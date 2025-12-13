import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { AppProvider } from "@/contexts/AppContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Stock from "@/pages/stock";
import Suppliers from "@/pages/suppliers";
import Purchases from "@/pages/purchases";
import Customers from "@/pages/customers";
import Sales from "@/pages/sales";
import Inventory from "@/pages/inventory";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import AIPredictions from "@/pages/ai-predictions";
import AIChatbot from "@/pages/ai-chatbot";
import AIRecommendations from "@/pages/ai-recommendations";
import AIAnomalies from "@/pages/ai-anomalies";
import Vendors from "@/pages/vendors";
import POS from "@/pages/pos";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/stock" component={Stock} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/purchases" component={Purchases} />
      <Route path="/customers" component={Customers} />
      <Route path="/sales" component={Sales} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/users" component={Users} />
      <Route path="/settings" component={Settings} />
      <Route path="/ai/predictions" component={AIPredictions} />
      <Route path="/ai/chatbot" component={AIChatbot} />
      <Route path="/ai/recommendations" component={AIRecommendations} />
      <Route path="/ai/anomalies" component={AIAnomalies} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/pos" component={POS} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
