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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR)

# ── Config ────────────────────────────────────────────────────────────────────
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "Qwen/Qwen3-VL-8B-Instruct"
MAX_DIM = 1500  # Max pixel dimension when rendering PDF pages

EXTRACTION_PROMPT = """You are a data extraction assistant for LIC (Life Insurance Corporation of India) proposal forms.
This image shows one page of an LIC Proposal Form No. 300.

Your task: Extract ALL visible, filled-in data from this form page and return it as a single JSON object.

The form has these major sections — extract whichever sections are visible on this page:

- office_use: { inward_no, proposal_no, date, date_of_proposal, date_of_deposit, boc_no, amt_of_deposit }
- header: { division, branch_office }
- section_i (Personal Details): { customer_id, kyc_number, name: {prefix, first_name, middle_name, last_name}, father_name, mother_name, gender, marital_status, spouse_name, date_of_birth (YYYY-MM-DD), place_of_birth, age_proof, nationality, citizenship, permanent_address: {house, town, city, state, pin, tel}, correspondence_address_same_as_permanent (bool), correspondence_address: {house, town, city, state, pin, tel}, residential_status, oci_card (bool), mobile, email, kyc_pmla: {income_tax_assessee (bool), pan, gstn_registered (bool), gstin, id_proof_type, id_number, id_expiry, corr_proof}, occupation: {educational_qualification, present_occupation, source_of_income, employer_name, nature_of_duties, length_of_service, annual_income, hazardous_occupation (bool), hazardous_details, criminal_record (bool), pep (bool)}, armed_forces: {in_armed_forces (bool)}, bank_details: {account_type, account_number, micr_code, ifsc_code, bank_name_address}, tax_residency: {tax_resident_outside_india (bool)} }
- section_ii (Plan): { objective_of_insurance, proposal_under, plan: {plan_name, plan_no, policy_term, sum_assured, premium_mode, premium_amount, policy_date_back}, riders: {term_assurance_rider (bool), term_assurance_rider_sa, critical_illness_rider (bool), critical_illness_rider_sa, pwb_rider (bool), accident_benefit_rider (bool), addb_rider (bool), accident_benefit_sa}, police_personnel: {is_police (bool), on_duty_rider (bool)}, sss_details: {authority, badge_no}, pwb_agreement (bool), simultaneous_proposals: {any_pending (bool), spouse_proposal (bool)}, lic_portal_registered (bool), settlement_option_maturity (bool), settlement_option_death (bool) }
- section_iii (Health): { personal_health: {height_cm, weight_kg, medical_consultation_5yrs (bool), hospital_admission (bool), absence_from_work (bool), diseases: {lungs_respiratory (bool), hypertension (bool), digestive (bool), diabetes (bool), heart (bool), kidney (bool), nervous (bool), joints (bool), cancer (bool), eye_ear (bool), mental (bool), genital (bool), blood (bool), hiv (bool), other_disease (bool)}, disease_details: [{nature, date, recovered (bool), doctor_name}]}, personal_habits: {alcohol (bool), alcohol_qty, narcotics (bool), narcotics_qty, other_drugs (bool), other_drugs_detail, tobacco (bool), tobacco_type, tobacco_qty}, present_health_state, family_health: {any_hereditary_disease (bool), hereditary_details} }
- section_iv (Existing Insurance / Nominees): { existing_insurance: {policies: [{company_name, policy_no, plan_name, sum_assured, premium_mode, premium_amount, accepted (bool), accepted_details, medical_type, inforce (bool), fup_surrender_date}], q14a_proposals_declined (bool), q14b_policy_lapsed (bool), q14c_policy_assignment (bool), q14d_other_proposals (bool)}, nominee: {nomination_type, nominees: [{name, share_percent, age, relationship, appointee_name, appointee_rel, id_type, id_number}]}, declaration: {la_name, place, date (YYYY-MM-DD)}, witness: {name, occupation, address} }
- moral_hazard_report: { agent: {name, code, mobile, club_status, licence_no, licence_expiry}, do: {name, code, mobile}, section_i_product: {proposer_name, age, plan_and_term, sum_assured, plan_explained (bool), plan_suitable (bool), benefit_illustration_given (bool)}, section_ii_proposer: {acquaintance_duration, is_relative (bool), relative_details, education, is_fnio_oci (bool), is_pep (bool), kyc_pmla_complied (bool)}, section_iii_financial: {income_source, employment, huf, other_sources, income_proofs (array of strings), pan_verified, financially_sound (bool)}, section_iv_previous_insurance: {has_previous_policy (bool), declined_deferred_before (bool)}, section_v_health: {health_status, physical_mental_defects (bool), illness_injury_operation (bool), height, weight, adverse_risk_factors (bool), other_observations}, agent_signature: {place, date}, do_mentor: {date, name, designation, standing}, bm_sr_bm: {date, name, designation} }
- insurance_suitability_questionnaire: { section_10: {agent_declaration: {agent_name_mr, agent_name_hi, agent_name_en, place, date}, proposer_declaration: {proposer_name_mr, proposer_name_hi, proposer_name_en, preferred_plan: {table_no, plan_name, term, sum_assured, mode, premium}, place, date}}, waiver: {waiver_opted (bool), place, date} }
- annexure_i: { item_1_proposer: {proposer_name, dob_dd, dob_mm, dob_yyyy, age, address, marital_status}, item_2_occupation: {occupation, occupation_other}, item_3_income: {income_employment, income_business, income_other, income_huf, income_lba, income_proof_submitted (bool), doc_itr (bool), doc_salary (bool), doc_ca (bool), doc_pl (bool), doc_property (bool), doc_others (bool), tax_assessee (bool), tax_detail, pan, tax_bracket}, item_4_prev_insurance: [{policy_no, company, plan, sa, mode, premium}], item_5_family_history: {father_age, father_health, father_death_age, father_cause, mother_age, mother_health, mother_death_age, mother_cause}, item_5a_spouse: {spouse_name, spouse_occ, spouse_income}, item_6_need_analysis: {total_income, liabilities, secured_income, unsecured, max_insurance}, item_7_objectives: {obj_pure_risk (bool), obj_savings (bool), obj_money_back (bool), obj_secured (bool), obj_market (bool), obj_pension (bool), obj_health (bool), obj_children (bool), obj_others (bool), risk_profile, premium_mode, time_frame, time_frame_other}, item_8_plan_category: {plan_category}, item_9_product_chosen: {table_no, plan_name, term, sum_assured, mode, premium} }

Rules:
1. Only extract data that is ACTUALLY FILLED IN on this page — omit fields that are blank/empty
2. For checkboxes and radio buttons: use true/false boolean values
3. For dates: use YYYY-MM-DD format when possible
4. Return ONLY valid JSON with NO markdown code fences and NO explanations
5. Nest extracted data under the correct section key as shown above
6. If this page has no readable or filled-in form data, return {}
7. For amount fields, return numeric values (no currency symbols)

Respond with ONLY the JSON object — nothing else."""


# ── Helpers ───────────────────────────────────────────────────────────────────

def page_to_b64(page, max_dim=MAX_DIM):
    """Render a PDF page to base64-encoded PNG at 2× resolution (capped at max_dim)."""
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    if max(pix.width, pix.height) > max_dim:
        scale = max_dim / max(pix.width, pix.height)
        mat = fitz.Matrix(2 * scale, 2 * scale)
        pix = page.get_pixmap(matrix=mat, alpha=False)
    png_bytes = pix.tobytes("png")
    return base64.b64encode(png_bytes).decode("utf-8")


def call_together(api_key, b64_image):
    """Call Together.ai VL API with a page image and return extracted JSON dict."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64_image}",
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
        "max_tokens": 4096,
        "temperature": 0.05,
    }
    resp = requests.post(
        TOGETHER_API_URL, headers=headers, json=payload, timeout=120
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"].strip()
    # Strip possible markdown code fences
    content = re.sub(r"^```json\s*", "", content, flags=re.MULTILINE)
    content = re.sub(r"^```\s*$", "", content, flags=re.MULTILINE)
    content = content.strip().strip("`")
    return json.loads(content)


def deep_merge(base, override):
    """Deep-merge two dicts. Scalars: override wins. Lists: override wins (latest page)."""
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


def sse(data):
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


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
                yield sse({"status": "processing", "page": page_num, "total": total})
                try:
                    b64 = page_to_b64(page)
                    page_data = call_together(api_key, b64)
                    if isinstance(page_data, dict):
                        merged = deep_merge(merged, page_data)
                    yield sse(
                        {
                            "status": "page_done",
                            "page": page_num,
                            "total": total,
                            "page_data": page_data,
                        }
                    )
                except Exception as exc:
                    yield sse(
                        {
                            "status": "page_error",
                            "page": page_num,
                            "error": str(exc),
                        }
                    )

            doc.close()
            yield sse({"status": "done", "data": merged})

        except Exception as exc:
            yield sse(
                {
                    "status": "error",
                    "error": str(exc),
                    "trace": traceback.format_exc(),
                }
            )

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
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
