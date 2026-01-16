import { ReactNode } from "react";
import { Button } from "../ui/button"

interface ModalProps {
    show: boolean;
    onClose: (value: false) => void;
    children: ReactNode;
}

export function Modal ({ show, onClose, children }: ModalProps) {
    return (
    <>
        {/* Overlay */}
        <div
            aria-hidden={!show}
            className={`fixed inset-0 z-40 transition-opacity bg-background/90 duration-300 ${
            show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => onClose(false)}
        />

        {/* Modal content */}
        <div
            className={`fixed inset-0 z-50 flex bg-background/20 items-start justify-center overflow-auto transition-transform duration-500 ${
            show ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="relative mt-10 w-full max-w-2xl rounded-3xl py-6 px-6 shadow-lg border">
            {/* Close button */}
            <Button
                onClick={() => onClose(false)}
                className="top-0 right-4 w-10 h-10 font-bold rounded-full"
                variant="ghost"
                aria-label="Close modal"
            >
                x
            </Button>
                {/* Modal content */}
                {children}
            </div>
        </div>
        </>
    )
}