export const roleLabel = (role) => {
    const map = {
        super_admin: "Super Admin",
        owner: "Owner",
        cashier: "Cashier"
    };

    return map[role] ?? role;
};
