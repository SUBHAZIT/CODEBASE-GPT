import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, RefreshCcw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const KeepAliveStatus = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real scenario, this would fetch from an API endpoint that reads the log file.
  // For this demonstration, we'll simulate fetching the last few lines of the log.
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Since we can't directly read the file from the frontend easily without a backend API,
      // we'll assume there's a placeholder or mock data for now.
      // If we had a backend, we'd call: const res = await fetch('/api/keep-alive-logs');
      
      const mockLogs = [
        `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] All projects and endpoints pinged successfully.`,
        `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] Success: Primary Project - Health Check Function responded with status 200`,
        `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] Success: Primary Project - REST API responded with status 200`,
        `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] Pinging Primary Project - Health Check Function...`,
        `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] Pinging Primary Project - REST API...`,
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (log: string) => {
    if (log.includes('Success')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (log.includes('Error')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (log.includes('Warning')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <Terminal className="h-4 w-4 text-blue-500" />;
  };

  const getBadgeColor = (log: string) => {
    if (log.includes('Success')) return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    if (log.includes('Error')) return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    if (log.includes('Warning')) return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Supabase Keep-Alive
          </CardTitle>
          <CardDescription>
            Monitoring automated pings to prevent project hibernation
          </CardDescription>
        </div>
        <Badge variant="outline" className="border-green-500/50 text-green-500">
          System Active
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800"
            >
              <div className="mt-0.5">
                {getStatusIcon(log)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-zinc-200">
                  {log.split('] ')[1]}
                </p>
                <p className="text-xs text-zinc-500">
                  {log.split('] ')[0].replace('[', '')}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && !loading && (
            <div className="text-center py-8 text-zinc-500">
              No ping logs available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeepAliveStatus;
