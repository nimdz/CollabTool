import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-[#172b4d] mb-1">{title}</h1>
        {description && <p className="text-sm text-[#5e6c84]">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
