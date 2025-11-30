import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

const initialCategories = [
    { id: 1, name: 'Housing', color: 'bg-blue-500' },
    { id: 2, name: 'Food', color: 'bg-green-500' },
    { id: 3, name: 'Transport', color: 'bg-yellow-500' },
    { id: 4, name: 'Utilities', color: 'bg-indigo-500' },
    { id: 5, name: 'Entertainment', color: 'bg-pink-500' },
];

export default function Categories() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                <p className="text-secondary-500 dark:text-secondary-400">Manage your spending categories.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input placeholder="Category Name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2">
                                    {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'].map(color => (
                                        <button key={color} type="button" className={`w-8 h-8 rounded-full ${color} ring-offset-2 focus:ring-2 ring-secondary-300 dark:ring-offset-secondary-800`}></button>
                                    ))}
                                </div>
                            </div>
                            <Button>Add Category</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {initialCategories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 border border-secondary-100 rounded-lg bg-white dark:bg-secondary-800 dark:border-secondary-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                                        <span className="font-medium">{cat.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400">
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
