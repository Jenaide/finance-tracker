"use client"

import { Button } from "@/components/ui/button";
import { ExpenseCategoryItem } from '@/components/expense-category-items';
import { Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend, } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useContext, useEffect, useMemo, useState } from 'react';
import { AddIncomeModal } from '@/components/modals/add-income-modal';
import { currencyFormatter } from "@/lib/utils";
import { FinanceContext } from "@/lib/store/finance-context";
import { AddExpensesModal } from "@/components/modals/add-expense-modal";
import { AuthContext } from "@/lib/store/auth-context";
import { SignIn } from "@/components/sign-in";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend);


export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setAddExpenseModal] = useState(false);

  const finance = useContext(FinanceContext);
  const  auth  = useContext(AuthContext);
  if (!auth) return null

  const { user, loading } = auth
  const expenses = finance?.expenses ?? [];
  const income = finance?.income ?? [];


  const balance = useMemo(() => {
    const totalIncome = income.reduce((total, i) => total + i.amount, 0)
    const totalExpenses = expenses.reduce((total, e) => total + e.total, 0)
    return totalIncome - totalExpenses
  }, [expenses, income]);

  const chartData = useMemo(() => {
    return {
      labels: expenses.map((e) => e.categoryName),
      datasets: [
        {
          label: "Expenses",
          data: expenses.map((e) => e.total),
          backgroundColor: expenses.map((e) => e.color),
          borderWidth: 0,
        }
      ]
    }
  }, [expenses])
  
  if (loading) {
    return (
      <main className="container max-w-4xl px-6 py-6 mx-auto animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-4" />
        <div className="h-12 w-64 bg-muted rounded mb-6" />
        <div className="h-32 bg-muted rounded" />
      </main>
    )
  }


  if (!user) {
    return <SignIn />
  }

  return (
    <>
      {/* add income modal */}
      <AddIncomeModal 
        show={showAddIncomeModal} 
        onClose={()=> setShowAddIncomeModal(false)}
      />

      {/* add income modal */}
      <AddExpensesModal 
        show={showAddExpenseModal} 
        onClose={()=> setAddExpenseModal(false)}
      />

      <main className="container max-w-4xl px-6 py-6 mx-auto">
        {/* balance */}
        <section className="py-4">
          <small className="text-md">Your Balance</small>
          <h2 className="text-4xl font-bold">{ currencyFormatter(balance) }</h2>
        </section>

        <section className="flex gap-3 py-4">
          <Button
            onClick={() => {setAddExpenseModal(true)}}
            variant="outline"
            >
              + Expenses
          </Button>
          <Button 
            onClick={() => {setShowAddIncomeModal(true)}}
            variant="outline"
            >
              + Income
            </Button>
        </section>

        {/* expenses list */}
        <section className='py-6'>
          <h3 className='text-2xl font-semibold mb-4'>My Expenses</h3>

          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            <div className='flex flex-col gap-3'>
              {expenses.map((expense) => (
                  <ExpenseCategoryItem
                    key={expense.id}
                    expense={expense}
                />
              ))}
            </div>
          )}
        </section>

        {/* chart */}
        <section className='py-6'>
          <h3 className='text-2xl mb-4 font-semibold'>Statistics</h3>

          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add expenses to see statistics.</p>
          ) : (
            <div className="w-full max-w-2xl mx-auto">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top" },
                  },
                  scales: {
                    x: { ticks: { autoSkip: false } },
                  },
                }}
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
}