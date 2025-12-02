import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Check, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function ShoppingList() {
    const { t } = useLanguage();
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const { formatPrice } = useCurrency();

    // Purchase Modal State
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await api.getShoppingItems();
            setItems(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem) return;
        try {
            const item = { name: newItem, price: parseFloat(newPrice) || 0 };
            const savedItem = await api.addShoppingItem(item);
            setItems([savedItem, ...items]);
            setNewItem('');
            setNewPrice('');
        } catch (err) {
            console.error(err);
        }
    };

    const toggleItem = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item.purchased) {
            // If marking as purchased, open modal
            setSelectedItem(item);
            setPurchasePrice(item.price.toString());
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setIsPurchaseModalOpen(true);
        } else {
            // If unmarking, just toggle
            try {
                await api.updateShoppingItem(id, { purchased: false });
                setItems(items.map(i => i.id === id ? { ...i, purchased: false } : i));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handlePurchaseConfirm = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        try {
            // 1. Update shopping item as purchased
            await api.updateShoppingItem(selectedItem.id, { purchased: true });

            // 2. Add as expense
            const expense = {
                title: selectedItem.name,
                amount: parseFloat(purchasePrice) || 0,
                category: 'Shopping', // Default category for shopping list items
                date: purchaseDate
            };
            await api.addExpense(expense);

            // 3. Update local state
            setItems(items.map(i => i.id === selectedItem.id ? { ...i, purchased: true, price: parseFloat(purchasePrice) || i.price } : i));

            // 4. Close modal
            setIsPurchaseModalOpen(false);
            setSelectedItem(null);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.deleteShoppingItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const purchasedTotal = items.filter(i => i.purchased).reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('shopping')}</h2>
                <p className="text-secondary-500">Plan your purchases.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('addItem')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={addItem} className="flex gap-2">
                                <Input
                                    placeholder={t('title')}
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder={t('amount')}
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    className="w-24"
                                    step="0.01"
                                />
                                <Button type="submit">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
                                {items.map((item) => (
                                    <div key={item.id} className={cn("flex items-center justify-between p-4 transition-colors", item.purchased ? "bg-secondary-50 dark:bg-secondary-800/50" : "bg-white dark:bg-secondary-800")}>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                                                    item.purchased ? "bg-primary-600 border-primary-600 text-white" : "border-secondary-300 hover:border-primary-500 dark:border-secondary-600"
                                                )}
                                            >
                                                {item.purchased && <Check className="h-3 w-3" />}
                                            </button>
                                            <span className={cn("font-medium", item.purchased && "text-secondary-400 line-through dark:text-secondary-500")}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">{formatPrice(item.price)}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-400 hover:text-red-600 dark:text-secondary-500 dark:hover:text-red-400" onClick={() => deleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="p-8 text-center text-secondary-500">
                                        <ShoppingCart className="mx-auto h-12 w-12 opacity-20 mb-2" />
                                        <p>Your shopping list is empty</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800">
                        <CardHeader>
                            <CardTitle className="text-primary-900 dark:text-primary-100">{t('summary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-700 dark:text-primary-300">Total Items</span>
                                <span className="font-medium text-primary-900 dark:text-primary-100">{items.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-700 dark:text-primary-300">Purchased</span>
                                <span className="font-medium text-primary-900 dark:text-primary-100">{items.filter(i => i.purchased).length}</span>
                            </div>
                            <div className="border-t border-primary-200 pt-4 dark:border-primary-800">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Estimated Total</span>
                                    <span className="text-2xl font-bold text-primary-900 dark:text-primary-100">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-baseline mt-1">
                                    <span className="text-xs text-primary-600 dark:text-primary-400">Already Spent</span>
                                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{formatPrice(purchasedTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Confirm Purchase">
                <form onSubmit={handlePurchaseConfirm} className="space-y-4">
                    <p className="text-sm text-secondary-500">
                        Confirming this item will mark it as purchased and add it to your expenses.
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('title')}</label>
                        <Input value={selectedItem?.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Actual Price</label>
                        <Input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('date')}</label>
                        <Input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsPurchaseModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Confirm Purchase</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
