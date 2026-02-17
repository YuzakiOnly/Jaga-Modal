import LanguageSelector from "@/components/language/LanguageSelector";
import { Link } from "@inertiajs/react";

export default function Home() {
    return (
        <div>
            <LanguageSelector />

            <h1 className="text-red-500">Dashboard</h1>
            <Link href="/login">Tambah Baranefefg</Link>
        </div>
    );
}
