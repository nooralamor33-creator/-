import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const register = useRegister();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !displayName || !password) return;

    register.mutate(
      { data: { username, displayName, password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("sessionId", data.sessionId);
          setUser(data.user);
          setLocation("/posts");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "فشل التسجيل",
            description: "قد يكون اسم المستخدم مأخوذاً أو البيانات غير صالحة.",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
      <div className="glass w-full max-w-sm p-8 rounded-3xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-3xl font-bold">و</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">حساب جديد</h1>
          <p className="text-muted-foreground">انضم إلى وصلة اليوم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="الاسم المستعار (يظهر للجميع)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-white/40 focus:bg-white/80 transition-all text-center text-lg"
              dir="rtl"
            />
            <Input
              type="text"
              placeholder="اسم المستخدم (للدخول)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-white/40 focus:bg-white/80 transition-all text-center text-lg"
              dir="ltr"
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-white/40 focus:bg-white/80 transition-all text-center text-lg"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25"
            disabled={register.isPending || !username || !displayName || !password}
          >
            {register.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "إنشاء حساب"}
          </Button>
        </form>

        <div className="text-sm">
          <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-primary font-bold hover:underline">
            سجل دخول
          </Link>
        </div>
      </div>
    </div>
  );
}
