import React from 'react';
import AdminPopularLeagues from '../components/Admin/AdminPopularLeagues';
import AdminNewsArticleForm from '../components/Admin/AdminNewsArticleForm';
import AdminNewsList from '../components/Admin/AdminNewsList';
import ClubFollowerAnalysis from '../components/Admin/ClubFollowerAnalysis';

const AdminDashboardPage = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <AdminPopularLeagues />
            <AdminNewsArticleForm />
            <AdminNewsList /> {/* Add the new component here */}
            <ClubFollowerAnalysis />
            {/* Add other admin-specific content and features here */}
        </div>
    );
};

export default AdminDashboardPage;
