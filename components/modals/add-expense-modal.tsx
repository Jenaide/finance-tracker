"use client"
import { useContext, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Modal } from "@/components/modals/generic-modal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FinanceContext, ExpenseCategory, ExpenseItem } from "@/lib/store/finance-context";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { logEvent } from "@/lib/monitor-logger";

interface AddExpensesModalProps {
  show: boolean;
  onClose: () => void;
}

export function AddExpensesModal({ show, onClose }: AddExpensesModalProps) {
    const [expenseAmount, setExpenseAmount] = useState("");
    const [selectCategory, setSelectCategory] = useState<string | null>(null);
    const [showAddExpense, setShowAddExpense] = useState(false);

    const context = useContext(FinanceContext);
    if (!context) return null; // context must exist

    const { expenses, addExpenseItem, addCategory } = context;

    const titleRef = useRef<HTMLInputElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);

    const addExpenseItemHandler = async () => {
        if (!selectCategory) return;
        const category = expenses.find((e) => e.id === selectCategory);
        if (!category) return;

        const amountNum = Number(expenseAmount);

        const newExpenseItem: ExpenseItem = {
            id: uuidv4(),
            amount: amountNum,
            createdAt: new Date(),
            title: `Expense ${category.items?.length + 1}`,
        };
        const updatedCategory: ExpenseCategory = {
            ...category,
            total: (category.total ?? 0) + amountNum,
            items: [...(category.items ?? []), newExpenseItem],
        };


        try {
            // call context function for adding a single item
            await addExpenseItem(selectCategory, newExpenseItem);

            setExpenseAmount("");
            setSelectCategory(null);

            toast.success("Expense Item added!")
            await logEvent("SUCCESS", "create-expense", `Added expense ${newExpenseItem.title}`, {
                category: selectCategory,
                amount: amountNum
            });
            onClose();
        } catch (e: any) {
            console.error(e.message);
            toast.success("Unable to add item.")
            await logEvent("ERROR", "create-expense", e.message, { 
                category: selectCategory,
                amount: amountNum
            })
        }
    };

    const addCategoryHandler = async () => {
        const title = titleRef.current?.value.trim();
        const color = colorRef.current?.value;

        if (!title || !color) return;

        try {
        await addCategory({
            categoryName: title,
            color,
            total: 0,
        });
        toast.success("Category created!")
        setShowAddExpense(false);
        await logEvent("SUCCESS", "create-category", `Category created: ${title}`, { color });
        } catch (e: any) {
            toast.error("Unable to create category.")
            console.error(e.message);
            await logEvent("ERROR", "create-category", e.message, { 
                title, 
                color 
            });
        }
    };

    const amountNum = Number(expenseAmount);

    return (
        <Modal show={show} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <Label>Enter an amount</Label>
                <Input 
                    type={"number"}
                    value={expenseAmount}
                    placeholder="Enter an expense amount."
                    onChange={(e)=> {setExpenseAmount(e.target.value)}}
                />
            </div>

            {/* expense categories */}
            {amountNum > 0 && (
            <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl capitalize font-semibold">Select Expense Category</h3>
                    <Button onClick={()=> {setShowAddExpense(true)}} variant="ghost">+ New Category</Button>
                </div>

                {showAddExpense && (
                    <div className="flex items-center justify-between gap-4">
                        <Input 
                            type={"text"}
                            placeholder="Enter Title"
                            ref={titleRef}
                        />
                        <Label>Pick Color</Label>
                        <Input
                            className={"w-24 h-10"}
                            type={"color"}
                            ref={colorRef}
                        />
                        <Button onClick={ addCategoryHandler } variant="outline">Create</Button>
                        <Button onClick={()=> {setShowAddExpense(false)}} variant="destructive">Cancel</Button>
                    </div>
                )}

                {expenses.map((expense) => {
                    return (
                        <Button
                            key={expense.id}
                            onClick={() => setSelectCategory(expense.id!)}
                            variant="ghost" 
                            className={"flex items-center justify-between rounded-3xl"} 
                            style={{ boxShadow: expense.id === selectCategory ? "1px 1px 4px" : "none" }}>
                            <div className="flex items-center gap-2">
                                {/* color circle */}
                                <div className="w-6.5 h-6.5 rounded-full" 
                                    style={{
                                        backgroundColor: expense.color,
                                    }}
                                />
                                <h4 className="capitalize">{expense.categoryName}</h4>
                            </div>
                        </Button>
                    )
                })}
            </div>
            )}
            {amountNum > 0 && selectCategory && (
                <div className="mt-6">
                    <Button
                        onClick={addExpenseItemHandler}
                        variant="outline"
                        className={"cursor-pointer"}
                        >
                        Add Expense
                    </Button>
                </div>
            )}
        </Modal>
    )
}