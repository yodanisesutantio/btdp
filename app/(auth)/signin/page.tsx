"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninPageInnerContent />
    </Suspense>
  );
}

function SigninPageInnerContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const msg = searchParams.get("message");
    const url = new URL(window.location.href);

    switch (msg) {
      case "not-authenticated":
        toast.error("You must be logged in to access this page!", {
          position: "top-right",
        });

        url.searchParams.delete("message");
        router.replace(url.pathname);
        break;
      case "not-authorized":
        toast.error("Only Administrators can access this page!", {
          position: "top-right",
        });

        url.searchParams.delete("message");
        router.replace(url.pathname);
        break;
      default:
        break;
    }
  }, [searchParams, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      toast.error("Login failed", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setLoading(false);

    toast.success("Logged in successfully!", { position: "top-right" });
    setTimeout(() => {
      router.push("/home");
    }, 1000);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 w-full h-full items-center justify-center font-sans">
      <Card className="w-full max-w-sm rounded-md">
        <CardHeader>
          <CardTitle>
            <h3 className="text-2xl font-bold">Sign In</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`transition-all duration-200`}
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
              </div>
              <span className="text-end">
                <Link href="/forgot-password">
                  <Button
                    variant="link"
                    size="xs"
                    className="cursor-pointer text-muted-foreground font-normal h-fit px-0"
                  >
                    Forgot Password?
                  </Button>
                </Link>
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full cursor-pointer">
                {loading ? `Signing in${dots}` : "Sign In"}
              </Button>
              <span className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup">
                  <Button variant="link" className="cursor-pointer h-fit px-0">
                    Sign up
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
