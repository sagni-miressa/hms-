import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  getACLs,
  grantPermission,
  revokePermission,
} from "@/services/permissions.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export const PermissionsPage = () => {
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["acls"],
    queryFn: () => getACLs(),
  });

  const grantMutation = useMutation({
    mutationFn: grantPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acls"] });
      setIsGrantModalOpen(false);
      toast.success("Permission granted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to grant permission"
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acls"] });
      toast.success("Permission revoked successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to revoke permission"
      );
    },
  });

  const handleGrant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    grantMutation.mutate({
      granteeId: formData.get("granteeId") as string,
      resourceType: formData.get("resourceType") as string,
      resourceId: formData.get("resourceId") as string,
      permission: formData.get("permission") as string,
    });
  };

  const handleRevoke = (acl: any) => {
    if (window.confirm("Are you sure you want to revoke this permission?")) {
      revokeMutation.mutate({
        granteeId: acl.granteeId,
        resourceType: acl.resourceType,
        resourceId: acl.resourceId,
      });
    }
  };

  const resourceTypeOptions = [
    { value: "Application", label: "Application" },
    { value: "Job", label: "Job" },
    { value: "Document", label: "Document" },
  ];

  const permissionOptions = [
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "delete", label: "Delete" },
    { value: "feedback", label: "Feedback" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="h-8 w-8" />
            <span>Permission Management</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Manage discretionary access control (DAC) permissions
          </p>
        </div>
        <Button onClick={() => setIsGrantModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Grant Permission
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Grantee</TableHeaderCell>
              <TableHeaderCell>Resource</TableHeaderCell>
              <TableHeaderCell>Permission</TableHeaderCell>
              <TableHeaderCell>Granted By</TableHeaderCell>
              <TableHeaderCell>Expires</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {data?.map((acl) => (
                <TableRow key={acl.id}>
                  <TableCell>{acl.grantee?.email || acl.granteeId}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="info" size="sm">
                        {acl.resourceType}
                      </Badge>
                      <span className="ml-2 text-gray-600">
                        {acl.resourceId.substring(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{acl.permission}</Badge>
                  </TableCell>
                  <TableCell>
                    {acl.grantedBy?.email || acl.grantedById}
                  </TableCell>
                  <TableCell>
                    {acl.expiresAt
                      ? format(new Date(acl.expiresAt), "MMM dd, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(acl)}
                    >
                      <UserMinus className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title="Grant Permission"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsGrantModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="grant-permission-form"
              isLoading={grantMutation.isPending}
            >
              Grant Permission
            </Button>
          </>
        }
      >
        <form
          id="grant-permission-form"
          onSubmit={handleGrant}
          className="space-y-4"
        >
          <Input
            name="granteeId"
            label="Grantee User ID"
            required
            placeholder="User ID to grant permission to"
          />
          <Select
            name="resourceType"
            label="Resource Type"
            options={resourceTypeOptions}
            required
          />
          <Input
            name="resourceId"
            label="Resource ID"
            required
            placeholder="ID of the resource"
          />
          <Select
            name="permission"
            label="Permission"
            options={permissionOptions}
            required
          />
          <Input
            name="expiresAt"
            label="Expires At (Optional)"
            type="datetime-local"
          />
        </form>
      </Modal>
    </div>
  );
};
