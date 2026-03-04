/* ════════════════════════════════════════════════
   LIC Proposal Form No. 300 – JavaScript
   Conditional logic, dynamic rows, validations
   ════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ──────────────────────────────────────────────
     Helper: show/hide element
  ────────────────────────────────────────────── */
  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function showBlock(el) { if (el) el.style.display = 'block'; }

  /* ──────────────────────────────────────────────
     Auto-calculate Age from DOB
  ────────────────────────────────────────────── */
  const dobInput = document.getElementById('dob');
  const ageDisplay = document.getElementById('age_display');

  if (dobInput) {
    // Set max date to today
    dobInput.max = new Date().toISOString().split('T')[0];
    dobInput.addEventListener('change', function () {
      const dob = new Date(this.value);
      const today = new Date();
      if (!isNaN(dob)) {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        ageDisplay.value = age >= 0 ? age : '';
      }
    });
  }

  /* ──────────────────────────────────────────────
     Photo Upload Preview
  ────────────────────────────────────────────── */
  const photoUpload = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.querySelector('.photo-placeholder');

  if (photoUpload) {
    photoUpload.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          photoPreview.src = e.target.result;
          photoPreview.style.display = 'block';
          if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* ──────────────────────────────────────────────
     Marital Status → Spouse Name field
  ────────────────────────────────────────────── */
  const maritalStatus = document.getElementById('marital_status');
  const spouseRow = document.getElementById('spouseRow');

  if (maritalStatus) {
    maritalStatus.addEventListener('change', function () {
      if (this.value === 'विवाहित / Married') {
        showBlock(spouseRow);
      } else {
        hide(spouseRow);
      }
    });
  }

  /* ──────────────────────────────────────────────
     Correspondence Address – same as permanent
  ────────────────────────────────────────────── */
  const corrSameY = document.getElementById('corrSameY');
  const corrSameN = document.getElementById('corrSameN');
  const corrBlock = document.getElementById('corrAddressBlock');

  function toggleCorrAddress() {
    if (corrSameN && corrSameN.checked) showBlock(corrBlock);
    else hide(corrBlock);
  }
  if (corrSameY) corrSameY.addEventListener('change', toggleCorrAddress);
  if (corrSameN) corrSameN.addEventListener('change', toggleCorrAddress);

  /* ──────────────────────────────────────────────
     GSTN Registration → GSTIN field
  ────────────────────────────────────────────── */
  document.querySelectorAll('input[name="gstn_registered"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const block = document.getElementById('gstinBlock');
      if (this.value === 'Y') showBlock(block);
      else hide(block);
    });
  });

  /* ──────────────────────────────────────────────
     Armed Forces → Wing/Rank fields
  ────────────────────────────────────────────── */
  const armedY = document.getElementById('armedY');
  const armedN = document.getElementById('armedN');
  const armedBlock = document.getElementById('armedForcesBlock');

  function toggleArmed() {
    if (armedY && armedY.checked) showBlock(armedBlock);
    else hide(armedBlock);
  }
  if (armedY) armedY.addEventListener('change', toggleArmed);
  if (armedN) armedN.addEventListener('change', toggleArmed);

  /* sub-question e) below A-1 */
  document.querySelectorAll('input[name="armed_below_a1"]').forEach(function(r) {
    r.addEventListener('change', function() {
      const d = document.getElementById('belowA1Details');
      if (this.value === 'Y') showBlock(d); else hide(d);
    });
  });

  /* ──────────────────────────────────────────────
     Premium Mode → SSS block
  ────────────────────────────────────────────── */
  const premiumMode = document.querySelector('select[name="premium_mode"]');
  const sssBlock = document.getElementById('sssBlock');

  if (premiumMode) {
    premiumMode.addEventListener('change', function () {
      if (this.value === 'SSS') showBlock(sssBlock);
      else hide(sssBlock);
    });
  }

  /* ──────────────────────────────────────────────
     Rider PWB → Agreement note
  ────────────────────────────────────────────── */
  const riderPWB = document.getElementById('riderPWB');
  const pwbNoteBlock = document.getElementById('pwbNoteBlock');

  if (riderPWB) {
    riderPWB.addEventListener('change', function () {
      if (this.checked) showBlock(pwbNoteBlock);
      else hide(pwbNoteBlock);
    });
  }

  /* ──────────────────────────────────────────────
     Hazardous Occupation → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('hazardous_occ', 'hazardousDetails');

  /* ──────────────────────────────────────────────
     Criminal Record → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('criminal_record', 'criminalDetails');

  /* ──────────────────────────────────────────────
     PEP Relative → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('pep_relative', 'pepRelativeDetails');

  /* ──────────────────────────────────────────────
     Existing Insurance – "No - Give Details" for field 10
  ────────────────────────────────────────────── */
  document.addEventListener('change', function(e) {
    if (e.target && e.target.name === 'ei_accepted[]') {
      const details = e.target.closest('.form-group').querySelector('.ei-accepted-details');
      if (details) {
        if (e.target.value === 'No - Give Details') details.style.display = 'block';
        else details.style.display = 'none';
      }
    }
  });

  /* ──────────────────────────────────────────────
     Existing Insurance Point 14 a–d
  ────────────────────────────────────────────── */
  bindYesShowDetails('ei_q14a', 'ei14aDetails');
  bindYesShowDetails('ei_q14b', 'ei14bDetails');
  bindYesShowDetails('ei_q14c', 'ei14cDetails');
  bindYesShowDetails('ei_q14d', 'ei14dDetails');

  /* ──────────────────────────────────────────────
     Simultaneous proposals
  ────────────────────────────────────────────── */
  bindYesShowDetails('simultaneous_pending', 'simultaneousDetails');
  bindYesShowDetails('simultaneous_spouse', 'simultaneousSpouseDetails');

  /* ──────────────────────────────────────────────
     Health Questions a, b, c
  ────────────────────────────────────────────── */
  bindYesShowDetails('hq_a', 'hqADetails');
  bindYesShowDetails('hq_b', 'hqBDetails');
  bindYesShowDetails('hq_c', 'hqCDetails');

  /* ──────────────────────────────────────────────
     Disease checkboxes → show details table
  ────────────────────────────────────────────── */
  const diseaseNames = ['dis_1','dis_2','dis_3','dis_4','dis_5','dis_6',
                        'dis_7','dis_8','dis_9','dis_10','dis_11','dis_12',
                        'dis_13','dis_14','dis_15'];
  const diseaseDetailsBlock = document.getElementById('diseaseDetailsBlock');

  diseaseNames.forEach(function (name) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        checkAnyDiseaseYes();
      });
    });
  });

  function checkAnyDiseaseYes() {
    const anyYes = diseaseNames.some(function (name) {
      const checked = document.querySelector('input[name="' + name + '"]:checked');
      return checked && checked.value === 'Y';
    });
    if (anyYes) showBlock(diseaseDetailsBlock);
    else hide(diseaseDetailsBlock);
  }

  /* ──────────────────────────────────────────────
     Other Disease
  ────────────────────────────────────────────── */
  bindYesShowDetails('other_disease', 'otherDiseaseDetails');

  /* ──────────────────────────────────────────────
     Family Disease → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('family_disease', 'familyDiseaseDetails');

  /* ──────────────────────────────────────────────
     Pregnant → Last delivery date
  ────────────────────────────────────────────── */
  bindYesShowDetails('pregnant', 'pregnantDetails');

  /* ──────────────────────────────────────────────
     Gynecology → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('gynec_consult', 'gynecDetails');

  /* ──────────────────────────────────────────────
     Abortion → Details
  ────────────────────────────────────────────── */
  bindYesShowDetails('abortion', 'abortionDetails');

  /* ──────────────────────────────────────────────
     Tax Residency outside India
  ────────────────────────────────────────────── */
  bindYesShowDetails('tax_outside_india', 'taxOutsideBlock');

  /* ──────────────────────────────────────────────
     Agent's Certificate – Hazardous occupation
  ────────────────────────────────────────────── */
  bindYesShowDetails('agent_hazardous', 'agentHazDetails');

  /* ──────────────────────────────────────────────
     D.O. Report – Knows proposer
  ────────────────────────────────────────────── */
  bindYesShowDetails('do_knows_proposer', 'doKnowsDetails');

  /* ──────────────────────────────────────────────
     D.O. Report – Adverse features
  ────────────────────────────────────────────── */
  bindYesShowDetails('do_adverse', 'doAdverseDetails');


  /* ──────────────────────────────────────────────
     Nomination type → multiple note
  ────────────────────────────────────────────── */
  document.querySelectorAll('input[name="nom_type"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const multiNote = document.getElementById('multipleNomNote');
      if (this.value === 'Multiple') showBlock(multiNote);
      else hide(multiNote);
    });
  });

  /* ──────────────────────────────────────────────
     PAN uppercase
  ────────────────────────────────────────────── */
  const panInput = document.getElementById('pan');
  if (panInput) {
    panInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
  }

  /* ──────────────────────────────────────────────
     IFSC uppercase
  ────────────────────────────────────────────── */
  const ifscInput = document.getElementById('bank_ifsc');
  if (ifscInput) {
    ifscInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
  }

  /* ──────────────────────────────────────────────
     Nominee % share sum validation
  ────────────────────────────────────────────── */
  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'nom_share[]') {
      validateNomineeShares();
    }
  });

  function validateNomineeShares() {
    const shares = document.querySelectorAll('input[name="nom_share[]"]');
    let total = 0;
    shares.forEach(function (input) {
      total += parseFloat(input.value) || 0;
    });
    const warning = document.getElementById('shareWarning');
    if (total !== 100 && shares.length > 1) {
      if (!warning) {
        const div = document.createElement('div');
        div.id = 'shareWarning';
        div.className = 'instruction-note';
        div.style.color = '#b71c1c';
        div.textContent = 'Warning: Total nominee share should equal 100%. Current total: ' + total + '%';
        const nomineeTable = document.getElementById('nomineeTable');
        if (nomineeTable) nomineeTable.parentNode.insertBefore(div, nomineeTable.nextSibling);
      } else {
        warning.textContent = 'Warning: Total nominee share should equal 100%. Current total: ' + total + '%';
      }
    } else {
      if (warning) warning.remove();
    }
  }

  /* ──────────────────────────────────────────────
     Generic: bind Yes radio to show details block
  ────────────────────────────────────────────── */
  function bindYesShowDetails(radioName, detailsId) {
    document.querySelectorAll('input[name="' + radioName + '"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        const detailsEl = document.getElementById(detailsId);
        if (!detailsEl) return;
        if (this.value === 'Y') showBlock(detailsEl);
        else hide(detailsEl);
      });
    });
  }

});

/* ════════════════════════════════════════════════
   DYNAMIC ROW FUNCTIONS (called from HTML onclick)
   ════════════════════════════════════════════════ */

/* Add policy card to Existing Insurance section */
function addInsuranceRow() {
  const container = document.getElementById('existingInsuranceBody');
  if (!container) return;
  const cardNum = container.querySelectorAll('.ei-card').length + 1;
  const card = document.createElement('div');
  card.className = 'ei-card';
  card.innerHTML = `
    <div class="ei-card-header">
      <span>Policy ${cardNum}</span>
      <button type="button" class="btn-remove-card" onclick="removeInsuranceCard(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group col-4"><label>1. पॉलिसी क्र. / Policy Number</label><input type="text" name="ei_policy_no[]" placeholder="Policy No." /></div>
      <div class="form-group col-4"><label>2. विमा कंपनीचे नांव/विभाग/शाखा / Name of Insurer / Division / Branch</label><input type="text" name="ei_insurer[]" placeholder="Insurer Name" /></div>
      <div class="form-group col-4"><label>3. योजना व मुदत / Plan and Term</label><input type="text" name="ei_plan[]" placeholder="Plan & Term" /></div>
    </div>
    <div class="form-row">
      <div class="form-group col-3"><label>4. विमा रक्कम / Sum Assured (Rs.)</label><input type="number" name="ei_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>5. जोखीम विमा विनाराशी / Term Rider SA (Rs.)</label><input type="number" name="ei_term_rider_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>6. गंभीर आजार / CI Rider SA (Rs.)</label><input type="number" name="ei_ci_rider_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>7. अपघाती लाभ / AB / ADDB SA (Rs.)</label><input type="number" name="ei_ab_addb_sa[]" placeholder="Rs." /></div>
    </div>
    <div class="form-row">
      <div class="form-group col-3"><label>8. प्रारंभ तिथी / Date of Commencement (DD/MM/YYYY)</label><input type="date" name="ei_commencement[]" /></div>
      <div class="form-group col-3"><label>9. पुनरूज्जीवन तारीख / Date of Revival (DD/MM/YYYY)</label><input type="date" name="ei_revival[]" /></div>
      <div class="form-group col-3"><label>10. सामान्य दराने स्विकृती / Whether accepted at ordinary rate</label><select name="ei_accepted[]"><option value="">--</option><option>Yes</option><option>No - Give Details</option></select><div class="ei-accepted-details" style="display:none;margin-top:6px;"><textarea name="ei_accepted_details[]" rows="2" placeholder="Please give details"></textarea></div></div>
      <div class="form-group col-3"><label>11. वैद्यकीय / Medical / Non-Medical</label><select name="ei_medical[]"><option value="">--</option><option>Medical</option><option>Non-Medical</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group col-3"><label>12. चालू स्थितित आहे का? / Whether Inforce?</label><select name="ei_inforce[]"><option value="">--</option><option>Yes</option><option>No</option></select></div>
      <div class="form-group col-5"><label>13. नसल्यास / If not, Date of FUP / Date of Surrender (DD/MM/YYYY)</label><input type="date" name="ei_fup_surrender[]" /></div>
    </div>
  `;
  container.appendChild(card);
}

/* Remove a policy card and renumber remaining cards */
function removeInsuranceCard(btn) {
  const card = btn.closest('.ei-card');
  if (!card) return;
  const container = card.parentNode;
  card.remove();
  container.querySelectorAll('.ei-card').forEach(function(c, i) {
    const span = c.querySelector('.ei-card-header span');
    if (span) span.textContent = 'Policy ' + (i + 1);
  });
}

/* Add row to Family History group (Brothers / Sisters / Children) */
function addFamilyGroupRow(tbodyId, prefix) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var dataRows = tbody.querySelectorAll('tr.fh-data-row');
  var rowNum = dataRows.length + 1;
  var newRow = document.createElement('tr');
  newRow.className = 'fh-data-row';
  newRow.innerHTML =
    '<td style="text-align:center;color:#888;font-size:11px;">' + rowNum + '</td>' +
    '<td><input type="number" name="fh_' + prefix + '_age[]" placeholder="Age" min="0" style="width:100%;" /></td>' +
    '<td><input type="text" name="fh_' + prefix + '_health[]" placeholder="State of health" style="width:100%;" /></td>' +
    '<td><input type="number" name="fh_' + prefix + '_dead_age[]" placeholder="Age at death" min="0" style="width:100%;" /></td>' +
    '<td><input type="text" name="fh_' + prefix + '_dead_cause[]" placeholder="Year / Cause" style="width:100%;" /></td>';
  tbody.appendChild(newRow);
}

/* Add row to Husband's Insurance table */
function addHusInsuranceRow() {
  var tbody = document.getElementById('husInsuranceBody');
  if (!tbody) return;
  var row = document.createElement('tr');
  row.innerHTML =
    '<td><input type="text" name="hus_policy[]" placeholder="Policy No." style="width:100%;" /></td>' +
    '<td><input type="text" name="hus_insurer[]" placeholder="Branch / Insurer name" style="width:100%;" /></td>' +
    '<td><input type="number" name="hus_sa[]" placeholder="Sum Assured" style="width:100%;" /></td>' +
    '<td><input type="text" name="hus_plan[]" placeholder="Plan &amp; Term" style="width:100%;" /></td>' +
    '<td><input type="text" name="hus_status[]" placeholder="Present status" style="width:100%;" /></td>';
  tbody.appendChild(row);
}

/* Add row to Disease Details table */
function addDiseaseRow() {
  const tbody = document.getElementById('diseaseDetailsBody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" name="dd_qno[]" placeholder="Q No." style="width:60px" /></td>
    <td><input type="text" name="dd_nature[]" placeholder="Nature of illness" /></td>
    <td><input type="date" name="dd_date[]" /></td>
    <td><select name="dd_recovered[]"><option value="">-</option><option>Y</option><option>N</option></select></td>
    <td><select name="dd_treatment[]"><option value="">-</option><option>Y</option><option>N</option></select></td>
    <td><input type="text" name="dd_doctor[]" placeholder="Doctor / Hospital name & address" /></td>
  `;
  tbody.appendChild(row);
}

/* Add Nominee Row */
function addExistingInsuranceRow() {
  const tbody = document.getElementById('existingInsuranceLegacyBody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" name="ei_company[]" placeholder="Company Name" /></td>
    <td><input type="text" name="ei_plan[]" placeholder="Plan Name" /></td>
    <td><input type="text" name="ei_policy_no[]" placeholder="Policy Number" /></td>
    <td><input type="text" name="ei_year[]" placeholder="Year" maxlength="4" /></td>
    <td><input type="number" name="ei_sum[]" placeholder="Sum Assured" /></td>
    <td><input type="number" name="ei_premium[]" placeholder="Annual Premium" /></td>
    <td><input type="text" name="ei_purpose[]" placeholder="Purpose" /></td>
  `;
  tbody.appendChild(row);
}

function addNomineeRow() {
  const container = document.getElementById('nomineeBody');
  if (!container) return;
  const cardNum = container.querySelectorAll('.ei-card').length + 1;
  const card = document.createElement('div');
  card.className = 'ei-card';
  card.innerHTML = `
    <div class="ei-card-header">
      <span>Nominee ${cardNum}</span>
      <button type="button" class="btn-remove-card" onclick="removeNomineeCard(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group col-6">
        <label>वारसदाराचे नांव व पत्ता / नामित व्यक्ति का नाम और पत्ता / Name and Address of Nominee</label>
        <textarea name="nom_name[]" rows="3" placeholder="Full Name&#10;Address"></textarea>
      </div>
      <div class="form-group col-3">
        <label>% हिस्सा / % Share</label>
        <input type="number" name="nom_share[]" placeholder="%" min="0" max="100" />
      </div>
      <div class="form-group col-3">
        <label>आयु / Age</label>
        <input type="number" name="nom_age[]" placeholder="Age" min="0" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group col-4">
        <label>बीमित व्यक्ति के साथ संबंध / Relationship with Life to be Assured</label>
        <input type="text" name="nom_rel[]" placeholder="e.g. Spouse, Son, Daughter" />
      </div>
      <div class="form-group col-8">
        <label>नियुक्त व्यक्ति का पूरा नाम और पता / Appointee's full name and address <span class="help-text">(if nominee is minor)</span></label>
        <textarea name="nom_appointee[]" rows="2" placeholder="Appointee Name &amp; Address"></textarea>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group col-3">
        <label>नियुक्त व्यक्ति के साथ संबंध / Relationship to the nominee</label>
        <input type="text" name="nom_app_rel[]" placeholder="Relationship to nominee" />
      </div>
      <div class="form-group col-3">
        <label>पहचान का प्रमाण / Id proof of Nominee / Appointee</label>
        <select name="nom_id_type[]">
          <option value="">--</option>
          <option>Aadhaar</option>
          <option>PAN</option>
          <option>Voter ID</option>
          <option>Passport</option>
        </select>
      </div>
      <div class="form-group col-3">
        <label>ओळखपत्र क्रमांक / ID Number</label>
        <input type="text" name="nom_id_number[]" placeholder="ID Number" />
      </div>
      <div class="form-group col-3">
        <label>नामांकित व्यक्ति के हस्ताक्षर / Appointee's Signature or Thumb Impression</label>
        <div class="sig-box">Signature / Thumb Impression</div>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function removeNomineeCard(btn) {
  const card = btn.closest('.ei-card');
  if (!card) return;
  const container = card.parentNode;
  card.remove();
  container.querySelectorAll('.ei-card').forEach(function(c, i) {
    const span = c.querySelector('.ei-card-header span');
    if (span) span.textContent = 'Nominee ' + (i + 1);
  });
}

/* ──────────────────────────────────────────────
   Family History – Add Brother/Sister row
────────────────────────────────────────────── */
var fhSibCount = 2;
function addFHSiblingRow() {
  fhSibCount++;
  var n = fhSibCount;
  var btnRow = document.getElementById('fh-add-sibling-btn-row');
  if (!btnRow) return;
  var tr = document.createElement('tr');
  tr.innerHTML =
    '<td style="border:1px solid #aac;padding:4px;">' +
      '<select name="sa_fh_sib_type_' + n + '" style="width:100%;font-size:11px;padding:4px 4px;">' +
        '<option value="brother">भाऊ / भाई / Brother</option>' +
        '<option value="sister">बहिण / बहन / Sister</option>' +
      '</select>' +
    '</td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_sib' + n + '_age" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_sib' + n + '_health" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_sib' + n + '_death_age" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;position:relative;">' +
      '<input type="text" name="sa_fh_sib' + n + '_cause" style="width:calc(100% - 26px);font-size:11px;" />' +
      '<button type="button" onclick="this.closest(\'tr\').remove()" title="Remove row" ' +
        'style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:#c0392b;color:#fff;border:none;border-radius:3px;width:20px;height:20px;font-size:14px;cursor:pointer;line-height:1;padding:0;">' +
        '&times;' +
      '</button>' +
    '</td>';
  btnRow.parentNode.insertBefore(tr, btnRow);
}

/* ──────────────────────────────────────────────
   Family History – Add Son/Daughter row
────────────────────────────────────────────── */
var fhChildCount = 2;
function addFHChildRow() {
  fhChildCount++;
  var n = fhChildCount;
  var btnRow = document.getElementById('fh-add-child-btn-row');
  if (!btnRow) return;
  var tr = document.createElement('tr');
  tr.innerHTML =
    '<td style="border:1px solid #aac;padding:4px;">' +
      '<select name="sa_fh_child_type_' + n + '" style="width:100%;font-size:11px;padding:4px 4px;">' +
        '<option value="son">मुलगा / पुत्र / Son</option>' +
        '<option value="daughter">मुलगी / पुत्री / Daughter</option>' +
      '</select>' +
    '</td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_child' + n + '_age" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_child' + n + '_health" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;"><input type="text" name="sa_fh_child' + n + '_death_age" style="width:100%;font-size:11px;" /></td>' +
    '<td style="border:1px solid #aac;padding:4px;position:relative;">' +
      '<input type="text" name="sa_fh_child' + n + '_cause" style="width:calc(100% - 26px);font-size:11px;" />' +
      '<button type="button" onclick="this.closest(\'tr\').remove()" title="Remove row" ' +
        'style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:#c0392b;color:#fff;border:none;border-radius:3px;width:20px;height:20px;font-size:14px;cursor:pointer;line-height:1;padding:0;">' +
        '&times;' +
      '</button>' +
    '</td>';
  btnRow.parentNode.insertBefore(tr, btnRow);
}
