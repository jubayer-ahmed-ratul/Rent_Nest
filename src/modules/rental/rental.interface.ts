export interface createRentalRequestPayload {
  propertyId: string;
  message?: string;
}

export interface updateRentalStatusPayload {
  status: "APPROVED" | "REJECTED";
}
