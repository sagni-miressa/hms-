import { api, extractData } from "@/lib/api";

export interface MFASetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerifyRequest {
  token: string;
}

export const setupMFA = async (): Promise<MFASetupResponse> => {
  const response = await api.post("/auth/mfa/setup");
  return extractData(response);
};

export const verifyMFA = async (
  data: MFAVerifyRequest
): Promise<{ message: string }> => {
  const response = await api.post("/auth/mfa/verify", data);
  return extractData(response);
};
