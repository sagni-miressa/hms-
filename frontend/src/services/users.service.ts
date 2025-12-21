import { api, extractData, extractPagination } from "@/lib/api";
import type { User, Role, ClearanceLevel } from "@/types";

export interface UsersListResponse {
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  roles?: Role[];
  clearanceLevel?: ClearanceLevel;
  department?: string;
  isActive?: boolean;
}

export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
}): Promise<UsersListResponse> => {
  const response = await api.get("/users", { params });
  return {
    users: extractData(response),
    pagination: extractPagination(response),
  };
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return extractData(response);
};

export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<User> => {
  const response = await api.patch(`/users/${userId}`, data);
  return extractData(response);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
