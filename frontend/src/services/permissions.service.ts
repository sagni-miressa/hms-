import { api, extractData } from "@/lib/api";

export interface ACL {
  id: string;
  grantedById: string;
  granteeId: string;
  resourceType: string;
  resourceId: string;
  permission: string;
  expiresAt: string | null;
  createdAt: string;
  grantedBy?: {
    email: string;
    fullName: string;
  };
  grantee?: {
    email: string;
    fullName: string;
  };
}

export interface GrantPermissionRequest {
  granteeId: string;
  resourceType: string;
  resourceId: string;
  permission: string;
  expiresAt?: string;
}

export interface RevokePermissionRequest {
  granteeId: string;
  resourceType: string;
  resourceId: string;
}

export const getACLs = async (params?: {
  resourceType?: string;
  resourceId?: string;
  granteeId?: string;
}): Promise<ACL[]> => {
  const response = await api.get("/acl", { params });
  return extractData(response);
};

export const grantPermission = async (
  data: GrantPermissionRequest
): Promise<ACL> => {
  const response = await api.post("/acl/grant", data);
  return extractData(response);
};

export const revokePermission = async (
  data: RevokePermissionRequest
): Promise<void> => {
  await api.post("/acl/revoke", data);
};
