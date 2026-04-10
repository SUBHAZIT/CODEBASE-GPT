import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useUserAuth } from "@/hooks/use-user-auth";
import { User, Mail, Github, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user } = useUserAuth();

  if (!user) return null;

  return (
    <PageLayout 
      title="User Profile" 
      subtitle="Manage your personal information and account details."
      category="Account"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar and Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-2 border-primary/20 p-1 mb-4">
                <img 
                  src={user.user_metadata?.avatar_url} 
                  alt={user.user_metadata?.user_name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-serif italic text-white">{user.user_metadata?.full_name || user.user_metadata?.user_name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">@{user.user_metadata?.user_name}</p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-4 w-4 text-primary/60" />
                <span className="text-[10px] uppercase tracking-widest">Authenticated</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span className="text-[10px] uppercase tracking-widest">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Account Details</h4>
                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-medium text-foreground">
                      {user.user_metadata?.full_name || "Not provided"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-medium text-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">GitHub Profile</label>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-medium text-foreground flex items-center gap-2">
                      <Github className="h-4 w-4 opacity-40" />
                      github.com/{user.user_metadata?.user_name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-6">Connected Accounts</h4>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">GitHub</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Primary Authentication</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
