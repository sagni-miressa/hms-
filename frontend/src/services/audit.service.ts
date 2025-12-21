import { api, extractData, extractPagination } from "@/lib/api";

export interface AuditLog {
  id: string;
  userId: string | null;
  user?: {
    email: string;
    fullName: string;
  };
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, any> | null;
  encryptedDetails: string | null;
  createdAt: string;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLogsListResponse> => {
  const response = await api.get("/system/audit-logs", { params });
  return {
    logs: extractData(response),
    pagination: extractPagination(response),
  };
};

export const getAuditLogById = async (logId: string): Promise<AuditLog> => {
  const response = await api.get(`/system/audit-logs/${logId}`);
  return extractData(response);
};
