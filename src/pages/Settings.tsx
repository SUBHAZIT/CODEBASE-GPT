import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Settings as SettingsIcon, Bell, Lock, Eye, Database, Globe, Sliders } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/settings-store";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { settings, setSetting, resetDefaults } = useSettingsStore();

  const handleClearTokens = () => {
    localStorage.removeItem("github_pat");
    toast({
      title: "Tokens cleared",
      description: "All stored GitHub personal access tokens have been removed.",
    });
  };

  const handleReset = () => {
    resetDefaults();
    toast({
      title: "Defaults reset",
      description: "Settings have been restored to their original values.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <PageLayout 
      title="Settings" 
      subtitle="Customize your experience and manage application preferences."
      category="Preferences"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Appearance Section */}
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-primary/60" />
            <h3 className="text-xl font-serif italic text-white">Appearance</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-muted-foreground italic">Optimize UI for smaller screens and side-by-side work.</p>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(val) => setSetting("compactMode", val)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Reduced Motion</Label>
                <p className="text-xs text-muted-foreground italic">Minimize animations throughout the application.</p>
              </div>
              <Switch 
                checked={settings.reducedMotion}
                onCheckedChange={(val) => setSetting("reducedMotion", val)}
              />
            </div>
          </div>
        </div>
 
        {/* Indexing Section */}
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-primary/60" />
            <h3 className="text-xl font-serif italic text-white">Indexing & Storage</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Cache Index Data</Label>
                <p className="text-xs text-muted-foreground italic">Store repository metadata locally for faster reloading.</p>
              </div>
              <Switch 
                checked={settings.cacheIndexData}
                onCheckedChange={(val) => setSetting("cacheIndexData", val)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto-save Chat History</Label>
                <p className="text-xs text-muted-foreground italic">Automatically persist your AI conversations across sessions.</p>
              </div>
              <Switch 
                checked={settings.autoSaveChatHistory}
                onCheckedChange={(val) => setSetting("autoSaveChatHistory", val)}
              />
            </div>
          </div>
        </div>
 
        {/* Security Section */}
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-5 w-5 text-primary/60" />
            <h3 className="text-xl font-serif italic text-white">Security</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Strict HTTPS Only</Label>
                <p className="text-xs text-muted-foreground italic">Enforce secure connections for all API requests.</p>
              </div>
              <Switch 
                checked={settings.strictHttps}
                disabled 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Personal Access Token Storage</Label>
                <p className="text-xs text-muted-foreground italic">Encrypted storage for manual GitHub tokens in localStorage.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearTokens}
                className="text-[10px] uppercase tracking-widest text-destructive"
              >
                Clear Tokens
              </Button>
            </div>
          </div>
        </div>
 
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="text-[10px] uppercase tracking-widest"
          >
            Reset Defaults
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-white text-black text-[10px] uppercase tracking-widest font-black h-10 px-8 rounded-xl hover:bg-neutral-200"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
