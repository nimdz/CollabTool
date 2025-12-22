import { Project } from "@/types";
import Button from "@/components/ui/Button";

interface ProjectHeaderProps {
  project: Project;
  onStartMeeting: () => void;
  onEndMeeting: () => void;
  isMeetingLoading: boolean;
  isEndingMeeting: boolean;
}

export default function ProjectHeader({
  project,
  onStartMeeting,
  onEndMeeting,
  isMeetingLoading,
  isEndingMeeting,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description || "No description"}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onStartMeeting} disabled={isMeetingLoading}>
          {project.activeMeeting ? "Join Meeting" : "Start Meeting"}
        </Button>
        {project.activeMeeting && (
          <Button variant="danger" onClick={onEndMeeting} disabled={isEndingMeeting}>
            End Meeting
          </Button>
        )}
      </div>
    </div>
  );
}
