export const roleLabel = (role) => {
    const map = {
        super_admin: "Super Admin",
        owner: "Owner",
        admin: "Admin",
        staff: "Staff",
        cashier: "Cashier"
    };

    return map[role] ?? role;
};
