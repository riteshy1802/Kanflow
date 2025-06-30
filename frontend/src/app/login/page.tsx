"use client";

import { useFormik } from "formik";
import { loginSchema } from "@/schemas/loginSchema";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Kanban } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/types/form.types";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/actions/common";
import { LOGIN } from "@/constants/API_Endpoints";
import { cookie } from "@/helper/cookie";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {mutate:loginUser, isPending:isLoggingIn} = useMutation({
    mutationKey:['login'],
    mutationFn:async(payload:login) => {
      const response = await post(LOGIN, payload);
      return response
    },
    onSuccess:(data)=>{
      console.log("Success in logging in!");
      console.log(data?.payload?.access_token);
      cookie.set('access_token',data?.payload?.access_token)
      toast.success("Login successful");
      router.push("/");
    },
    onError:(error)=>{
      console.log("Error in login : ", error);
      toast.error("Login failed");
    }
  })

  const handleLogin = (values:login) => {
    try {
      loginUser(values)
    } catch (error) {
      console.log("Error in login : ", error);
    }
  }

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => handleLogin(values),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111112] p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/20 via-transparent to-purple-900/10"></div>
      <Card className="relative w-full max-w-md bg-slate-900/80 border py-10 border-[#4b06c2]/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#4b06c2]/20 border border-[#4b06c2]/30">
              <Kanban className="h-6 w-6 text-[#4b06c2]" />
            </div>
            <h1 className="text-2xl font-bold text-[#4b06c2]">Kanflow</h1>
          </div>
          <CardTitle className="text-2xl text-slate-100">Welcome back</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 pr-10 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute cursor-pointer right-0 top-0 h-full px-3 py-2 hover:bg-slate-700/30 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-5 cursor-pointer bg-[#4b06c2] hover:bg-[#4b06c2]/90 text-white shadow-lg shadow-[#4b06c2]/25 transition-all duration-200"
              disabled={isLoggingIn}
            >
              {isLoggingIn && <span className="loader-2"></span>}
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {"Don't have an account? "}
              <Link href="/register" className="text-[#4b06c2] hover:text-[#4b06c2]/80 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
