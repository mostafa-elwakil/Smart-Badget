import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

const categoryData = [
    { name: 'Housing', value: 1200, color: '#0ea5e9' },
    { name: 'Food', value: 450, color: '#10b981' },
    { name: 'Transport', value: 300, color: '#f59e0b' },
    { name: 'Utilities', value: 200, color: '#6366f1' },
    { name: 'Entertainment', value: 150, color: '#ec4899' },
    { name: 'Others', value: 100, color: '#64748b' },
];

const monthlyData = [
    { name: 'Week 1', income: 1000, expense: 800 },
    { name: 'Week 2', income: 1200, expense: 900 },
    { name: 'Week 3', income: 900, expense: 400 },
    { name: 'Week 4', income: 1400, expense: 600 },
];

export default function MonthlySummary() {
    const { formatPrice } = useCurrency();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Monthly Summary</h2>
                <p className="text-secondary-500 dark:text-secondary-400">Detailed breakdown of your finances.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
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
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value).replace(/\D00(?=\D*$)/, '')} />
                                    <Tooltip formatter={(value) => formatPrice(value)} cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50 dark:bg-secondary-800/50 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
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
                                            {Math.round((item.value / categoryData.reduce((a, b) => a + b.value, 0)) * 100)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
