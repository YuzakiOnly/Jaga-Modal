import SidebarLayout from "@/Layouts/admin/sidebar/SidebarLayout";

export default function Home() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back!</p>
        </div>
    );
}

Home.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
