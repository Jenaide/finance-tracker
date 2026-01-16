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
import { useContext } from "react";


export function Nav() {
    const { setTheme } = useTheme()
    const context = useContext(AuthContext);
    if (!context) return null; // ensure context exists

    const { user, loading, logout } = context;

    const getUserInitials = () => {
        if (!user) return "??";
        const names = user.displayName?.split(" ") ?? [];
        return names.length > 1
        ? names[0][0] + names[1][0]
        : user.displayName?.[0] ?? user.email?.[0] ?? "?";
    };
    
    return (
        <header className="container max-w-4xl px-6 py-6 mx-auto">
            <div className="flex items-center justify-between">
                {/* user info */}
                {user && !loading && (
                <div  className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Avatar  className={'object-cover w-full h-full'}>
                            {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.photoURL}/>}
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                    </div>
                    <h1 className="font-semibold">
                        Hello, {user?.displayName ?? "User"}
                    </h1>
                </div>
                )}

                {/* Actions */}
                {user && !loading && (
                <div className="flex items-center gap-4">
                    <Button
                        onClick={logout}
                        disabled={loading}
                        variant="outline"
                        >
                            Log out
                    </Button>

                     {/* Dropdown menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="relative w-5 h-5 flex items-center justify-between">
                                <Button variant="outline" size="icon" aria-label="More Options">
                                    <MoreHorizontalIcon />
                                </Button>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="cursor-pointer">
                            <DropdownMenuItem onClick={() => setTheme("light")} className="flex justify-between">
                                
                                Light
                                <Sun className="size-5" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex justify-between">
                                
                                Dark
                                <Moon className="size-5" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")} className="flex justify-between">
                                
                                System
                                <ComputerIcon className="size-5" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex justify-between">
                                
                                Statistics
                                <ChartBarStacked className="size-5" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                )}
            </div>
        </header>
    )
}