import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function Expenses() {
    const { t } = useLanguage();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        loadExpenses();
        loadCategories();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await api.getExpenses();
            setExpenses(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data.filter(c => c.type === 'expense'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteExpense(id);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredExpenses = expenses.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('expenses')}</h2>
                    <p className="text-secondary-500">{t('overview')}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {t('addExpense')}
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
                    <Input
                        placeholder={t('title')}
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('expenses')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50 dark:bg-secondary-800/50 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">{t('title')}</th>
                                    <th className="px-4 py-3">{t('category')}</th>
                                    <th className="px-4 py-3">{t('date')}</th>
                                    <th className="px-4 py-3 text-right">{t('amount')}</th>
                                    <th className="px-4 py-3 text-center">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors dark:border-secondary-700 dark:hover:bg-secondary-800/50">
                                        <td className="px-4 py-3 font-medium">{expense.title}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-secondary-500 dark:text-secondary-400">{formatDate(expense.date)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">
                                            -{formatPrice(expense.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-500 hover:text-red-600 dark:text-secondary-400 dark:hover:text-red-400" onClick={() => handleDelete(expense.id)}>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addExpense')}>
                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newExpense = {
                        title: formData.get('title'),
                        amount: parseFloat(formData.get('amount')),
                        category: formData.get('category'),
                        date: formData.get('date'),
                    };
                    try {
                        const savedExpense = await api.addExpense(newExpense);
                        setExpenses([savedExpense, ...expenses]);
                        setIsModalOpen(false);
                    } catch (err) {
                        console.error(err);
                    }
                }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('title')}</label>
                        <Input name="title" placeholder="e.g. Grocery Shopping" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('amount')}</label>
                        <Input name="amount" type="number" placeholder="0.00" step="0.01" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('category')}</label>
                        <select name="category" className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
                            {categories.length > 0 ? categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            )) : (
                                <>
                                    <option>Food</option>
                                    <option>Transport</option>
                                    <option>Utilities</option>
                                    <option>Entertainment</option>
                                    <option>Other</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('date')}</label>
                        <Input name="date" type="date" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{t('addExpense')}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
