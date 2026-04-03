"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 w-full h-full items-center justify-center font-sans">
      <Card className="w-full max-w-sm rounded-md">
        <CardHeader>
          <CardTitle>
            <h3 className="text-2xl font-bold">Login</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
                Sign In
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
