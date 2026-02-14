import { useState } from "react";
import { mockSkillProfile } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  AlertTriangle, Layers, Shield, Unplug, Zap, Globe,
  Play, Trophy, Clock, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle, Layers, Shield, Unplug, Zap, Globe,
};

const radarData = mockSkillProfile.skills.map((s) => ({
  skill: s.name,
  score: s.score,
  fullMark: 100,
}));

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = mockSkillProfile;
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";

  const progressColor = (score: number) =>
    score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Developer</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Skill Level:</span>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {profile.level}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="6"
                  strokeDasharray={`${(profile.overall_score / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{profile.overall_score}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">Overall Score</span>
          </div>
          <Button onClick={() => navigate("/lab")} className="gap-2">
            <Play className="h-4 w-4" />
            Start Challenge
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <h2 className="text-sm font-semibold mb-3">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skill Cards */}
        <div className="grid grid-cols-2 gap-3">
          {profile.skills.map((skill, i) => {
            const Icon = iconMap[skill.icon] || Zap;
            const isExpanded = expandedCards.has(skill.key);
            return (
              <motion.div
                key={skill.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-card rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", scoreColor(skill.score))} />
                    <span className="text-xs font-medium">{skill.name}</span>
                  </div>
                  <span className={cn("text-sm font-bold", scoreColor(skill.score))}>
                    {skill.score}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    className={cn("h-full rounded-full", progressColor(skill.score))}
                  />
                </div>
                <button
                  onClick={() => toggleCard(skill.key)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Evidence ({skill.evidence.length})
                </button>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-1"
                  >
                    {skill.evidence.map((e, j) => (
                      <div key={j} className="text-[10px] text-muted-foreground pl-2 border-l border-border">
                        {e}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {profile.recent_activity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                activity.skill_change > 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {activity.type === "challenge_completed" && <Trophy className="h-3.5 w-3.5 text-success" />}
                {activity.type === "error_fixed" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                {activity.type === "pattern_detected" && <Layers className="h-3.5 w-3.5 text-info" />}
                {activity.type === "skill_improved" && <Zap className="h-3.5 w-3.5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs">{activity.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(activity.timestamp).toLocaleString()} · {activity.skill_name}
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-semibold shrink-0",
                activity.skill_change > 0 ? "text-success" : "text-destructive"
              )}>
                {activity.skill_change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {activity.skill_change > 0 ? "+" : ""}{activity.skill_change}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
