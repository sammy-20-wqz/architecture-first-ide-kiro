import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, FlaskConical, Grid3X3, Layers, TrendingUp, Settings,
  ChevronRight, FileCode, FolderOpen, FolderClosed
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: Home },
  { id: "lab", label: "Adversarial Lab", path: "/lab", icon: FlaskConical },
  { id: "heatmap", label: "Inclusion Heatmap", path: "/heatmap", icon: Grid3X3 },
  { id: "design", label: "System Design", path: "/design", icon: Layers },
  { id: "progress", label: "Progress", path: "/progress", icon: TrendingUp },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

const fileTree = [
  { name: "src", type: "folder" as const, children: [
    { name: "components", type: "folder" as const, children: [
      { name: "Dashboard.tsx", type: "file" as const },
      { name: "SkillRadar.tsx", type: "file" as const },
      { name: "CodeEditor.tsx", type: "file" as const },
    ]},
    { name: "lib", type: "folder" as const, children: [
      { name: "api.ts", type: "file" as const },
      { name: "types.ts", type: "file" as const },
    ]},
    { name: "App.tsx", type: "file" as const },
  ]},
  { name: "package.json", type: "file" as const },
];

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));
  const [activeSection, setActiveSection] = useState<"nav" | "files">("nav");

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const renderFileTree = (items: typeof fileTree, depth = 0) => (
    <div className="space-y-0.5">
      {items.map((item) => (
        <div key={item.name}>
          <button
            onClick={() => item.type === "folder" && toggleFolder(item.name)}
            className={cn(
              "flex items-center gap-1.5 w-full px-2 py-1 text-xs rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {item.type === "folder" ? (
              <>
                <ChevronRight className={cn("h-3 w-3 transition-transform", expandedFolders.has(item.name) && "rotate-90")} />
                {expandedFolders.has(item.name) ? <FolderOpen className="h-3.5 w-3.5 text-primary/70" /> : <FolderClosed className="h-3.5 w-3.5 text-primary/70" />}
              </>
            ) : (
              <>
                <span className="w-3" />
                <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
              </>
            )}
            <span className="font-mono truncate">{item.name}</span>
          </button>
          {item.type === "folder" && expandedFolders.has(item.name) && item.children && (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {renderFileTree(item.children, depth + 1)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      ))}
    </div>
  );

  if (collapsed) {
    return (
      <div className="w-12 bg-sidebar border-r border-border flex flex-col items-center py-2 gap-1 shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-60 bg-sidebar border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Section Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveSection("nav")}
          className={cn("flex-1 text-xs py-2 font-medium transition-colors", activeSection === "nav" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveSection("files")}
          className={cn("flex-1 text-xs py-2 font-medium transition-colors", activeSection === "files" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Files
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {activeSection === "nav" ? (
          <div className="space-y-0.5 px-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-semibold">Navigation</div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2 py-1.5 text-sm rounded-md transition-all",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="ml-auto w-1 h-4 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-semibold">Project Files</div>
            {renderFileTree(fileTree)}
          </div>
        )}
      </div>
    </div>
  );
}
