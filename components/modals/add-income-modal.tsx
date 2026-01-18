"use client";

import { useContext, useEffect, useRef } from "react";
import { Modal } from "@/components/modals/generic-modal";
import {currencyFormatter} from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from "@/components/ui/button";
import { Trash2Icon } from 'lucide-react';
import { FinanceContext, IncomeItem } from "@/lib/store/finance-context";
import { AuthContext } from "@/lib/store/auth-context";
import { toast } from "sonner";
import { logEvent } from "@/lib/monitor-logger";

interface AddIncomeModalProps {
  show: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ show, onClose }: AddIncomeModalProps) {
    const amountRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext must be used within AuthContextProvider");
    }
    const user  = authContext?.user;
    if (!user) {
        // Either show an error or prevent the action
        console.error("User not authenticated");
        return;
    }

    const context = useContext(FinanceContext);
    if (!context) return null;

    const { income, addIncomeItem, removeIncomeItem } = context;

    // Add Income Handler
    const addIncomeHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const amount = Number(amountRef.current?.value);
        const description = descriptionRef.current?.value.trim();

        if (!amount || !description) return;

        const newIncome: Omit<IncomeItem, "id"> = {
            amount,
            description,
            createdAt: new Date(),
            title: "",
            uid: user.uid
        };

        try {
            await addIncomeItem(newIncome);
            if (amountRef.current) amountRef.current.value = "";
            if (descriptionRef.current) descriptionRef.current.value = "";
            toast.success("income added successfully")
            await logEvent("SUCCESS", "add-income", `Income added: ${newIncome.description}`, {
                amount
            });
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to add Income.")
            await logEvent("ERROR", "add-income", e.message, {
                description, 
                amount,
                createdAt: newIncome.createdAt
            })
        }
    };

    // Delete Income Handler
    const deleteIncomeEntryHandler = async (incomeId?: string) => {
        if (!incomeId) return;
        try {
            await removeIncomeItem(incomeId);
            toast.success("income deleted successfully")
            await logEvent("SUCCESS", "delete-income", `Deleted income ${incomeId}`);
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to delete Income.")
            await logEvent("ERROR", "delete-income", e.message, { incomeId });
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={addIncomeHandler} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                    <Label htmlFor='amount'>Income Amount</Label>
                    <Input
                        className='px-4 py-2 rounded-xl'
                        name='amount'
                        type='number'
                        ref={amountRef}
                        placeholder='Enter income amount' required/>
                </div>
                <div className='flex flex-col gap-4'>
                    <Label htmlFor='amount'>Description</Label>
                    <Textarea
                        className='px-4 py-2 rounded-xl'
                        name='description'
                        ref={descriptionRef}
                        placeholder='Enter income amount description' required/>
                </div>
                <Button type='submit' className={"self-start cursor-pointer"}>Add Entry</Button>
            </form>

            <div className='flex flex-col gap-4 mt-6'>
                <h3 className='text-xl font-bold'>Income History</h3>
                {income.map(i => {
                    return (
                    <div className='flex justify-between items-center' key={i.id}>
                        <div>
                        <p className='font-semibold'>{i.description}</p>
                        <small className='text-xs'>{i.createdAt ? i.createdAt.toISOString() : "N/A"}</small>
                        </div>
                        <p className='flex items-center gap-2'>
                        {currencyFormatter(i.amount)}
                        <Button onClick={() => { deleteIncomeEntryHandler(i.id) }} >
                            <Trash2Icon />
                        </Button>
                        </p>
                    </div>
                    )
                })}
            </div>
        </Modal>
    )
}