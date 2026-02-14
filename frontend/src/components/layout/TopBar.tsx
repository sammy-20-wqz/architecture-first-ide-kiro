import { Code2, Search, Play, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  activeTab?: string;
}

const tabs = [
  { id: "dashboard", label: "dashboard.tsx" },
  { id: "lab", label: "adversarial-lab.tsx" },
  { id: "heatmap", label: "heatmap.tsx" },
  { id: "design", label: "design-canvas.tsx" },
  { id: "progress", label: "progress.tsx" },
];

export function TopBar({ activeTab }: TopBarProps) {
  return (
    <header className="h-10 bg-card border-b border-border flex items-center justify-between px-2 select-none shrink-0">
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">DevForge</span>
        </div>
        <div className="hidden md:flex items-center gap-0.5 text-xs text-muted-foreground">
          {["File", "Edit", "View", "Run", "Terminal", "Help"].map((item) => (
            <button key={item} className="px-2 py-1 rounded hover:bg-muted transition-colors">
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Center: File Tabs */}
      <div className="hidden lg:flex items-center gap-0 overflow-x-auto max-w-[600px]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-border cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground border-b-2 border-b-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="font-mono">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Search className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" className="h-7 gap-1.5 text-xs bg-primary hover:bg-primary/90">
          <Play className="h-3 w-3" />
          <span className="hidden sm:inline">Analyze Codebase</span>
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
          <User className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
