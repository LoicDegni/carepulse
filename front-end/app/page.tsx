import AppointmentForm from "@/components/forms/AppointmentForm";
import PatientForm from "@/components/forms/PatientForm";
import { Link } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollball container my-auto">
        <div className="flex items-center justify-center gap-16">

          {/* LEFT SIDE - LOGIN */}
          <div className="max-w-[496px]">
            <Image
              src="/assets/icons/plancarelogo_full.svg"
              height={1000}
              width={1000}
              alt="PlanCare logo"
              className="mb-8 h-12 w-auto"
            />
            <PatientForm />
          </div>

          {/* RIGHT SIDE - REGISTER */}
          <div className="bg-emerald-950 p-8 rounded-2xl shadow-xl text-white max-w-sm border border-white/30">
            <h2 className="text-2xl font-bold mb-4">
              Nouveau patient ?
            </h2>

            <p className="mb-6 text-sm text-emerald-200">
              Créez un compte pour prendre rendez-vous rapidement et gérer vos consultations.
            </p>

            <a
              href="/register"
              className="inline-block bg-emerald-600 hover:bg-emerald-500 transition px-6 py-3 rounded-lg font-semibold"
            >
              S'inscrire
            </a>
          </div>

        </div>
      </section>


    </div>
  )
}