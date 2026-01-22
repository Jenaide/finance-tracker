import { ReactNode, useEffect } from "react";
import { Button } from "../ui/button"

interface ModalProps {
    show: boolean;
    onClose: (value: false) => void;
    children: ReactNode;
}

export function Modal ({ show, onClose, children }: ModalProps) {
    /** Close on ESC key */
    useEffect(() => {
        if (!show) return

        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose(false)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [show, onClose])

  if (!show) return null
    return (
    <>
        {/* Overlay */}
        <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => onClose(false)}
        />

        {/* Modal wrapper */}
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-10"
        >
            {/* Modal box */}
            <div
                onClick={(e)=> e.stopPropagation()} 
                className="relative w-full max-w-2xl rounded-3xl border bg-background p-6 shadow-xl animate-in fade-in zoom-in-95">

                {/* Close button */}
                <Button
                    onClick={() => onClose(false)}
                    size={"icon"}
                    className="absolute right-5 top-2"
                    variant={"ghost"}
                    aria-label="Close modal"
                >
                     ✕
                </Button>
                {/* Modal content */}
                {children}
            </div>
        </div>
        </>
    )
}