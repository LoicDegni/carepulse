"use client"

import { useRouter } from "next/navigation"
import { LogOut, Home } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  userRole: "patient" | "doctor" | "admin"
  userName?: string
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        credentials: "include"
      })
      if (!response.ok) throw new Error("Logout failed")
      
      // Clear any stored auth data
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("userRole")
        sessionStorage.removeItem("adminAccessKey")
        localStorage.removeItem("authToken")
      }
      
      // Redirect to home
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
      alert("La déconnexion a échoué")
    }
  }

  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard"
      case "doctor":
        return "/doctor/dashboard"
      case "patient":
      default:
        return "/appointment"
    }
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Admin"
      case "doctor":
        return "Docteur"
      case "patient":
      default:
        return "Patient"
    }
  }

  return (
    <nav className="w-full bg-dark-400 border-b border-dark-300 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={getDashboardLink()} className="cursor-pointer hover:opacity-80 transition">
          <h1 className="text-24-bold text-green-500">PlanCare</h1>
        </Link>

        {/* Right section: Role + Logout */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              {userName && (
                <p className="text-14-semibold text-white">{userName}</p>
              )}
              <p className="text-12-medium text-dark-700">{getRoleLabel()}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-14-medium text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
