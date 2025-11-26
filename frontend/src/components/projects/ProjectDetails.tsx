import { Project } from "@/types";

interface ProjectDetailsProps {
  project: Project;
  creatorName: string;
  meetingStarterName?: string;
}

export default function ProjectDetails({ project, creatorName, meetingStarterName }: ProjectDetailsProps) {
  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-sm font-medium text-gray-500">Project Key</dt>
        <dd className="text-sm text-gray-900 mt-1">{project.projectId.substring(0, 8).toUpperCase()}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Created By</dt>
        <dd className="text-sm text-gray-900 mt-1">{creatorName || "Loading..."}</dd>
      </div>
      {project.activeMeeting && (
        <div>
          <dt className="text-sm font-medium text-gray-500">Active Meeting</dt>
          <dd className="text-sm text-gray-900 mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>In Progress</span>
            </div>
            {meetingStarterName && (
              <p className="text-xs text-gray-500 mt-1">Started by {meetingStarterName}</p>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
