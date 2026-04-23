"use client";

import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SwitchWithState } from "@/components/app-switch";

export interface UserData {
  first_name?: string;
  last_name?: string;
  username?: string;
  date_of_birth?: string;
  active?: boolean;
  password?: string;
}

export default function UsersPage() {
  const user = localStorage.getItem("user");
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const userObj = user ? JSON.parse(user) : null;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");

      const json = await res.json();

      if (!res.ok) {
        toast.error("Operation Failed!", {
          description: json.error,
          position: "top-right",
        });
        return;
      }

      setUsers(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userObj && userObj.username !== "administrator") {
      router.replace("/home?message=not-authorized");
    }
  }, [userObj, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSwitchActive = async (user: UserData, active: boolean) => {
    const res = await fetch("/api/users/switch-active", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        active,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    fetchUsers();

    toast.success("User status updated successfully", {
      position: "top-right",
    });
  };

  const handleResetPassword = async (user: UserData) => {
    const res = await fetch("/api/users/reset-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        date_of_birth: user.date_of_birth,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    toast.success("Password reset successfully", { position: "top-right" });
  };

  const handleDeleteUser = async (user: UserData) => {
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.username !== user.username));
    toast.success("User deleted successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Users Page!"
        pageDescription={`Manage your users effectively.`}
      />

      <InBetweenSections>
        <div className="col-span-12">
          <div className="flex justify-end w-full mb-2">
            <Button
              onClick={fetchUsers}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Refetch Users"}
            </Button>
          </div>
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="!w-[36%]">Full Name</TableHead>
                <TableHead className="!w-[30%]">Username</TableHead>
                <TableHead className="!w-[16%]">Date of Birth</TableHead>
                <TableHead className="!w-[10%]">Active</TableHead>
                <TableHead className="text-center !w-[8%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium !w-[36%]">
                    <div className="truncate">
                      {`${user.first_name} ${user.last_name}`}
                    </div>
                  </TableCell>
                  <TableCell className="!w-[30%]">
                    <div className="truncate">{user.username}</div>
                  </TableCell>
                  <TableCell className="!w-[16%]">
                    <div className="truncate">{user.date_of_birth}</div>
                  </TableCell>
                  <TableCell className="!w-[10%]">
                    <SwitchWithState
                      size={`lg`}
                      checked={user?.active ? true : false}
                      onChange={(val) => handleSwitchActive(user, val)}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-center !w-[8%]">
                    {user.username !== "administrator" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className={`cursor-pointer`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={`w-40`}>
                          <DropdownMenuItem className={`cursor-pointer`}>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenReset(true);
                            }}
                            className={`cursor-pointer`}
                          >
                            Reset Password
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDelete(true);
                            }}
                            className={`cursor-pointer`}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </InBetweenSections>

      <AlertDialog open={openReset} onOpenChange={setOpenReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              Password will be reset to user&apos;s date of birth.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedUser) {
                  await handleResetPassword(selectedUser);
                }
                setOpenReset(false);
              }}
              className={`cursor-pointer`}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedUser) {
                  await handleDeleteUser(selectedUser);
                }
                setOpenDelete(false);
              }}
              className={`cursor-pointer`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
