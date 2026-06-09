import { useState } from "react";
import { useGetPosts, useCreatePost, useToggleLike, getGetPostsQueryKey } from "@workspace/api-client-react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2, Image as ImageIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Posts() {
  const [content, setContent] = useState("");
  const { data: posts, isLoading } = useGetPosts();
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = () => {
    if (!content.trim()) return;
    createPost.mutate(
      { data: { content } },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
          toast({ title: "تم النشر بنجاح" });
        },
      }
    );
  };

  const handleLike = (postId: string) => {
    // @ts-ignore
    toggleLike.mutate({ id: postId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() })
    });
  };

  return (
    <div className="p-4 pt-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">المنشورات</h1>
      
      <div className="glass p-4 rounded-3xl space-y-4">
        <Textarea
          placeholder="بم تفكر؟"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white/50 border-white/40 focus:bg-white/80 resize-none rounded-2xl h-24"
        />
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" className="rounded-full text-primary">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createPost.isPending || !content.trim()}
            className="rounded-full px-6 font-bold shadow-md shadow-primary/20"
          >
            {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "نشر"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass p-4 rounded-3xl h-32 animate-pulse" />
          ))
        ) : posts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد منشورات بعد</div>
        ) : (
          posts?.map((post) => (
            <div key={post.id} className="glass p-5 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={post.author} size="md" />
                <div>
                  <h3 className="font-bold text-foreground">{post.author?.displayName}</h3>
                  <p className="text-xs text-muted-foreground">@{post.author?.username}</p>
                </div>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`rounded-full gap-1.5 ${post.isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs font-medium">{post.likeCount || 0}</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
