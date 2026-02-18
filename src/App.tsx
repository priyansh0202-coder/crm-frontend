import { Routes, Route } from 'react-router-dom'
import { Navbar } from "@/components/Navbar"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ProtectedRoutes from "@/components/ProtectedRoutes"
import AdminRoutes from "@/components/AdminRoutes"
import LeadsPage from "@/pages/leads/LeadsPage"
import LeadDetailPage from "@/pages/leads/LeadDetailPage"
import AdminDashboard from "@/pages/admin/AdminDashboard"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground ">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (any logged-in user) */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={
            <main className="container mx-auto px-4 py-8">
              <section className="flex flex-col items-center justify-center space-y-4 py-24 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary">
                  Welcome to Our CRM
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Manage your customer relationships with ease. Built with Tailwind CSS and Shadcn UI.
                </p>
              </section>
            </main>
          } />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />

          {/* Admin-only Routes */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
