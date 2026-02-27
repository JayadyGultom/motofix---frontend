import { useMemo } from 'react';

export type Role = 'ADMIN' | 'KASIR' | 'MEKANIK';

export const usePermission = (user: { role: string } | null) => {
    const role = (user?.role?.toUpperCase() || '') as Role;

    const permissions = useMemo(() => ({
        role,
        isAdmin: role === 'ADMIN',
        isKasir: role === 'KASIR',
        isMekanik: role === 'MEKANIK',

        canManageInventory: role === 'ADMIN' || role === 'KASIR',
        canManageCustomers: role === 'ADMIN' || role === 'KASIR',
        canManageTransactions: role === 'ADMIN' || role === 'KASIR',
        canManageMechanics: role === 'ADMIN',
        canViewFinance: role === 'ADMIN' || role === 'KASIR',

        getActionWarning: (action: 'inventory' | 'customer' | 'mechanic' | 'transaction' | 'finance') => {
            if (role === 'MEKANIK') {
                return "Only Admin/Cashier can perform this action";
            }
            if (role === 'KASIR' && action === 'mechanic') {
                return "Only Admin can perform this action";
            }
            return null;
        },

        getMaskedValue: (value: string | number, type: 'currency' | 'text' = 'text') => {
            if (role === 'MEKANIK' && type === 'currency') {
                return "••••••";
            }
            return value;
        }
    }), [role]);

    return permissions;
};
