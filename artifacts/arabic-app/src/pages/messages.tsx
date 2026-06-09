import { useGetConversations } from "@workspace/api-client-react";
import { Link } from "wouter";
import { UserAvatar } from "@/components/user-avatar";

export default function Messages() {
  const { data: conversations, isLoading } = useGetConversations();

  return (
    <div className="p-4 pt-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">المحادثات</h1>

      <div className="space-y-3 pb-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="glass h-20 rounded-3xl animate-pulse" />)
        ) : conversations?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد محادثات بعد</div>
        ) : (
          conversations?.map((conv) => (
            <Link key={conv.userId} href={`/messages/${conv.userId}`}>
              <div className="glass p-4 rounded-3xl flex items-center gap-4 active:scale-[0.98] transition-transform">
                <div className="relative">
                  <UserAvatar user={conv.user} size="lg" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-foreground truncate">{conv.user?.displayName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conv.lastMessage?.type === 'image' ? '📷 صورة' : conv.lastMessage?.content}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
