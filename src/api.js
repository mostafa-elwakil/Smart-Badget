const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    register: async (name, email, password) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json(); // Returns message
    },

    verifyEmail: async (token) => {
        const res = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },

    forgotPassword: async (email) => {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },

    resetPassword: async (token, newPassword) => {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    // Expenses
    getExpenses: async () => {
        const res = await fetch(`${API_URL}/expenses`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch expenses');
        return res.json();
    },
    addExpense: async (data) => {
        const res = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add expense');
        return res.json();
    },
    deleteExpense: async (id) => {
        const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete expense');
        return res.json();
    },

    // Income
    getIncome: async () => {
        const res = await fetch(`${API_URL}/income`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch income');
        return res.json();
    },
    addIncome: async (data) => {
        const res = await fetch(`${API_URL}/income`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add income');
        return res.json();
    },
    deleteIncome: async (id) => {
        const res = await fetch(`${API_URL}/income/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete income');
        return res.json();
    },

    // Shopping List
    getShoppingItems: async () => {
        const res = await fetch(`${API_URL}/shopping`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch shopping items');
        return res.json();
    },
    addShoppingItem: async (data) => {
        const res = await fetch(`${API_URL}/shopping`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
    },
    updateShoppingItem: async (id, data) => {
        const res = await fetch(`${API_URL}/shopping/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update item');
        return res.json();
    },
    deleteShoppingItem: async (id) => {
        const res = await fetch(`${API_URL}/shopping/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete item');
        return res.json();
    },

    // Users
    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },
    updateUser: async (id, data) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },
};
