"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { AuthContext } from "@/lib/store/auth-context";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  ChartBarStacked,
  ComputerIcon,
  Moon,
  MoreHorizontalIcon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes";
import { useContext, useMemo } from "react";


export function Nav() {
    const { setTheme } = useTheme()
    const auth = useContext(AuthContext);
    if (!auth) return null; // ensure context exists

    const { user, loading, logout } = auth;

    const initials = useMemo(() => {
        if (!user) return "??";
        const name = user.displayName?.trim()
        if(name) {
            const parts = name.split(" ")
            if (parts.length > 2) return parts[0][0] + parts[1][0]
            return parts[0][0]
        }
        return user.email?.[0] ?? "?"
    },[user]);
    
    if (!user || loading) return null

    return (
        <header className="container max-w-4xl px-6 py-6 mx-auto">
            <div className="flex items-center justify-between">
                {/* user info */}
                <div  className="flex items-center gap-3">
                    <div className="h-10 w-10">
                        <Avatar  className={'object-cover w-full h-full'}>
                            {user.photoURL && <AvatarImage src={user.photoURL} alt="profile"/>}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                    <h1 className="font-semibold">
                        Hello, {user.displayName ?? "User"}
                    </h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={logout}
                        disabled={loading}
                        variant="outline"
                        size={"sm"}
                        >
                            Log out
                    </Button>

                     {/* Dropdown menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Open menu">
                                <MoreHorizontalIcon className="h-5 w-5"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <ComputerIcon className="mr-2 h-4 w-4" />
                                System
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Statistics
                                <ChartBarStacked className="mr-2 h-4 w-4" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}