import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function MonthlySummary() {
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expensesData, incomeData, categoriesData] = await Promise.all([
                api.getExpenses(),
                api.getIncome(),
                api.getCategories()
            ]);
            setExpenses(expensesData);
            setIncome(incomeData);
            processCategoryData(expensesData, categoriesData);
            processWeeklyData(expensesData, incomeData);
        } catch (err) {
            console.error(err);
        }
    };

    const processCategoryData = (expenses, categories) => {
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        const data = Object.keys(categoryTotals).map(catName => {
            const category = categories.find(c => c.name === catName);
            // Default colors if category not found or no color set
            const color = category?.color?.replace('bg-', '') || 'gray-500';
            // Map tailwind bg colors to hex for recharts (simplified mapping)
            const colorMap = {
                'red-500': '#ef4444',
                'blue-500': '#3b82f6',
                'green-500': '#10b981',
                'yellow-500': '#f59e0b',
                'purple-500': '#a855f7',
                'pink-500': '#ec4899',
                'indigo-500': '#6366f1',
                'gray-500': '#64748b'
            };

            return {
                name: catName,
                value: categoryTotals[catName],
                color: colorMap[color] || '#64748b'
            };
        });

        setCategoryData(data);
    };

    const processWeeklyData = (expenses, income) => {
        // Simplified weekly logic: Group by week of current month
        // For now, let's just show the last 4 weeks based on transaction dates
        // Or simpler: Group by day for the last 7 days? 
        // Let's stick to the existing "Week 1-4" structure but based on actual dates if possible.
        // For simplicity in this iteration, let's just group all data into 4 buckets based on day of month.

        const weeks = [
            { name: t('week') + ' 1', income: 0, expense: 0 },
            { name: t('week') + ' 2', income: 0, expense: 0 },
            { name: t('week') + ' 3', income: 0, expense: 0 },
            { name: t('week') + ' 4', income: 0, expense: 0 },
        ];

        const addToWeek = (dateStr, amount, type) => {
            const day = new Date(dateStr).getDate();
            let weekIndex = Math.floor((day - 1) / 7);
            if (weekIndex > 3) weekIndex = 3; // Put days 29-31 in week 4
            if (type === 'income') weeks[weekIndex].income += amount;
            else weeks[weekIndex].expense += amount;
        };

        expenses.forEach(e => addToWeek(e.date, e.amount, 'expense'));
        income.forEach(i => addToWeek(i.date, i.amount, 'income'));

        setWeeklyData(weeks);
    };

    const totalExpenses = categoryData.reduce((a, b) => a + b.value, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('summary')}</h2>
                <p className="text-secondary-500 dark:text-secondary-400">{t('overview')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('spendingByCategory') || 'Spending by Category'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatPrice(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-secondary-400">
                                    No expense data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('weeklyBreakdown') || 'Weekly Breakdown'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value).replace(/\D00(?=\D*$)/, '')} />
                                    <Tooltip formatter={(value) => formatPrice(value)} cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="income" name={t('income')} fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name={t('expenses')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('categoryDetails') || 'Category Details'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50 dark:bg-secondary-800/50 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">{t('category')}</th>
                                    <th className="px-4 py-3 text-right">{t('amount')}</th>
                                    <th className="px-4 py-3 text-right">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map((item, index) => (
                                    <tr key={index} className="border-b border-secondary-100 dark:border-secondary-700">
                                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatPrice(item.value)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                                {categoryData.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-8 text-center text-secondary-500">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
