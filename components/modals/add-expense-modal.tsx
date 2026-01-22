"use client"
import { useContext, useState, useRef, useEffect, useMemo } from "react";
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

    const finance = useContext(FinanceContext);
    if (!finance) return null; // context must exist

    const { expenses, addExpenseItem, addCategory } = finance;

    const titleRef = useRef<HTMLInputElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);

    const amountNum = useMemo(() => Number(expenseAmount), [expenseAmount])
    
    useEffect(() => {
        if(!show) {
            setExpenseAmount("")
            setSelectCategory(null)
            setShowAddExpense(false)
        }
    }, [show])

    // add expense item
    const addExpenseItemHandler = async () => {
        if (!selectCategory || amountNum <= 0) return;

        const category = expenses.find((e) => e.id === selectCategory);
        if (!category) return;

        const newExpenseItem: ExpenseItem = {
            id: uuidv4(),
            amount: amountNum,
            createdAt: new Date(),
            title: `Expense ${(category.items?.length ?? 0) + 1}`,
        };

        try {
            // call context function for adding a single item
            await addExpenseItem(selectCategory, newExpenseItem);

            toast.success("Expense added!")
            await logEvent("SUCCESS", "create-expense", `Added expense ${newExpenseItem.title}`, {
                category: selectCategory,
                amount: amountNum
            });
            onClose();
        } catch (e: any) {
            console.error(e.message);
            toast.success("Unable to add expense.")
            await logEvent("ERROR", "create-expense", e.message, { 
                category: selectCategory,
                amount: amountNum
            })
        }
    };

    // add category
    const addCategoryHandler = async () => {
        const title = titleRef.current?.value.trim();
        const color = colorRef.current?.value;

        if (!title || !color) {
            toast.error("Please enter title and pick a color.")
        };

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
            console.error(e);
            await logEvent("ERROR", "create-category", e.message, { 
                title, 
                color 
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Enter an amount</Label>
                <Input 
                    type="number"
                    value={expenseAmount}
                    placeholder="Enter an expense amount."
                    onChange={(e)=> {setExpenseAmount(e.target.value)}}
                />
            </div>

            {/* expense categories */}
            {amountNum > 0 && (
            <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Select Category</h3>
                    <Button onClick={()=> setShowAddExpense(true)} variant="ghost">
                        + New
                    </Button>
                </div>

                {showAddExpense && (
                    <div className="flex flex-wrap justify-between gap-3">
                        <Input 
                            placeholder="Category name"
                            ref={titleRef}
                        />
                        <Input
                            className="w-20 h-10"
                            type="color"
                            ref={colorRef}
                        />
                        <Button onClick={ addCategoryHandler } variant="outline">
                            Create
                        </Button>
                        <Button onClick={()=> setShowAddExpense(false)} variant="destructive">
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Category List */}
                <div className="grid gap-2">
                    {expenses.map((expense) => (
                        <Button
                            key={expense.id}
                            onClick={() => setSelectCategory(expense.id!)}
                            className={`flex items-center justify-between rounded-2xl border px-4 py-2 transition
                                    ${
                                        expense.id === selectCategory
                                        ? "border-primary ring-2 ring-primary/40"
                                        : "border-muted hover:bg-muted/50"
                                    }
                                `}
                            >
                            <div className="flex items-center gap-2">
                                {/* color circle */}
                                <span className="w-3.5 h-3.5 rounded-full" 
                                    style={{
                                        backgroundColor: expense.color,
                                    }}
                                />
                                <span className="capitalize">{expense.categoryName}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
            )}
            {amountNum > 0 && selectCategory && (
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={addExpenseItemHandler}
                        variant={"default"}
                        >
                        Add Expense
                    </Button>
                </div>
            )}
        </Modal>
    )
}