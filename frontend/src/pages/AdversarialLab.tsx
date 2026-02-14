import { useState, useEffect } from "react";
import { mockChallenges } from "@/lib/mock-data";
import { Challenge } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Play, Square, HelpCircle, Check, X, Clock, ChevronDown,
  Terminal, FileText, BarChart3, TestTube2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const difficultyColors = {
  easy: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  hard: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AdversarialLab() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(mockChallenges[0]);
  const [code, setCode] = useState(selectedChallenge.starter_code);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState("terminal");
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCode(selectedChallenge.starter_code);
    setTimer(0);
    setFeedback(null);
    setShowHints(false);
  }, [selectedChallenge]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleVerify = () => {
    setFeedback("Analyzing your solution...");
    setTimeout(() => {
      setFeedback("✓ 2/3 test cases passed. Your solution handles basic rate limiting but doesn't address distributed state. Consider using Redis for shared counters across nodes.");
    }, 1500);
  };

  const rightTabs = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "logs", label: "Logs", icon: FileText },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "tests", label: "Tests", icon: TestTube2 },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <select
            value={selectedChallenge.id}
            onChange={(e) => {
              const ch = mockChallenges.find((c) => c.id === e.target.value);
              if (ch) setSelectedChallenge(ch);
            }}
            className="bg-muted text-foreground text-xs rounded-md px-2 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {mockChallenges.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.title}</option>
            ))}
          </select>
          <Badge variant="outline" className={cn("text-[10px]", difficultyColors[selectedChallenge.difficulty])}>
            {selectedChallenge.difficulty}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timer)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            className="h-7 text-xs gap-1.5"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isRunning ? "Stop" : "Start"}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleVerify}>
            <Check className="h-3 w-3" />
            Verify
          </Button>
        </div>
      </div>

      {/* Challenge Description */}
      <div className="px-4 py-3 border-b border-border bg-card/50 shrink-0">
        <h2 className="text-sm font-semibold">{selectedChallenge.title}</h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedChallenge.description}</p>
        <div className="mt-2 space-y-1">
          {selectedChallenge.objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded border border-border flex items-center justify-center shrink-0">
                <span className="text-[10px]">{i + 1}</span>
              </div>
              {obj}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-1 text-[10px] text-primary mt-2 hover:underline"
        >
          <HelpCircle className="h-3 w-3" />
          {showHints ? "Hide Hints" : `Show Hints${timer < 300 ? " (unlocks at 5:00)" : ""}`}
        </button>
        {showHints && timer >= 300 && (
          <div className="mt-2 space-y-1">
            {selectedChallenge.hints.map((h, i) => (
              <div key={i} className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">💡 {h}</div>
            ))}
          </div>
        )}
      </div>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-[6] flex flex-col border-r border-border overflow-hidden">
          <div className="flex items-center px-3 py-1.5 border-b border-border bg-card text-xs">
            <span className="font-mono text-muted-foreground">solution.js</span>
            <span className="ml-auto text-[10px] text-muted-foreground">JavaScript</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex">
              {/* Line numbers */}
              <div className="w-10 bg-editor-line text-muted-foreground text-right pr-2 py-2 font-mono text-xs leading-5 select-none overflow-hidden">
                {code.split("\n").map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-editor-bg text-foreground font-mono text-xs leading-5 p-2 resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-[4] flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-border bg-card">
            {rightTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
                  activeRightTab === tab.id
                    ? "text-foreground border-b border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-terminal-bg p-3 font-mono text-xs">
            {activeRightTab === "terminal" && (
              <div className="text-terminal-foreground space-y-1">
                <div className="text-muted-foreground">$ node solution.js</div>
                <div className="text-info">[DevForge] Running challenge environment...</div>
                <div className="text-info">[DevForge] Waiting for solution...</div>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("mt-2 p-2 rounded", feedback.includes("✓") ? "bg-success/10 text-success" : "text-muted-foreground")}
                  >
                    {feedback}
                  </motion.div>
                )}
              </div>
            )}
            {activeRightTab === "tests" && (
              <div className="space-y-2">
                {selectedChallenge.test_cases.map((tc, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Input: {tc.input}</div>
                      <div className="text-muted-foreground">Expected: {tc.expected}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeRightTab === "logs" && (
              <div className="text-muted-foreground space-y-1">
                <div>[10:05:30] INFO  Server started on port 3000</div>
                <div>[10:05:31] INFO  Rate limiter initialized</div>
                <div>[10:05:32] WARN  No Redis connection configured</div>
                <div>[10:05:33] INFO  Falling back to in-memory store</div>
              </div>
            )}
            {activeRightTab === "metrics" && (
              <div className="text-muted-foreground text-center py-8">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>Start the challenge to see live metrics</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
