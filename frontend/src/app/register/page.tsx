"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Kanban, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast("Password mismatch")
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      if (name && email && password) {
        localStorage.setItem("kanflow_token", "dummy_jwt_token")
        localStorage.setItem(
          "kanflow_user",
          JSON.stringify({
            id: "1",
            name: name,
            email: email,
            avatar: name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
          }),
        )
        toast("Registration successful")
        router.push("/")
      } else {
        toast("Registration failed")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111112] p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/20 via-transparent to-purple-900/10"></div>
      <Card className="relative w-full max-w-md bg-slate-900/80 border border-[#4b06c2]/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#4b06c2]/20 border border-[#4b06c2]/30">
              <Kanban className="h-6 w-6 text-[#4b06c2]" />
            </div>
            <h1 className="text-2xl font-bold text-[#4b06c2]">Kanflow</h1>
          </div>
          <CardTitle className="text-2xl text-slate-100">Create account</CardTitle>
          <CardDescription className="text-slate-400">Sign up to start managing your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 pr-10 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-700/30 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 pr-10 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-700/30 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-3 bg-[#4b06c2] cursor-pointer hover:bg-[#4b06c2]/90 text-white shadow-lg shadow-[#4b06c2]/25 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-[#4b06c2] hover:text-[#4b06c2]/80 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}