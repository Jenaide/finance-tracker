"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, DocumentData, Timestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthContext } from "./auth-context";


// ----- Type Definitions -----
export interface IncomeItem {
  id?: string;
  title: string;
  description?: string;
  amount: number;
  createdAt?: Date;
  uid: string;
}

export interface ExpenseItem {
  id?: string;
  title: string;
  amount: number;
  createdAt?: Date;
}

export interface ExpenseCategory {
  id?: string;
  categoryName: string;
  items: ExpenseItem[];
  total: number;
  color?: string;
}

interface FinanceContextType {
  income: IncomeItem[];
  expenses: ExpenseCategory[];
  addIncomeItem: (newIncome: IncomeItem) => Promise<void>;
  removeIncomeItem: (incomeId: string) => Promise<void>;
  addExpenseItem: (categoryId: string, newItem: ExpenseItem) => Promise<void>;
  addCategory: (category: Omit<ExpenseCategory, "id" | "items">) => Promise<void>;
  deleteExpenseItem: (
    categoryId: string,
    updatedCategory: ExpenseCategory
  ) => Promise<void>;
  deleteExpenseCategory: (categoryId: string) => Promise<void>;
}

// ----- Context -----
export const FinanceContext = createContext<FinanceContextType | null>(null);

// ----- Provider -----
export function FinanceContextProvider({ children }: Readonly<{ children: React.ReactNode }>){
    const [income, setIncome] = useState<IncomeItem[]>([]);
    const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext must be used within AuthContextProvider");
    }
    const user  = authContext?.user;


    // --- Add Expense Category ---
    const addCategory = async (category: Omit<ExpenseCategory, "id" | "items">): Promise<void> => {
        const collectionRef = collection(db, "expenses");
        const docSnap = await addDoc(collectionRef, { uid: user?.uid, ...category, items: [] });
        setExpenses((prev) => [...prev, { id: docSnap.id, uid: user?.uid, ...category, items: [] }]);
    };

    // --- Add Expense Item ---
    const addExpenseItem = async (categoryId: string,newItem: ExpenseItem): Promise<void> => {
        const categoryRef = doc(db, "expenses", categoryId);
        const category = expenses.find((c) => c.id === categoryId);
        if (!category) return;

        const updatedItems = [...category.items, newItem];
        const updatedCategory: ExpenseCategory = {
            ...category,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + item.amount, 0), // update total
        };

        await updateDoc(categoryRef, { items: updatedItems, total: updatedCategory.total });
        
        setExpenses((prev) =>
            prev.map((c) => (c.id === categoryId ? updatedCategory : c))
        );
    };

    // --- Add Income ---
    const addIncomeItem = async (newIncome: IncomeItem): Promise<void> => {
        const collectionRef = collection(db, "income");
        const docSnap = await addDoc(collectionRef, {
        ...newIncome,
        createdAt: Timestamp.now(),
        });
        setIncome((prev) => [...prev, { id: docSnap.id, ...newIncome }]);
    };

    // --- Delete Expense Item ---
    const deleteExpenseItem = async (categoryId: string,updatedCategory: ExpenseCategory): Promise<void> => {
        const categoryRef = doc(db, "expenses", categoryId);
        await updateDoc(categoryRef, { items: updatedCategory.items });
        setExpenses((prev) =>
        prev.map((c) => (c.id === categoryId ? updatedCategory : c))
        );
    };

    // --- Delete Expense Category ---
    const deleteExpenseCategory = async (categoryId: string): Promise<void> => {
        await deleteDoc(doc(db, "expenses", categoryId));
        setExpenses((prev) => prev.filter((c) => c.id !== categoryId));
    };

    // --- Remove Income ---
    const removeIncomeItem = async (incomeId: string): Promise<void> => {
        await deleteDoc(doc(db, "income", incomeId));
        setIncome((prev) => prev.filter((i) => i.id !== incomeId));
    };

    // --- Fetch Initial Data ---
    useEffect(() => {
        if(!user) return;
        const fetchIncome = async () => {
            try {
                const collectionRef = collection(db, "income");
                const q = query(collectionRef, where("uid", '==', user.uid));
                const docSnap = await getDocs(q);

                const data: IncomeItem[] = docSnap.docs.map((doc) => {
                    const docData = doc.data() as DocumentData;
                    return {
                        id: doc.id,
                        title: docData.title ?? "",
                        amount: docData.amount ?? 0,
                        createdAt: docData.createdAt
                            ? (docData.createdAt as Timestamp).toDate()
                            : undefined,
                            uid: docData.uid,
                    };
                });
                setIncome(data);
            } catch (e) {
                console.error(e);
            }
        };

        const fetchExpenses = async () => {
            try {
                const collectionRef = collection(db, "expenses");
                const q = query(collectionRef, where("uid", '==', user.uid));
                const docSnap = await getDocs(q)
                const data = docSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as ExpenseCategory),
                }));
                setExpenses(data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchIncome();
        fetchExpenses();
    }, [user]);

    const values: FinanceContextType = { 
        income, 
        expenses, 
        addIncomeItem, 
        removeIncomeItem, 
        addExpenseItem ,
        addCategory,
        deleteExpenseItem,
        deleteExpenseCategory
    };

    return (
        <FinanceContext.Provider value={values}>
            {children}
        </FinanceContext.Provider>
    )
}