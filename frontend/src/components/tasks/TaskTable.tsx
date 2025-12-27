"use client";

import { Task, TaskStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import { Edit3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

interface TaskTableProps {
    tasks: Task[];
    onEdit: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}

const getStatusBadge = (status: TaskStatus): { label: string; variant: "default" | "info" | "success" } => {
    const statusMap: Record<TaskStatus, { label: string; variant: "default" | "info" | "success" }> = {
        Pending: { label: "To Do", variant: "default" },
        InProgress: { label: "In Progress", variant: "info" },
        Completed: { label: "Done", variant: "success" },
    };
    return statusMap[status] ?? { label: "Unknown", variant: "default" };
};

export default function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    return (
        <div className="overflow-hidden rounded-xl border border-[#dfe1e6] shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
                    <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Task</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Assignee</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#5e6c84] uppercase">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#dfe1e6]">
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-6 text-[#5e6c84] text-sm">
                                No tasks available
                            </td>
                        </tr>
                    ) : (
                        tasks.map((task) => {
                            const statusBadge = getStatusBadge(task.status);
                            return (
                                <motion.tr
                                    key={task.taskId}
                                    className="hover:bg-[#f9fafb] transition"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-[#172b4d] text-sm">{task.title}</div>
                                        <div className="text-xs text-[#5e6c84] mt-1">{task.description || "No description"}</div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-[#42526e]">{task.assignee}</td>

                                    <td className="px-4 py-3">
                                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                    </td>

                                    <td className="px-4 py-3 flex items-center justify-end gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onEdit(task.taskId)}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            title="Edit Task"
                                        >
                                            <Edit3 size={16} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setConfirmDeleteId(task.taskId)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
                        <Dialog.Title className="text-lg font-semibold text-gray-800">Delete Task?</Dialog.Title>
                        <p className="text-sm text-gray-500 mt-2">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>

                        <div className="flex justify-end mt-4 gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDeleteId) {
                                        onDelete(confirmDeleteId);
                                        setConfirmDeleteId(null);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
