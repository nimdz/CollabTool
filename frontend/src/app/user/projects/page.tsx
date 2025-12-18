"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserLayout from "@/components/layout/UserLayout";
import { useProjects } from "@/hooks/useProjects";
import { getToken, logout } from "@/lib/auth";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjectsByUser, deleteProject, fetchUsers, users } = useProjects();
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getToken();
    if (!token) {
      logout();
      return;
    }
    fetchProjectsByUser().catch(err => toast.error(err.message || "Failed to fetch projects"));
    fetchUsers();
  }, []);

  useEffect(() => {
    const map: Record<string, string> = {};
    users.forEach(u => {
      map[u.userId] = u.username;
    });
    setUserMap(map);
  }, [users]);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const success = await deleteProject(projectId);
      if (success) toast.success("Project deleted successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      toast.error(message);
    }
  };

  const uniqueProjects = projects.filter(
    (project, index, self) =>
      index === self.findIndex(p => p.projectId === project.projectId)
  );

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#172b4d]">Projects</h1>
            <Link href="/user/projects/create">
              <Button>+ Create project</Button>
            </Link>
          </div>

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Card>
              <LoadingSpinner message="Loading projects..." />
            </Card>
          ) : uniqueProjects.length === 0 ? (
            <Card>
              <EmptyState
                message="No projects found"
                action={
                  <Link href="/user/projects/create">
                    <Button>Create your first project</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card>
              <table className="w-full">
                <thead className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Key</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Lead</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Members</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe1e6]">
                  {uniqueProjects.map(project => (
                    <tr key={project.projectId} className="hover:bg-[#f4f5f7] transition">
                      <td className="px-4 py-3">
                        <Link href={`/user/projects/${project.projectId}`}>
                          <div className="font-medium text-[#0052cc] hover:underline text-sm">{project.name}</div>
                          <div className="text-xs text-[#5e6c84] mt-1">{project.description || "No description"}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#42526e] font-mono">
                        {project.projectId.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#42526e]">
                        {userMap[project.createdBy] || project.createdBy || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#42526e]">
                        {project.members?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/user/projects/${project.projectId}`} className="text-[#0052cc] hover:underline text-sm font-medium">
                            View
                          </Link>
                          <button onClick={() => handleDelete(project.projectId)} className="text-[#de350b] hover:underline text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
