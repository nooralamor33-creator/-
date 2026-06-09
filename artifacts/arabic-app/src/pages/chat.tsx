import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useGetMessages, 
  useSendMessage, 
  useGetUserById,
  getGetMessagesQueryKey
} from "@workspace/api-client-react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function Chat() {
  const params = useParams();
  const userId = params.userId as string;
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: otherUser } = useGetUserById(userId, { query: { enabled: !!userId } });
  const { data: messages, isLoading } = useGetMessages(userId, { query: { enabled: !!userId, refetchInterval: 3000 } });
  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userId) return;

    sendMessage.mutate(
      { userId, data: { type: "text", content } },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(userId) });
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[430px] mx-auto bg-transparent pb-safe">
      <div className="glass-panel z-10 pt-safe-top sticky top-0">
        <div className="flex items-center p-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/messages")} className="rounded-full shrink-0">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <UserAvatar user={otherUser} size="sm" />
            <div className="overflow-hidden">
              <h2 className="font-bold text-foreground truncate">{otherUser?.displayName || "..."}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-6">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">بدء المحادثة</div>
        ) : (
          messages?.slice().reverse().map((msg) => {
            const isMe = msg.fromUserId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'glass rounded-bl-sm text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 glass-panel z-10 pb-6">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0 text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب رسالة..."
            className="rounded-full glass border-white/40 h-12 flex-1"
          />
          <Button 
            type="submit" 
            disabled={!content.trim() || sendMessage.isPending}
            size="icon" 
            className="rounded-full shrink-0 bg-primary hover:bg-primary/90 h-12 w-12 shadow-lg shadow-primary/25"
          >
            {sendMessage.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1 rtl:rotate-180" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
