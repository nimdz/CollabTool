"use client";

import UserLayout from "@/components/layout/UserLayout";
import { useUser } from "@/hooks/useUser";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import DashboardCard from "@/components/dashboard/DashboardCard";

export default function DashboardPage() {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <UserLayout>
        <LoadingSpinner />
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="p-8">
          <ErrorMessage message={error} />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">Dashboard</h1>
          <p className="text-sm text-[#5e6c84] mb-6">Welcome back, {user?.fullName || "User"}!</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard
              title="Projects"
              description="View and manage projects"
              href="/user/projects"
              icon="📋"
            />
            <DashboardCard
              title="Tasks"
              description="Track your tasks"
              href="/user/tasks"
              icon="✓"
            />
            <DashboardCard
              title="Meetings"
              description="Join or start meetings"
              href="#"
              icon="📹"
            />
            <DashboardCard
              title="Profile"
              description="Manage your profile"
              href="/user/profile"
              icon="👤"
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
