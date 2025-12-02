import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function Categories() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedColor, setSelectedColor] = useState('bg-blue-500');
    const [type, setType] = useState('expense');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory) return;
        try {
            const added = await api.addCategory({ name: newCategory, color: selectedColor, type });
            setCategories([...categories, added]);
            setNewCategory('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('categories')}</h2>
                <p className="text-secondary-500 dark:text-secondary-400">Manage your spending categories.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('addCategory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('title')}</label>
                                <Input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Category Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full ${color} ring-offset-2 ${selectedColor === color ? 'ring-2 ring-primary-500' : ''} dark:ring-offset-secondary-800`}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit">{t('addCategory')}</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('categories')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 border border-secondary-100 rounded-lg bg-white dark:bg-secondary-800 dark:border-secondary-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                                        <span className="font-medium">{cat.name}</span>
                                        <span className="text-xs text-secondary-400">({cat.type})</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
