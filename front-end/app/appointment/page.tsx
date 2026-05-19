"use client"
import AppointmentForm from "@/components/forms/AppointmentForm"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {getPatient } from "@/lib/api"

import Image from "next/image"

export default function AppointmentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
        try {
            const data = await getPatient();

        } catch (e) {
            setError("Vous devez être connecté");
            router.push("/");
        } finally {
            setAuthChecked(true);
            setLoading(false);
        }
    };
    init();
}, []);


  return (
    <div className="flex flex-col w-full">
        <section className="w-full space-y-4 border-b pb-4">
            <h1 className="header text-white">Nouveau Rendez-vous</h1>
        </section>
      <section className="remove-scrollball  container pt-20">

        <div className="flex items-center justify-center">

          <div className="max-w-[496px]">

            <AppointmentForm />

          </div>

        </div>

      </section>
    </div>
  )
}