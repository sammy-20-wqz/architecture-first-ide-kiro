import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Bell, User, Shield, Code2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const sections = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Theme",
          description: "Select your preferred color scheme",
          control: (
            <div className="flex gap-2">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all",
                    theme === t.id ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          ),
        },
        { label: "Font Size", description: "Editor font size", control: <select className="bg-muted text-foreground text-xs rounded-md px-2 py-1.5 border border-border"><option>12px</option><option>14px</option><option>16px</option></select> },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Skill Updates", description: "Get notified when your skills change", control: <Switch defaultChecked /> },
        { label: "Challenge Reminders", description: "Daily challenge reminders", control: <Switch defaultChecked /> },
        { label: "Achievement Alerts", description: "Notify on new milestones", control: <Switch defaultChecked /> },
      ],
    },
    {
      title: "Editor",
      icon: Code2,
      items: [
        { label: "Auto Save", description: "Save code automatically", control: <Switch defaultChecked /> },
        { label: "Minimap", description: "Show code minimap", control: <Switch /> },
        { label: "Word Wrap", description: "Wrap long lines", control: <Switch defaultChecked /> },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto">
      <h1 className="text-lg font-bold">Settings</h1>
      {sections.map((section) => (
        <div key={section.title} className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <section.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{section.title}</span>
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
