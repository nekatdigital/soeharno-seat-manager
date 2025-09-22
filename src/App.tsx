import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import QRAdmin from "./pages/QRAdmin";
import Order from "./pages/Order";
import OrderTracking from "./pages/OrderTracking";
import OrderAdmin from "./pages/OrderAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/" element={<Landing />} />
          <Route path="/qr-admin" element={<QRAdmin />} />
          <Route path="/order/:tableId/:secret" element={<Order />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/order-admin" element={<OrderAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
