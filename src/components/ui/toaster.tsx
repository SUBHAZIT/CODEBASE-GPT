import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        const Icon = 
          variant === "success" ? CheckCircle2 :
          variant === "destructive" ? AlertCircle :
          title?.toLowerCase().includes("ai") ? Sparkles : Info;

        const iconColor = 
          variant === "success" ? "text-emerald-500/80" :
          variant === "destructive" ? "text-primary/60" : // Not red!
          "text-primary/80";

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0">
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
