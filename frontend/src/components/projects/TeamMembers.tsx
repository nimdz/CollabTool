import { User } from "@/types";
import Avatar from "@/components/common/Avatar";

interface TeamMembersProps {
  members: User[];
}

export default function TeamMembers({ members }: TeamMembersProps) {
  return (
    <div className="space-y-3">
      {members.length > 0 ? (
        members.map((member) => (
          <div key={member.userId} className="flex items-center gap-3">
            <Avatar name={member.fullName || member.username} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {member.fullName || member.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No members</p>
      )}
    </div>
  );
}
