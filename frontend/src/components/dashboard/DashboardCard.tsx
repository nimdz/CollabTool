import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

export default function DashboardCard({ title, description, href, icon = "📁" }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white border border-[#dfe1e6] rounded p-4 hover:border-[#0052cc] hover:shadow-md transition"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-semibold text-[#172b4d]">{title}</h3>
      </div>
      <p className="text-xs text-[#5e6c84]">{description}</p>
    </Link>
  );
}
