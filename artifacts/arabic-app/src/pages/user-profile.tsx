import { useLocation, useParams } from "wouter";
import { useGetUserById } from "@workspace/api-client-react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, UserPlus, Gift, Loader2 } from "lucide-react";

export default function UserProfile() {
  const params = useParams();
  const userId = params.userId as string;
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useGetUserById(userId, { query: { enabled: !!userId } });

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-foreground font-bold">المستخدم غير موجود</div>;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-transparent pb-safe">
      <div className="glass-panel z-10 pt-safe-top">
        <div className="flex items-center p-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full shrink-0">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-xl text-foreground">الملف الشخصي</h1>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-6 mt-4">
        <div className="glass rounded-3xl p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
          <div className="relative z-10">
            <UserAvatar user={user} size="xl" className="border-4 border-white shadow-xl" />
          </div>
          <div className="space-y-1 relative z-10">
            <h2 className="text-2xl font-bold text-foreground">{user.displayName}</h2>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <p className="text-xs font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full inline-block mt-2">
              ID: {user.userId}
            </p>
            <p className="text-sm text-foreground mt-4">{user.bio || "لا توجد نبذة شخصية"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button 
            onClick={() => setLocation(`/messages/${user.id}`)}
            className="flex flex-col items-center justify-center h-20 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 gap-2 shadow-none border-0"
            variant="outline"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold">مراسلة</span>
          </Button>
          
          <Button 
            className="flex flex-col items-center justify-center h-20 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary gap-2 shadow-none border-0"
            variant="outline"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-[10px] font-bold">إضافة</span>
          </Button>

          <Button 
            onClick={() => setLocation("/points")}
            className="flex flex-col items-center justify-center h-20 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 gap-2 shadow-none border-0"
            variant="outline"
          >
            <Gift className="w-6 h-6" />
            <span className="text-[10px] font-bold">هدية</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
