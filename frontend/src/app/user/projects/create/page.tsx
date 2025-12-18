"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UserLayout from "@/components/layout/UserLayout";
import ProjectForm from "@/components/projects/ProjectForm";
import { useProjects } from "@/hooks/useProjects";
import { User } from "@/types";
import { getToken } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function CreateProjectPage() {
  const { createProject, fetchUsers } = useProjects();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getCurrentUserId = useCallback((): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as { nameid: string };
      return payload.nameid;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = getCurrentUserId();

  const loadUsers = useCallback(async () => {
    try {
      const fetchedUsers = await fetchUsers();
      if (fetchedUsers && Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers);
        // Auto-select current user
        if (currentUserId) {
          const currentUser = fetchedUsers.find(u => u.userId === currentUserId);
          if (currentUser) {
            setSelectedUsers([currentUser]);
          }
        }
      }
    } catch {
      toast.error("Failed to load users");
    }
  }, [fetchUsers, currentUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return false;
    const name = user.name || user.username || "";
    const email = user.email || "";
    const query = searchQuery.toLowerCase();
    const isMatch = name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    const notSelected = !selectedUsers.find(u => u.userId === user.userId);
    return isMatch && notSelected;
  });

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.userId !== userId));
  };

  const handleCreate = async () => {
    if (submitting || !formData.name) {
      toast.error("Please enter a project name");
      return;
    }
    setSubmitting(true);

    try {
      const project = await createProject({
        ...formData,
        members: selectedUsers.map((user) => ({
          userId: user.userId,
          username: user.username,
          email: user.email,
        })),
      });

      if (project) {
        toast.success("Project created successfully!");
        router.push("/user/projects");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[
            { label: "Projects", href: "/user/projects" },
            { label: "Create Project" }
          ]} />

          <Card className="p-6 mb-6">
            <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">Create Project</h1>
            <p className="text-[#5e6c84]">Start a new project and add team members</p>
          </Card>

          <Card className="p-6 space-y-6">
            <ProjectForm 
              submitLabel="Create" 
              onSubmit={() => {}} 
              submitting={submitting}
              hideButton={true}
              onFormChange={setFormData}
            />

            <div>
              <label className="block text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Team Members</label>
              
              {/* Selected Members */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-1 bg-[#deebff] text-[#0052cc] px-2 py-1 rounded text-sm">
                      <span>{user.name || user.username}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.userId)}
                        className="hover:text-[#de350b] font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Type to search and add members..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white"
                />
                
                {/* Dropdown */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#dfe1e6] rounded shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.userId}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-3 py-2 hover:bg-[#f4f5f7] text-sm text-[#172b4d] transition"
                      >
                        <div className="font-medium">{user.name || user.username}</div>
                        <div className="text-xs text-[#5e6c84]">{user.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-[#5e6c84] mt-2">{selectedUsers.length} member(s) selected</p>
            </div>

            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
