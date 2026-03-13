"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import taskService, {
  Task,
  TaskFilters,
  UserInfo,
} from "@/services/taskService";
import { AuthContext } from "@/context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ListTodo,
  CheckSquare,
  BarChart2,
  User,
  Filter,
} from "lucide-react";

export default function AdminDashboard() {
  const PAGE_SIZE = 10;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const { name } = useContext(AuthContext);

  const fetchData = useCallback(
    async (page: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError("");

        const [taskData, usersData] = await Promise.all([
          taskService.getTasks({
            page,
            size: PAGE_SIZE,
            sortBy: "createdAt",
            direction: "desc",
            ...(filterStatus && { status: filterStatus }),
            ...(filterPriority && { priority: filterPriority }),
          }),
          taskService.getAllUsers(),
        ]);

        if ("content" in taskData && Array.isArray(taskData.content)) {
          setTasks((prev) =>
            append ? [...prev, ...taskData.content] : taskData.content,
          );
          setTotalPages(taskData.totalPages);
          setTotalElements(taskData.totalElements);
        } else if (Array.isArray(taskData)) {
          const total = Math.ceil(taskData.length / PAGE_SIZE);
          const start = page * PAGE_SIZE;
          const pageItems = taskData.slice(start, start + PAGE_SIZE);
          setTasks((prev) => (append ? [...prev, ...pageItems] : pageItems));
          setTotalPages(total);
          setTotalElements(taskData.length);
        }

        setUsers(usersData);
      } catch (err) {
        console.error("Error loading admin data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterStatus, filterPriority],
  );

  useEffect(() => {
    setCurrentPage(0);
    fetchData(0);
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this task? This action cannot be undone.")) {
      try {
        await taskService.deleteTask(id);
        setCurrentPage(0);
        fetchData(0);
      } catch {
        alert("Failed to delete task.");
      }
    }
  };

  const handleMarkComplete = async (task: Task) => {
    try {
      await taskService.markComplete(task.id, task);
      setCurrentPage(0);
      fetchData(0);
    } catch {
      alert("Failed to update task status.");
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchData(nextPage, true);
  };

  const stats = {
    total: totalElements,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  const filteredTasks = filterUser
    ? tasks.filter((t) => t.userEmail === filterUser)
    : tasks;

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
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "TODO":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case "TODO":
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back,{" "}
              <span className="font-medium text-indigo-600">{name}</span>.
              Manage all tasks and users.
            </p>
          </div>
          <Link
            href="/tasks/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Assign Task
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                Total Tasks
              </span>
              <div className="bg-indigo-50 p-1.5 rounded-lg">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">To Do</span>
              <div className="bg-orange-50 p-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.todo}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                In Progress
              </span>
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Done</span>
              <div className="bg-green-50 p-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
          </div>
        </div>

        {/* Users Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-800">
              Registered Users ({users.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <span
                key={u.email}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                  filterUser === u.email
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                }`}
                onClick={() =>
                  setFilterUser(filterUser === u.email ? "" : u.email)
                }
              >
                <User className="w-3.5 h-3.5" />
                {u.name}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    u.role === "ADMIN"
                      ? "bg-purple-200 text-purple-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {u.role}
                </span>
              </span>
            ))}
          </div>
          {filterUser && (
            <p className="text-sm text-indigo-600 mt-2">
              Filtering tasks for:{" "}
              <strong>{users.find((u) => u.email === filterUser)?.name}</strong>
              <button
                onClick={() => setFilterUser("")}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter Tasks
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            {(filterStatus || filterPriority || filterUser) && (
              <button
                onClick={() => {
                  setFilterStatus("");
                  setFilterPriority("");
                  setFilterUser("");
                  setCurrentPage(0);
                }}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Tasks Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No tasks found with the current filters.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} shown
                {filterUser &&
                  ` for ${users.find((u) => u.email === filterUser)?.name}`}
              </span>
            </div>
            <div className="max-h-[calc(100vh-24rem)] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              {task.userName || "—"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {task.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {task.status !== "DONE" && (
                            <button
                              onClick={() => handleMarkComplete(task)}
                              title="Mark Done"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/tasks/edit/${task.id}`}
                            title="Edit"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(task.id)}
                            title="Delete"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Showing {filteredTasks.length} of {totalElements} task
                {totalElements !== 1 ? "s" : ""}
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
