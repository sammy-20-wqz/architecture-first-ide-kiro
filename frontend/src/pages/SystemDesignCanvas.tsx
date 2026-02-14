import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Monitor, Server, Box, Database, Zap, ListOrdered, Cloud,
  Trash2, ArrowRight, AlertCircle, AlertTriangle, CheckCircle,
  Download, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DesignNode, DesignEdge } from "@/lib/types";

const nodeTypes = [
  { type: "client" as const, label: "Client", icon: Monitor, color: "bg-info/20 border-info/40 text-info" },
  { type: "api" as const, label: "API Gateway", icon: Server, color: "bg-primary/20 border-primary/40 text-primary" },
  { type: "service" as const, label: "Microservice", icon: Box, color: "bg-success/20 border-success/40 text-success" },
  { type: "db" as const, label: "Database", icon: Database, color: "bg-warning/20 border-warning/40 text-warning" },
  { type: "cache" as const, label: "Cache", icon: Zap, color: "bg-destructive/20 border-destructive/40 text-destructive" },
  { type: "queue" as const, label: "Queue", icon: ListOrdered, color: "bg-muted text-muted-foreground border-border" },
  { type: "external" as const, label: "External API", icon: Cloud, color: "bg-secondary border-border text-foreground" },
];

const domains = ["Web/API", "Blockchain", "AI/ML", "Cybersecurity"];

const mockAnalysis = {
  critical: ["No rate limiting on API Gateway → vulnerable to DDoS"],
  warnings: ["Cache has no eviction policy defined", "Single database could be a bottleneck"],
  good: ["Microservice architecture enables independent scaling", "Message queue decouples services effectively"],
  patterns: ["API Gateway Pattern", "Event-Driven Architecture", "Cache-Aside"],
  complexity: 72,
  cost: "$~340/mo (AWS estimate)",
};

export default function SystemDesignCanvas() {
  const [nodes, setNodes] = useState<DesignNode[]>([
    { id: "n1", type: "client", label: "Web Client", position: { x: 80, y: 180 } },
    { id: "n2", type: "api", label: "API Gateway", position: { x: 280, y: 180 } },
    { id: "n3", type: "service", label: "Auth Service", position: { x: 480, y: 100 } },
    { id: "n4", type: "service", label: "User Service", position: { x: 480, y: 260 } },
    { id: "n5", type: "db", label: "PostgreSQL", position: { x: 680, y: 180 } },
    { id: "n6", type: "cache", label: "Redis Cache", position: { x: 680, y: 60 } },
  ]);
  const [edges, setEdges] = useState<DesignEdge[]>([
    { id: "e1", source: "n1", target: "n2", label: "HTTPS" },
    { id: "e2", source: "n2", target: "n3", label: "JWT" },
    { id: "e3", source: "n2", target: "n4", label: "REST" },
    { id: "e4", source: "n3", target: "n5" },
    { id: "e5", source: "n4", target: "n5" },
    { id: "e6", source: "n3", target: "n6", label: "Session" },
  ]);
  const [selectedDomain, setSelectedDomain] = useState("Web/API");
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("nodeType") as DesignNode["type"];
    if (!nodeType) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newNode: DesignNode = {
      id: `n_${Date.now()}`,
      type: nodeType,
      label: nodeTypes.find((n) => n.type === nodeType)?.label || "Node",
      position: { x: e.clientX - rect.left - 50, y: e.clientY - rect.top - 20 },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        setEdges((prev) => [...prev, { id: `e_${Date.now()}`, source: connectingFrom, target: nodeId }]);
      }
      setConnectingFrom(null);
      return;
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNode(nodeId);
    setDragOffset({ x: e.clientX - node.position.x, y: e.clientY - node.position.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNode
          ? { ...n, position: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }
          : n
      )
    );
  };

  const handleCanvasMouseUp = () => setDraggingNode(null);

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.position.x + 50, y: node.position.y + 20 } : { x: 0, y: 0 };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          {nodeTypes.map((nt) => (
            <div
              key={nt.type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("nodeType", nt.type)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs cursor-grab active:cursor-grabbing transition-colors",
                nt.color
              )}
            >
              <nt.icon className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{nt.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setNodes([]); setEdges([]); }}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button size="sm" className="h-7 text-xs">Analyze</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 relative bg-editor-bg overflow-hidden cursor-crosshair"
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Edges (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge) => {
              const from = getNodeCenter(edge.source);
              const to = getNodeCenter(edge.target);
              const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
              return (
                <g key={edge.id}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4,4" opacity={0.5}
                  />
                  {edge.label && (
                    <text x={mid.x} y={mid.y - 6} textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const nt = nodeTypes.find((t) => t.type === node.type)!;
            const Icon = nt.icon;
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-move select-none shadow-sm",
                  nt.color,
                  connectingFrom === node.id && "ring-2 ring-primary"
                )}
                style={{ left: node.position.x, top: node.position.y }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onDoubleClick={() => setConnectingFrom(node.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{node.label}</span>
              </motion.div>
            );
          })}

          {connectingFrom && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
              Click a target node to connect • ESC to cancel
            </div>
          )}
        </div>

        {/* AI Feedback Panel */}
        <div className="w-72 border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-semibold mb-2">Domain</h3>
            <div className="flex flex-wrap gap-1">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full border transition-colors",
                    selectedDomain === d ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Critical Issues
              </div>
              {mockAnalysis.critical.map((c, i) => (
                <div key={i} className="text-[10px] text-muted-foreground bg-destructive/5 p-2 rounded mb-1">{c}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Warnings
              </div>
              {mockAnalysis.warnings.map((w, i) => (
                <div key={i} className="text-[10px] text-muted-foreground bg-warning/5 p-2 rounded mb-1">{w}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Good Decisions
              </div>
              {mockAnalysis.good.map((g, i) => (
                <div key={i} className="text-[10px] text-muted-foreground bg-success/5 p-2 rounded mb-1">{g}</div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Complexity</span>
                <span className="font-bold">{mockAnalysis.complexity}/100</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {mockAnalysis.patterns.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Est. Cost: <span className="font-semibold text-foreground">{mockAnalysis.cost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
