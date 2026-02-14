import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { SidebarNav } from "./SidebarNav";
import { AIChat } from "./AIChat";
import { BottomPanel } from "./BottomPanel";
import { Bot, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IDELayout() {
  const [chatOpen, setChatOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <BottomPanel isOpen={bottomPanelOpen} onToggle={() => setBottomPanelOpen(!bottomPanelOpen)} />
        </div>
        <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        {!chatOpen && (
          <div className="border-l border-border bg-card flex flex-col items-center py-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setChatOpen(true)} title="Open AI Chat">
              <Bot className="h-4 w-4 text-primary" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
