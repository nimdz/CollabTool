"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UserLayout from "@/components/layout/UserLayout";
import { useTasks } from "@/hooks/useTasks";
import api from "@/lib/api";
import { getToken } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Member {
  userId: string;
  username: string;
  email: string;
}

export default function AddTaskPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { createTask, loading } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const stored = localStorage.getItem("projectMembers");
        if (!stored) {
          toast.error("No project members found");
          setFetching(false);
          return;
        }

        const allUserIds: string[] = JSON.parse(stored);
        if (!Array.isArray(allUserIds) || allUserIds.length === 0) {
          toast.error("Project members list is empty");
          setFetching(false);
          return;
        }

        const token = getToken();
        const response = await api.post<Member[]>(
          "/profile/by-ids",
          allUserIds,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMembers(response.data);
      } catch {
        toast.error("Failed to load project members");
      } finally {
        setFetching(false);
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return false;
    const name = member.username || "";
    const email = member.email || "";
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    );
  });

  const handleSelectAssignee = (member: Member) => {
    setSelectedAssignee(member);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemoveAssignee = () => {
    setSelectedAssignee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");
    if (!selectedAssignee) return toast.error("Please select an assignee");

    const projectIdStr = Array.isArray(projectId) ? projectId[0] : projectId;
    if (!projectIdStr) return toast.error("Project ID missing");

    const newTask = await createTask({
      title,
      description,
      assignee: selectedAssignee.email,
      projectId: projectIdStr,
      status: "Pending",
    });

    if (newTask) {
      toast.success("Task created successfully!");
      router.push(`/user/projects/${projectIdStr}/tasks`);
    }
  };

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { label: "Projects", href: "/user/projects" },
              { label: "Project", href: `/user/projects/${projectId}` },
              { label: "Create Task" },
            ]}
          />

          <Card className="p-6 mb-6">
            <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">
              Create Task
            </h1>
            <p className="text-[#5e6c84]">Add a new task to this project</p>
          </Card>

          {fetching ? (
            <Card>
              <LoadingSpinner message="Loading members..." />
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white resize-none"
                  placeholder="Enter task title"
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white resize-none"
                    placeholder="Add a description"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5e6c84] mb-2 uppercase">
                    Assignee
                  </label>

                  {/* Selected Assignee */}
                  {selectedAssignee && (
                    <div className="flex items-center gap-1 bg-[#deebff] text-[#0052cc] px-2 py-1 rounded text-sm mb-2 w-fit">
                      <span>{selectedAssignee.username}</span>
                      <button
                        type="button"
                        onClick={handleRemoveAssignee}
                        className="hover:text-[#de350b] font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Search Input with Dropdown */}
                  {!selectedAssignee && (
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        placeholder="Type to search assignee..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => searchQuery && setShowDropdown(true)}
                        className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white"
                      />

                      {/* Dropdown */}
                      {showDropdown && filteredMembers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#dfe1e6] rounded shadow-lg max-h-48 overflow-y-auto">
                          {filteredMembers.map((member) => (
                            <button
                              key={member.userId}
                              type="button"
                              onClick={() => handleSelectAssignee(member)}
                              className="w-full text-left px-3 py-2 hover:bg-[#f4f5f7] text-sm text-[#172b4d] transition"
                            >
                              <div className="font-medium">
                                {member.username}
                              </div>
                              <div className="text-xs text-[#5e6c84]">
                                {member.email}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      router.push(`/user/projects/${projectId}/tasks`)
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
