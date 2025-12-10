"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import UserLayout from "@/components/layout/UserLayout";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types";
import { normalizeStatus } from "@/utils/helpers";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import TaskTable from "@/components/tasks/TaskTable";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getToken, logout } from "@/lib/auth";

export default function ProjectTasksPage() {
    const { projectId } = useParams();
    const router = useRouter();
    const { fetchTasksByProject } = useTasks();
    const { fetchProjectsByUser } = useProjects();

    const [projectTasks, setProjectTasks] = useState<Task[]>([]);
    const [projectName, setProjectName] = useState("Project");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load project and tasks
    useEffect(() => {
        const loadData = async () => {
            if (!projectId) return;
            setLoading(true);
            setError(null);

            try {
                const projectIdStr = Array.isArray(projectId) ? projectId[0] : projectId;

                // Fetch project name
                const projects = await fetchProjectsByUser();
                const project = projects.find((p) => p.projectId === projectIdStr);
                if (project) {
                    const truncated =
                        project.name.length > 30
                            ? project.name.substring(0, 30) + "..."
                            : project.name;
                    setProjectName(truncated);
                }

                // Fetch project tasks
                const data = await fetchTasksByProject(projectIdStr);

                if (!data) return;

                const uniqueTasks: Task[] = Array.from(
                    new Map(
                        data.map((t) => [
                            t.taskId,
                            {
                                ...t,
                                status: normalizeStatus(t.status),
                            } as Task,
                        ])
                    ).values()
                );

                setProjectTasks(uniqueTasks);
            } catch (err) {
                setError("Failed to load project tasks.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [projectId]);

    // Add Task
    const handleAddTask = () => {
        router.push(`/user/projects/${projectId}/add-task`);
    };

    // Edit Task
    const handleEditTask = (taskId: string) => {
        router.push(`/user/projects/${projectId}/tasks/${taskId}`);
    };

    // Delete Task
    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const token = getToken();
            if (!token) return logout();

            await api.delete(`/taskservice/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Task deleted successfully!");
            setProjectTasks((prev) => prev.filter((t) => t.taskId !== taskId));
        } catch {
            toast.error("Failed to delete task");
        }
    };

    // Progress summary
    const completionPercentage = useMemo(() => {
        if (!projectTasks.length) return 0;
        const completed = projectTasks.filter((t) => t.status === "Completed").length;
        return Math.round((completed / projectTasks.length) * 100);
    }, [projectTasks]);

    const statusCounts = useMemo(() => {
        const counts = { Pending: 0, InProgress: 0, Completed: 0 };
        projectTasks.forEach((task) => {
            const status = task.status;
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [projectTasks]);

    // UI rendering
    return (
        <UserLayout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumb
                        items={[
                            { label: "Projects", href: "/user/projects" },
                            { label: projectName, href: `/user/projects/${projectId}` },
                            { label: "Tasks" },
                        ]}
                    />

                    <Card className="p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">
                                    Project Tasks
                                </h1>
                                <p className="text-[#5e6c84]">
                                    Manage and track all tasks for this project
                                </p>
                            </div>
                            <Button onClick={handleAddTask}>Create Task</Button>
                        </div>
                    </Card>

                    {error && <ErrorMessage message={error} />}

                    {loading ? (
                        <Card>
                            <LoadingSpinner message="Loading tasks..." />
                        </Card>
                    ) : projectTasks.length === 0 ? (
                        <Card>
                            <EmptyState
                                message="No tasks found for this project"
                                action={<Button onClick={handleAddTask}>Create your first task</Button>}
                            />
                        </Card>
                    ) : (
                        <Card>
                            <Card className="p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
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
                            </Card>

                            <TaskTable
                                tasks={projectTasks}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                            />
                        </Card>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
