"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const PasskeyModal = () => {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [passkey, setPasskey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Code PIN admin — à remplacer par une vérification backend (BACK-ADM-03)
  const ADMIN_PASSKEY = "123456"

  const closeModal = () => {
    setOpen(false)
    router.push("/")
  }

  const validatePasskey = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (passkey === ADMIN_PASSKEY) {
      // Stocker la session admin (simplifié — à remplacer par un vrai token JWT)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("adminAccessKey", passkey)
      }

      setOpen(false)
      // Rediriger vers le dashboard admin
      router.push("/admin/dashboard")
    } else {
      setError("Code d'accès invalide. Veuillez réessayer.")
      setPasskey("")
    }

    setIsLoading(false)
  }

  // Soumettre avec Enter quand le code est complet
  useEffect(() => {
    if (passkey.length === 6) {
      const fakeEvent = { preventDefault: () => {} } as React.MouseEvent<
        HTMLButtonElement,
        MouseEvent
      >
      validatePasskey(fakeEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passkey])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between">
            <span className="text-light-200 text-xl">
              Vérification d&apos;accès administrateur
            </span>
            <button
              onClick={closeModal}
              className="cursor-pointer rounded-full p-1 hover:bg-dark-500 transition-colors"
            >
              <X className="h-5 w-5 text-dark-600" />
            </button>
          </AlertDialogTitle>

          <AlertDialogDescription className="text-dark-600 text-14-regular mt-2">
            Pour accéder à la page administrateur, veuillez entrer le code
            d&apos;accès.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-center mt-4">
          <InputOTP
            maxLength={6}
            value={passkey}
            onChange={(value: string) => {
              setPasskey(value)
              setError("")
            }}
          >
            <InputOTPGroup className="shad-otp">
              <InputOTPSlot className="shad-otp-slot" index={0} />
              <InputOTPSlot className="shad-otp-slot" index={1} />
              <InputOTPSlot className="shad-otp-slot" index={2} />
              <InputOTPSlot className="shad-otp-slot" index={3} />
              <InputOTPSlot className="shad-otp-slot" index={4} />
              <InputOTPSlot className="shad-otp-slot" index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="shad-error text-14-regular mt-2 flex justify-center">
            {error}
          </p>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogAction
            onClick={(e) => validatePasskey(e)}
            className="shad-primary-btn w-full h-11 rounded-lg cursor-pointer"
            disabled={passkey.length !== 6 || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Vérification...
              </div>
            ) : (
              "Accéder au panneau d'administration"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default PasskeyModal
