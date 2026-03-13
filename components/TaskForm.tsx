"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Task } from "@/services/taskService";
import { UserInfo } from "@/services/taskService";

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: Partial<Task> & { assignedUserEmail?: string }) => void;
  isSubmitting: boolean;
  users?: UserInfo[]; // Only provided for admin
  isAdmin?: boolean;
}

export default function TaskForm({
  initialData,
  onSubmit,
  isSubmitting,
  users,
  isAdmin,
}: TaskFormProps) {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<Task> & { assignedUserEmail?: string } = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate")
        ? (formData.get("dueDate") as string).split("T")[0]
        : undefined,
    };
    if (isAdmin) {
      const assignedEmail = formData.get("assignedUserEmail") as string;
      if (assignedEmail) data.assignedUserEmail = assignedEmail;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          defaultValue={initialData?.title || ""}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description || ""}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            defaultValue={initialData?.status || "TODO"}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            defaultValue={initialData?.priority || "MEDIUM"}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          defaultValue={
            initialData?.dueDate ? initialData.dueDate.split("T")[0] : ""
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {isAdmin && users && users.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To User
          </label>
          <select
            name="assignedUserEmail"
            defaultValue={initialData?.userEmail || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">— Assign to yourself —</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {u.name} ({u.email}) [{u.role}]
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 rounded-md text-white font-medium hover:bg-indigo-700 transition-colors flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Task"}
        </button>
      </div>
    </form>
  );
}
