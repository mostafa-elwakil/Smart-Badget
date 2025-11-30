import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../api';

export default function Income() {
    const [incomes, setIncomes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        loadIncome();
    }, []);

    const loadIncome = async () => {
        try {
            const data = await api.getIncome();
            setIncomes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredIncomes = incomes.filter(income =>
        income.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        try {
            await api.deleteIncome(id);
            setIncomes(incomes.filter(i => i.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Income</h2>
                    <p className="text-secondary-500">Track your earnings.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Income
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
                    <Input
                        placeholder="Search income..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Income List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50 dark:bg-secondary-800/50 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncomes.map((income) => (
                                    <tr key={income.id} className="border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors dark:border-secondary-700 dark:hover:bg-secondary-800/50">
                                        <td className="px-4 py-3 font-medium">{income.title}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                {income.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-secondary-500 dark:text-secondary-400">{formatDate(income.date)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                                            +{formatPrice(income.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-500 hover:text-red-600 dark:text-secondary-400 dark:hover:text-red-400" onClick={() => handleDelete(income.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Income">
                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newIncome = {
                        title: formData.get('title'),
                        amount: parseFloat(formData.get('amount')),
                        category: formData.get('category'),
                        date: formData.get('date'),
                    };
                    try {
                        const savedIncome = await api.addIncome(newIncome);
                        setIncomes([savedIncome, ...incomes]);
                        setIsModalOpen(false);
                    } catch (err) {
                        console.error(err);
                    }
                }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" placeholder="e.g. Salary" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input name="amount" type="number" placeholder="0.00" step="0.01" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select name="category" className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
                            <option>Salary</option>
                            <option>Freelance</option>
                            <option>Investment</option>
                            <option>Gift</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input name="date" type="date" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Add Income</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
