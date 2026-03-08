#!/usr/bin/env python3
"""LIC e-form Flask server.

Serves static files and provides a streaming PDF → JSON extraction endpoint
using Together.ai's Qwen VL model (Server-Sent Events).

Usage:
    pip install -r requirements.txt
    python3 server.py

Then open http://localhost:5173
"""

import base64
import json
import os
import pathlib
import re
import sys
import traceback

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR: PyMuPDF not installed. Run: pip install PyMuPDF", file=sys.stderr)
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests", file=sys.stderr)
    sys.exit(1)

from flask import Flask, Response, jsonify, request, send_from_directory

BASE_DIR = pathlib.Path(__file__).parent.resolve()
app = Flask(__name__, static_folder=str(BASE_DIR))

# ── Config ────────────────────────────────────────────────────────────────────
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "Qwen/Qwen3-VL-8B-Instruct"
MAX_DIM = 1500   # Max pixel dimension when rendering PDF pages
MAX_TOKENS = 8192  # Increased to avoid truncation on complex pages

# ── Page-schema loading ───────────────────────────────────────────────────────
# Look for lic_form_unfilled.json next to server.py first, then ~/Downloads
_SCHEMA_CANDIDATES = [
    BASE_DIR / "lic_form_unfilled.json",
    pathlib.Path.home() / "Downloads" / "lic_form_unfilled.json",
]
PAGE_SCHEMAS: dict[int, dict] = {}  # page_number → JSON schema dict

for _candidate in _SCHEMA_CANDIDATES:
    if _candidate.exists():
        try:
            _raw = json.loads(_candidate.read_text(encoding="utf-8"))
            for _k, _v in _raw.items():
                if _k.startswith("page_") and _k[5:].isdigit() and isinstance(_v, dict):
                    PAGE_SCHEMAS[int(_k[5:])] = _v
            print(f"✓ Loaded {len(PAGE_SCHEMAS)} page schemas from {_candidate}")
        except Exception as _e:
            print(f"WARNING: Could not load schema file {_candidate}: {_e}")
        break
else:
    print("WARNING: lic_form_unfilled.json not found — using generic extraction prompt.")

# Pages that are informational only (no fill-able data)
INFORMATIONAL_PAGES = {16, 17, 28}

# Which HTML-form section keys each page contributes to (for output guidance)
PAGE_SECTION_KEYS: dict[int, list[str]] = {
    1:  ["office_use"],
    2:  ["section_i"],
    3:  ["section_i"],
    4:  ["section_i", "section_iv"],
    5:  ["section_iv"],
    6:  ["section_iv", "section_i"],
    7:  ["section_ii"],
    8:  ["section_ii"],
    9:  ["section_ii"],
    10: ["section_iii"],
    11: ["section_iii"],
    12: ["section_iii"],
    13: ["section_iii", "section_iv"],
    14: ["section_iv"],
    15: ["section_iv"],
    18: ["addendum_1_settlement_maturity", "addendum_2_death_benefit_instalments"],
    19: ["addendum_plan_specific"],
    20: ["addendum_plan_specific"],
    21: ["moral_hazard_report"],
    22: ["moral_hazard_report"],
    23: ["moral_hazard_report"],
    24: ["insurance_suitability_questionnaire", "annexure_i"],
    25: ["annexure_i"],
    26: ["annexure_i"],
    27: ["annexure_i", "insurance_suitability_questionnaire"],
}


# ── Schema → compact field list (for prompt context) ─────────────────────────

def _schema_to_fieldlist(schema: dict, prefix: str = "", depth: int = 0) -> list[str]:
    """Recursively convert a JSON Schema to a compact bulleted field list."""
    if depth > 4 or not isinstance(schema, dict):
        return []

    lines = []
    for key, val in schema.get("properties", {}).items():
        if not isinstance(val, dict):
            continue
        # Skip const/informational-only fields
        if "const" in val:
            continue

        full_key = f"{prefix}.{key}" if prefix else key
        vtype = val.get("type", "any")
        if isinstance(vtype, list):
            vtype = " | ".join(str(t) for t in vtype if t != "null")

        enum_vals = [str(e) for e in val.get("enum", []) if e is not None]
        desc = re.sub(r"^(ADDED|CORRECTED):\s*", "", val.get("description", val.get("title", "")))[:90]

        nested = val.get("properties")
        items = val.get("items", {})

        if nested and depth < 3:
            lines.append(f"{'  ' * depth}• {full_key} (object):")
            lines.extend(_schema_to_fieldlist(val, full_key, depth + 1))
        elif isinstance(items, dict) and items.get("properties") and depth < 3:
            lines.append(f"{'  ' * depth}• {full_key} (array of objects):")
            lines.extend(_schema_to_fieldlist(items, full_key + "[]", depth + 1))
        else:
            line = f"{'  ' * depth}• {full_key} ({vtype})"
            if enum_vals:
                sample = ", ".join(enum_vals[:6])
                if len(enum_vals) > 6:
                    sample += "…"
                line += f" [enum: {sample}]"
            if desc:
                line += f" — {desc}"
            lines.append(line)

    return lines


# ── Prompt builder ────────────────────────────────────────────────────────────

_BASE_EXTRACTION_PROMPT = (
    "You are a data extraction assistant for LIC (Life Insurance Corporation of India) proposal forms.\n"
    "This image shows {PAGE_HEADER} of an LIC Proposal Form No. 300.\n"
    "{SCHEMA_HINT}\n"
    "Extract ALL visible, filled-in data from this page and return it as a single JSON object.\n"
    "\n"
    "Use these top-level section keys matching the form structure:\n"
    "  office_use            — inward_no, proposal_no, inward_date, amt_of_deposit, boc_no, boc_date\n"
    "  section_i             — personal details, KYC/PMLA, occupation, bank, tax residency, contact\n"
    "  section_ii            — plan details, riders, police/SSS, PWB, simultaneous proposals, settlement, portal\n"
    "  section_iii           — health metrics, medical history, habits, family history\n"
    "  section_iv            — existing insurance table, nominee details, declaration, witness\n"
    "  addendum_1_settlement_maturity   — maturity benefit settlement option\n"
    "  addendum_2_death_benefit_instalments — death benefit instalment option\n"
    "  addendum_plan_specific           — plan-specific fields (Dhan Sanchay, Jeevan Azad, etc.)\n"
    "  moral_hazard_report   — agent confidential report sections I-V plus signatures\n"
    "  insurance_suitability_questionnaire — section 10 (agent+proposer declaration), waiver\n"
    "  annexure_i            — suitability analysis items 1-9 (proposer details through product chosen)\n"
    "\n"
    "Nested key conventions (use these exact key names inside section_i):\n"
    "  personal_details -> prefix, first_name, middle_name, last_name\n"
    "  father_full_name, mother_full_name, gender, marital_status, spouse_full_name\n"
    "  date_of_birth (YYYY-MM-DD), age, place_of_birth, nature_of_age_proof, nationality, citizenship\n"
    "  permanent_address -> house_building_name_street, town_village_taluka, district, state_country, pin_code, tel_no_with_std\n"
    "  correspondence_address -> same sub-keys as permanent_address\n"
    "  residential_status_info -> status, holding_oci_card, address_outside_india\n"
    "  kyc_pmla_details -> is_income_tax_assessee, pan_number,\n"
    "                      gst_registered -> is_registered, gstin;\n"
    "                      id_details -> proof_of_identity, id_number, expiry_date;\n"
    "                      proof_of_correspondence_address\n"
    "  occupation_details -> educational_qualification, present_occupation, source_of_income,\n"
    "                        name_of_present_employer, exact_nature_of_duties, length_of_service, annual_income,\n"
    "                        hazardous_occupation_or_hobby -> has_hazardous_activities, details;\n"
    "                        legal_criminal_proceedings -> has_legal_proceedings, details;\n"
    "                        politically_exposed_person -> is_pep\n"
    "  bank_details -> account_type, account_number, micr_code, ifsc_code, bank_name_and_address\n"
    "  tax_residency -> is_tax_resident_outside_india\n"
    "  mobile_number, email_id\n"
    "\n"
    "Rules:\n"
    "1. Extract ONLY data that is ACTUALLY FILLED IN — omit blank or unchecked fields completely\n"
    "2. Return ONLY valid JSON — NO markdown code fences, NO explanation, NOTHING before or after the JSON\n"
    "3. Booleans: true/false for checkboxes and radio buttons\n"
    "4. Dates: YYYY-MM-DD format wherever possible\n"
    "5. Amounts/numbers: numeric values without Rs or rupee symbols\n"
    '6. If this page has no filled data, return {}\n'
    "\n"
    "Return ONLY the JSON object:"
)


def build_page_prompt(page_num: int) -> str | None:
    """
    Build a page-specific extraction prompt.
    Returns None for informational/skippable pages.
    """
    if page_num in INFORMATIONAL_PAGES:
        return None

    schema = PAGE_SCHEMAS.get(page_num, {})
    title = schema.get("title", "")

    # Also skip if the schema marks this page as informational
    props = schema.get("properties", {})
    ct = props.get("content_type", {})
    if isinstance(ct, dict) and ct.get("const") == "Informational/Legal":
        return None

    # Build page header
    page_header = f"PAGE {page_num}"
    if title:
        page_header += f" ({title})"

    # Build schema hint section from lic_form_unfilled.json
    schema_hint = ""
    if schema:
        field_lines = _schema_to_fieldlist(schema)
        if field_lines:
            section_keys = PAGE_SECTION_KEYS.get(page_num, [])
            sections_str = (
                "  Output these under: " + ", ".join(f'"{k}"' for k in section_keys)
                if section_keys else ""
            )
            hint_body = "\n".join(field_lines)
            schema_hint = (
                f"\nThis page's form schema (fields to look for):\n{hint_body}"
                + (f"\n{sections_str}" if sections_str else "")
            )

    return (
        _BASE_EXTRACTION_PROMPT
        .replace("{PAGE_HEADER}", page_header)
        .replace("{SCHEMA_HINT}", schema_hint)
    )


# ── JSON extraction (robust — handles Qwen3 think tags, fences, truncation) ──

def _close_json(s: str) -> str:
    """Append missing closing braces/brackets to an unclosed JSON string."""
    stack = []
    in_string = False
    escape = False
    for ch in s:
        if escape:
            escape = False
            continue
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ("{", "["):
            stack.append("}" if ch == "{" else "]")
        elif ch in ("}", "]"):
            if stack and stack[-1] == ch:
                stack.pop()
    return s + "".join(reversed(stack))


def extract_json(content: str) -> dict:
    """
    Robustly extract a JSON dict from an LLM response string.
    Handles:
      - Qwen3 <think>…</think> blocks
      - Markdown ``` fences
      - Trailing commas (invalid JSON)
      - Truncated / unclosed JSON (max_tokens cut-off)
    """
    if not content:
        return {}

    # 1. Strip Qwen3 chain-of-thought thinking blocks
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL)

    # 2. Strip markdown code fences (``` or ```json … ```)
    content = re.sub(r"^```(?:json)?\s*\n?", "", content.strip(), flags=re.MULTILINE)
    content = re.sub(r"\n?```\s*$", "", content, flags=re.MULTILINE)
    content = content.strip().strip("`").strip()

    # 3. Find first '{' (discard any preamble text)
    start = content.find("{")
    if start == -1:
        print(f"[extract_json] No '{{' found. First 300 chars: {content[:300]!r}")
        return {}
    content = content[start:]

    # 4. Attempt direct parse
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        print(f"[extract_json] Direct parse failed at char {exc.pos}: {exc.msg}")

    # 5. Repair trailing commas before } or ]
    repaired = re.sub(r",\s*([}\]])", r"\1", content)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # 6. Try closing unclosed braces/brackets (handles max_tokens truncation)
    closed = _close_json(repaired)
    try:
        return json.loads(closed)
    except json.JSONDecodeError:
        pass

    # 7. Walk backwards from end to find last complete closing brace
    for end in range(len(repaired) - 1, max(len(repaired) // 2, 0), -1):
        if repaired[end] in ("}", "]"):
            try:
                return json.loads(repaired[: end + 1])
            except json.JSONDecodeError:
                continue

    print(f"[extract_json] All repair strategies failed. First 500 chars: {content[:500]!r}")
    return {}


# ── Together.ai call ──────────────────────────────────────────────────────────

def page_to_b64(page: "fitz.Page", max_dim: int = MAX_DIM) -> str:
    """Render a PDF page to base64-encoded PNG at 2× resolution (capped at max_dim)."""
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    if max(pix.width, pix.height) > max_dim:
        scale = max_dim / max(pix.width, pix.height)
        mat = fitz.Matrix(2 * scale, 2 * scale)
        pix = page.get_pixmap(matrix=mat, alpha=False)
    return base64.b64encode(pix.tobytes("png")).decode("utf-8")


def call_together(api_key: str, b64_image: str, prompt: str) -> dict:
    """Call Together.ai VL API and return extracted JSON dict."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a data extraction assistant. "
                    "Always respond with ONLY a valid JSON object. "
                    "Never include markdown, code blocks, thinking steps, or any explanation."
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{b64_image}"},
                    },
                    {"type": "text", "text": prompt},
                ],
            },
        ],
        "max_tokens": MAX_TOKENS,
        "temperature": 0.05,
    }
    resp = requests.post(TOGETHER_API_URL, headers=headers, json=payload, timeout=180)
    resp.raise_for_status()

    raw_content = resp.json()["choices"][0]["message"]["content"]
    return extract_json(raw_content)


# ── Deep merge ────────────────────────────────────────────────────────────────

def deep_merge(base: dict, override: dict) -> dict:
    """Deep-merge two dicts. Scalars: override wins. Lists: later page wins (or concatenates)."""
    if not isinstance(base, dict) or not isinstance(override, dict):
        return override if override is not None else base
    merged = dict(base)
    for k, v in override.items():
        if k in merged:
            if isinstance(merged[k], dict) and isinstance(v, dict):
                merged[k] = deep_merge(merged[k], v)
            elif isinstance(merged[k], list) and isinstance(v, list):
                # For arrays (policies, nominees), prefer the later/longer list
                merged[k] = v if v else merged[k]
            else:
                if v is not None:
                    merged[k] = v
        else:
            merged[k] = v
    return merged


# ── SSE helper ────────────────────────────────────────────────────────────────

def sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(str(BASE_DIR), "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(str(BASE_DIR), filename)


@app.route("/api/parse-pdf-stream", methods=["POST"])
def parse_pdf_stream():
    # Resolve API key (header → form field → env var)
    api_key = (
        request.headers.get("X-Together-Api-Key")
        or request.form.get("together_api_key")
        or os.environ.get("TOGETHER_API_KEY", "")
    ).strip()

    if not api_key:
        return jsonify({"error": "Together.ai API key is required"}), 400

    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file attached (field name must be 'pdf')"}), 400

    pdf_bytes = request.files["pdf"].read()
    if not pdf_bytes:
        return jsonify({"error": "Uploaded PDF file is empty"}), 400

    def generate():
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            total = len(doc)
            yield sse({"status": "started", "total_pages": total})

            merged = {}
            for i, page in enumerate(doc):
                page_num = i + 1

                # Determine prompt for this page (None = informational, skip API call)
                prompt = build_page_prompt(page_num)

                if prompt is None:
                    # Informational page — skip without calling the API
                    yield sse({
                        "status": "page_skipped",
                        "page": page_num,
                        "total": total,
                        "reason": "Informational/legal page — no data fields",
                    })
                    continue

                yield sse({"status": "processing", "page": page_num, "total": total})

                try:
                    b64 = page_to_b64(page)
                    page_data = call_together(api_key, b64, prompt)

                    if isinstance(page_data, dict) and page_data:
                        merged = deep_merge(merged, page_data)

                    yield sse({
                        "status": "page_done",
                        "page": page_num,
                        "total": total,
                        "fields_extracted": sum(1 for v in page_data.values() if v) if page_data else 0,
                    })

                except Exception as exc:
                    tb = traceback.format_exc()
                    print(f"[page {page_num}] Error: {exc}\n{tb}")
                    yield sse({
                        "status": "page_error",
                        "page": page_num,
                        "error": str(exc),
                    })

            doc.close()
            yield sse({"status": "done", "data": merged})

        except Exception as exc:
            yield sse({
                "status": "error",
                "error": str(exc),
                "trace": traceback.format_exc(),
            })

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5173))
    print(f"LIC e-form server → http://localhost:{port}")
    print(f"Serving files from: {BASE_DIR}")
    if PAGE_SCHEMAS:
        print(f"Page-specific prompts: {len(PAGE_SCHEMAS)} pages loaded")
        informational = INFORMATIONAL_PAGES | {
            n for n, s in PAGE_SCHEMAS.items()
            if s.get("properties", {}).get("content_type", {}).get("const") == "Informational/Legal"
        }
        print(f"Informational pages (will be skipped): {sorted(informational)}")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
