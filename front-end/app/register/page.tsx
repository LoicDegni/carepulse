import RegisterForm from "@/components/forms/RegisterForm"
import Image from "next/image"

export default function AppointmentPage() {

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollball container my-auto">
        <div className="flex items-center justify-center">

          <div className="w-[60%] max-w-[800px] min-w-[300px] mx-auto px-4">

            <Image
              src="/assets/icons/plancarelogo_full.svg"
              height={1000}
              width={1000}
              alt="PlanCare logo"
              className="mb-8 h-12 w-auto"
            />

            <RegisterForm/>

          </div>

        </div>

      </section>
    </div>
  )
}