export function receiveFromKAIZEN(payload: {
  patientId: string;
  patientName: string;
  myKad: string;
  visitDate: string;
  providerName: string;
  icd10Code: string;
  icd10Description: string;
  medications: Array<{ name: string; dosage: string; qty: number }>;
  insurerId: string;
  policyNo: string;
  admissionType?: "outpatient" | "inpatient";
}): void {
  // Teammates call this to push patient data into Claims module
  console.log("KAIZEN intake received:", payload);
}

export function pushToKAIZEN(result: {
  claimId: string;
  claimRef: string;
  status: "approved" | "rejected" | "pending";
  approvedAmount?: number;
  glNumber?: string;
  timestamp: string;
}): void {
  // Claims module calls this to push result back to shared record
  console.log("KAIZEN result pushed:", result);
}
