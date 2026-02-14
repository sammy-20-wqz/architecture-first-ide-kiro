import { useState } from "react";
import { mockHeatmapFile } from "@/lib/mock-data";
import { HeatmapIssue } from "@/lib/types";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, Scan, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityConfig = {
  high: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", icon: AlertCircle },
  medium: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", icon: AlertTriangle },
  low: { bg: "bg-info/10", border: "border-info/30", text: "text-info", icon: Info },
};

const files = ["src/api/userService.js", "src/components/Upload.tsx", "src/utils/format.ts"];

export default function InclusionHeatmap() {
  const data = mockHeatmapFile;
  const [selectedFile, setSelectedFile] = useState(data.file_path);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<HeatmapIssue | null>(null);

  const filteredIssues = data.issues.filter(
    (i) => severityFilter === "all" || i.severity === severityFilter
  );

  const isLineHighlighted = (lineNum: number) =>
    filteredIssues.find((i) => lineNum >= i.line_start && lineNum <= i.line_end);

  const codeLines = data.code.split("\n");
  const highCount = data.issues.filter((i) => i.severity === "high").length;
  const medCount = data.issues.filter((i) => i.severity === "medium").length;
  const lowCount = data.issues.filter((i) => i.severity === "low").length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="bg-muted text-foreground text-xs rounded-md px-2 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {files.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            {(["all", "high", "medium", "low"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full border transition-colors capitalize",
                  severityFilter === sev ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">{highCount}</Badge>
            <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">{medCount}</Badge>
            <Badge variant="outline" className="text-[10px] bg-info/10 text-info border-info/30">{lowCount}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
            <Scan className="h-3 w-3" />
            Scan File
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto font-mono text-xs">
          {codeLines.map((line, i) => {
            const lineNum = i + 1;
            const issue = isLineHighlighted(lineNum);
            const cfg = issue ? severityConfig[issue.severity] : null;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-stretch hover:bg-muted/30 cursor-pointer transition-colors",
                  cfg && cfg.bg
                )}
                onClick={() => issue && setSelectedIssue(issue)}
              >
                <div className="w-12 text-right pr-3 py-0.5 text-muted-foreground select-none shrink-0 bg-editor-line">
                  {lineNum}
                </div>
                <div className={cn("flex-1 py-0.5 px-3 whitespace-pre", cfg && `border-l-2 ${cfg.border}`)}>
                  {line || " "}
                </div>
                {issue && (
                  <div className="w-6 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = cfg!.icon;
                      return <Icon className={cn("h-3 w-3", cfg!.text)} />;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Issues Sidebar */}
        <div className="w-72 border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Issues ({filteredIssues.length})</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Score:</span>
                <span className={cn(
                  "text-sm font-bold",
                  data.overall_accessibility_score >= 70 ? "text-success" : data.overall_accessibility_score >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {data.overall_accessibility_score}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1 p-2">
            {filteredIssues.map((issue) => {
              const cfg = severityConfig[issue.severity];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedIssue(issue)}
                  className={cn(
                    "rounded-md border p-2 cursor-pointer transition-all",
                    selectedIssue?.id === issue.id ? `${cfg.bg} ${cfg.border}` : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("h-3 w-3", cfg.text)} />
                    <span className="text-[10px] font-semibold">{issue.type}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">L{issue.line_start}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{issue.description}</p>
                  <p className="text-[10px] mt-1 font-medium">{issue.impact}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {issue.auto_fix_available && (
                      <Button size="sm" variant="outline" className="h-5 text-[10px] px-2">
                        Apply Fix
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-border space-y-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground">Legend</div>
            {(["high", "medium", "low"] as const).map((sev) => {
              const cfg = severityConfig[sev];
              const Icon = cfg.icon;
              return (
                <div key={sev} className="flex items-center gap-2 text-[10px]">
                  <Icon className={cn("h-3 w-3", cfg.text)} />
                  <span className="capitalize">{sev} Severity</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
