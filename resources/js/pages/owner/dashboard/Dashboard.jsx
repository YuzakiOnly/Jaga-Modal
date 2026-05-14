import AppLayout from "@/layouts/dashboard/AppLayout";

export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Owner</p>
            <h1 className="font-poppins">Hello</h1>

            <code className="font-jetbrains">npm run dev</code>

            <p className="font-manrope">Dashboard modern</p>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
