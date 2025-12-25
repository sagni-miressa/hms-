/**
 * WebAuthn Service
 * Biometric authentication functions
 */

import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { api, extractData, ApiResponse } from "@/lib/api";

/**
 * Register a new biometric credential
 */
export const registerBiometric = async (): Promise<void> => {
  try {
    // 1. Get registration options from server
    const response = await api.post<ApiResponse<any>>(
      "/webauthn/register/start",
      {}
    );
    const options = extractData(response);

    console.log("Registration options received:", options);

    // 2. Start browser registration
    const attestation = await startRegistration(options);

    console.log("Attestation received from browser:", attestation);

    // 3. Send attestation back to server to finish registration
    await api.post("/webauthn/register/finish", attestation);
  } catch (error: any) {
    console.error("registerBiometric error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Authenticate using biometric credential
 */
export const loginWithBiometric = async (
  email: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // 1. Get authentication options from server
  const response = await api.post<ApiResponse<any>>("/webauthn/login/start", {
    email,
  });

  console.log("Authentication options received:", response);
  const options = extractData(response);

  // 2. Start browser authentication
  const assertion = await startAuthentication(options);
  console.log("Assertion received from browser:", assertion);

  // 3. Send assertion back to server to finish login
  const finishResponse = await api.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/webauthn/login/finish", assertion);

  return extractData(finishResponse);
};
