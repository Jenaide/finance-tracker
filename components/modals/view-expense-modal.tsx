"use client";

import { currencyFormatter, formatDate } from "@/lib/utils";
import { Modal } from "@/components/modals/generic-modal";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";
import { useContext } from "react";
import { FinanceContext, ExpenseCategory, ExpenseItem } from "@/lib/store/finance-context";
import { toast } from "sonner";
import { logEvent } from "@/lib/monitor-logger";

interface ViewExpenseModalProps {
  show: boolean;
  onClose: () => void;
  expense: ExpenseCategory;
}

export function ViewExpenseModal({ show, onClose, expense }: ViewExpenseModalProps) {
    const finance = useContext(FinanceContext);
    if (!finance) return null;

    const { deleteExpenseItem, deleteExpenseCategory } = finance;

    // Delete entire category
    const deleteExpenseHandler = async () => {
        const confirmed = confirm(`Delete entire "${expense.categoryName} category?`)
        if (!confirmed) return

        try {
            await deleteExpenseCategory(expense.id!);
            toast.success("Expense Category successfully Deleted!")
            await logEvent("SUCCESS", "delete-expense-category", `Deleted income ${expense.id}`);
            onClose();
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to deleted expense category")
            await logEvent("ERROR", "delete-expense-category", e.message, { expense });
        }
    };

    // Delete single expense item
    const deleteExpenseItemHandler = async (item: ExpenseItem) => {
        try {
            const updatedItems = expense.items.filter((i) => i.id !== item.id);

            const updatedExpense: ExpenseCategory = {
                ...expense,
                items: updatedItems,
                total: updatedItems.reduce((sum, i) => sum + i.amount, 0),
            };

            await deleteExpenseItem(expense.id!, updatedExpense);

            toast.success("Expense Item Deleted!")
            await logEvent("SUCCESS", "delete-expense-item", `Deleted income ${expense.id}`, {
                categorId: expense.id,
                amount: item.amount
            });
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to deleted expense item.")
            await logEvent("ERROR", "delete-expense-item", e.message, { expense });
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            {/* header */}
            <div className="flex items-center justify-between gap-4 mt-6">
                <h2 className="text-2xl font-semibold capitalize">{expense.categoryName}</h2>
                <Button onClick={deleteExpenseHandler} variant="destructive">
                    Delete Category
                </Button>
            </div>

            {/* item */}
            <div className="mt-6 max-h-[50vh] overflow-y-auto space-y-3">
                {expense.items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">No expense yet.</p>
                )}

                {expense.items.map((item) => (
                    <div 
                        key={item.id} 
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {item.createdAt ? new Date().toLocaleString() : "N/A"}
                            </p>
                        </div>

                        <p className="flex items-center gap-3 font-semibold">
                            {currencyFormatter(item.amount)}
                            <Button
                                size={"icon"}
                                onClick={()=> {deleteExpenseItemHandler(item)}}
                                variant="ghost"
                                aria-label="Delete expense item"
                                >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </p>
                    </div>
                ))}
            </div>
        </Modal>
    )
}