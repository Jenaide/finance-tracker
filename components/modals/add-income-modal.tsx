"use client";

import { useContext, useRef } from "react";
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
    /** Hooks */
    const amountRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const authContext = useContext(AuthContext);
    const financeContext = useContext(FinanceContext);

    const user = authContext?.user
    const income = financeContext?.income ?? []
    const addIncomeItem = financeContext?.addIncomeItem
    const removeIncomeItem = financeContext?.removeIncomeItem

    const isDisabled = !user || !addIncomeItem || !removeIncomeItem

    /** Handlers  */
    const addIncomeHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isDisabled) return

        const amount = Number(amountRef.current?.value || 0);
        const description = descriptionRef.current?.value?.trim();

        if (amount <= 0 || !description) {
            toast.error("Please enter a valid amount and description.")
            return
        }

        const newIncome: Omit<IncomeItem, "id"> = {
            amount,
            description,
            createdAt: new Date(),
            title: "",
            uid: user!.uid
        };

        try {
            await addIncomeItem(newIncome);

            if (amountRef.current) amountRef.current.value = "";
            if (descriptionRef.current) descriptionRef.current.value = "";

            toast.success("income added successfully")

            await logEvent("SUCCESS", "add-income", `Income added: ${newIncome.description}`, {
                amount,
            });
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to add Income.")

            await logEvent("ERROR", "add-income", e?.message, {
                description, 
                amount,
            })
        }
    };

    // Delete Income Handler
    const deleteIncomeEntryHandler = async (incomeId?: string) => {
        if (!incomeId || isDisabled) return;

        try {
            await removeIncomeItem(incomeId)
            toast.success("income deleted successfully")

            await logEvent("SUCCESS", "delete-income", `Deleted income ${incomeId}`);
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to delete Income.")

            await logEvent("ERROR", "delete-income", e?.message ?? "Unknown Error", { incomeId });
        }
    };

    if (!authContext) {
        throw new Error("AuthContext must be used within AuthContextProvider");
    }


    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={addIncomeHandler} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='amount'>Income Amount</Label>
                    <Input
                        id="amount"
                        min="0"
                        step="0.01"
                        type='number'
                        ref={amountRef}
                        placeholder='Enter income amount' 
                        required/>
                </div>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                        id='description'
                        ref={descriptionRef}
                        placeholder='What is this income for?' 
                        required/>
                </div>
                <Button type='submit' disabled={isDisabled}>
                    Add Entry
                </Button>
            </form>

            {/* Income History */}
            <div className='flex flex-col gap-3 mt-8 max-h-62.5 overflow-y-auto'>
                <h3 className='text-xl font-bold'>Income History</h3>
                {income.length == 0 && (
                    <p className="text-sm text-muted-foreground">No income added yet.</p>
                )}

                {income.map((i) => (
                    <div  key={i.id} className='flex justify-between items-center border-b pb-2'>
                        <div>
                            <p className='font-semibold'>{i.description}</p>
                            <p className='text-xs text-muted-foreground'>
                                {i.createdAt ? new Date(i.createdAt).toLocaleString() : "N/A"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{currencyFormatter(i.amount)}</span>
                        </div>

                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => deleteIncomeEntryHandler(i.id)}
                            >
                            <Trash2Icon size={18}/>
                        </Button>
                    </div>
                ))}
            </div>
        </Modal>
    )
}