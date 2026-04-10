import React, { useEffect } from "react";
import { useHealthStore } from "@/lib/health-store";
import { Activity, ShieldCheck, AlertTriangle, CloudOff } from "lucide-react";
import { motion } from "framer-motion";

const SystemHealth: React.FC = () => {
  const { status, latency, lastChecked, checkHealth } = useHealthStore();

  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Auto-polling every 30 seconds for "Live" status without human interaction
    const interval = setInterval(() => {
      checkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusConfig = () => {
    switch (status) {
      case 'operational':
        return {
          icon: <ShieldCheck className="h-3 w-3 text-emerald-500" />,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'Operational'
        };
      case 'degraded':
        return {
          icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'Degraded'
        };
      case 'outage':
        return {
          icon: <CloudOff className="h-3 w-3 text-red-500" />,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'Service Disruption'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.border} border ${config.color} text-[9px] font-black uppercase tracking-widest`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-sm opacity-50 animate-ping ${config.bg.replace('/10', '/60')}`} />
          <div className={`h-1.5 w-1.5 rounded-full relative ${config.bg.replace('/10', '/100')}`} />
        </div>
        {config.text}
      </div>
      
      <div className="hidden sm:flex items-center gap-3 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
         <span className="flex items-center gap-1 group">
           <Activity className="h-3 w-3 opacity-50 group-hover:text-primary transition-colors" />
           Latency: {latency}ms
         </span>
         <span className="h-1 w-1 rounded-full bg-white/5" />
         <span>Checked: {new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default SystemHealth;
