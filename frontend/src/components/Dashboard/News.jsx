import React, { useState } from "react";
import "../../styles/Dashboard/News.scss";

const News = () => {
  const [activeTab, setActiveTab] = useState("All News");
  const { data: newsData, error, isLoading } = [];

  const truncateDescription = (text) => {
    const maxLength = 74;
    if (text.length <= maxLength) return text;

    const truncatedText = text.substring(0, maxLength);
    const lastSpaceIndex = truncatedText.lastIndexOf(" ");
    return truncatedText.substring(0, lastSpaceIndex) + "...";
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading news</div>;

  return (
      <div className="news-container">
        <div className="news-header">
          <h2 className="news-title">📰 All News and Transfer Today</h2>
        </div>

        <div className="news-grid">
          {newsData.response.news.map((item, index) => (
              <div key={index} className="news-card">
                <img src={item.imageUrl} alt={item.title} className="news-image" />
                <span className="news-category">{item.sourceStr}</span>
                <h3 className="news-card-title">{item.title}</h3>
                <p className="news-card-description">
                  {truncateDescription(item.title)}
                </p>
                <a href={item.page.url} className="news-link">Read more</a>
              </div>
          ))}
        </div>
      </div>
  );
};

export default News;