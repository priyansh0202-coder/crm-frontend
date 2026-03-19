import { Routes, Route } from 'react-router-dom'
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ProtectedRoutes from "@/components/ProtectedRoutes"
import AdminRoutes from "@/components/AdminRoutes"
import SidebarLayout from "@/components/SidebarLayout"
import LeadsPage from "@/pages/leads/LeadsPage"
import LeadDetailPage from "@/pages/leads/LeadDetailPage"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import DealsPage from "@/pages/deals/DealsPage"
import PipelinePage from "@/pages/deals/PipelinePage"
import DashboardPage from "@/pages/Dashboard"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes — all wrapped in SidebarLayout */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<SidebarLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />

            {/* Admin-only Routes */}
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
