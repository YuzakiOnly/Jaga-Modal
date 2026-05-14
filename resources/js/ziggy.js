const Ziggy = {
  url: "http:\/\/localhost:8000",
  port: 8000,
  defaults: {},
  routes: {
    dashboard: {
      uri: "dashboard",
      methods: ["GET", "HEAD"],
    },
    store: {
      uri: "store",
      methods: ["GET", "HEAD"],
    },
    revenue: {
      uri: "revenue",
      methods: ["GET", "HEAD"],
    },
    products: {
      uri: "products",
      methods: ["GET", "HEAD"],
    },
    orders: {
      uri: "orders",
      methods: ["GET", "HEAD"],
    },
    "orders.pending": {
      uri: "orders\/pending",
      methods: ["GET", "HEAD"],
    },
    "orders.completed": {
      uri: "orders\/completed",
      methods: ["GET", "HEAD"],
    },
    settings: {
      uri: "settings",
      methods: ["GET", "HEAD"],
    },
    "admin.dashboard": {
      uri: "admin\/dashboard",
      methods: ["GET", "HEAD"],
    },
    "admin.analytics": {
      uri: "admin\/analytics",
      methods: ["GET", "HEAD"],
    },
    "admin.reports": {
      uri: "admin\/reports",
      methods: ["GET", "HEAD"],
    },
    "admin.users": {
      uri: "admin\/users",
      methods: ["GET", "HEAD"],
    },
    "admin.users.create": {
      uri: "admin\/users\/create",
      methods: ["GET", "HEAD"],
    },
    "admin.users.store": {
      uri: "admin\/users",
      methods: ["POST"],
    },
    "admin.users.edit": {
      uri: "admin\/users\/{user}\/edit",
      methods: ["GET", "HEAD"],
      parameters: ["user"],
      bindings: { user: "id" },
    },
    "admin.users.update": {
      uri: "admin\/users\/{user}",
      methods: ["PUT"],
      parameters: ["user"],
      bindings: { user: "id" },
    },
    "admin.users.destroy": {
      uri: "admin\/users\/{user}",
      methods: ["DELETE"],
      parameters: ["user"],
      bindings: { user: "id" },
    },
    "admin.users.roles": {
      uri: "admin\/users\/roles",
      methods: ["GET", "HEAD"],
    },
    "admin.security": {
      uri: "admin\/security",
      methods: ["GET", "HEAD"],
    },
    login: {
      uri: "login",
      methods: ["GET", "HEAD"],
    },
    register: {
      uri: "register",
      methods: ["GET", "HEAD"],
    },
    "verify.phone": {
      uri: "verify-phone",
      methods: ["GET", "HEAD"],
    },
    "verify.phone.submit": {
      uri: "verify-phone",
      methods: ["POST"],
    },
    "verify.phone.resend": {
      uri: "verify-phone\/resend",
      methods: ["POST"],
    },
    logout: {
      uri: "logout",
      methods: ["POST"],
    },
    "store.setup": {
      uri: "setup-store",
      methods: ["GET", "HEAD"],
    },
    "store.setup.save": {
      uri: "setup-store",
      methods: ["POST"],
    },
    "language.switch": {
      uri: "language\/switch",
      methods: ["POST"],
    },
    "storage.local": {
      uri: "storage\/{path}",
      methods: ["GET", "HEAD"],
      wheres: { path: ".*" },
      parameters: ["path"],
    },
  },
};
if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
