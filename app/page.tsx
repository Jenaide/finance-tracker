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
import { useContext, useEffect, useState } from 'react';
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
  const [balance, setBalance] = useState(0);
  const contex = useContext(FinanceContext);
  const  authContext  = useContext(AuthContext);


  if (!contex) {
    // Optional: Render a loader or fallback if context not ready
    return <div>Loading...</div>;
  }

  const { expenses, income } = contex;

  useEffect(() => {
    const newBalance = income.reduce((total, i) => {
      return total + i.amount
    }, 0) - expenses.reduce((total, e) => {
      return total + e.total
    }, 0)

    setBalance(newBalance)
  }, [expenses, income]);

  if (!authContext || !authContext.user) {
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
        <section className="py-3">
          <small className="text-md">Your Balance</small>
          <h2 className="text-4xl font-bold">{ currencyFormatter(balance) }</h2>
        </section>

        <section className="flex items-center gap-2 py-3 ">
          <Button
            onClick={() => {setAddExpenseModal(true)}}
            variant="outline"
            className="cursor-pointer"
            >
              + Expenses
          </Button>
          <Button 
            onClick={() => {setShowAddIncomeModal(true)}}
            variant="outline"
            className="cursor-pointer"
            >
              + Income
            </Button>
        </section>

        {/* expenses */}
        <section className='py-6'>
          <h3 className='text-2xl'>My Expenses</h3>
          <div className='flex flex-col gap-4 mt-6'>
            {expenses.map((expense) => {
              return (
                <ExpenseCategoryItem
                  key={expense.id}
                  expense={expense}
              />
              )
            })}
          </div>
        </section>

        {/* chart */}
        <section className='py-6'>
          <h3 className='text-2xl mb-4 text-center md:text-left'>Statistics</h3>
          <div className="w-full max-w-2xl mx-auto">
            <Bar
              data={{
                labels: expenses.map((expense) => expense.categoryName),
                datasets: [
                  {
                    label: "Expense",
                    data: expenses.map((expense) => expense.total),
                    backgroundColor: expenses.map((expense) => expense.color),
                    borderColor: ["border-0"],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                    },
                  },
                },
              }} 
              height={300}
              />
          </div>
        </section>
      </main>
    </>
  );
}