import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Trash2, Edit2, User } from 'lucide-react';
import { api } from '../api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        // API delete not implemented yet in backend for users, so just local state for now
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-secondary-500 dark:text-secondary-400">Manage system users and their roles.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50 dark:bg-secondary-800/50 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors dark:border-secondary-700 dark:hover:bg-secondary-800/50">
                                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                                            <div className="bg-primary-100 p-1 rounded-full dark:bg-primary-900/30">
                                                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-secondary-500 dark:text-secondary-400">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400" onClick={() => { setEditingUser(user); setIsModalOpen(true); }}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-500 hover:text-red-600 dark:text-secondary-400 dark:hover:text-red-400" onClick={() => handleDelete(user.id)}>
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

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} title={editingUser ? "Edit User" : "Add New User"}>
                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const userData = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        role: formData.get('role'),
                        status: formData.get('status') || 'Active',
                    };

                    try {
                        if (editingUser) {
                            await api.updateUser(editingUser.id, userData);
                            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
                        } else {
                            // Add user logic (would need backend endpoint for admin to create user)
                            // For now, we'll just focus on editing since registration handles creation
                            alert("To add a user, please use the registration page.");
                        }
                        setIsModalOpen(false);
                        setEditingUser(null);
                    } catch (err) {
                        console.error(err);
                    }
                }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input name="name" defaultValue={editingUser?.name} placeholder="John Doe" required disabled={!!editingUser} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input name="email" type="email" defaultValue={editingUser?.email} placeholder="john@example.com" required disabled={!!editingUser} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select name="role" defaultValue={editingUser?.role} className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select name="status" defaultValue={editingUser?.status} className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>Cancel</Button>
                        <Button type="submit">{editingUser ? "Update User" : "Add User"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
