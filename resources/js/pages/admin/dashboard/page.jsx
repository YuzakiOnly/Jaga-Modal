import AppLayout from "@/layouts/dashboard/AppLayout";

export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>admin</p>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
