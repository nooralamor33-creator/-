import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateGroup, getGetGroupsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function GroupCreate() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [joinRequestsEnabled, setJoinRequestsEnabled] = useState(true);
  
  const createGroup = useCreateGroup();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup.mutate(
      { data: { name, bio, joinRequestsEnabled } },
      {
        onSuccess: (newGroup) => {
          queryClient.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
          toast({ title: "تم إنشاء الغرفة بنجاح" });
          setLocation(`/groups/${newGroup.id}`);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-transparent pb-safe">
      <div className="glass-panel z-10 pt-safe-top">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/groups")} className="rounded-full shrink-0">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-xl text-foreground">إنشاء غرفة</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold px-1 text-foreground">اسم الغرفة</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أصدقاء الجامعة"
              className="h-14 rounded-2xl glass border-white/40 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold px-1 text-foreground">وصف الغرفة (اختياري)</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="عن ماذا تتحدث هذه الغرفة؟"
              className="rounded-2xl glass border-white/40 h-24 resize-none font-medium p-4"
            />
          </div>

          <div className="glass p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-foreground">السماح بطلبات الانضمام</label>
              <p className="text-xs text-muted-foreground">يمكن للآخرين طلب الانضمام للغرفة</p>
            </div>
            <Switch
              checked={joinRequestsEnabled}
              onCheckedChange={setJoinRequestsEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || createGroup.isPending}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 mt-8"
          >
            {createGroup.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "إنشاء الغرفة"}
          </Button>
        </form>
      </div>
    </div>
  );
}
