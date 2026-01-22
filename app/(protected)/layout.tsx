"use client"

import { useContext } from "react"
import { AuthContext } from "@/lib/store/auth-context"
import { SignIn } from "@/components/sign-in"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext)

  if (!auth || auth.loading) return null

  if (!auth.user) return <SignIn />

  return <>{children}</>
}