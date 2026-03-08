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
     Gender → show/hide Female Proposer section
  ────────────────────────────────────────────── */
  function toggleFemaleSection() {
    var femaleSec = document.getElementById('femalePropSection');
    if (!femaleSec) return;
    var checked = document.querySelector('input[name="gender"]:checked');
    femaleSec.style.display = (checked && checked.value === 'Female') ? '' : 'none';
  }
  document.querySelectorAll('input[name="gender"]').forEach(function(r) {
    r.addEventListener('change', toggleFemaleSection);
  });
  toggleFemaleSection(); // initialise on page load

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
      <div class="form-group col-3"><label>4. विमा रक्कम / Sum Assured (Rs.)</label><input type="text" name="ei_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>5. जोखीम विमा विनाराशी / Term Rider SA (Rs.)</label><input type="text" name="ei_term_rider_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>6. गंभीर आजार / CI Rider SA (Rs.)</label><input type="text" name="ei_ci_rider_sa[]" placeholder="Rs." /></div>
      <div class="form-group col-3"><label>7. अपघाती लाभ / AB / ADDB SA (Rs.)</label><input type="text" name="ei_ab_addb_sa[]" placeholder="Rs." /></div>
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

/* ════════════════════════════════════════════════
   normalizePdfJson(raw)
   Converts the lic_form_unfilled.json-style nested
   key names (output by Together.ai) to the
   schema.json-style names expected by fillFromJson().
   Safe to call on already-normalized data.
   ════════════════════════════════════════════════ */
function normalizePdfJson(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  // Normalise DD/MM/YYYY or DD-MM-YYYY → YYYY-MM-DD for date inputs; pass YYYY-MM-DD through
  function toDateInput(val) {
    if (!val) return undefined;
    var s = String(val).trim();
    if (/^(NA|N\/A|na|n\/a|-)$/i.test(s)) return undefined;
    // Already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // DD/MM/YYYY or DD-MM-YYYY
    var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0');
    return s;
  }

  // Convert YES/NO/true/false/string to boolean
  function toBool(val) {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'boolean') return val;
    var s = String(val).toUpperCase();
    if (s === 'YES' || s === 'Y') return true;
    if (s === 'NO'  || s === 'N') return false;
    return undefined;
  }

  var out = {};

  /* ── office_use ─────────────────────────────── */
  var ou = raw.office_use || {};
  if (Object.keys(ou).length) out.office_use = ou;

  /* ── section_i ──────────────────────────────── */
  var si = raw.section_i;
  if (si) {
    var nsi = {};
    nsi.customer_id = si.customer_id;
    nsi.kyc_number  = si.ckyc_number || si.kyc_number;

    // Name: support personal_details (new) or name (old)
    var pd = si.personal_details || si.name || {};
    nsi.name = { prefix: pd.prefix, first_name: pd.first_name,
                 middle_name: pd.middle_name, last_name: pd.last_name };

    nsi.father_name    = si.father_full_name || si.father_name;
    nsi.mother_name    = si.mother_full_name || si.mother_name;
    nsi.gender         = si.gender;
    nsi.marital_status = si.marital_status;
    nsi.spouse_name    = si.spouse_full_name || si.spouse_name;
    nsi.date_of_birth  = si.date_of_birth;
    nsi.place_of_birth = si.place_of_birth;
    nsi.age_proof      = si.nature_of_age_proof || si.age_proof;
    nsi.nationality    = si.nationality;
    nsi.citizenship    = si.citizenship;
    nsi.mobile         = si.mobile_number || si.mobile;
    nsi.email          = si.email_id || si.email;

    // Permanent address
    function mapAddr(a) {
      if (!a) return {};
      return {
        house: a.house_building_name_street || a.house,
        town:  a.town_village_taluka        || a.town,
        city:  a.district                   || a.city,
        state: a.state_country              || a.state,
        pin:   a.pin_code                   || a.pin,
        tel:   a.tel_no_with_std            || a.tel
      };
    }
    nsi.permanent_address = mapAddr(si.permanent_address);
    nsi.correspondence_address_same_as_permanent = si.correspondence_address_same_as_permanent;
    nsi.correspondence_address = mapAddr(si.correspondence_address);

    // Residential status
    var rs = si.residential_status_info || {};
    nsi.residential_status = si.residential_status || rs.status;
    nsi.oci_card = si.oci_card != null ? si.oci_card : rs.holding_oci_card;

    // KYC/PMLA
    var kyc = si.kyc_pmla || si.kyc_pmla_details || {};
    var gstR = kyc.gst_registered || {};
    var idD  = kyc.id_details     || {};
    nsi.kyc_pmla = {
      income_tax_assessee: kyc.income_tax_assessee != null ? kyc.income_tax_assessee : kyc.is_income_tax_assessee,
      pan:             kyc.pan       || kyc.pan_number,
      gstn_registered: kyc.gstn_registered != null ? kyc.gstn_registered : gstR.is_registered,
      gstin:           kyc.gstin     || gstR.gstin,
      id_proof_type:   kyc.id_proof_type  || idD.proof_of_identity,
      id_number:       kyc.id_number      || idD.id_number,
      id_expiry:       kyc.id_expiry      || idD.expiry_date,
      corr_proof:      kyc.corr_proof     || kyc.proof_of_correspondence_address
    };

    // Occupation
    var occ = si.occupation || si.occupation_details || {};
    var haz  = occ.hazardous_occupation_or_hobby  || {};
    var crim = occ.legal_criminal_proceedings      || {};
    var pepO = occ.politically_exposed_person      || {};
    nsi.occupation = {
      educational_qualification: occ.educational_qualification,
      present_occupation:        occ.present_occupation,
      source_of_income:          occ.source_of_income,
      employer_name:             occ.employer_name    || occ.name_of_present_employer,
      nature_of_duties:          occ.nature_of_duties || occ.exact_nature_of_duties,
      length_of_service:         occ.length_of_service,
      annual_income:             occ.annual_income,
      hazardous_occupation:      occ.hazardous_occupation != null ? occ.hazardous_occupation : haz.has_hazardous_activities,
      criminal_record:           occ.criminal_record  != null ? occ.criminal_record  : crim.has_legal_proceedings,
      pep:                       occ.pep              != null ? occ.pep              : pepO.is_pep
    };

    // Armed forces — merge si.armed_forces (schema.json) and occupation_details.armed_forces_employment (lic_form_unfilled)
    var af  = si.armed_forces || {};
    var afe = ((si.occupation_details || {}).armed_forces_employment) || {};
    nsi.armed_forces = {
      in_armed_forces:  af.in_armed_forces  != null ? af.in_armed_forces  : af.in_armed_forces,
      wing:             af.wing             || afe.wing,
      rank:             af.rank             || afe.rank,
      last_medical:     af.last_medical     || afe.last_medical_examination_date,
      medical_category: af.medical_category || afe.medical_examination_category,
      below_a1:         af.below_a1         != null ? af.below_a1 : (afe.below_a1_category && afe.below_a1_category.was_ever_below_a1),
      below_a1_when:    af.below_a1_when    || (afe.below_a1_category && afe.below_a1_category.if_so_when)
    };

    // Tax residency
    var tr = si.tax_residency || {};
    var trVal = tr.tax_resident_outside_india != null ? tr.tax_resident_outside_india
              : toBool(tr.is_tax_resident_outside_india);
    nsi.tax_residency = { tax_resident_outside_india: trVal };

    // Bank details
    var bk = si.bank_details || {};
    nsi.bank_details = {
      account_type:      bk.account_type,
      account_number:    bk.account_number,
      micr_code:         bk.micr_code,
      ifsc_code:         bk.ifsc_code,
      bank_name_address: bk.bank_name_address || bk.bank_name_and_address
    };

    out.section_i = nsi;
  }

  /* ── section_ii ─────────────────────────────── */
  var sii = raw.section_ii;
  if (sii) {
    var nsii = {};
    nsii.objective_of_insurance = sii.objective_of_insurance || sii.insurance_objective;
    nsii.proposal_under         = sii.proposal_under         || sii.proposal_type;

    // Plan: check both plan{} object and plan_details[0] (lic_form_unfilled page_7)
    var pl  = sii.plan  || {};
    var pd7 = (Array.isArray(sii.plan_details) && sii.plan_details[0]) || {};
    nsii.plan = {
      plan_name:        pl.plan_name,
      plan_no:          pl.plan_no,
      policy_term:      pl.policy_term      || pd7.term_and_premium_paying_term,
      sum_assured:      pl.sum_assured      || pd7.sum_assured,
      premium_mode:     pl.premium_mode     || pd7.mode_of_premium,
      premium_amount:   pl.premium_amount,
      policy_date_back: pl.policy_date_back || pd7.backdating_date
    };

    // Riders: check both riders{} and riders_selected{} (lic_form_unfilled page_7)
    var rd  = sii.riders          || {};
    var rs7 = sii.riders_selected || {};
    nsii.riders = {
      term_assurance_rider:     rd.term_assurance_rider     != null ? rd.term_assurance_rider     : rs7.new_term_assurance_rider,
      term_assurance_rider_sa:  rd.term_assurance_rider_sa  || pd7.term_rider_sum_assured,
      critical_illness_rider:   rd.critical_illness_rider   != null ? rd.critical_illness_rider   : rs7.new_critical_illness_benefit_rider,
      critical_illness_rider_sa: rd.critical_illness_rider_sa || pd7.ci_rider_sum_assured,
      pwb_rider:                rd.pwb_rider                != null ? rd.pwb_rider                : rs7.premium_waiver_benefit_rider,
      accident_benefit_rider:   rd.accident_benefit_rider   != null ? rd.accident_benefit_rider   : rs7.accident_benefit_rider_ab,
      addb_rider:               rd.addb_rider               != null ? rd.addb_rider               : rs7.accidental_death_disability_benefit_rider_addb,
      accident_benefit_sa:      rd.accident_benefit_sa      || rd.addb_rider_sa || pd7.accident_benefit_sum_assured
    };

    // Police: check police_personnel{} and police_duty_details{} (lic_form_unfilled page_8)
    var pp  = sii.police_personnel    || {};
    var pdd = sii.police_duty_details || {};
    nsii.police_personnel = {
      is_police:     pp.is_police     != null ? pp.is_police     : pdd.engaged_in_police_duty,
      on_duty_rider: pp.on_duty_rider != null ? pp.on_duty_rider : pdd.wish_to_avail_rider_on_duty
    };

    // SSS
    var sss  = sii.sss_details        || {};
    var sssp = sii.sss_policy_details || {};
    nsii.sss_details = {
      authority: sss.authority || sssp.paying_authority_code_and_dept_no,
      badge_no:  sss.badge_no  || sssp.badge_or_sr_no
    };

    nsii.pwb_agreement = sii.pwb_agreement;

    // Simultaneous proposals
    var sp       = sii.simultaneous_proposals || {};
    var spOther  = sp.other_proposal_under_consideration  || {};
    var spSpouse = sp.proposed_with_spouse_or_children    || {};
    nsii.simultaneous_proposals = {
      any_pending:     sp.any_pending     != null ? sp.any_pending     : toBool(spOther.has_proposal),
      spouse_proposal: sp.spouse_proposal != null ? sp.spouse_proposal : toBool(spSpouse.has_proposal)
    };

    // Settlement options
    var smObj = typeof sii.settlement_option_maturity === 'object' ? sii.settlement_option_maturity : {};
    var sdObj = typeof sii.settlement_option_death    === 'object' ? sii.settlement_option_death    : {};
    nsii.settlement_option_maturity = typeof sii.settlement_option_maturity === 'boolean' ? sii.settlement_option_maturity : toBool(smObj.wish_to_avail);
    nsii.settlement_option_death    = typeof sii.settlement_option_death    === 'boolean' ? sii.settlement_option_death    : toBool(sdObj.wish_to_avail);
    nsii.lic_portal_registered      = typeof sii.lic_portal_registered     === 'boolean' ? sii.lic_portal_registered      : toBool(sii.lic_portal_registered);

    out.section_ii = nsii;
  }

  /* ── section_iii ────────────────────────────── */
  var siii = raw.section_iii;
  if (siii) {
    var nsiii = {};

    // Physical metrics
    var phR = siii.personal_health || {};
    var pmR = siii.physical_metrics || {};
    var nph = Object.assign({}, phR);
    nph.height_cm = phR.height_cm || pmR.height_cm;
    nph.weight_kg = phR.weight_kg || pmR.weight_kg;

    // Medical history questions (lic_form_unfilled page_10 naming)
    var mhq = siii.medical_history_questions || {};
    var qConsult = mhq.consulted_practitioner_last_5_years          || {};
    var qAdmit   = mhq.admitted_to_hospital_last_5_years            || {};
    var qAbsent  = mhq.absent_from_work_health_grounds_last_5_years || {};
    if (nph.medical_consultation_5yrs === undefined) nph.medical_consultation_5yrs = toBool(qConsult.has_consulted);
    if (nph.hospital_admission         === undefined) nph.hospital_admission         = toBool(qAdmit.was_admitted);
    if (nph.absence_from_work          === undefined) nph.absence_from_work          = toBool(qAbsent.was_absent);

    // Ailment checklists (pages 10 + 11)
    var ac10 = siii.ailment_checklist            || {};
    var ac11 = siii.additional_ailment_checklist || {};
    if (!nph.diseases) nph.diseases = {};
    var dis = nph.diseases;
    function setDis(k, v) { if (dis[k] === undefined) dis[k] = toBool(v); }
    setDis('lungs_respiratory',  ac10.respiratory_or_persistent_cough);
    setDis('hypertension',       ac10.hypertension_heart_or_arteries_disease);
    setDis('digestive',          ac10.digestive_or_glandular_disorder);
    setDis('kidney_urinary',     ac10.kidney_or_urinary_system_disease);
    setDis('neurological',       ac10.neurological_or_brain_disorder);
    setDis('hernia_venereal',    ac10.hernia_or_venereal_disease);
    setDis('cancer',             ac11.cancer_leukemia_lymphoma_tumour_cyst_blood_disorder);
    setDis('eyes_ent',           ac11.ear_nose_throat_or_eye_disease);
    setDis('diabetes_endocrine', ac11.endocrine_disorders_diabetes_goitre_thyroid);
    setDis('bone_joint',         ac11.bone_joint_spine_arthritis);
    setDis('mental',             ac11.mental_disorder_depression_anxiety);
    setDis('infectious',         ac11.chronic_infections_tuberculosis_pleurisy_skin_disease_leprosy);
    setDis('hepatitis_aids',     ac11.hepatitis_aids_hiv);
    setDis('operations_injuries', ac11.operation_accident_injury_bodily_defect_deformity);
    setDis('other',              ac11.any_other_disease);

    // Medical history table → disease_details
    var mht = siii.medical_history_table || [];
    if (!nph.disease_details && mht.length) {
      nph.disease_details = mht.map(function(r) {
        var tx = r.still_on_treatment || {};
        return { nature: r.nature_of_disease, date: r.date_of_diagnosis,
                 recovered: r.fully_recovered, treatment: tx.treatment_details,
                 doctor_name: r.doctor_hospital_details };
      });
    }
    nsiii.personal_health = nph;

    // Personal habits
    var hb   = siii.personal_habits || {};
    var alc  = (typeof hb.alcohol  === 'object' && hb.alcohol)  || hb.alcoholic_drinks || {};
    var narc = (typeof hb.narcotics === 'object' && hb.narcotics) || {};
    var odrug = (typeof hb.other_drugs === 'object' && hb.other_drugs) || {};
    var tob  = (typeof hb.tobacco  === 'object' && hb.tobacco)  || hb.tobacco_consumption_last_60_months || {};
    nsiii.personal_habits = {
      alcohol:          typeof hb.alcohol   === 'boolean' ? hb.alcohol   : toBool(alc.consumes),
      alcohol_qty:      hb.alcohol_qty      || alc.quantity_and_duration,
      alcohol_stopped:  hb.alcohol_stopped  || alc.stopped_since_months,
      narcotics:        typeof hb.narcotics === 'boolean' ? hb.narcotics : toBool(narc.consumes),
      narcotics_qty:    hb.narcotics_qty    || narc.quantity_and_duration,
      narcotics_stopped: hb.narcotics_stopped || narc.stopped_since_months,
      other_drugs:      typeof hb.other_drugs === 'boolean' ? hb.other_drugs : toBool(odrug.consumes),
      other_drugs_qty:  hb.other_drugs_qty  || odrug.quantity_and_duration,
      other_drugs_stopped: hb.other_drugs_stopped || odrug.stopped_since_months,
      tobacco:          typeof hb.tobacco   === 'boolean' ? hb.tobacco   : toBool(tob.consumes),
      tobacco_qty:      hb.tobacco_qty      || tob.quantity_and_duration,
      tobacco_stopped:  hb.tobacco_stopped  || tob.stopped_since_months
    };

    nsiii.present_health_state = siii.present_health_state || siii.usual_health_status;

    // Family health
    var fh    = siii.family_health || {};
    var fhTab = siii.family_history_table || [];
    var nfh   = Object.assign({}, fh);
    if (fhTab.length && !fh.father) {
      var fhMap = {};
      fhTab.forEach(function(row) {
        var rel = (row.relation || '').toLowerCase();
        fhMap[rel] = { age_if_alive: row.status === 'Alive' ? row.age : undefined,
                       health: row.state_of_health,
                       age_at_death:   row.status === 'Dead' ? row.age_at_death : undefined,
                       cause_of_death: row.year_or_cause_of_death };
      });
      nfh.father = fhMap['father'] || {};
      nfh.mother = fhMap['mother'] || {};
      nfh.spouse = fhMap['spouse'] || {};
    }
    var fhHist = siii.family_details_illness_history || {};
    if (nfh.any_hereditary_disease === undefined && fhHist.has_history !== undefined)
      nfh.any_hereditary_disease = fhHist.has_history;
    nsiii.family_health = nfh;

    out.section_iii = nsiii;
  }

  /* ── section_iv ─────────────────────────────── */
  var siv = raw.section_iv || {};
  // Also pick up top-level fields if the model didn't nest them under section_iv
  var sivEiTable  = siv.existing_insurance_table  || raw.existing_insurance_table;
  var sivNomDet   = siv.nominee_details           || raw.nominee_details;
  var sivWitDet   = siv.witness_details           || raw.witness_details;
  if (siv || sivEiTable || sivNomDet) {
    var nsiv = {};
    var eiRaw = siv.existing_insurance;
    var eiArr = Array.isArray(eiRaw) ? eiRaw
              : (eiRaw && Array.isArray(eiRaw.policies)) ? eiRaw.policies
              : Array.isArray(sivEiTable) ? sivEiTable
              : [];
    nsiv.existing_insurance = {
      policies: eiArr.map(function(p) {
        return { policy_no:         p.policy_no         || p.policy_number,
                 insurer:           p.insurer            || p.insurer_name  || p.insurer_name_division_branch,
                 plan_name:         p.plan_name          || p.plan_and_term,
                 sum_assured:       p.sum_assured,
                 term_rider_sa:     p.term_rider_sa      || p.term_rider_sum_assured,
                 ci_rider_sa:       p.ci_rider_sa        || p.ci_rider_sum_assured,
                 ab_addb_sa:        p.ab_addb_sa         || p.ab_addb_sum_assured,
                 commencement_date: toDateInput(p.commencement_date  || p.date_of_commencement),
                 revival_date:      toDateInput(p.revival_date       || p.date_of_revival),
                 accepted:          p.accepted           || p.accepted_at_ordinary_rate,
                 accepted_details:  p.accepted_details   || p.details_if_not_ordinary_rate,
                 medical_type:      p.medical_type       || p.medical_non_medical,
                 inforce:           p.inforce            || p.in_force,
                 fup_surrender_date: toDateInput(p.fup_surrender_date || p.date_of_fup_or_surrender) };
      }),
      q14a_proposals_declined: eiRaw && eiRaw.q14a_proposals_declined,
      q14b_policy_lapsed:      eiRaw && eiRaw.q14b_policy_lapsed,
      q14c_policy_assignment:  eiRaw && eiRaw.q14c_policy_assignment,
      q14d_other_proposals:    eiRaw && eiRaw.q14d_other_proposals
    };
    // Also pick up q14 from proposal_history (lic_form_unfilled page_5)
    var ph5 = siv.proposal_history || {};
    var phd = ph5.proposal_details || {};
    if (nsiv.existing_insurance.q14a_proposals_declined == null && ph5.has_other_proposals != null)
      nsiv.existing_insurance.q14a_proposals_declined = toBool(ph5.has_other_proposals);

    // Nominees — also check top-level nominee_details
    var nom    = siv.nominee || {};
    var nomDet = sivNomDet || {};
    var nomArr = Array.isArray(sivNomDet) ? sivNomDet
               : (nom.nominees && Array.isArray(nom.nominees)) ? nom.nominees
               : [];
    nsiv.nominee = {
      nomination_type: nom.nomination_type || (typeof nomDet === 'object' && nomDet.nomination_type),
      nominees: nomArr.map(function(n) {
        var ap = n.appointee_details || {};
        return { name:          n.name          || n.nominee_name_and_address,
                 share_percent: n.share_percent  || n.percentage_share,
                 age:           n.age,
                 relationship:  n.relationship   || n.relationship_with_life_to_be_assured,
                 appointee_name: n.appointee_name || ap.full_name,
                 appointee_rel:  n.appointee_rel  || ap.relationship_to_nominee,
                 id_type:        n.id_type,
                 id_number:      n.id_number };
      })
    };

    // Declaration
    var decl  = siv.declaration       || {};
    var declD = siv.declaration_date  || {};
    nsiv.declaration = Object.assign({}, decl);
    if (!decl.date && (declD.year || declD.day)) {
      nsiv.declaration.date = (declD.year || '') + '-' + (declD.month || '') + '-' + (declD.day || '');
    }
    // la_name from declaration_section.applicant_name (lic_form_unfilled page_13)
    var declSec = siv.declaration_section || {};
    if (!nsiv.declaration.la_name && declSec.applicant_name) nsiv.declaration.la_name = declSec.applicant_name;

    // Witness — also check top-level witness_details
    var wit  = siv.witness  || {};
    var witD = sivWitDet    || {};
    nsiv.witness = { name:       wit.name       || witD.name,
                     occupation: wit.occupation || witD.occupation,
                     address:    wit.address    || witD.address };

    out.section_iv = nsiv;
  }

  /* ── pass-through sections ──────────────────── */
  ['addendum_1_settlement_maturity', 'addendum_2_death_benefit_instalments',
   'addendum_plan_specific', 'moral_hazard_report',
   'insurance_suitability_questionnaire', 'annexure_i'
  ].forEach(function(k) { if (raw[k]) out[k] = raw[k]; });

  return out;
}

/* ════════════════════════════════════════════════
   fillFromJson(data)
   Auto-populate the entire form from a JSON object
   matching schema.json.  Call this after PDF parsing:
     fillFromJson(parsedJsonFromPdf);
   ════════════════════════════════════════════════ */
function fillFromJson(data) {
  if (!data) return;
  data = normalizePdfJson(data);

  /* ── Internal helpers ────────────────────────── */
  function v(selector, val) {
    if (val == null || val === '') return;
    var el = document.querySelector(selector);
    if (el) el.value = val;
  }
  function byId(id, val)   { v('#' + id, val); }
  function byName(nm, val) { v('[name="' + nm + '"]', val); }

  // Set a radio by name+value and fire change to trigger conditional logic
  function radio(name, val) {
    if (val == null) return;
    var el = document.querySelector('input[name="' + name + '"][value="' + val + '"]');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles: true})); }
  }
  // Boolean → Y/N radio
  function yn(name, boolVal) {
    if (boolVal == null) return;
    radio(name, boolVal ? 'Y' : 'N');
  }
  // Checkbox by name
  function check(nm, boolVal) {
    if (boolVal == null) return;
    var el = document.querySelector('input[name="' + nm + '"]');
    if (el) el.checked = !!boolVal;
  }
  // Checkbox by id
  function checkId(id, boolVal) {
    if (boolVal == null) return;
    var el = document.getElementById(id);
    if (el) el.checked = !!boolVal;
  }
  // Select – exact match first, then partial text match for multilingual options
  function matchSelect(el, val) {
    if (!el || val == null) return;
    var opts = Array.from(el.options);
    var lc   = String(val).toLowerCase();
    var opt  = opts.find(function(o) { return o.value === String(val); });
    if (!opt) opt = opts.find(function(o) { return o.text  === String(val); });
    if (!opt) opt = opts.find(function(o) { return o.text.toLowerCase().includes(lc) || o.value.toLowerCase().includes(lc); });
    if (opt) el.value = opt.value;
  }
  function sel(name, val) {
    var el = document.querySelector('[name="' + name + '"]');
    if (!el) return;
    matchSelect(el, val);
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  function selId(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    matchSelect(el, val);
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  // Safe nested access without throwing
  function g(obj) {
    var result = obj;
    for (var i = 1; i < arguments.length; i++) {
      if (result == null) return undefined;
      result = result[arguments[i]];
    }
    return result;
  }

  /* ── Office Use ─────────────────────────────── */
  var ou = g(data, 'office_use');
  if (ou) {
    byName('inward_no',        ou.inward_no);
    byName('proposal_no',      ou.proposal_no);
    byName('ou_date',          ou.date);
    byName('date_of_proposal', ou.date_of_proposal);
    byName('date_of_deposit',  ou.date_of_deposit);
    byName('boc_no',           ou.boc_no);
    byName('amt_of_deposit',   ou.amt_of_deposit);
  }

  /* ── Section I – Personal Details ───────────── */
  var si = g(data, 'section_i');
  if (si) {
    byId('customer_id', si.customer_id);
    byId('kyc_number',  si.kyc_number);
    var nm = si.name || {};
    selId('name_prefix', nm.prefix);
    byId('first_name',   nm.first_name);
    byId('middle_name',  nm.middle_name);
    byId('last_name',    nm.last_name);
    byId('father_name', si.father_name);
    byId('mother_name', si.mother_name);
    if (si.gender) {
      radio('gender', si.gender);
      var femaleSec = document.getElementById('femalePropSection');
      if (femaleSec) femaleSec.style.display = (si.gender === 'Female') ? '' : 'none';
    }
    if (si.marital_status) selId('marital_status', si.marital_status);
    byId('spouse_name',  si.spouse_name);
    if (si.date_of_birth) {
      byId('dob', si.date_of_birth);
      var dobEl = document.getElementById('dob');
      if (dobEl) dobEl.dispatchEvent(new Event('change', {bubbles: true}));
    }
    byId('place_of_birth', si.place_of_birth);
    selId('age_proof',     si.age_proof);
    byId('nationality',    si.nationality);
    byId('citizenship',    si.citizenship);
    var pa = si.permanent_address || {};
    byId('perm_house', pa.house);
    byId('perm_town',  pa.town);
    byId('perm_city',  pa.city);
    byId('perm_state', pa.state);
    byId('perm_pin',   pa.pin);
    byId('perm_tel',   pa.tel);
    if (si.correspondence_address_same_as_permanent != null)
      radio('corr_same', si.correspondence_address_same_as_permanent ? 'Y' : 'N');
    var ca = si.correspondence_address || {};
    byName('corr_house', ca.house);
    byName('corr_town',  ca.town);
    byName('corr_city',  ca.city);
    byName('corr_state', ca.state);
    byName('corr_pin',   ca.pin);
    byName('corr_tel',   ca.tel);
    if (si.residential_status) radio('residential_status', si.residential_status);
    if (si.oci_card != null)   yn('oci_card', si.oci_card);
    byName('la_mobile', si.mobile);
    byName('la_email',  si.email);
    var kyc = si.kyc_pmla || {};
    if (kyc.income_tax_assessee != null) yn('income_tax_assessee', kyc.income_tax_assessee);
    byId('pan', kyc.pan);
    if (kyc.gstn_registered != null) radio('gstn_registered', kyc.gstn_registered ? 'Y' : 'N');
    byId('gstin', kyc.gstin);
    if (kyc.id_proof_type) radio('kyc_id_type', kyc.id_proof_type);
    byId('id_number', kyc.id_number);
    byId('id_expiry', kyc.id_expiry);
    byId('corr_proof', kyc.corr_proof);
    var occ = si.occupation || {};
    byId('educational_qualification', occ.educational_qualification);
    byId('present_occupation',        occ.present_occupation);
    selId('source_of_income',         occ.source_of_income);
    byId('employer_name',             occ.employer_name);
    byId('nature_of_duties',          occ.nature_of_duties);
    byId('length_of_service',         occ.length_of_service);
    byId('annual_income',             occ.annual_income);
    if (occ.hazardous_occupation != null) yn('hazardous_occ', occ.hazardous_occupation);
    if (occ.criminal_record != null)      yn('criminal_record', occ.criminal_record);
    if (occ.pep != null)                  yn('pep', occ.pep);
    var af = si.armed_forces || {};
    if (af.in_armed_forces != null) yn('armed_forces', af.in_armed_forces);
    byName('armed_wing',             af.wing);
    byName('armed_rank',             af.rank);
    byName('armed_last_medical',     af.last_medical);
    byName('armed_medical_category', af.medical_category);
    if (af.below_a1 != null)         yn('armed_below_a1', af.below_a1);
    byName('armed_below_a1_when',    af.below_a1_when);
    var tr = si.tax_residency || {};
    if (tr.tax_resident_outside_india != null) yn('tax_outside_india', tr.tax_resident_outside_india);
    var bk = si.bank_details || {};
    selId('bank_account_type', bk.account_type);
    byId('bank_account_no',    bk.account_number);
    byId('bank_micr',          bk.micr_code);
    byId('bank_ifsc',          bk.ifsc_code);
    byId('bank_name_address',  bk.bank_name_address);
  }

  /* ── Section II – Proposed Plan Details ─────── */
  var sii = g(data, 'section_ii');
  if (sii) {
    if (sii.objective_of_insurance) radio('obj_insurance', sii.objective_of_insurance);
    if (sii.proposal_under)         radio('proposal_under', sii.proposal_under);
    var pl = sii.plan || {};
    byName('plan_name',        pl.plan_name);
    byName('plan_no',          pl.plan_no);
    byName('policy_term',      pl.policy_term);
    byName('sum_assured',      pl.sum_assured);
    sel('premium_mode',        pl.premium_mode);
    byName('premium_amount',   pl.premium_amount);
    byName('policy_date_back', pl.policy_date_back);
    var rd = sii.riders || {};
    check('rider_term', rd.term_assurance_rider);
    if (rd.term_assurance_rider !== false) byName('term_rider_sa', rd.term_assurance_rider_sa);
    check('rider_ci',   rd.critical_illness_rider);
    if (rd.critical_illness_rider !== false) byName('ci_benefit', rd.critical_illness_rider_sa);
    if (rd.pwb_rider != null) {
      check('rider_pwb', rd.pwb_rider);
      if (rd.pwb_rider) {
        var pwbEl = document.getElementById('riderPWB');
        if (pwbEl) pwbEl.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }
    check('rider_ab',  rd.accident_benefit_rider);
    check('rider_adb', rd.addb_rider);
    if (rd.accident_benefit_rider !== false || rd.addb_rider !== false)
      byName('accident_benefit', rd.accident_benefit_sa || rd.addb_rider_sa);
    var pp = sii.police_personnel || {};
    if (pp.is_police != null)     yn('police_duty',      pp.is_police);
    if (pp.on_duty_rider != null) yn('police_rider_duty', pp.on_duty_rider);
    var sss = sii.sss_details || {};
    byId('sss_authority', sss.authority);
    byId('sss_badge',     sss.badge_no);
    if (sii.pwb_agreement != null)              yn('pwb_agree',         sii.pwb_agreement);
    var sp = sii.simultaneous_proposals || {};
    if (sp.any_pending != null)     yn('simultaneous_pending', sp.any_pending);
    if (sp.spouse_proposal != null) yn('simultaneous_spouse',  sp.spouse_proposal);
    if (sii.lic_portal_registered != null)      yn('lic_portal',         sii.lic_portal_registered);
    if (sii.settlement_option_maturity != null) yn('settlement_maturity', sii.settlement_option_maturity);
    if (sii.settlement_option_death != null)    yn('settlement_death',    sii.settlement_option_death);
  }

  /* ── Section III – Health & Family ──────────── */
  var siii = g(data, 'section_iii');
  if (siii) {
    var ph = siii.personal_health || {};
    byId('height', ph.height_cm);
    byId('weight', ph.weight_kg);
    if (ph.medical_consultation_5yrs != null) yn('hq_b', ph.medical_consultation_5yrs);
    if (ph.hospital_admission != null)        yn('hq_c', ph.hospital_admission);
    if (ph.absence_from_work != null)         yn('hq_d', ph.absence_from_work);
    var dis = ph.diseases || {};
    var disMap = [
      ['dis_1',  'lungs_respiratory'],  ['dis_2',  'hypertension'],
      ['dis_3',  'digestive'],          ['dis_4',  'kidney_urinary'],
      ['dis_5',  'neurological'],       ['dis_6',  'hernia_venereal'],
      ['dis_7',  'cancer'],             ['dis_8',  'eyes_ent'],
      ['dis_9',  'diabetes_endocrine'], ['dis_10', 'bone_joint'],
      ['dis_11', 'mental'],             ['dis_12', 'infectious'],
      ['dis_13', 'hepatitis_aids'],     ['dis_14', 'operations_injuries'],
      ['dis_15', 'other']
    ];
    disMap.forEach(function(pair) { if (dis[pair[1]] != null) yn(pair[0], dis[pair[1]]); });
    var anyDisYes = disMap.some(function(pair) { return dis[pair[1]]; });
    if (anyDisYes) {
      var ddBlock = document.getElementById('diseaseDetailsBlock');
      if (ddBlock) ddBlock.style.display = 'block';
    }
    var ddArr  = ph.disease_details || [];
    var ddBody = document.getElementById('diseaseDetailsBody');
    if (ddBody && ddArr.length) {
      ddBody.innerHTML = '';
      ddArr.forEach(function(dd) {
        addDiseaseRow();
        var rows = ddBody.querySelectorAll('tr');
        var row  = rows[rows.length - 1];
        var rv = function(s, val) { var el = row.querySelector(s); if (el && val != null) el.value = val; };
        rv('[name="dd_nature[]"]',    dd.nature);
        rv('[name="dd_date[]"]',      dd.date);
        rv('[name="dd_recovered[]"]', dd.recovered);
        rv('[name="dd_treatment[]"]', dd.treatment);
        rv('[name="dd_doctor[]"]',    dd.doctor_name);
      });
    }
    var hb = siii.personal_habits || {};
    if (hb.alcohol != null)     yn('habit_alcohol', hb.alcohol);
    byName('habit_alcohol_qty',       hb.alcohol_qty);
    byName('habit_alcohol_stopped',   hb.alcohol_stopped);
    if (hb.narcotics != null)   yn('habit_narcotics', hb.narcotics);
    byName('habit_narcotics_qty',     hb.narcotics_qty);
    byName('habit_narcotics_stopped', hb.narcotics_stopped);
    if (hb.other_drugs != null) yn('habit_other_drugs', hb.other_drugs);
    byName('habit_other_drugs_qty',     hb.other_drugs_qty);
    byName('habit_other_drugs_stopped', hb.other_drugs_stopped);
    if (hb.tobacco != null)     yn('habit_tobacco', hb.tobacco);
    byName('habit_tobacco_qty',     hb.tobacco_qty);
    byName('habit_tobacco_stopped', hb.tobacco_stopped);
    sel('health_state', siii.present_health_state);
    var fh = siii.family_health || {};
    if (fh.any_hereditary_disease != null) yn('family_disease', fh.any_hereditary_disease);
    var fhFather = fh.father || {};
    byName('fh_father_liv_age',    fhFather.age_if_alive);
    byName('fh_father_liv_health', fhFather.health);
    byName('fh_father_dead_age',   fhFather.age_at_death);
    byName('fh_father_dead_cause', fhFather.cause_of_death);
    var fhMother = fh.mother || {};
    byName('fh_mother_liv_age',    fhMother.age_if_alive);
    byName('fh_mother_liv_health', fhMother.health);
    byName('fh_mother_dead_age',   fhMother.age_at_death);
    byName('fh_mother_dead_cause', fhMother.cause_of_death);
    var fhSpouse = fh.spouse || {};
    byName('fh_spouse_liv_age',    fhSpouse.age_if_alive);
    byName('fh_spouse_liv_health', fhSpouse.health);
    byName('fh_spouse_dead_age',   fhSpouse.age_at_death);
    byName('fh_spouse_dead_cause', fhSpouse.cause_of_death);
  }

  /* ── Section IV – Declaration & Nominees ────── */
  var siv = g(data, 'section_iv');
  if (siv) {
    var eiCont   = document.getElementById('existingInsuranceBody');
    var policies = g(siv, 'existing_insurance', 'policies') || [];
    if (eiCont && policies.length) {
      eiCont.innerHTML = '';
      policies.forEach(function(p) {
        addInsuranceRow();
        var cards = eiCont.querySelectorAll('.ei-card');
        var card  = cards[cards.length - 1];
        var cv = function(s, val) { var el = card.querySelector(s); if (el && val != null) el.value = val; };
        var cs = function(s, val) { var el = card.querySelector(s); matchSelect(el, val); };
        cv('[name="ei_policy_no[]"]',     p.policy_no);
        cv('[name="ei_insurer[]"]',       p.insurer);
        cv('[name="ei_plan[]"]',          p.plan_name);
        cv('[name="ei_sa[]"]',            p.sum_assured);
        cv('[name="ei_term_rider_sa[]"]', p.term_rider_sa);
        cv('[name="ei_ci_rider_sa[]"]',   p.ci_rider_sa);
        cv('[name="ei_ab_addb_sa[]"]',    p.ab_addb_sa);
        cv('[name="ei_commencement[]"]',  p.commencement_date);
        cv('[name="ei_revival[]"]',       p.revival_date);
        cs('[name="ei_accepted[]"]',      p.accepted);
        cv('[name="ei_accepted_details[]"]', p.accepted_details);
        cs('[name="ei_medical[]"]',       p.medical_type);
        cs('[name="ei_inforce[]"]',       p.inforce);
        cv('[name="ei_fup_surrender[]"]', p.fup_surrender_date);
      });
    }
    var ei = siv.existing_insurance || {};
    if (ei.q14a_proposals_declined != null) yn('ei_q14a', ei.q14a_proposals_declined);
    if (ei.q14b_policy_lapsed != null)      yn('ei_q14b', ei.q14b_policy_lapsed);
    if (ei.q14c_policy_assignment != null)  yn('ei_q14c', ei.q14c_policy_assignment);
    if (ei.q14d_other_proposals != null)    yn('ei_q14d', ei.q14d_other_proposals);
    var nomCont = document.getElementById('nomineeBody');
    var noms    = g(siv, 'nominee', 'nominees') || [];
    if (nomCont && noms.length) {
      nomCont.innerHTML = '';
      var nomType = g(siv, 'nominee', 'nomination_type');
      if (nomType) radio('nom_type', nomType);
      noms.forEach(function(nom) {
        addNomineeRow();
        var cards = nomCont.querySelectorAll('.ei-card');
        var card  = cards[cards.length - 1];
        var cv = function(s, val) { var el = card.querySelector(s); if (el && val != null) el.value = val; };
        var cs = function(s, val) { var el = card.querySelector(s); matchSelect(el, val); };
        cv('[name="nom_name[]"]',      nom.name);
        cv('[name="nom_share[]"]',     nom.share_percent);
        cv('[name="nom_age[]"]',       nom.age);
        cv('[name="nom_rel[]"]',       nom.relationship);
        cv('[name="nom_appointee[]"]', nom.appointee_name);
        cv('[name="nom_app_rel[]"]',   nom.appointee_rel);
        cs('[name="nom_id_type[]"]',   nom.id_type);
        cv('[name="nom_id_number[]"]', nom.id_number);
      });
    }
    var decl = siv.declaration || {};
    byName('decl_la_name',    decl.la_name);
    byName('decl_la_name_hi', decl.la_name);
    byName('decl_dated_at',   decl.place);
    if (decl.date) {
      var dp = decl.date.split('-');
      if (dp.length === 3) {
        byName('decl_day',      dp[2]);
        byName('decl_month_en', dp[1]);
        byName('decl_year_en',  dp[0]);
        byName('decl_tarikh',   dp[2]);
        byName('decl_maah',     dp[1]);
        byName('decl_year_hi',  dp[0]);
        byName('decl_roji',     dp[2]);
        byName('decl_year_mr',  dp[0]);
      }
    }
    var wit = siv.witness || {};
    byName('witness_name',         wit.name);
    byName('witness_occupation',   wit.occupation);
    byName('witness_address_main', wit.address);
  }

  /* ── Addendum 1 – Settlement Option (Maturity) ─ */
  var add1 = g(data, 'addendum_1_settlement_maturity');
  if (add1) {
    byName('add1_proposal_no', add1.proposal_no);
    if (add1.avail_option != null) radio('add1_avail', add1.avail_option ? 'yes' : 'no');
    if (add1.period_years)         radio('add1_period', String(add1.period_years));
    if (add1.benefit_type)         radio('add1_benefit_type', add1.benefit_type.toLowerCase());
    byName('add1_abs_amt', add1.partial_amount);
    byName('add1_pct',     add1.partial_percent);
    if (add1.payment_mode)         radio('add1_mode', add1.payment_mode.toLowerCase().replace('-', ''));
    byName('add1_place',    add1.place);
    byName('add1_date',     add1.date);
    byName('add1_lba_name', add1.lba_name);
  }

  /* ── Addendum 2 – Death Benefit Instalments ──── */
  var add2 = g(data, 'addendum_2_death_benefit_instalments');
  if (add2) {
    byName('add2_proposal_no', add2.proposal_no);
    if (add2.avail_option != null) radio('add2_avail', add2.avail_option ? 'yes' : 'no');
    if (add2.period_years)         radio('add2_period', String(add2.period_years));
    if (add2.benefit_type)         radio('add2_benefit_type', add2.benefit_type.toLowerCase());
    byName('add2_abs_amt', add2.partial_amount);
    byName('add2_pct',     add2.partial_percent);
    if (add2.payment_mode)         radio('add2_mode', add2.payment_mode.toLowerCase().replace('-', ''));
    byName('add2_place',    add2.place);
    byName('add2_date',     add2.date);
    byName('add2_lba_name', add2.lba_name);
  }

  /* ── Addendum – Plan-Specific Details ────────── */
  var aps = g(data, 'addendum_plan_specific');
  if (aps) {
    var ds = aps.dhan_sanchay_865 || {};
    if (ds.benefit_option) radio('ps_benefit_opt', ds.benefit_option);
    if (ds.payout_modes && ds.payout_modes.indexOf('Yearly') > -1) check('ps_payout_yearly', true);
    var ja = aps.jeevan_azad_868 || {};
    byName('ps_azad_bsa', ja.existing_bsa);
    if (ja.simultaneous != null) radio('ps_azad_simul', ja.simultaneous ? 'yes' : 'no');
    byName('ps_azad_simul_details', ja.simul_details);
    var dv = aps.dhan_vriddhi_869 || {};
    if (dv.death_benefit_option) radio('ps_vriddhi_opt', String(dv.death_benefit_option));
    var jk = aps.jeevan_kiran_870 || {};
    if (jk.category) radio('ps_kiran_category', jk.category.toLowerCase());
    var ju = aps.jeevan_utsav_871 || {};
    if (ju.benefit_option) radio('ps_utsav_opt', String(ju.benefit_option));
    var aas = aps.aadhar_stambh_shila_943_944 || {};
    byName('ps_aadhar_bsa', aas.existing_sa);
    if (aas.simultaneous != null) radio('ps_aadhar_simul', aas.simultaneous ? 'yes' : 'no');
    byName('ps_aadhar_simul_details', aas.simul_details);
    var nja = aps.new_jeevan_amar_955 || {};
    if (nja.category) radio('ps_amar_category', nja.category.toLowerCase());
    if (nja.death_benefit_option) radio('ps_amar_death_opt', nja.death_benefit_option.indexOf('II') > -1 ? 'II' : 'I');
    byName('ps_place_date',     aps.place);
    byName('ps_place_date_p19', aps.place);
  }

  /* ── Moral Hazard Report ─────────────────────── */
  var mhr = g(data, 'moral_hazard_report');
  if (mhr) {
    var mhrA = mhr.agent || {};
    byName('mhr_agent_name',    mhrA.name);
    byName('mhr_agent_code',    mhrA.code);
    byName('mhr_agent_mobile',  mhrA.mobile);
    byName('mhr_agent_club',    mhrA.club_status);
    byName('mhr_agent_license', mhrA.licence_no);
    byName('mhr_agent_expiry',  mhrA.licence_expiry);
    var mhrDo = mhr.do || {};
    byName('mhr_do_name',   mhrDo.name);
    byName('mhr_do_code',   mhrDo.code);
    byName('mhr_do_mobile', mhrDo.mobile);
    var m1 = mhr.section_i_product || {};
    byName('mhr_1a', m1.proposer_name);
    byName('mhr_1b', m1.age);
    byName('mhr_1c', m1.plan_and_term);
    byName('mhr_1d', m1.sum_assured);
    if (m1.plan_explained             != null) yn('mhr_1e', m1.plan_explained);
    if (m1.plan_suitable              != null) yn('mhr_1f', m1.plan_suitable);
    if (m1.benefit_illustration_given != null) yn('mhr_1g', m1.benefit_illustration_given);
    var m2 = mhr.section_ii_proposer || {};
    byName('mhr_2a', m2.acquaintance_duration);
    if (m2.is_relative        != null) yn('mhr_2b', m2.is_relative);
    byName('mhr_2c', m2.relative_details);
    byName('mhr_2d', m2.education);
    if (m2.is_fnio_oci        != null) yn('mhr_2e', m2.is_fnio_oci);
    if (m2.is_pep             != null) yn('mhr_2f', m2.is_pep);
    if (m2.kyc_pmla_complied  != null) yn('mhr_2g', m2.kyc_pmla_complied);
    var m3 = mhr.section_iii_financial || {};
    byName('mhr_3a', m3.income_source);
    byName('mhr_3b', m3.employment);
    byName('mhr_3c', m3.huf);
    byName('mhr_3d', m3.other_sources);
    var proofs = m3.income_proofs || [];
    check('mhr_3e_itr',    proofs.indexOf('ITR')            > -1);
    check('mhr_3e_bank',   proofs.indexOf('Bank Statement') > -1);
    check('mhr_3e_salary', proofs.indexOf('Salary Slip')    > -1);
    check('mhr_3e_ca',     proofs.indexOf('CA Certificate') > -1);
    byName('mhr_3f', m3.pan_verified);
    if (m3.financially_sound != null) yn('mhr_3g', m3.financially_sound);
    var m4 = mhr.section_iv_previous_insurance || {};
    if (m4.has_previous_policy      != null) yn('mhr_4a', m4.has_previous_policy);
    if (m4.declined_deferred_before != null) yn('mhr_4b', m4.declined_deferred_before);
    var m5 = mhr.section_v_health || {};
    byName('mhr_5a', m5.health_status);
    if (m5.physical_mental_defects  != null) yn('mhr_5b', m5.physical_mental_defects);
    if (m5.illness_injury_operation != null) yn('mhr_5c', m5.illness_injury_operation);
    byName('mhr_5d', m5.height);
    byName('mhr_5e', m5.weight);
    if (m5.adverse_risk_factors     != null) yn('mhr_5f', m5.adverse_risk_factors);
    byName('mhr_5g', m5.other_observations);
    var mhrSig = mhr.agent_signature || {};
    byName('mhr_agent_place', mhrSig.place);
    byId('mhr_agent_date',    mhrSig.date);
    var mhrDom = mhr.do_mentor || {};
    byId('mhr_do_date',       mhrDom.date);
    byName('mhr_do_name2',    mhrDom.name);
    byName('mhr_do_desig',    mhrDom.designation);
    byName('mhr_do_standing', mhrDom.standing);
    var mhrBm = mhr.bm_sr_bm || {};
    byId('mhr_bm_date',    mhrBm.date);
    byName('mhr_bm_name',  mhrBm.name);
    byName('mhr_bm_desig', mhrBm.designation);
  }

  /* ── Insurance Suitability Questionnaire ────── */
  var isq = g(data, 'insurance_suitability_questionnaire');
  if (isq) {
    var s10    = isq.section_10 || {};
    var agDecl = s10.agent_declaration || {};
    byName('sa_agent_decl_name_mr', agDecl.agent_name_mr);
    byName('sa_agent_decl_name_hi', agDecl.agent_name_hi);
    byName('sa_agent_decl_name_en', agDecl.agent_name_en);
    byName('sa_agent_decl_place',   agDecl.place);
    byName('sa_agent_decl_date',    agDecl.date);
    var prDecl = s10.proposer_declaration || {};
    byName('sa_prop_decl_name_mr', prDecl.proposer_name_mr);
    byName('sa_prop_decl_name_hi', prDecl.proposer_name_hi);
    byName('sa_prop_decl_name_en', prDecl.proposer_name_en);
    var pref = prDecl.preferred_plan || {};
    byName('sa_prop_table_no',  pref.table_no);
    byName('sa_prop_plan_name', pref.plan_name);
    byName('sa_prop_term',      pref.term);
    byName('sa_prop_sa',        pref.sum_assured);
    byName('sa_prop_mode',      pref.mode);
    byName('sa_prop_premium',   pref.premium);
    byName('sa_prop_decl_place', prDecl.place);
    byName('sa_prop_decl_date',  prDecl.date);
    var wv = isq.waiver || {};
    if (wv.waiver_opted != null) checkId('sa_waiver_opted', wv.waiver_opted);
    byName('sa_waiver_place', wv.place);
    byName('sa_waiver_date',  wv.date);
  }

  /* ── Annexure I (items 1–9, sa_* fields) ────── */
  var ai = g(data, 'annexure_i');
  if (ai) {
    var ai1 = ai.item_1_proposer || {};
    byName('sa_proposer_name', ai1.proposer_name);
    byName('sa_dob_dd',        ai1.dob_dd);
    byName('sa_dob_mm',        ai1.dob_mm);
    byName('sa_dob_yyyy',      ai1.dob_yyyy);
    byName('sa_age',           ai1.age);
    byName('sa_age_yr',        ai1.age_yr);
    byName('sa_address',       ai1.address);
    if (ai1.marital_status) radio('sa_marital', ai1.marital_status);
    var ai2 = ai.item_2_occupation || {};
    if (ai2.occupation) radio('sa_occupation', ai2.occupation);
    byName('sa_occupation_other', ai2.occupation_other);
    var ai3 = ai.item_3_income || {};
    byName('sa_income_emp',   ai3.income_employment);
    byName('sa_income_biz',   ai3.income_business);
    byName('sa_income_other', ai3.income_other);
    byName('sa_income_huf',   ai3.income_huf);
    byName('sa_income_lba',   ai3.income_lba);
    if (ai3.income_proof_submitted != null) radio('sa_income_proof', ai3.income_proof_submitted ? 'yes' : 'no');
    check('sa_doc_itr',      ai3.doc_itr);
    check('sa_doc_salary',   ai3.doc_salary);
    check('sa_doc_ca',       ai3.doc_ca);
    check('sa_doc_pl',       ai3.doc_pl);
    check('sa_doc_property', ai3.doc_property);
    check('sa_doc_others',   ai3.doc_others);
    if (ai3.tax_assessee != null) radio('sa_tax_assessee', ai3.tax_assessee ? 'yes' : 'no');
    byName('sa_tax_ifyes_detail', ai3.tax_detail);
    byName('sa_pan',              ai3.pan);
    byName('sa_tax_bracket',      ai3.tax_bracket);
    var ai5 = ai.item_5_family_history || {};
    byName('sa_fh_father_age',       ai5.father_age);
    byName('sa_fh_father_health',    ai5.father_health);
    byName('sa_fh_father_death_age', ai5.father_death_age);
    byName('sa_fh_father_cause',     ai5.father_cause);
    byName('sa_fh_mother_age',       ai5.mother_age);
    byName('sa_fh_mother_health',    ai5.mother_health);
    byName('sa_fh_mother_death_age', ai5.mother_death_age);
    byName('sa_fh_mother_cause',     ai5.mother_cause);
    var ai5a = ai.item_5a_spouse || {};
    byName('sa_spouse_name',   ai5a.spouse_name);
    byName('sa_spouse_occ',    ai5a.spouse_occ);
    byName('sa_spouse_income', ai5a.spouse_income);
    var ai6 = ai.item_6_need_analysis || {};
    byName('sa_na_total_income', ai6.total_income);
    byName('sa_na_liabilities',  ai6.liabilities);
    byName('sa_na_secured',      ai6.secured_income);
    byName('sa_na_unsecured',    ai6.unsecured);
    byName('sa_max_insurance',   ai6.max_insurance);
    var ai7 = ai.item_7_objectives || {};
    check('sa_obj_purerisks', ai7.obj_pure_risk);
    check('sa_obj_savings',   ai7.obj_savings);
    check('sa_obj_moneyback', ai7.obj_money_back);
    check('sa_obj_secured',   ai7.obj_secured);
    check('sa_obj_market',    ai7.obj_market);
    check('sa_obj_pension',   ai7.obj_pension);
    check('sa_obj_health',    ai7.obj_health);
    check('sa_obj_children',  ai7.obj_children);
    check('sa_obj_others',    ai7.obj_others);
    if (ai7.risk_profile)         radio('sa_risk_profile', ai7.risk_profile);
    if (ai7.premium_mode)         radio('sa_prem_mode',    ai7.premium_mode);
    if (ai7.time_frame)           radio('sa_timeframe',    ai7.time_frame);
    byName('sa_timeframe_other',  ai7.time_frame_other);
    var ai8 = ai.item_8_plan_category || {};
    if (ai8.plan_category) radio('sa_plan_category', ai8.plan_category);
    var ai9 = ai.item_9_product_chosen || {};
    byName('sa_prop_table_no',  ai9.table_no);
    byName('sa_prop_plan_name', ai9.plan_name);
    byName('sa_prop_term',      ai9.term);
    byName('sa_prop_sa',        ai9.sum_assured);
    byName('sa_prop_mode',      ai9.mode);
    byName('sa_prop_premium',   ai9.premium);
  }

  console.log('[fillFromJson] Form populated successfully.');
}

/* ══════════════════════════════════════════════════════════════════════════════
   PDF AUTO-FILL  –  parse a proposal-form PDF via Together.ai and fill the form
   Functions exposed globally: startPdfParse(), toggleJsonPreview(), applyParsedJson()
══════════════════════════════════════════════════════════════════════════════ */

/** Holds the last successfully parsed JSON so the modal can re-apply it. */
var _parsedPdfData = null;

/**
 * Called by the "Parse & Fill" button in the PDF toolbar.
 * Uploads the selected PDF to /api/parse-pdf-stream and consumes SSE events.
 */
function startPdfParse() {
  var fileInput   = document.getElementById('pdfFileInput');
  var apiKeyInput = document.getElementById('togetherApiKey');
  var progressDiv = document.getElementById('pdfProgress');
  var progressBar = document.getElementById('pdfProgressBar');
  var progressTxt = document.getElementById('pdfProgressText');
  var statusMsg   = document.getElementById('pdfStatusMsg');
  var viewJsonBtn = document.getElementById('pdfViewJsonBtn');

  /* ── Validate inputs ── */
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert('Please select a PDF file first.');
    return;
  }
  var apiKey = (apiKeyInput && apiKeyInput.value.trim()) || '';
  if (!apiKey) {
    alert('Please enter your Together.ai API key.');
    return;
  }

  /* ── Reset UI ── */
  if (progressDiv) progressDiv.style.display  = 'block';
  if (statusMsg)   { statusMsg.style.display  = 'block'; statusMsg.style.color = '#7fcfff'; statusMsg.textContent = ''; }
  if (viewJsonBtn) viewJsonBtn.style.display  = 'none';
  if (progressBar) progressBar.style.width    = '0%';
  if (progressTxt) progressTxt.textContent    = 'Uploading PDF…';

  /* ── Build multipart request ── */
  var formData = new FormData();
  formData.append('pdf', fileInput.files[0]);

  fetch('/api/parse-pdf-stream', {
    method:  'POST',
    headers: { 'X-Together-Api-Key': apiKey },
    body:    formData
  })
  .then(function(resp) {
    if (!resp.ok) {
      return resp.json().then(function(e) {
        throw new Error(e.error || ('HTTP ' + resp.status));
      });
    }
    if (!resp.body) {
      throw new Error('ReadableStream not supported in this browser. Please use Chrome or Edge.');
    }

    var reader  = resp.body.getReader();
    var decoder = new TextDecoder();
    var buffer  = '';
    var totalPages  = 0;
    var donePages   = 0;

    /* ── Handle one parsed SSE event ── */
    function handleEvent(evt) {
      switch (evt.status) {

        case 'started':
          totalPages = evt.total_pages || 0;
          if (progressTxt) progressTxt.textContent = 'Parsing ' + totalPages + ' page(s) via Together.ai…';
          if (progressBar) progressBar.style.width = '5%';
          break;

        case 'processing':
          if (progressTxt) progressTxt.textContent =
            'Processing page ' + evt.page + ' of ' + evt.total + '…';
          if (progressBar) progressBar.style.width =
            (Math.round(((evt.page - 1) / (evt.total || 1)) * 85) + 5) + '%';
          break;

        case 'page_done':
          donePages++;
          var fInfo = evt.fields_extracted != null ? ' · ' + evt.fields_extracted + ' field(s)' : '';
          if (progressTxt) progressTxt.textContent =
            'Page ' + evt.page + ' extracted' + fInfo + '  (' + donePages + ' / ' + totalPages + ')';
          if (progressBar) progressBar.style.width =
            (Math.round((donePages / (totalPages || 1)) * 85) + 5) + '%';
          break;

        case 'page_skipped':
          donePages++;
          if (progressTxt) progressTxt.textContent =
            'Page ' + evt.page + ' skipped (info-only)  (' + donePages + ' / ' + totalPages + ')';
          if (progressBar) progressBar.style.width =
            (Math.round((donePages / (totalPages || 1)) * 85) + 5) + '%';
          break;

        case 'page_error':
          if (statusMsg) {
            statusMsg.style.color   = '#ffb347';
            statusMsg.textContent   = '⚠ Page ' + evt.page + ' error: ' + evt.error;
          }
          break;

        case 'done':
          if (progressBar) progressBar.style.width = '100%';
          if (progressTxt) progressTxt.textContent = '✓ Extraction complete!';
          _parsedPdfData = evt.data || {};
          if (viewJsonBtn) viewJsonBtn.style.display = 'block';
          /* Auto-apply to form */
          try {
            fillFromJson(_parsedPdfData);
            if (statusMsg) {
              statusMsg.style.color = '#7fcfff';
              statusMsg.textContent = '✓ Form auto-populated from ' + totalPages + ' page(s).';
            }
          } catch (fe) {
            if (statusMsg) {
              statusMsg.style.color   = '#ffb347';
              statusMsg.textContent   = 'fillFromJson error: ' + fe.message;
            }
          }
          break;

        case 'error':
          if (progressTxt) progressTxt.textContent = '✕ Error';
          if (statusMsg) {
            statusMsg.style.color = '#ff8080';
            statusMsg.textContent = 'Error: ' + (evt.error || 'Unknown');
          }
          break;
      }
    }

    /* ── Stream reader loop ── */
    function pump() {
      return reader.read().then(function(result) {
        if (result.done) {
          if (progressTxt && progressTxt.textContent.indexOf('✓') === -1) {
            progressTxt.textContent = 'Stream ended.';
          }
          return;
        }
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop(); /* keep any partial line */
        lines.forEach(function(line) {
          if (!line.startsWith('data: ')) return;
          try {
            handleEvent(JSON.parse(line.slice(6)));
          } catch (_) { /* malformed JSON line — skip */ }
        });
        return pump();
      });
    }

    return pump();
  })
  .catch(function(err) {
    if (progressTxt) progressTxt.textContent = '✕ Failed';
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.color   = '#ff8080';
      statusMsg.textContent   = 'Error: ' + err.message;
    }
    console.error('[pdfParse]', err);
  });
}

/** Toggle the JSON preview modal. */
function toggleJsonPreview() {
  var modal   = document.getElementById('jsonPreviewModal');
  var content = document.getElementById('jsonPreviewContent');
  if (!modal || !content) return;
  if (modal.style.display === 'none' || !modal.style.display) {
    if (_parsedPdfData) {
      content.textContent = JSON.stringify(_parsedPdfData, null, 2);
    } else {
      content.textContent = '(No parsed data yet)';
    }
    modal.style.display = 'block';
  } else {
    modal.style.display = 'none';
  }
}

/** Apply the cached parsed JSON to the form and close the modal. */
function applyParsedJson() {
  if (_parsedPdfData) {
    fillFromJson(_parsedPdfData);
  }
  var modal = document.getElementById('jsonPreviewModal');
  if (modal) modal.style.display = 'none';
}
