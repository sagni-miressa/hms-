import { api, extractData } from "@/lib/api";

export interface BackupStatus {
  enabled: boolean;
  tasks: Array<{
    name: string;
    schedule: string;
    enabled: boolean;
  }>;
}

export interface BackupStatusResponse {
  enabled: boolean;
  lastDatabaseBackup?: string;
  lastRedisBackup?: string;
  databaseBackupCount: number;
  redisBackupCount: number;
  totalSize: number;
}

export const getBackupStatus = async (): Promise<BackupStatus> => {
  const response = await api.get("/system/backup/status");
  return extractData(response);
};

export const getBackupStatistics = async (): Promise<BackupStatusResponse> => {
  const response = await api.get("/system/backup/statistics");
  return extractData(response);
};

export const triggerDatabaseBackup = async (): Promise<{ message: string }> => {
  const response = await api.post("/system/backup/database");
  return extractData(response);
};

export const triggerRedisBackup = async (): Promise<{ message: string }> => {
  const response = await api.post("/system/backup/redis");
  return extractData(response);
};

export const triggerBackupCleanup = async (): Promise<{ message: string }> => {
  const response = await api.post("/system/backup/cleanup");
  return extractData(response);
};
