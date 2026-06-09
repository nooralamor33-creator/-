import { useState } from "react";
import { useLocation } from "wouter";
import { 
  useGetPoints,
  useGetFriends,
  useSendGift,
  getGetPointsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gift, Coins, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/user-avatar";

const GIFTS = [
  { id: 'rose', emoji: '🌹', name: 'وردة', points: 10 },
  { id: 'star', emoji: '⭐', name: 'نجمة', points: 50 },
  { id: 'heart', emoji: '💖', name: 'قلب', points: 100 },
  { id: 'crown', emoji: '👑', name: 'تاج', points: 500 },
  { id: 'diamond', emoji: '💎', name: 'ألماسة', points: 1000 },
] as const;

export default function Points() {
  const [, setLocation] = useLocation();
  const { data: balance, isLoading } = useGetPoints();
  const { data: friends } = useGetFriends();
  
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<typeof GIFTS[number] | null>(null);

  const sendGift = useSendGift();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSendGift = () => {
    if (!selectedFriend || !selectedGift) return;

    sendGift.mutate(
      { 
        data: { 
          toUserId: selectedFriend, 
          giftType: selectedGift.id as any, 
          points: selectedGift.points 
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPointsQueryKey() });
          toast({ title: "تم إرسال الهدية بنجاح 🎁" });
          setSelectedFriend(null);
          setSelectedGift(null);
        },
        onError: () => {
          toast({ variant: "destructive", title: "فشل", description: "رصيدك لا يكفي أو حدث خطأ" });
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-transparent pb-safe">
      <div className="glass-panel z-10 pt-safe-top">
        <div className="flex items-center p-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")} className="rounded-full shrink-0">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-xl text-foreground">النقاط والهدايا</h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-8">
        <div className="glass p-8 rounded-3xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Coins className="w-32 h-32 text-orange-500" />
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-lg font-bold text-muted-foreground">رصيدك الحالي</h2>
            <div className="text-5xl font-bold text-orange-500 flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : balance?.points || 0}
            </div>
            <p className="text-sm font-medium text-foreground">نقطة</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-foreground px-2">إرسال هدية</h3>
          
          <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground px-2">اختر صديقاً</p>
            <div className="flex gap-3 overflow-x-auto pb-2 px-2 snap-x hide-scrollbar">
              {friends?.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={`snap-center shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    selectedFriend === friend.id 
                      ? 'bg-primary text-primary-foreground scale-105 shadow-md' 
                      : 'glass'
                  }`}
                >
                  <UserAvatar user={friend} size="md" />
                  <span className="text-xs font-bold w-16 truncate text-center">{friend.displayName}</span>
                </button>
              ))}
              {friends?.length === 0 && <p className="text-sm text-muted-foreground">أضف أصدقاء أولاً لإرسال الهدايا</p>}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground px-2">اختر الهدية</p>
            <div className="grid grid-cols-3 gap-3 px-2">
              {GIFTS.map(gift => (
                <button
                  key={gift.id}
                  onClick={() => setSelectedGift(gift)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    selectedGift?.id === gift.id 
                      ? 'bg-orange-50 border-orange-500/50 border-2 shadow-md' 
                      : 'glass border-2 border-transparent'
                  }`}
                >
                  <span className="text-4xl">{gift.emoji}</span>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${selectedGift?.id === gift.id ? 'text-orange-700' : 'text-foreground'}`}>{gift.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{gift.points}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 pt-4 pb-12">
            <Button
              onClick={handleSendGift}
              disabled={!selectedFriend || !selectedGift || sendGift.isPending}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/25 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {sendGift.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "إرسال الآن"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
