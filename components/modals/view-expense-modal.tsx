"use client";
import { currencyFormatter, formatDate } from "@/lib/utils";
import { Modal } from "@/components/modals/generic-modal";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";
import { useContext } from "react";
import { FinanceContext, ExpenseCategory, ExpenseItem } from "@/lib/store/finance-context";
import { toast } from "sonner";

interface ViewExpenseModalProps {
  show: boolean;
  onClose: () => void;
  expense: ExpenseCategory;
}

export function ViewExpenseModal({ show, onClose, expense }: ViewExpenseModalProps) {
    const context = useContext(FinanceContext);
    if (!context) return null;

    const { deleteExpenseItem, deleteExpenseCategory } = context;

    // Delete entire category
    const deleteExpenseHandler = async () => {
        try {
            await deleteExpenseCategory(expense.id!);
            onClose();
            toast.success("Expense Category successfully Deleted!")
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to deleted expense category")
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
            toast.success("Expense Item successfully Deleted!")
        } catch (e: any) {
            console.error(e.message);
            toast.error("Unable to deleted expense item.")
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-semibold">{expense.categoryName}</h2>
                <Button onClick={deleteExpenseHandler} variant="destructive" className="hover:bg-red-500 cursor-pointer">Delete</Button>
            </div>

            <div className="my-4 text-2xl">
                {expense.items.map((item) => {
                    return (
                        <div key={item.id} className="flex items-center justify-between">
                            <small className="text-sm">
                                {formatDate(item.createdAt)}
                            </small>
                            <p className="flex items-center gap-2 font-semibold">
                                {currencyFormatter(item.amount)}
                                <Button
                                    onClick={()=> {deleteExpenseItemHandler(item)}}
                                    variant="ghost">
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