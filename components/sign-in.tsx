"use client"
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "./login-form";

export function SignIn(){
    return (
        <div className="flex flex-col items-center justify-center p-6 gap-6 md:p-20">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Finance Tracker
                </a>
                <LoginForm />
            </div>
        </div>
    )
}