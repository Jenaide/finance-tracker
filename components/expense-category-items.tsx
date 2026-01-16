"use client";
import {currencyFormatter} from '@/lib/utils'
import { useState } from 'react';
import { ViewExpenseModal } from '@/components/modals/view-expense-modal';
import { ExpenseCategory } from '@/lib/store/finance-context';

interface ExpenseCategoryItemProps {
  expense: ExpenseCategory;
}
export function ExpenseCategoryItem({ expense }: ExpenseCategoryItemProps){
    const [showViewExpenseModal, setViewExpenseModal] = useState(false);
    return (
        <>
            <ViewExpenseModal 
                expense={expense} 
                show={showViewExpenseModal} 
                onClose={() =>setViewExpenseModal(false)}
                />

            <div onClick={()=> {setViewExpenseModal(true)}} className='flex items-center justify-between px-4 py-4 rounded-3xl hover:scale-105 transition-all cursor-pointer'>
                <div className='flex items-center gap-2'>
                    <div className='h-5 w-5 rounded-full' style={{ backgroundColor: expense.color }} />
                    <h4 className='capitalize'>{expense.categoryName}</h4>
                </div>
                <p>{currencyFormatter(expense.total)}</p>
            </div>            
        </>
    )
}