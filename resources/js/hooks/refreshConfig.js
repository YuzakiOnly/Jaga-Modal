export const refreshConfigs = {
    owner_pos: {
        baseOnly: ['products', 'categories'],
        priorityOnly: [],
        baseInterval: 10000,
        priorityInterval: null,
        idleBaseInterval: 30000,
    },

    owner_history: {
        baseOnly: ['transactions', 'customers', 'summary'],
        priorityOnly: ['transactions'],
        baseInterval: 10000,
        priorityInterval: 4000,
        idleBaseInterval: 30000,
        idlePriorityInterval: 12000,
    },

    owner_dashboard: {
        baseOnly: ['stats', 'sales_chart', 'top_products', 'low_stock_products'],
        priorityOnly: ['stats'],
        baseInterval: 15000,
        priorityInterval: 6000,
        idleBaseInterval: 45000,
        idlePriorityInterval: 20000,
    },

    owner_products: {
        baseOnly: ['products', 'categories'],
        priorityOnly: [],
        baseInterval: 10000,
        priorityInterval: null,
        idleBaseInterval: 30000,
    },

    owner_categories: {
        baseOnly: ['categories', 'counts'],
        priorityOnly: [],
        baseInterval: 30000,
        priorityInterval: null,
        idleBaseInterval: 60000,
    },

    owner_expenses: {
        baseOnly: ['expenses', 'summary', 'storeCashBalance'],
        priorityOnly: ['storeCashBalance'],
        baseInterval: 15000,
        priorityInterval: 5000,
        idleBaseInterval: 45000,
        idlePriorityInterval: 15000,
    },

    owner_wallet: {
        baseOnly: ['transactions', 'summary'],
        priorityOnly: ['summary'],
        baseInterval: 20000,
        priorityInterval: 7000,
        idleBaseInterval: 60000,
        idlePriorityInterval: 25000,
    },

    owner_capital_price: {
        baseOnly: ['templates'],
        priorityOnly: [],
        baseInterval: 60000,
        priorityInterval: null,
        idleBaseInterval: 120000,
    },

    cashier_pos: {
        baseOnly: ['products', 'categories'],
        priorityOnly: ['products'],
        baseInterval: 8000,
        priorityInterval: 3000,
        idleBaseInterval: 25000,
        idlePriorityInterval: 8000,
    },

    cashier_history: {
        baseOnly: ['transactions', 'summary'],
        priorityOnly: ['transactions'],
        baseInterval: 8000,
        priorityInterval: 3000,
        idleBaseInterval: 25000,
        idlePriorityInterval: 8000,
    },

    cashier_dashboard: {
        baseOnly: ['stats', 'sales_chart', 'recent_transactions'],
        priorityOnly: ['stats', 'recent_transactions'],
        baseInterval: 10000,
        priorityInterval: 4000,
        idleBaseInterval: 30000,
        idlePriorityInterval: 12000,
    },

    cashier_expenses: {
        baseOnly: ['expenses', 'summary', 'storeCashBalance'],
        priorityOnly: ['storeCashBalance'],
        baseInterval: 15000,
        priorityInterval: 5000,
        idleBaseInterval: 45000,
        idlePriorityInterval: 15000,
    },
};