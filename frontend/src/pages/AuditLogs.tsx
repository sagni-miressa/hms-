import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { getAuditLogs } from "@/services/audit.service";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export const AuditLogsPage = () => {
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    search: "",
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => getAuditLogs({ ...filters, limit: 50 }),
  });

  const actionOptions = [
    { value: "", label: "All Actions" },
    { value: "LOGIN_SUCCESS", label: "Login Success" },
    { value: "LOGIN_FAILED", label: "Login Failed" },
    { value: "PASSWORD_CHANGED", label: "Password Changed" },
    { value: "PERMISSION_GRANTED", label: "Permission Granted" },
    { value: "PERMISSION_REVOKED", label: "Permission Revoked" },
    { value: "RESOURCE_CREATED", label: "Resource Created" },
    { value: "RESOURCE_UPDATED", label: "Resource Updated" },
    { value: "RESOURCE_DELETED", label: "Resource Deleted" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="h-8 w-8" />
          <span>Audit Logs</span>
        </h1>
        <p className="mt-2 text-gray-600">
          View system activity and security events
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <Select
            options={actionOptions}
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          />
          <Input
            placeholder="Resource Type"
            value={filters.resourceType}
            onChange={(e) =>
              setFilters({ ...filters, resourceType: e.target.value })
            }
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Timestamp</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
              <TableHeaderCell>Resource</TableHeaderCell>
              <TableHeaderCell>IP Address</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {data?.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {log.user?.email || log.userId || "System"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.resourceType && log.resourceId ? (
                      <span className="text-sm">
                        {log.resourceType}: {log.resourceId.substring(0, 8)}...
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
