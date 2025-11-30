import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const currencyConfig = {
    USD: { locale: 'en-US', symbol: '$' },
    EUR: { locale: 'en-IE', symbol: '€' },
    GBP: { locale: 'en-GB', symbol: '£' },
    EGP: { locale: 'ar-EG', symbol: 'E£' },
    SAR: { locale: 'ar-SA', symbol: 'SAR' },
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('currency');
            return saved && currencyConfig[saved] ? saved : 'USD';
        }
        return 'USD';
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const formatPrice = (amount) => {
        const config = currencyConfig[currency];
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencyConfig }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
