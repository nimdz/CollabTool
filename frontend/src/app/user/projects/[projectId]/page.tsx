"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import UserLayout from "@/components/layout/UserLayout";
import { useProjects } from "@/hooks/useProjects";
import { Project, User } from "@/types";
import api from "@/lib/api";
import { getToken } from "@/lib/auth";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectDetails from "@/components/projects/ProjectDetails";
import TeamMembers from "@/components/projects/TeamMembers";

export default function ProjectViewPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { fetchProjectsByUser, startOrJoinMeeting, endMeeting, loading } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [memberDetails, setMemberDetails] = useState<User[]>([]);
  const [creatorName, setCreatorName] = useState<string>("");
  const [meetingStarterName, setMeetingStarterName] = useState<string>("");
  const [error, setError] = useState("");
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      if (!projectId) return;

      try {
        const allProjects = (await fetchProjectsByUser()) || [];
        const foundProject = allProjects.find((p) => p.projectId === projectId);

        if (!foundProject) {
          if (mounted) setError("Project not found");
          return;
        }

        if (mounted) setProject(foundProject);

        const memberIds = foundProject.members.map((m) => 
          typeof m === "string" ? m : m.userId
        ).filter(Boolean);

        const meetingStarterId = foundProject.activeMeeting && typeof foundProject.activeMeeting === 'object' && 'startedBy' in foundProject.activeMeeting 
          ? (foundProject.activeMeeting as any).startedBy 
          : undefined;

        const allUserIds = [...new Set([...memberIds, foundProject.createdBy, meetingStarterId].filter(Boolean))];

        if (allUserIds.length > 0) {
          const token = getToken();
          const response = await api.post<User[]>(
            "/profile/by-ids",
            allUserIds,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (mounted) {
            setMemberDetails(response.data);
            const creator = response.data.find(u => u.userId === foundProject.createdBy);
            setCreatorName(creator?.fullName || creator?.username || foundProject.createdBy);
            
            if (meetingStarterId) {
              const starter = response.data.find(u => u.userId === meetingStarterId);
              setMeetingStarterName(starter?.fullName || starter?.username || "");
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load project");
          toast.error("Failed to load project");
        }
      }
    };

    loadProject();
    return () => {
      mounted = false;
    };
  }, [projectId, fetchProjectsByUser]);

  const handleStartOrJoinMeeting = async () => {
    if (!project) return;

    setIsMeetingLoading(true);
    const toastId = toast.loading(
      project.activeMeeting ? "Joining meeting..." : "Starting meeting..."
    );

    try {
      const joinInfo = await startOrJoinMeeting(project.projectId);
      if (joinInfo) {
        toast.success("Successfully joined meeting!", { id: toastId });
        sessionStorage.setItem("chimeMeetingInfo", JSON.stringify(joinInfo));
        router.push(`/meeting/${project.projectId}`);
      } else {
        throw new Error("Failed to get meeting information.");
      }
    } catch (err) {
      toast.error("Could not start or join the meeting.", { id: toastId });
      console.error(err);
    } finally {
      setIsMeetingLoading(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!project) return;

    setIsEndingMeeting(true);
    const toastId = toast.loading("Ending meeting...");

    try {
      const success = await endMeeting(project.projectId);
      if (success) {
        toast.success("Meeting ended successfully!", { id: toastId });
        window.location.reload();
      } else {
        throw new Error("Failed to end meeting.");
      }
    } catch (err) {
      toast.error("Could not end the meeting.", { id: toastId });
      console.error(err);
    } finally {
      setIsEndingMeeting(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <LoadingSpinner message="Loading project details..." />
      </UserLayout>
    );
  }

  if (error || !project) {
    return (
      <UserLayout>
        <div className="p-8">
          <ErrorMessage message={error || "Project not found."} />
        </div>
      </UserLayout>
    );
  }

  const handleAddTaskClick = () => {
    localStorage.setItem("projectMembers", JSON.stringify(project.members));
  };

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[
            { label: "Projects", href: "/user/dashboard" },
            { label: project.name }
          ]} />

          <Card className="p-6 mb-6">
            <ProjectHeader
              project={project}
              onStartMeeting={handleStartOrJoinMeeting}
              onEndMeeting={handleEndMeeting}
              isMeetingLoading={isMeetingLoading}
              isEndingMeeting={isEndingMeeting}
            />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-[#172b4d] mb-4">Quick Actions</h2>
                  <Link href={`/user/projects/${projectId}/tasks`} onClick={handleAddTaskClick}>
                    <Button variant="secondary">📋 View Tasks</Button>
                  </Link>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-[#172b4d] mb-4">Details</h2>
                  <ProjectDetails
                    project={project}
                    creatorName={creatorName}
                    meetingStarterName={meetingStarterName}
                  />
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-[#172b4d] mb-4">Team</h2>
                  <TeamMembers members={memberDetails} />
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
