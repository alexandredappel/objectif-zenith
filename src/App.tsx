import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DesktopNavigation, MobileNavigation } from "@/components/Navigation"
import Index from "./pages/Index"
import DailyGoals from "./pages/DailyGoals"
import PeriodGoals from "./pages/PeriodGoals"
import Calendar from "./pages/Calendar"
import NotFound from "./pages/NotFound"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex">
            <DesktopNavigation />
            <main className="flex-1 md:ml-64">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/daily" element={<DailyGoals />} />
                <Route path="/periods" element={<PeriodGoals />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App