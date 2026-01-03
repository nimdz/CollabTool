export interface User {
  userId: string;
  username: string;
  fullName?: string;
  name?: string;
  email: string;
  department?: string;
}

export interface Project {
  projectId: string;
  name: string;
  description?: string;
  createdBy: string;
  members: ProjectMember[];
  activeMeeting?: ActiveMeeting | null;
}

export interface ProjectMember {
  userId: string;
  username: string;
  email: string;
}

export interface ActiveMeeting {
  chimeMeetingId: string;
  applicationMeetingId: string;
  startedBy?: string;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  projectId: string;
}

export type TaskStatus = "Pending" | "InProgress" | "Completed";

export interface MeetingJoinInfo {
  meeting: {
    meetingId: string;
    externalMeetingId: string;
    mediaPlacement: {
      audioHostUrl: string;
      audioFallbackUrl: string;
      screenDataUrl: string;
      screenSharingUrl: string;
      screenViewingUrl: string;
      signalingUrl: string;
      turnControlUrl: string;
    };
  };
  attendee: {
    attendeeId: string;
    externalUserId: string;
    joinToken: string;
  };
}

export interface JwtPayload {
  nameid: string;
  name: string;
  email: string;
  role: string;
}
