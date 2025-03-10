import Layout from "../Layouts/layout";
import { Helmet } from "react-helmet";

export default function dashboard() {
    return (
        <>
            <Helmet>
                <title>Simlatek - Dashboard</title>
            </Helmet>
            <Layout currentActive="dashboard">
                <h1 className="text-3xl p-8 font-semibold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
            </Layout>
        </>
    );
}
