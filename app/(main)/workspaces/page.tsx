"use client";

import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export interface UserData {
  first_name?: string;
  last_name?: string;
  username?: string;
  date_of_birth?: string;
  active?: boolean;
  password?: string;
}

export default function WorkspacesPage() {
  const user = localStorage.getItem("user");
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<UserData[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<UserData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const userObj = user ? JSON.parse(user) : null;

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces");

      const json = await res.json();

      if (!res.ok) {
        toast.error("Operation Failed!", {
          description: json.error,
          position: "top-right",
        });
        return;
      }

      setWorkspaces(json.data ?? []);
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
    fetchWorkspaces();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Workspaces Page!"
        pageDescription={`Manage your workspaces effectively.`}
      />

      <InBetweenSections>
        <div className="col-span-12">
          <div className="flex justify-end gap-2 w-full mb-2">
            <Button
              onClick={fetchWorkspaces}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Refetch Workspaces"}
            </Button>
            <Button
              onClick={fetchWorkspaces}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
            >
              Add Workspace
            </Button>
          </div>
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="!w-[35%]">Title</TableHead>
                <TableHead className="!w-[30%]">Description</TableHead>
                <TableHead className="!w-[25%]">Peoples</TableHead>
                <TableHead className="text-center !w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace, index) => (
                <TableRow key={index}></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </InBetweenSections>
    </div>
  );
}
