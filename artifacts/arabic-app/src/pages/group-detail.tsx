import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useGetGroup, 
  useRequestJoinGroup, 
  useGetJoinRequests,
  useRespondJoinRequest,
  useRemoveGroupMember,
  getGetGroupQueryKey,
  getGetJoinRequestsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Shield, Crown, UserPlus, Check, X, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";

export default function GroupDetail() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: group, isLoading } = useGetGroup(groupId, { query: { enabled: !!groupId } });
  
  const isOwner = group?.ownerId === user?.id;
  const isMember = group?.members?.some(m => m.userId === user?.id);

  const { data: joinRequests } = useGetJoinRequests(groupId, { 
    query: { enabled: !!groupId && isOwner } 
  });

  const requestJoin = useRequestJoinGroup();
  const respondJoin = useRespondJoinRequest();
  const removeMember = useRemoveGroupMember();

  const handleRequestJoin = () => {
    requestJoin.mutate(
      { groupId },
      {
        onSuccess: () => {
          toast({ title: "تم إرسال طلب الانضمام" });
        }
      }
    );
  };

  const handleRespondJoin = (requestId: string, action: 'accept' | 'reject') => {
    respondJoin.mutate(
      { groupId, joinRequestId: requestId, data: { action } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetJoinRequestsQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetGroupQueryKey(groupId) });
          toast({ title: action === 'accept' ? "تم قبول الطلب" : "تم رفض الطلب" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!group) {
    return <div className="p-8 text-center text-foreground font-bold">الغرفة غير موجودة</div>;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-transparent pb-safe">
      <div className="glass-panel z-10 pt-safe-top">
        <div className="flex items-center p-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/groups")} className="rounded-full shrink-0">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-xl text-foreground truncate flex-1">{group.name}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="glass p-6 rounded-3xl text-center space-y-4 relative overflow-hidden">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl mx-auto flex items-center justify-center text-4xl font-bold">
            {group.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
            <p className="text-sm font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full inline-block mt-2">
              #{group.groupId}
            </p>
          </div>
          {group.bio && <p className="text-sm text-foreground mt-4">{group.bio}</p>}

          {!isMember && (
            <Button 
              onClick={handleRequestJoin}
              disabled={requestJoin.isPending}
              className="mt-6 w-full rounded-2xl h-12 font-bold"
            >
              {requestJoin.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "طلب انضمام"}
            </Button>
          )}
        </div>

        {isOwner && joinRequests && joinRequests.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-foreground px-2">طلبات الانضمام</h3>
            {joinRequests.map(req => (
              <div key={req.id} className="glass p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={req.user} size="sm" />
                  <span className="font-bold text-sm">{req.user?.displayName}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-green-500 bg-green-500/10" onClick={() => handleRespondJoin(req.id, 'accept')}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-red-500 bg-red-500/10" onClick={() => handleRespondJoin(req.id, 'reject')}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-foreground">الأعضاء ({group.memberCount})</h3>
          </div>
          <div className="space-y-2 pb-6">
            {group.members?.map(member => (
              <div key={member.userId} className="glass p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={member.user} size="sm" />
                  <div>
                    <p className="font-bold text-sm text-foreground">{member.user?.displayName}</p>
                  </div>
                </div>
                {member.role === 'owner' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-500/10 text-red-600 rounded-full">
                    <Crown className="w-3 h-3" /> مالك
                  </span>
                )}
                {member.role === 'admin' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full">
                    <Shield className="w-3 h-3" /> أدمن
                  </span>
                )}
                {member.role === 'member' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                    <Users className="w-3 h-3" /> عضو
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
