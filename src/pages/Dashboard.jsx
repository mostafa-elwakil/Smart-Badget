import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

const data = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
    { name: 'Jul', income: 3490, expense: 4300 },
];

const SummaryCard = ({ title, amount, icon: Icon, trend, trendValue, type }) => {
    const { formatPrice } = useCurrency();

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
                    <div className={`p-2 rounded-full ${type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h2 className="text-2xl font-bold">{formatPrice(amount)}</h2>
                </div>
                <div className="mt-2 flex items-center text-xs">
                    <span className={`flex items-center ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trend === 'up' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                        {trendValue}
                    </span>
                    <span className="ml-1 text-secondary-500 dark:text-secondary-400">from last month</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard() {
    const { formatPrice } = useCurrency();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-secondary-500 dark:text-secondary-400">Overview of your financial status.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Balance" amount={12450.00} icon={DollarSign} trend="up" trendValue="+2.5%" type="balance" />
                <SummaryCard title="Monthly Income" amount={4500.00} icon={ArrowUpRight} trend="up" trendValue="+4.1%" type="income" />
                <SummaryCard title="Monthly Expenses" amount={2350.00} icon={ArrowDownRight} trend="down" trendValue="-1.2%" type="expense" />
                <SummaryCard title="Savings" amount={2150.00} icon={CreditCard} trend="up" trendValue="+10%" type="balance" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value).replace(/\D00(?=\D*$)/, '')} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip formatter={(value) => formatPrice(value)} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { name: 'Grocery Store', amount: -120.50, date: 'Today', type: 'expense' },
                                { name: 'Salary Deposit', amount: 3500.00, date: 'Yesterday', type: 'income' },
                                { name: 'Electric Bill', amount: -85.00, date: '2 days ago', type: 'expense' },
                                { name: 'Freelance Work', amount: 450.00, date: '3 days ago', type: 'income' },
                                { name: 'Netflix Subscription', amount: -15.99, date: '1 week ago', type: 'expense' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {item.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{item.date}</p>
                                    </div>
                                    <div className={`ml-auto font-medium ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.type === 'income' ? '+' : ''}{formatPrice(item.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
