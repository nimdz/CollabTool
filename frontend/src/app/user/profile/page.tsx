"use client";

import UserLayout from "@/components/layout/UserLayout";
import InputField from "@/components/auth/InputField";
import { useProfile } from "@/hooks/useProfile";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function ProfilePage() {
  const { user, loading, editMode, setEditMode, form, handleChange, handleSave, saving, error } = useProfile();

  if (loading) {
    return (
      <UserLayout>
        <LoadingSpinner />
      </UserLayout>
    );
  }

  if (!user) {
    return (
      <UserLayout>
        <div className="p-8">
          <ErrorMessage message="User not found" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#172b4d]">Profile</h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm text-[#0052cc] hover:underline font-medium"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="bg-white rounded border border-[#dfe1e6] p-6 space-y-4">
            <InputField
              label="Username"
              name="username"
              value={user.username}
              onChange={() => {}}
              type="text"
              disabled
            />
            <InputField
              label="Email"
              name="email"
              value={user.email}
              onChange={() => {}}
              type="email"
              disabled
            />
            <InputField
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              type="text"
              disabled={!editMode}
            />
            <InputField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              type="text"
              disabled={!editMode}
            />
            <div>
              <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-[#dfe1e6] rounded text-sm focus:outline-none focus:border-[#0052cc] resize-none ${
                  !editMode ? "bg-[#fafbfc] text-[#5e6c84]" : "bg-white text-[#172b4d]"
                }`}
                rows={4}
              />
            </div>

            {editMode && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#0052cc] text-white py-2 rounded hover:bg-[#0747a6] transition text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          <div className="mt-4 text-sm text-[#5e6c84]">
            Joined: {new Date(user.joinedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
