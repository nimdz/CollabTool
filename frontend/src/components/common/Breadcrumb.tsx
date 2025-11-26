import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="mb-6 flex items-center text-sm text-[#5e6c84]">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#0052cc] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#172b4d] font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </div>
  );
}
