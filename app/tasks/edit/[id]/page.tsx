"use client";

import { useState, useEffect, use, useContext } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskForm from '@/components/TaskForm';
import taskService, { Task, UserInfo } from '@/services/taskService';
import { AuthContext } from '@/context/AuthContext';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTaskById(id);
        setTask(data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError('Failed to load task details. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
    if (isAdmin) {
      taskService.getAllUsers().then(setUsers).catch(() => {});
    }
  }, [id, isAdmin]);

  const handleSubmit = async (taskData: Partial<Task> & { assignedUserEmail?: string }) => {
    setIsSubmitting(true);
    setError('');

    try {
      await taskService.updateTask(id, taskData);
      router.push(isAdmin ? '/admin/dashboard' : '/tasks');
    } catch (err: any) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.message || 'Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = isAdmin ? '/admin/dashboard' : '/tasks';

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading task details...</span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Link href={backHref} className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 mb-4 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {isAdmin ? 'Back to Dashboard' : 'Back to Tasks'}
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
              <p className="text-sm text-gray-500 mt-1">Update the details for this task.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
            {error}
          </div>
        )}

        {!task && !loading && !error && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6 border border-yellow-200">
            Task not found.
          </div>
        )}

        {task && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
            <TaskForm
              initialData={task}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              users={users}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
