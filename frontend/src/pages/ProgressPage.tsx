import { useState } from "react";
import { mockProgressData, mockMilestones, mockSkillProfile } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Trophy, Shield, Flame, Layers, Globe, Calendar,
  Target, Zap, Clock, TrendingUp, Users, Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const skillColors: Record<string, string> = {
  error_handling: "hsl(0, 84%, 60%)",
  system_design: "hsl(239, 84%, 67%)",
  security: "hsl(38, 92%, 50%)",
  decoupling: "hsl(142, 71%, 45%)",
  performance: "hsl(199, 89%, 48%)",
  inclusion: "hsl(280, 67%, 55%)",
};

const skillLabels: Record<string, string> = {
  error_handling: "Error Handling",
  system_design: "System Design",
  security: "Security",
  decoupling: "Decoupling",
  performance: "Performance",
  inclusion: "Inclusion",
};

const milestoneIcons: Record<string, React.ElementType> = {
  Trophy, Shield, Flame, Layers, Globe,
};

const ranges = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "all", label: "All time" },
];

const stats = [
  { label: "Challenges", value: "23", icon: Target, color: "text-primary" },
  { label: "Skill Points", value: "1,240", icon: Zap, color: "text-warning" },
  { label: "Current Streak", value: "12 days", icon: Flame, color: "text-destructive" },
  { label: "Avg. Time", value: "18 min", icon: Clock, color: "text-info" },
  { label: "Most Improved", value: "Security", icon: TrendingUp, color: "text-success" },
  { label: "Domain Level", value: "Advanced", icon: Award, color: "text-primary" },
];

const leaderboard = [
  { rank: 1, name: "alice_dev", score: 2450, isCurrentUser: false },
  { rank: 2, name: "DevForge User", score: 1240, isCurrentUser: true },
  { rank: 3, name: "bob_codes", score: 1180, isCurrentUser: false },
  { rank: 4, name: "charlie_sys", score: 980, isCurrentUser: false },
  { rank: 5, name: "diana_sec", score: 870, isCurrentUser: false },
];

export default function ProgressPage() {
  const [range, setRange] = useState("30");
  const [leaderTab, setLeaderTab] = useState("global");

  const filteredData = range === "all" ? mockProgressData : mockProgressData.slice(-parseInt(range));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Range Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Progress Tracking</h1>
        <div className="flex items-center gap-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md transition-colors",
                range === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h2 className="text-sm font-semibold mb-3">Skill Progression</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            {Object.entries(skillColors).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={skillLabels[key]}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-lg border border-border p-3 text-center"
          >
            <stat.icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <h2 className="text-sm font-semibold mb-3">Milestones</h2>
          <div className="space-y-3">
            {mockMilestones.map((m) => {
              const Icon = milestoneIcons[m.icon] || Trophy;
              return (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{m.title}</div>
                    <div className="text-[10px] text-muted-foreground">{m.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{m.date}</span>
                      <Badge variant="outline" className="text-[9px] h-4">+{m.skill_points} pts</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Leaderboard</h2>
            <div className="flex gap-1">
              {["friends", "global", "domain"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderTab(tab)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded capitalize transition-colors",
                    leaderTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-xs",
                  entry.isCurrentUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                )}
              >
                <span className={cn("font-bold w-6 text-center", entry.rank <= 3 ? "text-warning" : "text-muted-foreground")}>
                  #{entry.rank}
                </span>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className={cn("flex-1", entry.isCurrentUser && "font-semibold")}>{entry.name}</span>
                <span className="font-mono font-semibold">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
