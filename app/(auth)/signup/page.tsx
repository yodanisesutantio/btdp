"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getConfirmStatus, getPasswordStrength } from "@/lib/helper";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "administrator") {
      toast.error("Invalid username", {
        description: "The username 'administrator' is not allowed.",
        position: "top-right",
      });
      return;
    }
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields", {
        description: "All fields are required.",
        position: "top-right",
      });
      return;
    }

    if (password.length < 8) {
      toast.error("Password is too short", {
        description: "Password must be at least 8 characters long.",
        position: "top-right",
      });
      return;
    }

    if (passwordStrength !== "strong") {
      toast.error("Password is not strong enough", {
        description:
          "Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.",
        position: "top-right",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please ensure both password fields are identical.",
        position: "top-right",
      });
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        username,
        password,
        dateOfBirth,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Registration failed!", {
        description: data.error,
        position: "top-right",
      });
      return;
    }

    toast.success("Registration successful!", {
      description: "You can now log in with your new account.",
      position: "top-right",
    });

    setTimeout(() => {
      router.push("/signin");
    }, 1000);
  };

  const passwordStrength = getPasswordStrength(password);
  const confirmStatus = getConfirmStatus(password, confirmPassword);

  return (
    <div className="flex flex-1 flex-col gap-4 w-full h-full items-center justify-center font-sans">
      <Card className="w-full max-w-sm rounded-md">
        <CardHeader>
          <CardTitle>
            <h3 className="text-2xl font-bold">Sign Up</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldSet>
              <FieldGroup className="flex flex-row gap-2">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </FieldGroup>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  placeholder="Date of Birth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute z-10 right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {password.length > 0 && passwordStrength !== "strong" && (
                  <FieldDescription
                    className={`text-${passwordStrength === "weak" ? "red-500" : "orange-500"} text-xs`}
                  >
                    Password must be at least 8 characters long and contain a
                    mix of letters, numbers, and special characters.
                  </FieldDescription>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
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
            <div className="flex flex-col gap-2 mt-8">
              <Button type="submit" className="w-full cursor-pointer">
                Sign Up
              </Button>
              <span className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin">
                  <Button variant="link" className="cursor-pointer h-fit px-0">
                    Sign in
                  </Button>
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
