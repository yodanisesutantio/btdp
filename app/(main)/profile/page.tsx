"use client";

import { useEffect, useState } from "react";
import { UserData } from "../users/page";
import { InBetweenSections } from "@/components/sections";
import { FieldDescription, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DialogStickyFooter } from "@/components/app-sticky-footer-dialog";
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
import { useRouter } from "next/navigation";
import { getConfirmStatus, getPasswordStrength } from "@/lib/helper";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [user, setUser] = useState<UserData | null>(() => {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const passwordStrength = getPasswordStrength(newPassword);
  const confirmStatus = getConfirmStatus(newPassword, confirmPassword);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  if (!user) {
    return (
      <div className="flex flex-col gap-4 w-full items-center justify-center min-h-screen font-sans">
        <h1 className="text-2xl font-semibold">No user found</h1>
      </div>
    );
  }

  const handlePersonalInfo = async (updatedUser: UserData) => {
    if (!updatedUser) return;

    if (
      !updatedUser.first_name ||
      !updatedUser.last_name ||
      !updatedUser.username ||
      !updatedUser.date_of_birth
    ) {
      toast.error("Please fill in all fields", {
        description: "All fields are required.",
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error("Saving Personal Information failed!", {
          description: data.error,
          position: "top-right",
        });
        console.error(data.error);
        return;
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Personal Information updated successfully!", {
        description: "Your personal information has been updated.",
        position: "top-right",
      });
    } catch (err) {
      console.error(err);
      toast.error("Operation Failed!", {
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields", {
        description: "All fields are required.",
        position: "top-right",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "The new password and confirmation password do not match.",
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user?.username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error("Failed to update password!", {
          description: data.error,
          position: "top-right",
        });
        console.error(data.error);
        return;
      }

      toast.success("Password updated successfully!", {
        description: "Your password has been updated.",
        position: "top-right",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpenDialog(false);
    } catch (err) {
      toast.error("Operation Failed!", {
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        position: "top-right",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to delete account", {
          description: data.error,
          position: "top-right",
        });
        return;
      }

      toast.success("Your account is successfully deleted!", {
        position: "top-right",
      });

      setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setOpenConfirmationDialog(false);
        router.push("/signin");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Operation Failed!", {
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      {user?.username !== "administrator" && (
        <InBetweenSections className="gap-4">
          <div className="col-span-12">
            <h1 className="text-xl font-bold">Personal Information</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal details
            </p>
          </div>
          <div className="col-span-12">
            <FieldSet>
              <div className="flex flex-row gap-5">
                <div className="w-1/2 flex flex-col gap-2">
                  <FieldLabel htmlFor="first_name" className="gap-0">
                    First Name<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="e.g. December Budget"
                    value={user?.first_name}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <FieldLabel htmlFor="last_name" className="gap-0">
                    Last Name<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="e.g. December Budget"
                    value={user?.last_name}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-1/2 flex flex-col gap-2">
                  <FieldLabel htmlFor="username" className="gap-0">
                    Username<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. December Budget"
                    value={user?.username}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <FieldLabel htmlFor="date_of_birth" className="gap-0">
                    Date of Birth<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="date_of_birth"
                    type="text"
                    placeholder="e.g. December Budget"
                    value={user?.date_of_birth}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        date_of_birth: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end w-full mb-2">
                <Button
                  className="cursor-pointer px-6"
                  onClick={() => {
                    if (user) handlePersonalInfo(user);
                  }}
                >
                  {loading ? `Saving${dots}` : "Save"}
                </Button>
              </div>
            </FieldSet>
          </div>
        </InBetweenSections>
      )}

      <InBetweenSections className="gap-4">
        <div className="col-span-12">
          <h1 className="text-xl font-bold">Account Security</h1>
          <p className="text-sm text-muted-foreground">
            Update your password or permanently delete your account
          </p>
        </div>

        <div className="col-span-12 flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <h2 className="font-semibold">Update Password</h2>
              <p className="text-xs text-muted-foreground">
                To update your password please press the button on the right.
              </p>
            </div>
            <Button
              className="cursor-pointer px-6"
              variant={`outline`}
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              Change Password
            </Button>
          </div>
          {user?.username !== "administrator" && (
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <h2 className="font-semibold">Delete Account</h2>
                <p className="text-xs text-muted-foreground">
                  To delete your account please press the button on the right.
                </p>
              </div>
              <Button
                className="cursor-pointer px-6"
                variant={`destructive`}
                onClick={() => {
                  setOpenConfirmationDialog(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </InBetweenSections>

      <DialogStickyFooter
        open={openDialog}
        onOpenChange={setOpenDialog}
        dialogTitle="Set your New Password"
        content={
          <FieldSet>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Current Password<span className="text-red-500">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`transition-all duration-200`}
                  required
                />
                <Button
                  type="button"
                  variant={"ghost"}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute z-10 right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                New Password<span className="text-red-500">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`transition-all duration-200 ${
                    passwordStrength === "weak"
                      ? "ring-2 ring-red-500"
                      : passwordStrength === "medium"
                        ? "ring-2 ring-orange-500"
                        : passwordStrength === "strong"
                          ? "ring-2 ring-green-500"
                          : ""
                  }`}
                  required
                />

                <Button
                  type="button"
                  variant={"ghost"}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute z-10 right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {newPassword.length > 0 && passwordStrength !== "strong" && (
                <FieldDescription
                  className={`text-${passwordStrength === "weak" ? "red-500" : "orange-500"} text-xs`}
                >
                  Password must be at least 8 characters long and contain a mix
                  of letters, numbers, and special characters.
                </FieldDescription>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Confirm New Password<span className="text-red-500">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`transition-all duration-200 ${
                    confirmStatus === "mismatch"
                      ? "ring-2 ring-red-500"
                      : confirmStatus === "match"
                        ? "ring-2 ring-green-500"
                        : ""
                  }`}
                  required
                />
                <Button
                  type="button"
                  variant={"ghost"}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute z-10 right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          </FieldSet>
        }
        dialogAction={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setOpenDialog(false);
              }}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleUpdatePassword();
              }}
            >
              {loading ? `Saving${dots}` : "Save"}
            </Button>
          </div>
        }
      />

      <AlertDialog
        open={openConfirmationDialog}
        onOpenChange={setOpenConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure that you want to delete your account? Doing so, You
              will lose access to your whole projects made in these apps!
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteAccount();
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
