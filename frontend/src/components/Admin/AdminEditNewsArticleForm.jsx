import React, { useState, useEffect } from 'react';
import { useUpdateNewsArticleMutation } from '../../services/footballApi';
import '../../styles/Admin/AdminEditNewsArticleForm.scss';

const AdminEditNewsArticleForm = ({ article, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [sourceStr, setSourceStr] = useState('');
    const [updateNewsArticle, { isLoading, error }] = useUpdateNewsArticleMutation();

    useEffect(() => {
        if (article) {
            setTitle(article.title || '');
            setContent(article.content || '');
            setImageUrl(article.imageUrl || '');
            setSourceStr(article.sourceStr || 'Admin');
        }
    }, [article]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Title and content are required.');
            return;
        }
        try {
            const updateData = {
                id: article.id,
                title,
                content,
                imageUrl,
                sourceStr,
                ...(article.page && { page: article.page })
            };

            await updateNewsArticle(updateData).unwrap();
            alert('News article updated successfully!');
            onClose();
        } catch (err) {
            console.error('Failed to update news article: ', err);
            alert(`Error: ${err.data?.message || err.message || 'Failed to update article'}`);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit News Article</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="edit-news-form">
                        <div className="form-group">
                            <label htmlFor="edit-title">
                                <i className="form-icon">📝</i> Title
                            </label>
                            <input
                                type="text"
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter article title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-content">
                                <i className="form-icon">📄</i> Content
                            </label>
                            <textarea
                                id="edit-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your article content here..."
                                rows="8"
                                required
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-imageUrl">
                                    <i className="form-icon">🖼️</i> Image URL
                                </label>
                                <input
                                    type="text"
                                    id="edit-imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg (optional)"
                                />
                                {imageUrl && (
                                    <div className="image-preview">
                                        <img src={imageUrl} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-sourceStr">
                                    <i className="form-icon">📰</i> Source
                                </label>
                                <input
                                    type="text"
                                    id="edit-sourceStr"
                                    value={sourceStr}
                                    onChange={(e) => setSourceStr(e.target.value)}
                                    placeholder="Admin"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <i className="error-icon">⚠️</i>
                                {error.data?.message || error.message || 'An error occurred'}
                            </div>
                        )}
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                    <button
                        type="button"
                        className="save-button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="btn-icon">💾</i>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditNewsArticleForm;