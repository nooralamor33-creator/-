import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const login = useLogin();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    login.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("sessionId", data.sessionId);
          setUser(data.user);
          setLocation("/posts");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "فشل تسجيل الدخول",
            description: "تأكد من اسم المستخدم وكلمة المرور.",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
      <div className="glass w-full max-w-sm p-8 rounded-3xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-primary text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-primary/30 rotate-3 transition-transform hover:rotate-0">
            <span className="text-4xl font-bold">و</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mt-4 tracking-tight">وصلة</h1>
          <p className="text-muted-foreground">مساحتك الدافئة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-white/40 focus:bg-white/80 transition-all text-center text-lg"
              dir="rtl"
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
            disabled={login.isPending || !username || !password}
          >
            {login.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "دخول"}
          </Button>
        </form>

        <div className="text-sm">
          <span className="text-muted-foreground">ليس لديك حساب؟ </span>
          <Link href="/register" className="text-primary font-bold hover:underline">
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
