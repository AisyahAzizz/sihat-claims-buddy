export const rahman = {
  name: "Encik Rahman bin Ismail",
  myKad: "710304-14-5528",
  policyName: "AIA Smart MedCare Plus",
  policyNo: "AIA-MY-2024-88312",
  annualLimit: 80000,
};

export const clinicClaim = {
  visitDate: "24 May 2026",
  clinic: "Klinik Sihat, Subang Jaya",
  icd10: "E11.9",
  icd10Desc: "Type 2 Diabetes Mellitus",
  medication: "Dispatoline 500mg × 30",
  dispensedAt: "Farmasi Sunway (1.2km)",
  doctor: "Dr Siti Rahimah",
  documents: [
    { name: "klinik_sihat_receipt_240526.pdf", size: "84 KB", type: "Clinic receipt" },
    { name: "prescription_dispatoline.jpg", size: "1.2 MB", type: "Prescription photo" },
  ],
  scanLabels: [
    "Checking patient identity…",
    "Validating ICD-10 code…",
    "Reading doctor signature…",
    "Verifying pharmacy stamp…",
    "Checking GST registration…",
    "Matching drug to prescription…",
  ],
  checks: [
    { status: "ok" as const, label: "Patient name matches policy", note: "exact match" },
    { status: "ok" as const, label: "ICD-10 code present and valid", note: "E11.9" },
    { status: "ok" as const, label: "Doctor signature detected", note: "Dr Siti Rahimah" },
    { status: "ok" as const, label: "Pharmacy stamp present", note: "Farmasi Sunway" },
    { status: "warn" as const, label: "GST registration missing on receipt", note: "minor, may cause delay" },
    { status: "ok" as const, label: "Drug name matches prescription", note: "Dispatoline 500mg" },
    { status: "ok" as const, label: "Visit date within policy year", note: "AY 2026" },
  ],
  breakdown: [
    { label: "Consultation fee", amount: 60.0 },
    { label: "Dispatoline 500mg × 30", amount: 45.0 },
    { label: "Dispensing fee", amount: 5.0 },
    { label: "Co-payment (10%)", amount: -11.0 },
  ],
  total: 99.0,
  json: {
    claimRef: "SSATU-20260524-001",
    insurerId: "AIA-MY",
    policyNo: "AIA-MY-2024-88312",
    patientIC: "710304145528",
    icd10: "E11.9",
    amount: 99.0,
    currency: "MYR",
    provider: "Klinik Sihat",
    dispensedBy: "Farmasi Sunway",
  },
};

export const hospitalCase = {
  hospital: "Sunway Medical Centre, Petaling Jaya",
  doctor: "Dr Amirul Hisham",
  specialty: "Cardiology",
  mmc: "MMC 32145",
  icd10: "I25.10",
  icd10Desc: "Atherosclerotic heart disease",
  procedures: ["Coronary angiography", "12-lead ECG", "Echocardiogram"],
  estStay: "3–5 days",
  glRef: "GL-SSATU-20260524-HOS",
  justification:
    "Patient presents with exertional chest pain and elevated troponin (0.08 ng/mL). History of T2DM (E11.9) and hypertension. ECG shows ST-segment depression in leads V4–V6. Clinical urgency warrants inpatient coronary angiography to exclude acute coronary syndrome. Outpatient management is clinically inappropriate at this time given haemodynamic status and troponin trend.",
  estCost: "RM 12,400 – RM 18,000",
  roomType: "1-bed standard (within policy entitlement)",
  scanLabels: [
    "Checking policy status…",
    "Mapping ICD-10 to covered benefits…",
    "Verifying room entitlement…",
    "Assessing medical necessity…",
    "Flagging pre-existing conditions…",
    "Checking estimated cost vs policy limit…",
    "Verifying specialist MMC registration…",
    "Running fraud and repeated-claim check…",
  ],
  checks: [
    { status: "ok" as const, label: "Policy active, GL category covered", note: "Cardiac inpatient" },
    { status: "ok" as const, label: "ICD-10 I25.10 maps to covered benefit", note: "Inpatient surgical" },
    { status: "ok" as const, label: "Room entitlement matches request", note: "1-bed confirmed" },
    { status: "ok" as const, label: "Medical necessity clinically justified", note: "Troponin + ECG evidence" },
    { status: "warn" as const, label: "T2DM listed as pre-existing", note: "cardiac benefit not excluded" },
    { status: "ok" as const, label: "Estimated cost within policy limit", note: "RM 18K of RM 80K limit" },
    { status: "ok" as const, label: "Specialist MMC registration verified", note: "Dr Amirul · MMC 32145" },
    { status: "ok" as const, label: "No suspicious repeated claims detected", note: "First cardiac admission" },
  ],
  qa: [
    {
      q: "Is the cardiac condition related to the pre-existing T2DM?",
      a: "No — acute atherosclerotic disease, distinct onset and aetiology",
    },
    {
      q: "Can this condition be safely managed as outpatient?",
      a: "No — elevated troponin and ECG changes require inpatient monitoring",
    },
    {
      q: "Is coronary angiography the least invasive appropriate investigation?",
      a: "Yes — consistent with ACC/AHA NSTEMI guidelines for this presentation",
    },
  ],
  glDetails: {
    glNumber: "AIA-GL-20260524-7734",
    approvedAmount: 18000,
    room: "1-bed confirmed",
    validUntil: "27 May 2026",
    conditions:
      "Coronary angiography approved. If percutaneous coronary intervention (stenting) required during procedure, submit supplementary GL before proceeding. Non-cardiac incidental charges billed separately.",
  },
  claimBreakdown: [
    { label: "Inpatient room — 4 nights", amount: 1800 },
    { label: "Coronary angiography", amount: 8500 },
    { label: "Specialist consultation fees", amount: 3200 },
    { label: "Medications and consumables", amount: 1400 },
    { label: "Laboratory and imaging", amount: 2200 },
    { label: "Co-payment (10%)", amount: -1710 },
  ],
  claimTotal: 15390,
};

export const dashboardClaims = [
  {
    ref: "SSATU-20260524-001",
    patient: "Encik Rahman",
    type: "Outpatient",
    provider: "Klinik Sihat",
    amount: 99,
    insurer: "AIA",
    status: "approved" as const,
    submitted: "24 May 14:32",
  },
  {
    ref: "GL-SSATU-20260524-HOS",
    patient: "Encik Rahman",
    type: "Inpatient GL",
    provider: "Sunway Medical",
    amount: 15390,
    insurer: "AIA",
    status: "approved" as const,
    submitted: "24 May 14:31",
  },
  {
    ref: "AIA-REJ-001",
    patient: "Puan Haslinda",
    type: "Outpatient",
    provider: "Klinik Prima",
    amount: 340,
    insurer: "AIA",
    status: "rejected" as const,
    submitted: "23 May 09:14",
  },
];

export const rejectedClaim = {
  ref: "AIA-REJ-001",
  patient: "Puan Haslinda binti Yusof",
  ic: "820917-10-5847",
  amount: 340,
  reason:
    "GST registration number absent from clinic receipt (Klinik Prima, Ampang)",
  rejectedBy: "AIA Claims Processing · 23 May 2026",
};

export const appealLetter = `To: AIA Claims Department
Re: Appeal — Claim Ref AIA-REJ-001

Dear Sir/Madam,

We write on behalf of our patient Puan Haslinda binti Yusof (IC: 820917-10-5847) with respect to the above-referenced claim submitted on 23 May 2026 and subsequently rejected on the grounds that the GST registration number was absent from the Klinik Prima clinic receipt.

We respectfully submit that Klinik Prima (Ampang) holds a valid GST registration (Registration No. AM/2020/0187) with the Royal Malaysian Customs Department. The omission of the registration number on the receipt dated 23 May 2026 was an inadvertent administrative error on the part of the clinic's billing system, and does not reflect a lack of valid registration.

In support of this appeal, we attach herewith: (1) a certified copy of Klinik Prima's GST registration certificate, (2) a corrected tax invoice bearing the full registration number, and (3) a statutory declaration from the clinic proprietor confirming the error.

We respectfully draw your attention to AIA Smart MedCare Plus policy clause 7.3(b), which provides that minor documentary deficiencies of an administrative nature shall not constitute grounds for the denial of an otherwise valid and covered claim. The clinical validity of this claim, the patient's policy coverage, and the medical necessity of the visit are not in dispute.

We therefore respectfully request that AIA reconsider and approve this claim in full. Should you require any further documentation, please do not hesitate to contact us.

Yours faithfully,

SihatSatu Claims Defense Agent
(AI-assisted · Reviewed and authorised by clinic staff)`;
