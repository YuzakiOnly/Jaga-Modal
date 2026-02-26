import OwnerLayout from "@/layouts/dashboard/OwnerLayout";

export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Owner</p>
        </div>
    );
}

Dashboard.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;
