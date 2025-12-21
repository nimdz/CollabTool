"use client";

import { useState, useEffect } from "react";

interface ProjectFormProps {
  submitLabel: string;
  onSubmit: (data: { name: string; description: string }) => void | Promise<void>;
  initialData?: { name: string; description: string };
  disabled?: boolean;
  submitting?: boolean;
  hideButton?: boolean;
  onFormChange?: (data: { name: string; description: string }) => void;
}

export default function ProjectForm({
  submitLabel,
  onSubmit,
  initialData,
  disabled = false,
  submitting = false,
  hideButton = false,
  onFormChange,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
    }
  }, [initialData]);

  useEffect(() => {
    if (onFormChange) {
      onFormChange({ name, description });
    }
  }, [name, description, onFormChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitting) return;
    await onSubmit({ name, description });
  };

  const isDisabled = disabled || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
          Name
        </label>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white"
          required
          disabled={isDisabled}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
          Description
        </label>
        <textarea
          placeholder="Project description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-[#dfe1e6] rounded px-2 py-1.5 text-sm text-[#172b4d] bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white resize-none"
          disabled={isDisabled}
          rows={3}
        />
      </div>

      {!hideButton && (
        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full py-2 rounded text-sm font-medium transition ${
            isDisabled
              ? "bg-[#0052cc] opacity-50 cursor-not-allowed text-white"
              : "bg-[#0052cc] hover:bg-[#0747a6] text-white"
          }`}
        >
          {isDisabled ? "Creating..." : submitLabel}
        </button>
      )}
    </form>
  );
}
