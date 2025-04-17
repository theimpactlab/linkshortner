import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6 px-4 md:px-6">{children}</div>
      </div>
    </div>
  )
}
