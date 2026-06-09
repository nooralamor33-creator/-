import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Settings, Users, Gift, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 pt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">أنا</h1>
        <Button variant="ghost" size="icon" onClick={logout} className="text-destructive hover:bg-destructive/10 rounded-full">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div className="glass rounded-3xl p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
        <div className="relative z-10">
          <UserAvatar user={user!} size="xl" className="border-4 border-white shadow-xl" />
        </div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-bold text-foreground">{user?.displayName}</h2>
          <p className="text-muted-foreground font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full inline-block">
            ID: {user?.userId}
          </p>
          <p className="text-sm text-foreground mt-2">{user?.bio || "لا توجد نبذة شخصية"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/friends">
          <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer h-28">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm">الأصدقاء</span>
          </div>
        </Link>
        <Link href="/points">
          <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer h-28">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm">الهدايا والنقاط</span>
          </div>
        </Link>
      </div>

      <div className="glass rounded-3xl p-2">
        <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-3 font-bold">
          <Settings className="w-5 h-5 text-muted-foreground" />
          تعديل الملف الشخصي
        </Button>
      </div>
    </div>
  );
}
