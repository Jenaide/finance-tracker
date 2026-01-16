"use client";

import { createContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";

interface AuthContextType {
    user: User| null;
    loading: boolean;
    googleLoginHandler: () => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {

    const [rawUser, loading] = useAuthState(auth);
    const user: User | null = rawUser ?? null;
    
    const googleProvider = new GoogleAuthProvider();

    const googleLoginHandler = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch(e) {
            throw e
        }
    };

    const logout = async() => {
        await signOut(auth);
    };

    const values: AuthContextType = {
        user,
        loading,
        googleLoginHandler,
        logout
    }

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
};