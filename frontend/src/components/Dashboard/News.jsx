import React, { useState } from "react";
import "../../styles/Dashboard/News.scss";
import { useGetAllNewsQuery } from "../../services/footballApi";

const News = () => {
    const [activeTab, setActiveTab] = useState("All News");
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { data: newsData, error, isLoading } = useGetAllNewsQuery();

    const truncateDescription = (text) => {
        const maxLength = 74;
        if (text.length <= maxLength) return text;

        const truncatedText = text.substring(0, maxLength);
        const lastSpaceIndex = truncatedText.lastIndexOf(" ");
        return truncatedText.substring(0, lastSpaceIndex) + "...";
    };

    const handleReadMore = (article, e) => {
        e.preventDefault();
        setSelectedArticle(article);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedArticle(null);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading news: {error.message || JSON.stringify(error)}</div>;

    const articles = newsData || [];

    return (
        <div className="news-container">
            <div className="news-header">
                <h2 className="news-title">📰 All News and Transfer Today</h2>
            </div>

            <div className="news-grid">
                {Array.isArray(articles) && articles.length > 0 ? (
                    articles.map((item, index) => (
                        <div key={item._id || item.id || index} className="news-card">
                            <img src={item.imageUrl || 'default-news-image.png'} alt={item.title} className="news-image" />
                            <span className="news-category">{item.sourceStr || 'News'}</span>
                            <h3 className="news-card-title">{item.title}</h3>
                            <p className="news-card-description">
                                {truncateDescription(item.content || item.title)}
                            </p>
                            <a href="#" className="news-link" onClick={(e) => handleReadMore(item, e)}>Read more</a>
                        </div>
                    ))
                ) : (
                    <p>No news articles available at the moment.</p>
                )}
            </div>

            {/* News Article Modal */}
            {showModal && selectedArticle && (
                <div className="news-modal-overlay" onClick={handleCloseModal}>
                    <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={handleCloseModal}>×</button>
                        {selectedArticle.imageUrl && (
                            <img
                                src={selectedArticle.imageUrl}
                                alt={selectedArticle.title}
                                className="modal-image"
                            />
                        )}
                        <span className="modal-category">{selectedArticle.sourceStr || 'News'}</span>
                        <h2 className="modal-title">{selectedArticle.title}</h2>
                        <p className="modal-date">
                            {new Date(selectedArticle.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <div className="modal-content">
                            {selectedArticle.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;