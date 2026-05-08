export const roleLabel = (role) => {
    const map = {
        admin: "Admin",
        owner: "Owner",
        cashier: "Cashier"
    };

    return map[role] ?? role;
};
