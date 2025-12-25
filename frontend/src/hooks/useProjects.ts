"use client";

import { useState, useRef, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";
import { Project, User, MeetingJoinInfo, JwtPayload, ProjectMember } from "@/types";
import { handleApiError } from "@/utils/helpers";

type ApiUser = {
  userId: string;
  username: string;
  fullName?: string;
  name?: string;
  email: string;
};



export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const creatingRef = useRef(false);

    const getUserFromToken = (): { id: string; name: string; email: string } | null => {
        const token = getToken();
        if (!token) return null;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return { id: decoded.nameid, name: decoded.name, email: decoded.email };
        } catch {
            return null;
        }
    };

    const handleError = (err: unknown, fallback = "Something went wrong") => {
        const message = handleApiError(err, fallback);
        setError(message);
        return message;
    };

    const fetchProjectsByUser = useCallback(async (): Promise<Project[]> => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) {
                logout();
                return [];
            }

            const user = getUserFromToken();
            if (!user) {
                logout();
                return [];
            }

            const res = await api.get<Project[]>(`/taskservice/projects/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // The response already includes the activeMeeting field from the backend
            const projectsData = res.data ?? [];
            setProjects(projectsData);
            return projectsData;
        } catch (err) {
            handleError(err, "Failed to fetch projects");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(
        async (data: { name: string; description?: string; members?: ProjectMember[] }): Promise<Project | null> => {
            if (creatingRef.current) return null;
            creatingRef.current = true;

            try {
                const token = getToken();
                if (!token) {
                    logout();
                    return null;
                }

                const user = getUserFromToken();
                if (!user) {
                    logout();
                    return null;
                }

                const res = await api.post<Project>(
                    "/taskservice/projects",
                    { ...data, createdBy: user.id, members: data.members?.map(m => m.userId) ?? [] },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setProjects(prev =>
                    prev.some(p => p.projectId === res.data.projectId) ? prev : [...prev, res.data]
                );

                return res.data;
            } catch (err) {
                throw new Error(handleError(err, "Failed to create project"));
            } finally {
                creatingRef.current = false;
            }
        },
        []
    );

    const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) {
                logout();
                return false;
            }

            await api.delete(`/taskservice/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProjects(prev => prev.filter(p => p.projectId !== projectId));
            return true;
        } catch (err) {
            throw new Error(handleError(err, "Failed to delete project"));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async (): Promise<User[]> => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) {
                logout();
                return [];
            }

            const res = await api.get<ApiUser[]>("profile/all", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const mappedUsers: User[] = (res.data ?? []).map(u => ({
                userId: u.userId != null ? String(u.userId) : "",
                username: u.username ?? "",
                name: u.fullName ?? u.name ?? "Unknown",
                email: u.email ?? "",
            }));

            setUsers(mappedUsers);
            return mappedUsers;
        } catch (err) {
            console.error("Error fetching users:", err);
            handleError(err, "Failed to fetch users");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const startOrJoinMeeting = useCallback(
        async (projectId: string): Promise<MeetingJoinInfo | null> => {
            setError("");
            try {
                const token = getToken();
                if (!token) {
                    logout();
                    return null;
                }

                const res = await api.post<MeetingJoinInfo>(
                    `/taskservice/projects/${projectId}/meetings/start`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                return res.data;
            } catch (err) {
                throw new Error(handleError(err, "Failed to start or join the meeting"));
            }
        },
        []
    );

    const endMeeting = useCallback(
        async (projectId: string): Promise<boolean> => {
            setError("");
            try {
                const token = getToken();
                if (!token) {
                    logout();
                    return false;
                }

                await api.delete(
                    `/taskservice/projects/${projectId}/meetings`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                return true;
            } catch (err) {
                throw new Error(handleError(err, "Failed to end the meeting"));
            }
        },
        []
    );

    return {
        projects,
        users,
        loading,
        error,
        fetchProjectsByUser,
        createProject,
        deleteProject,
        fetchUsers,
        startOrJoinMeeting,
        endMeeting,
    };
}