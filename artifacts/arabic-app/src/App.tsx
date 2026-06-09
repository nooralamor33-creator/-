import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Posts from "@/pages/posts";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Chat from "@/pages/chat";
import Groups from "@/pages/groups";
import GroupCreate from "@/pages/group-create";
import GroupDetail from "@/pages/group-detail";
import Friends from "@/pages/friends";
import Points from "@/pages/points";
import UserProfile from "@/pages/user-profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => user ? <Redirect to="/posts" /> : <Redirect to="/login" />} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/posts"><ProtectedRoute component={Posts} /></Route>
        <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
        <Route path="/messages"><ProtectedRoute component={Messages} /></Route>
        <Route path="/messages/:userId"><ProtectedRoute component={Chat} /></Route>
        <Route path="/groups"><ProtectedRoute component={Groups} /></Route>
        <Route path="/groups/create"><ProtectedRoute component={GroupCreate} /></Route>
        <Route path="/groups/:groupId"><ProtectedRoute component={GroupDetail} /></Route>
        <Route path="/friends"><ProtectedRoute component={Friends} /></Route>
        <Route path="/points"><ProtectedRoute component={Points} /></Route>
        <Route path="/user/:userId"><ProtectedRoute component={UserProfile} /></Route>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
