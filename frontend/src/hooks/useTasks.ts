"use client";

import { useState, useRef, useCallback } from "react";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";
import { Task } from "@/types";
import { handleApiError } from "@/utils/helpers";

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const creatingRef = useRef(false);

    const handleError = (err: unknown, fallback = "Something went wrong") => {
        const message = handleApiError(err, fallback);
        setError(message);
        return message;
    };

    const fetchTasksByProject = async (projectId: string) => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) return logout();

            const res = await api.get<Task[]>(`/taskservice/tasks/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks(res.data);
            return res.data;
        } catch (err) {
            handleError(err, "Failed to fetch tasks");
            return [];
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (task: Omit<Task, "taskId">) => {
        if (creatingRef.current) return null;
        creatingRef.current = true;
        setError("");

        try {
            const token = getToken();
            if (!token) return logout();

            const res = await api.post<Task>("/taskservice/tasks", task, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks(prev => [...prev, res.data]);
            return res.data;
        } catch (err) {
            handleError(err, "Failed to create task");
            return null;
        } finally {
            creatingRef.current = false;
        }
    };

    const fetchTasksByUser = useCallback(async (userEmail: string) => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) return logout();

            const res = await api.get<Task[]>(`/taskservice/tasks/user/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const map = new Map<string, Task>();
            res.data.forEach(task => map.set(task.taskId, task));
            const uniqueTasks = Array.from(map.values());

            setTasks(uniqueTasks);
            console.log("[DEBUG] Fetched and deduplicated tasks:", uniqueTasks);

            return uniqueTasks;
        } catch (err) {
            handleError(err, "Failed to fetch tasks for user");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTask = async (taskId: string) => {
        setError("");
        try {
            const token = getToken();
            if (!token) return logout();

            await api.delete(`/taskservice/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove deleted task from state
            setTasks(prev => prev.filter(task => task.taskId !== taskId));
            return true;
        } catch (err) {
            handleError(err, "Failed to delete task");
            return false;
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: "Pending" | "InProgress" | "Completed") => {
        setError("");
        try {
            const token = getToken();
            if (!token) return logout();

            const res = await api.put<Task>(
                `/taskservice/tasks/${taskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTasks(prev =>
                prev.map(task =>
                    task.taskId === taskId
                        ? { ...task, status: newStatus } 
                        : task
                )
            );

            return res.data;
        } catch (err) {
            handleError(err, "Failed to update task status");
            return null;
        }
    };


    return { tasks, loading, error, fetchTasksByProject, createTask, fetchTasksByUser, updateTaskStatus, deleteTask };
}
