import { useState } from "react";
import { Terminal, AlertCircle, FileOutput, ChevronDown, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const tabs = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "problems", label: "Problems", icon: AlertCircle, badge: 3 },
  { id: "output", label: "Output", icon: FileOutput },
];

const terminalLines = [
  { text: "$ npm run dev", type: "command" as const },
  { text: "  VITE v5.4.2  ready in 342 ms", type: "success" as const },
  { text: "", type: "normal" as const },
  { text: "  ➜  Local:   http://localhost:5173/", type: "info" as const },
  { text: "  ➜  Network: http://192.168.1.42:5173/", type: "info" as const },
  { text: "", type: "normal" as const },
  { text: "[DevForge] Analyzing codebase...", type: "normal" as const },
  { text: "[DevForge] Found 6 skill dimensions to evaluate", type: "normal" as const },
  { text: "[DevForge] ✓ Error handling patterns detected", type: "success" as const },
  { text: "[DevForge] ⚠ Security: 3 potential vulnerabilities", type: "warning" as const },
  { text: "[DevForge] ✓ System design score updated: 65/100", type: "success" as const },
];

const problems = [
  { file: "src/api/userService.js", line: 15, severity: "error" as const, message: "Potential SQL injection in query builder" },
  { file: "src/api/userService.js", line: 29, severity: "warning" as const, message: "Hardcoded timezone 'America/New_York'" },
  { file: "src/components/Upload.tsx", line: 42, severity: "warning" as const, message: "No file size validation before upload" },
];

interface BottomPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function BottomPanel({ isOpen, onToggle }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState("terminal");

  return (
    <div className="border-t border-border bg-card shrink-0">
      {/* Tab Bar */}
      <div className="flex items-center justify-between px-2 h-8 border-b border-border">
        <div className="flex items-center gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (!isOpen) onToggle(); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs transition-colors",
                activeTab === tab.id && isOpen
                  ? "text-foreground border-b border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-destructive text-destructive-foreground rounded-full px-1.5 text-[10px] font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onToggle} className="p-1 hover:bg-muted rounded transition-colors">
            {isOpen ? <Minus className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground rotate-180" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 180 }}
          exit={{ height: 0 }}
          className="h-[180px] overflow-y-auto"
        >
          {activeTab === "terminal" && (
            <div className="p-2 font-mono text-xs bg-terminal-bg text-terminal-foreground h-full">
              {terminalLines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-5",
                    line.type === "command" && "text-foreground font-semibold",
                    line.type === "success" && "text-success",
                    line.type === "warning" && "text-warning",
                    line.type === "info" && "text-info",
                  )}
                >
                  {line.text}
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-primary">$</span>
                <span className="animate-pulse">▊</span>
              </div>
            </div>
          )}
          {activeTab === "problems" && (
            <div className="p-2 space-y-1">
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                  <AlertCircle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", p.severity === "error" ? "text-destructive" : "text-warning")} />
                  <div>
                    <span className="text-muted-foreground">{p.file}:{p.line}</span>
                    <span className="mx-2 text-foreground">{p.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "output" && (
            <div className="p-3 font-mono text-xs text-muted-foreground">
              <div>[INFO] Build completed successfully</div>
              <div>[INFO] No type errors found</div>
              <div>[INFO] All tests passing (12/12)</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
