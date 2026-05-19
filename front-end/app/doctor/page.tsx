"use client"

import DoctorCalendar from "@/components/doctor/DoctorCalendar"

export default function DoctorPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <div className="flex justify-end p-4">
        <button
          onClick={() => {
            window.location.href = "/"
          }}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
        >
          Déconnexion
        </button>
      </div>

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">
          Tableau de bord médecin
        </h1>

        <DoctorCalendar />
      </div>
    </div>
  )
}