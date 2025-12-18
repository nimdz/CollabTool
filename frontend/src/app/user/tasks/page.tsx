"use client";

import { useEffect, useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { getToken } from "@/lib/auth";
import UserLayout from "@/components/layout/UserLayout";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import { normalizeStatus } from "@/utils/helpers";

export default function UserTasksPage() {
  const { tasks, loading, error, fetchTasksByUser, deleteTask } = useTasks();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as { email: string };
      setUserEmail(payload.email);
    } catch {
      console.error("Failed to decode token");
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchTasksByUser(userEmail);
    }
  }, [userEmail, fetchTasksByUser]);

  const getStatusBadge = (status: string | number) => {
    const normalized = normalizeStatus(status);
    const map = {
      Pending: { label: "To Do", variant: "default" as const },
      InProgress: { label: "In Progress", variant: "info" as const },
      Completed: { label: "Done", variant: "success" as const },
    };
    return map[normalized];
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleUpdate = (taskId: string) => {
    window.location.href = `/user/tasks/update/${taskId}`;
    };

   const completionPercentage = useMemo(() => {
        if (!tasks.length) return 0;
        const completed = tasks.filter(task => normalizeStatus(task.status) === "Completed").length;
        return Math.round((completed / tasks.length) * 100);
    }, [tasks]);

   const statusCounts = useMemo(() => {
        const counts = { Pending: 0, InProgress: 0, Completed: 0 };
        tasks.forEach(task => {
            const status = normalizeStatus(task.status);
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [tasks]);


  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#172b4d] mb-6">My Tasks</h1>

               {tasks.length > 0 && (
                      <div className="mb-6">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-[#172b4d]">
                                  Completion: {completionPercentage}%
                              </span>
                              <div className="flex gap-2 text-xs">
                                  <Badge variant="default">To Do: {statusCounts.Pending}</Badge>
                                  <Badge variant="info">In Progress: {statusCounts.InProgress}</Badge>
                                  <Badge variant="success">Done: {statusCounts.Completed}</Badge>
                              </div>
                          </div>
                          <ProgressBar progress={completionPercentage} />
                      </div>
               )}

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Card>
              <LoadingSpinner message="Loading tasks..." />
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <EmptyState message="No tasks assigned to you" />
            </Card>
          ) : (
            <Card>
              <table className="w-full">
                <thead className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe1e6]">
                  {tasks.map(task => {
                    const statusBadge = getStatusBadge(task.status);
                    return (
                      <tr key={task.taskId} className="hover:bg-[#f4f5f7] transition">
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#172b4d] text-sm">{task.title}</div>
                          <div className="text-xs text-[#5e6c84] mt-1">{task.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdate(task.taskId)} className="text-[#0052cc] hover:underline text-sm font-medium">
                              Update
                            </button>
                            <button onClick={() => handleDelete(task.taskId)} className="text-[#de350b] hover:underline text-sm font-medium">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
