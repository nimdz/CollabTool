"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";
import { Task } from "@/types";
import { useProjects } from "@/hooks/useProjects";
import UserLayout from "@/components/layout/UserLayout";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function ProjectTaskEditPage() {
    const { projectId, taskId } = useParams();
    const router = useRouter();
    const { fetchProjectsByUser } = useProjects();
    const [task, setTask] = useState<Task | null>(null);
    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);

    const getStatusCode = (status: string) => {
        switch (status) {
            case "Pending":
                return 0;
            case "InProgress":
                return 1;
            case "Completed":
                return 2;
            default:
                return 0;
        }
    };

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) return;
            setLoading(true);

            try {
                const token = getToken();
                if (!token) return logout();

                const res = await api.get<Task>(`/taskservice/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTask(res.data);

                // Fetch project name
                if (res.data.projectId) {
                    const projects = await fetchProjectsByUser();
                    const project = projects.find((p) => p.projectId === res.data.projectId);
                    if (project) {
                        setProjectName(project.name);
                    }
                }
            } catch {
                toast.error("Failed to load task details");
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (!task) return;
        const { name, value } = e.target;
        setTask((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;

        try {
            const token = getToken();
            if (!token) return logout();

            const payload = {
                taskId: task.taskId,
                title: task.title,
                description: task.description,
                assignee: task.assignee,
                status: getStatusCode(task.status),
                projectId: task.projectId || projectId,
            };

            await api.put(`/taskservice/tasks/${task.taskId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Task updated successfully!");
            router.push(`/user/projects/${projectId}/tasks`);
        } catch {
            toast.error("Failed to update task");
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <LoadingSpinner message="Loading task details..." />
            </UserLayout>
        );
    }

    if (!task) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center p-8">
                    <ErrorMessage message="Task not found" />
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumb
                        items={[
                            { label: "Projects", href: "/user/projects" },
                            { label: projectName, href: `/user/projects/${projectId}` },
                            { label: "Tasks", href: `/user/projects/${projectId}/tasks` },
                            { label: "Edit Task" },
                        ]}
                    />

                    <Card className="p-6 mb-6">
                        <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">Edit Task</h1>
                        <p className="text-[#5e6c84]">
                            {projectName && (
                                <span className="font-medium">Project: {projectName}</span>
                            )}
                        </p>
                    </Card>

                    <Card className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Title"
                                name="title"
                                value={task.title}
                                onChange={handleChange}
                                className="text-[#172b4d]"
                                required
                            />

                            <div>
                                <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={task.description}
                                    onChange={handleChange}
                                    className="w-full border border-[#dfe1e6] rounded px-3 py-2 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white resize-none"
                                    rows={4}
                                    required
                                />
                            </div>

                            <Input
                                label="Assignee"
                                name="assignee"
                                value={task.assignee}
                                onChange={handleChange}
                                className="text-[#172b4d]"
                                required
                            />

                            <Select
                                label="Status"
                                name="status"
                                value={task.status}
                                onChange={handleChange}
                                className="text-[#172b4d]"
                                options={[
                                    { value: "Pending", label: "To Do" },
                                    { value: "InProgress", label: "In Progress" },
                                    { value: "Completed", label: "Done" },
                                ]}
                            />

                            <div className="flex gap-2 pt-4">
                                <Button type="submit">Save Changes</Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push(`/user/projects/${projectId}/tasks`)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </UserLayout>
    );
}
