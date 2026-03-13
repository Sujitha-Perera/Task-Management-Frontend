"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, CheckSquare, LayoutDashboard, ListTodo } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, role, name } = useContext(AuthContext);
  const isAdmin = role === "ADMIN";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-indigo-600 font-bold text-xl"
            >
              <CheckSquare className="w-6 h-6" />
              <span>TaskFlow</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/tasks"
                      className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <ListTodo className="w-4 h-4" />
                      All Tasks
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/tasks"
                    className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <ListTodo className="w-4 h-4" />
                    My Tasks
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {name && (
                    <span className="text-sm text-gray-600 font-medium">
                      {name}
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isAdmin
                        ? "bg-purple-100 text-purple-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
