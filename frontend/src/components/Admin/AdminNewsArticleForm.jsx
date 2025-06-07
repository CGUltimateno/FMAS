import React, { useState } from 'react';
import { useCreateNewsArticleMutation } from '../../services/footballApi';
import '../../styles/Admin/AdminNewsArticleForm.scss';

const AdminNewsArticleForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [sourceStr, setSourceStr] = useState('Admin');
    const [createNewsArticle, { isLoading, isSuccess, isError, error }] = useCreateNewsArticleMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Title and content are required.');
            return;
        }
        try {
            await createNewsArticle({ title, content, imageUrl, sourceStr, page: { url: '#' } }).unwrap();
            setTitle('');
            setContent('');
            setImageUrl('');
            alert('News article created successfully!');
        } catch (err) {
            console.error('Failed to create news article: ', err);
            alert(`Error: ${err.data?.message || err.message || 'Failed to create article'}`);
        }
    };

    return (
        <div className="admin-card news-form-card">
            <div className="admin-card-header">
                <h3>Create News Article</h3>
                <p className="subtitle">Add a new article to be published on the site</p>
            </div>

            <div className="admin-card-content">
                <form onSubmit={handleSubmit} className="admin-news-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">
                                <i className="form-icon">📝</i> Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter article title"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="content">
                                <i className="form-icon">📄</i> Content
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your article content here..."
                                rows="6"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-row two-columns">
                        <div className="form-group">
                            <label htmlFor="imageUrl">
                                <i className="form-icon">🖼️</i> Image URL
                            </label>
                            <input
                                type="text"
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg (optional)"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sourceStr">
                                <i className="form-icon">📰</i> Source
                            </label>
                            <input
                                type="text"
                                id="sourceStr"
                                value={sourceStr}
                                onChange={(e) => setSourceStr(e.target.value)}
                                placeholder="Admin"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading} className="submit-btn">
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="btn-icon">✚</i>
                                    Create Article
                                </>
                            )}
                        </button>
                    </div>

                    {isSuccess && (
                        <div className="notification success">
                            <i className="notification-icon">✓</i>
                            Article created successfully!
                        </div>
                    )}

                    {isError && (
                        <div className="notification error">
                            <i className="notification-icon">⚠</i>
                            {error?.data?.message || error?.message || 'Failed to create article'}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminNewsArticleForm;