import { TaskFilters } from "@/services/taskService";

interface FilterBarProps {
  filters: TaskFilters;
  onFilterChange: (key: keyof TaskFilters, value: string) => void;
  onSortChange: (sortBy: string, direction: string) => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Filters:
        </span>

        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={filters.priority || ""}
          onChange={(e) => onFilterChange("priority", e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {(filters.status || filters.priority) && (
          <button
            onClick={() => {
              onFilterChange("status", "");
              onFilterChange("priority", "");
            }}
            className="text-sm text-red-500 hover:text-red-700 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Sort:
        </span>
        <select
          value={`${filters.sortBy || "createdAt"}-${filters.direction || "desc"}`}
          onChange={(e) => {
            const [sortBy, direction] = e.target.value.split("-");
            onSortChange(sortBy, direction);
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="priority-asc">Priority (Low to High)</option>
        </select>
      </div>
    </div>
  );
}
