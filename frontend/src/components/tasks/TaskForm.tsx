"use client";

import { useState } from "react";

export default function TaskForm({
  onSubmit,
  submitLabel,
  initialData,
}: {
  onSubmit: (data: { title: string; description: string; assignee: string }) => void;
  submitLabel: string;
  initialData?: { title: string; description: string; assignee: string };
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    assignee: initialData?.assignee || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">Assignee</label>
        <input
          type="text"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white"
        />
      </div>

      <button
        type="submit"
        className="bg-[#0052cc] text-white w-full py-2 rounded text-sm font-medium hover:bg-[#0747a6] transition"
      >
        {submitLabel}
      </button>
    </form>
  );
}
