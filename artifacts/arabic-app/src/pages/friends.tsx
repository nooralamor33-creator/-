import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetFriends, 
  useGetFriendRequests,
  useSendFriendRequest,
  useRespondFriendRequest,
  useRemoveFriend,
  getGetFriendsQueryKey,
  getGetFriendRequestsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, UserPlus, Check, X, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Friends() {
  const [, setLocation] = useLocation();
  const [searchId, setSearchId] = useState("");
  
  const { data: friends, isLoading: friendsLoading } = useGetFriends();
  const { data: requests, isLoading: requestsLoading } = useGetFriendRequests();
  
  const sendRequest = useSendFriendRequest();
  const respondRequest = useRespondFriendRequest();
  const removeFriend = useRemoveFriend();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId || searchId.length !== 8) {
      toast({ variant: "destructive", title: "معرف غير صالح", description: "معرف المستخدم يجب أن يكون 8 أرقام" });
      return;
    }

    sendRequest.mutate(
      { data: { toUserId: searchId } },
      {
        onSuccess: () => {
          toast({ title: "تم إرسال طلب الصداقة" });
          setSearchId("");
        },
        onError: () => {
          toast({ variant: "destructive", title: "فشل", description: "تأكد من صحة المعرف" });
        }
      }
    );
  };

  const handleRespond = (requestId: string, action: 'accept' | 'reject') => {
    respondRequest.mutate(
      { friendRequestId: requestId, data: { action } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFriendRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetFriendsQueryKey() });
          toast({ title: action === 'accept' ? "تم القبول" : "تم الرفض" });
        }
      }
    );
  };

  const handleRemove = (friendId: string) => {
    removeFriend.mutate(
      { friendId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFriendsQueryKey() });
          toast({ title: "تم حذف الصديق" });
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
          <h1 className="font-bold text-xl text-foreground">الأصدقاء</h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <form onSubmit={handleSendRequest} className="relative mb-6">
          <UserPlus className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="إضافة صديق برمز ID (8 أرقام)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="h-14 pl-14 pr-12 rounded-2xl glass border-white/40 font-mono"
            dir="ltr"
          />
          {searchId.length === 8 && (
            <Button 
              type="submit" 
              size="icon" 
              disabled={sendRequest.isPending}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary shadow-sm"
            >
              {sendRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
            </Button>
          )}
        </form>

        <Tabs defaultValue="friends" className="w-full" dir="rtl">
          <TabsList className="w-full grid grid-cols-2 bg-black/5 dark:bg-white/10 rounded-2xl h-12 p-1 mb-6">
            <TabsTrigger value="friends" className="rounded-xl font-bold">أصدقائي</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl font-bold relative">
              الطلبات
              {requests && requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-3 mt-0">
            {friendsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="glass h-16 rounded-2xl animate-pulse" />)
            ) : friends?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا يوجد أصدقاء بعد</div>
            ) : (
              friends?.map(friend => (
                <div key={friend.id} className="glass p-3 rounded-2xl flex items-center gap-3">
                  <UserAvatar user={friend} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground truncate">{friend.displayName}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">#{friend.userId}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemove(friend.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs font-bold"
                  >
                    حذف
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-0">
            {requestsLoading ? (
              <div className="glass h-16 rounded-2xl animate-pulse" />
            ) : requests?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد طلبات معلقة</div>
            ) : (
              requests?.map(req => (
                <div key={req.id} className="glass p-3 rounded-2xl flex items-center gap-3">
                  <UserAvatar user={req.fromUser} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground truncate">{req.fromUser?.displayName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">أرسل طلب صداقة</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl text-green-600 bg-green-500/10 hover:bg-green-500/20" onClick={() => handleRespond(req.id, 'accept')}>
                      <Check className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl text-red-600 bg-red-500/10 hover:bg-red-500/20" onClick={() => handleRespond(req.id, 'reject')}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
