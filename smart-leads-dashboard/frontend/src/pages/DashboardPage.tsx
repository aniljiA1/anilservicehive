import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useLeadStore } from "../store/leadStore";
import { useAuthStore } from "../store/authStore";
import {
  StatsCard,
  LoadingOverlay,
  StatusBadge,
  SourceBadge,
} from "../components/ui";

export default function DashboardPage() {
  const { stats, leads, fetchStats, fetchLeads, isLoading } = useLeadStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusCount = (status: string) =>
    stats?.statusStats.find((s) => s._id === status)?.count || 0;

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's what's happening with your leads today.
          </p>
        </div>
        <button
          onClick={() => navigate("/leads")}
          className="btn-primary hidden sm:inline-flex"
        >
          <Plus size={16} />
          New Lead
        </button>
      </div>

      {isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Total Leads"
              value={stats?.total || 0}
              icon={<Users size={20} />}
              color="blue"
            />
            <StatsCard
              label="Qualified"
              value={getStatusCount("Qualified")}
              icon={<CheckCircle2 size={20} />}
              color="green"
            />
            <StatsCard
              label="Contacted"
              value={getStatusCount("Contacted")}
              icon={<TrendingUp size={20} />}
              color="amber"
            />
            <StatsCard
              label="Lost"
              value={getStatusCount("Lost")}
              icon={<XCircle size={20} />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Status Breakdown
              </h3>
              <div className="space-y-3">
                {(stats?.statusStats || []).map((s) => {
                  const pct = stats?.total
                    ? Math.round((s.count / stats.total) * 100)
                    : 0;
                  const colorMap: Record<string, string> = {
                    New: "bg-blue-500",
                    Contacted: "bg-amber-500",
                    Qualified: "bg-green-500",
                    Lost: "bg-red-500",
                  };
                  return (
                    <div key={s._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {s._id}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorMap[s._id] || "bg-brand-500"} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!stats?.statusStats?.length && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No data yet
                  </p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Source Breakdown
              </h3>
              <div className="space-y-3">
                {(stats?.sourceStats || []).map((s) => {
                  const pct = stats?.total
                    ? Math.round((s.count / stats.total) * 100)
                    : 0;
                  const colorMap: Record<string, string> = {
                    Website: "bg-purple-500",
                    Instagram: "bg-pink-500",
                    Referral: "bg-teal-500",
                  };
                  return (
                    <div key={s._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {s._id}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorMap[s._id] || "bg-brand-500"} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!stats?.sourceStats?.length && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No data yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Leads
              </h3>
              <button
                onClick={() => navigate("/leads")}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No leads yet. Create your first one!
              </p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {lead.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={lead.status} />
                      <SourceBadge source={lead.source} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
