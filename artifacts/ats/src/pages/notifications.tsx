import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  requisition: "bg-blue-100 text-blue-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  approval: "bg-amber-100 text-amber-700",
  system: "bg-slate-100 text-slate-600",
};

export default function NotificationsPage() {
  const { data: notifications = [], refetch } = useListNotifications({ params: {} });
  const markReadMutation = useMarkNotificationRead();
  const { toast } = useToast();

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ params: { id } });
      refetch();
    } catch {
      toast({ title: "Failed to mark as read", variant: "destructive" });
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 px-4 py-3 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
              <div className="mt-0.5 shrink-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide mr-2 ${TYPE_COLORS[n.type] ?? "bg-slate-100 text-slate-600"}`}>{n.type}</span>
                    <span className="text-xs text-card-foreground">{n.message}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</span>
                    {!n.read && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                        <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
