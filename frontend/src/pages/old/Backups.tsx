import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, HardDrive, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  getBackupStatus,
  getBackupStatistics,
  triggerDatabaseBackup,
  triggerRedisBackup,
  triggerBackupCleanup,
} from "@/services/backup.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const BackupsPage = () => {
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ["backupStatus"],
    queryFn: getBackupStatus,
  });

  const { data: statistics } = useQuery({
    queryKey: ["backupStatistics"],
    queryFn: getBackupStatistics,
  });

  const dbBackupMutation = useMutation({
    mutationFn: triggerDatabaseBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backupStatus", "backupStatistics"],
      });
      toast.success("Database backup triggered successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to trigger backup"
      );
    },
  });

  const redisBackupMutation = useMutation({
    mutationFn: triggerRedisBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backupStatus", "backupStatistics"],
      });
      toast.success("Redis backup triggered successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to trigger backup"
      );
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: triggerBackupCleanup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupStatistics"] });
      toast.success("Backup cleanup completed");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to cleanup backups"
      );
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backup Management</h1>
        <p className="mt-2 text-gray-600">
          Manage automated backups and restore data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Database Backup" description="PostgreSQL database backups">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Status</span>
              </div>
              <Badge variant={status?.enabled ? "success" : "warning"}>
                {status?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {statistics && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Backups:</span>
                  <span className="font-medium">
                    {statistics.databaseBackupCount}
                  </span>
                </div>
                {statistics.lastDatabaseBackup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">
                      {format(
                        new Date(statistics.lastDatabaseBackup),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Button
              onClick={() => dbBackupMutation.mutate()}
              isLoading={dbBackupMutation.isPending}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Trigger Backup Now
            </Button>
          </div>
        </Card>

        <Card
          title="Redis Backup"
          description="Redis cache and session backups"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-red-600" />
                <span className="font-medium">Status</span>
              </div>
              <Badge variant={status?.enabled ? "success" : "warning"}>
                {status?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {statistics && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Backups:</span>
                  <span className="font-medium">
                    {statistics.redisBackupCount}
                  </span>
                </div>
                {statistics.lastRedisBackup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">
                      {format(
                        new Date(statistics.lastRedisBackup),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Button
              onClick={() => redisBackupMutation.mutate()}
              isLoading={redisBackupMutation.isPending}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Trigger Backup Now
            </Button>
          </div>
        </Card>
      </div>

      <Card
        title="Backup Statistics"
        description="Overview of backup storage and retention"
      >
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Size</div>
              <div className="text-2xl font-bold text-gray-900">
                {(statistics.totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Database Backups</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.databaseBackupCount}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Redis Backups</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.redisBackupCount}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Scheduled Tasks" description="Automated backup schedules">
        {status?.tasks && status.tasks.length > 0 ? (
          <div className="space-y-3">
            {status.tasks.map((task) => (
              <div
                key={task.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{task.name}</div>
                  <div className="text-sm text-gray-600">
                    Schedule: {task.schedule}
                  </div>
                </div>
                <Badge variant={task.enabled ? "success" : "default"}>
                  {task.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No scheduled tasks configured
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Cleanup Old Backups</h3>
            <p className="text-sm text-gray-600">
              Remove backups older than retention period
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => cleanupMutation.mutate()}
            isLoading={cleanupMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Run Cleanup
          </Button>
        </div>
      </Card>
    </div>
  );
};
