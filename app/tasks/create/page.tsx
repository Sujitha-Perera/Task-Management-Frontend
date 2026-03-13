"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import TaskForm from "@/components/TaskForm";
import taskService, { Task, UserInfo } from "@/services/taskService";
import { AuthContext } from "@/context/AuthContext";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

export default function CreateTaskPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const router = useRouter();
  const { role } = useContext(AuthContext);
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      taskService
        .getAllUsers()
        .then(setUsers)
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleSubmit = async (
    taskData: Partial<Task> & { assignedUserEmail?: string },
  ) => {
    setIsSubmitting(true);
    setError("");

    try {
      await taskService.createTask(taskData);
      router.push(isAdmin ? "/admin/dashboard" : "/tasks");
    } catch (err: any) {
      console.error("Error creating task:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create task. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Link
            href={isAdmin ? "/admin/dashboard" : "/tasks"}
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 mb-4 w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAdmin ? "Back to Dashboard" : "Back to Tasks"}
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Edit3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Task
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin
                  ? "Create and assign a task to any user."
                  : "Fill out the details below to add a new task."}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            users={users}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
