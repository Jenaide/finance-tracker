"use client";
import {currencyFormatter} from '@/lib/utils'
import { useCallback, useState } from 'react';
import { ViewExpenseModal } from '@/components/modals/view-expense-modal';
import { ExpenseCategory } from '@/lib/store/finance-context';
import { Button } from './ui/button';

interface ExpenseCategoryItemProps {
  expense: ExpenseCategory;
}
export function ExpenseCategoryItem({ expense }: ExpenseCategoryItemProps){
    const [showViewExpenseModal, setViewExpenseModal] = useState(false);

    const openModal = useCallback(() => setViewExpenseModal(true), [])
    const closeModal = useCallback(() => setViewExpenseModal(false), [])
    
    return (
        <>
            <ViewExpenseModal 
                expense={expense} 
                show={showViewExpenseModal} 
                onClose={closeModal}
                />
            <Button
                type='button'
                onClick={openModal}
                className='
                    w-full flex items-center justify-between
                    px-4 py-4 rounded-2xl
                    border bg-background
                    hover:bg-accent hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-primary
                    transition-all
                '
                variant={"ghost"}
                aria-label={`View expenses for ${expense.categoryName}`}
            >
                <div className='flex items-center gap-3'>
                    <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: expense.color }}
                        aria-hidden
                    />
                    <span className='capitalize font-medium'>{expense.categoryName}</span>
                </div>
                <span className='font-semibold'>{currencyFormatter(expense.total)}</span>
            </Button> 
        </>
    )
}