"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import FilterBar from "@/components/FilterBar";
import taskService, { Task, TaskFilters } from "@/services/taskService";
import { AuthContext } from "@/context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  CheckSquare,
  User,
} from "lucide-react";

export default function TasksPage() {
  const PAGE_SIZE = 10;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { role, email } = useContext(AuthContext);
  const isAdmin = role === "ADMIN";

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "",
    priority: "",
    sortBy: "createdAt",
    direction: "desc",
  });

  const fetchTasks = useCallback(
    async (page: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError("");

        const params: TaskFilters = {
          page,
          size: PAGE_SIZE,
          ...(filters.status && { status: filters.status }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.sortBy && { sortBy: filters.sortBy }),
          ...(filters.direction && { direction: filters.direction }),
        };

        const data = await taskService.getTasks(params);

        if ("content" in data && Array.isArray(data.content)) {
          setTasks((prev) =>
            append ? [...prev, ...data.content] : data.content,
          );
          setTotalPages(data.totalPages);
        } else if (Array.isArray(data)) {
          const total = Math.ceil(data.length / PAGE_SIZE);
          const start = page * PAGE_SIZE;
          const pageItems = data.slice(start, start + PAGE_SIZE);
          setTasks((prev) => (append ? [...prev, ...pageItems] : pageItems));
          setTotalPages(total);
        } else {
          setTasks([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    setCurrentPage(0);
    fetchTasks(0);
  }, [fetchTasks]);

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const handleSortChange = (sortBy: string, direction: string) => {
    setFilters((prev) => ({ ...prev, sortBy, direction }));
    setCurrentPage(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        setCurrentPage(0);
        fetchTasks(0);
      } catch (err) {
        alert("Failed to delete task.");
      }
    }
  };

  const handleMarkComplete = async (task: Task) => {
    try {
      await taskService.markComplete(task.id, task);
      setCurrentPage(0);
      fetchTasks(0);
    } catch (err) {
      alert("Failed to update task.");
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTasks(nextPage, true);
  };

  const canModifyTask = (task: Task) => {
    return isAdmin || task.userEmail === email;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "TODO":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "TODO":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "DONE":
        return "Done";
      case "IN_PROGRESS":
        return "In Progress";
      case "TODO":
        return "To Do";
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? "All Tasks" : "My Tasks"}
            </h1>
            {isAdmin && (
              <p className="text-sm text-gray-500 mt-1">
                Viewing and managing all tasks across all users
              </p>
            )}
          </div>
          <Link
            href="/tasks/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating a new task.
            </p>
            <Link
              href="/tasks/create"
              className="text-indigo-600 font-medium hover:text-indigo-800"
            >
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="max-h-[calc(100vh-20rem)] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                      Task
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {task.userName || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {task.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {task.status !== "DONE" && canModifyTask(task) && (
                            <button
                              onClick={() => handleMarkComplete(task)}
                              title="Mark Done"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white border border-green-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {canModifyTask(task) && (
                            <Link
                              href={`/tasks/edit/${task.id}`}
                              title="Edit"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded bg-white border border-blue-200"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}
                          {canModifyTask(task) && (
                            <button
                              onClick={() => handleDelete(task.id)}
                              title="Delete"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white border border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Showing {tasks.length} of {totalPages * PAGE_SIZE} task{totalPages * PAGE_SIZE !== 1 ? "s" : ""}
              </span>
              {currentPage < totalPages - 1 && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
