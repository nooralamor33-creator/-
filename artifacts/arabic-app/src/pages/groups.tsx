import { useGetGroups } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Shield, Crown } from "lucide-react";
import { useState } from "react";

export default function Groups() {
  const { data: groups, isLoading } = useGetGroups();
  const [searchId, setSearchId] = useState("");

  return (
    <div className="p-4 pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">الغرف</h1>
        <Link href="/groups/create">
          <Button size="icon" className="rounded-full shadow-md shadow-primary/20">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="ابحث برمز الغرفة..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="h-14 pl-4 pr-12 rounded-2xl glass border-white/40 font-medium"
        />
        {searchId && (
          <Link href={`/groups/${searchId}`}>
            <Button size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl">
              انتقال
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3 pb-4">
        {isLoading ? (
          [1, 2].map((i) => <div key={i} className="glass h-24 rounded-3xl animate-pulse" />)
        ) : groups?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد غرف منضم إليها</div>
        ) : (
          groups?.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <div className="glass p-4 rounded-3xl flex items-center gap-4 active:scale-[0.98] transition-transform">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-lg text-foreground truncate">{group.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {group.memberCount || 1}
                    </span>
                    <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full font-mono">
                      #{group.groupId}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
