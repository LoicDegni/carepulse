import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  type: "appointments" | "pending" | "cancelled"
  count: number
  label: string
  icon: LucideIcon
}

const StatCard = ({ type, count, label, icon: Icon }: StatCardProps) => {
  return (
    <div
      className={cn("stat-card", {
        "bg-appointments": type === "appointments",
        "bg-pending": type === "pending",
        "bg-cancelled": type === "cancelled",
      })}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn("flex h-12 w-12 items-center justify-center rounded-full", {
            "bg-green-600": type === "appointments",
            "bg-blue-600": type === "pending",
            "bg-red-600": type === "cancelled",
          })}
        >
          <Icon
            className={cn("h-6 w-6", {
              "text-green-500": type === "appointments",
              "text-blue-500": type === "pending",
              "text-red-500": type === "cancelled",
            })}
          />
        </div>
        <div>
          <h2 className="text-32-bold text-white">{count}</h2>
          <p className="text-14-regular text-dark-700">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default StatCard
