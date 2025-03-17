// js/pages/dashboard.tsx
import { Head } from "@inertiajs/react";
import Layout from "../Layouts/layout"; // Adjust path based on your structure

const Dashboard: React.FC = () => {
    return (
        <>
            <Head title="Simlatek - Dashboard" />
            <Layout currentActive="dashboard">
                <h1 className="text-3xl p-8 font-semibold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
            </Layout>
        </>
    );
};

export default Dashboard;
