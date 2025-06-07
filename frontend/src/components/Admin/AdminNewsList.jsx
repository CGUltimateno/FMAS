import React, { useState } from 'react';
import { useGetAllNewsQuery, useDeleteNewsArticleMutation } from '../../services/footballApi';
import AdminEditNewsArticleForm from './AdminEditNewsArticleForm.jsx';
import '../../styles/Admin/AdminNewsList.scss';

const AdminNewsList = () => {
    const { data: articles, error, isLoading, refetch } = useGetAllNewsQuery();
    const [deleteNewsArticle, { isLoading: isDeleting }] = useDeleteNewsArticleMutation();
    const [editingArticle, setEditingArticle] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteNewsArticle(id).unwrap();
                refetch();
            } catch (err) {
                console.error('Failed to delete article:', err);
                alert(`Error: ${err.data?.message || err.message || 'Failed to delete article'}`);
            }
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
    };

    const handleCloseEditForm = () => {
        setEditingArticle(null);
        refetch();
    };

    if (isLoading) return (
        <div className="admin-card loading-state">
            <div className="spinner"></div>
            <p>Loading news articles...</p>
        </div>
    );

    if (error) return (
        <div className="admin-card error-state">
            <i className="error-icon">⚠</i>
            <p>Error loading news articles: {error.data?.message || error.message}</p>
        </div>
    );

    return (
        <div className="admin-card news-list-card">
            <div className="admin-card-header">
                <h3>Manage News Articles</h3>
                <p className="subtitle">View, edit, and delete published articles</p>
                <div className="articles-count">
                    <span className="count-badge">{articles?.length || 0}</span> Articles
                </div>
            </div>

            <div className="admin-card-content">
                {!articles || articles.length === 0 ? (
                    <div className="empty-state">
                        <i className="empty-icon">📰</i>
                        <p>No news articles found</p>
                        <p className="empty-hint">Create your first article using the form above</p>
                    </div>
                ) : (
                    <div className="admin-news-list">
                        {articles.map((article) => (
                            <div key={article.id} className="news-item-card">
                                <div className="news-item-header">
                                    <h4 className="news-title">{article.title}</h4>
                                    <div className="news-meta">
                                        <span className="news-source">
                                            <i className="meta-icon">📰</i> {article.sourceStr}
                                        </span>
                                        <span className="news-date">
                                            <i className="meta-icon">📅</i> {new Date(article.createdAt).toLocaleDateString()}
                                        </span>
                                        {article.updatedAt && (
                                            <span className="news-updated">
                                                <i className="meta-icon">🔄</i> Updated: {new Date(article.updatedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="news-content">
                                    {article.imageUrl && (
                                        <div className="news-image">
                                            <img src={article.imageUrl} alt={article.title} />
                                        </div>
                                    )}
                                    <p className="news-excerpt">{article.content.substring(0, 150)}...</p>
                                </div>

                                <div className="news-actions">
                                    <button onClick={() => handleEdit(article)} className="edit-btn">
                                        <i className="btn-icon">✏️</i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        disabled={isDeleting}
                                        className="delete-btn"
                                    >
                                        <i className="btn-icon">🗑️</i> {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingArticle && (
                <AdminEditNewsArticleForm
                    article={editingArticle}
                    onClose={handleCloseEditForm}
                />
            )}
        </div>
    );
};

export default AdminNewsList;