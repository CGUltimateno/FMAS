import React, {useState} from "react";
import "../../styles/News.scss";

const newsData = [
  {
    category: "PREMIER LEAGUE",
    title: "Signs of Arsenal getting stronger in the Premier League",
    description: "The victory over Wolves provided a comfortable distance for Arsenal at the top of the Premier League standings.",
    image: "https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Untitled_e0chkol9.jpeg?h=d1cb525d&auto=webp&itok=Nn5eLNQM"
  },
  {
    category: "PREMIER LEAGUE",
    title: "Erling Haaland Leads Premier League Top Scorers 2022",
    description: "Until the competition break for the 2022 World Cup in Qatar, Haaland remains the top scorer for the 2022/2023 Premier League season.",
    image: "https://content.api.news/v3/images/bin/5a9010b762b50c56c8b717050a0bcfdf"
  },
  {
    category: "PREMIER LEAGUE",
    title: "Chelsea humiliated 1-4 at Brighton's home",
    description: "Chelsea suffered a heavy 1-4 defeat when they visited Brighton's home ground in Matchday 14 of the English Premier League at the Amex Stadium on Saturday night.",
    image: "https://cdn.vanguardngr.com/wp-content/uploads/2022/10/skysports-leandro-trossard_5947395.jpg"
  },
  {
    category: "PREMIER LEAGUE",
    title: "Garnacho leads Manchester United to beat Fulham",
    description: "Alejandro Garnacho scored a stoppage-time winner, leading Manchester United to a 2-1 victory over Fulham.",
    image: "https://e0.365dm.com/22/11/2048x1152/skysports-alejandro-garnacho_5965135.jpg?20221113183112"
  },
  {
    category: "EUROPA LEAGUE",
    title: "West Ham United Advances to Europa League Quarterfinals",
    description: "West Ham United secured their spot in the Europa League quarterfinals after a thrilling 2-1 victory over Sevilla.",
    image: "https://dims.apnews.com/dims4/default/c85901e/2147483647/strip/true/crop/3000x1688+0+156/resize/1440x810!/quality/90/?url=https%3A%2F%2Fstorage.googleapis.com%2Fafs-prod%2Fmedia%2F3c875a86050b47718e608aa8ba9f2141%2F3000.jpeg"
  },
  {
    category: "TRANSFER NEWS",
    title: "Real Madrid Signs Jude Bellingham for €120M",
    description: "Real Madrid has officially announced the signing of Jude Bellingham from Borussia Dortmund for a staggering €120 million.",
    image: "https://cdn.prod.website-files.com/64faf35daaaeae4552082444/652397b9d232d30b4d34fa6d_648b4940870084c5740233d8_GettyImages-1498662584-min.webp"
  },
  {
    category: "CHAMPIONS LEAGUE",
    title: "Manchester City Wins First Champions League Title",
    description: "Manchester City made history by winning their first-ever UEFA Champions League title after defeating Inter Milan 1-0.",
    image: "https://wimg.heraldcorp.com/content/default/2023/06/11/20230611000024_0.jpg"
  },
  {
    category: "WORLD CUP",
    title: "Argentina Wins 2022 FIFA World Cup in Dramatic Final",
    description: "Argentina defeated France in a dramatic penalty shootout to win the 2022 FIFA World Cup in Qatar.",
    image: "https://s.france24.com/media/display/e95c1ef6-7f04-11ed-9f88-005056bf30b7/w:1280/p:16x9/000_334Q7CG.jpg"
  },
];

;const News = () => {
  const [activeTab, setActiveTab] = useState("All News");

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

  return (
      <div className="news-container">
        <div className="news-header">
          <h2 className="news-title">📰 All News and Transfer Today</h2>
          <div className="news-tabs">
          <span
              className={`tab ${activeTab === "All News" ? "active" : ""}`}
              onClick={() => handleTabClick("All News")}
          >
            All News
          </span>
            <span
                className={`tab ${activeTab === "Hot News" ? "active" : ""}`}
                onClick={() => handleTabClick("Hot News")}
            >
            Hot News
          </span>
            <span
                className={`tab ${activeTab === "Transfer" ? "active" : ""}`}
                onClick={() => handleTabClick("Transfer")}
            >
            Transfer
          </span>
          </div>
        </div>

        <div className="news-grid">
          {newsData.map((item, index) => (
              <div key={index} className="news-card">
                <img src={item.image} alt={item.title} className="news-image"/>
                <span className="news-category">{item.category}</span>
                <h3 className="news-card-title">{item.title}</h3>
                <p className="news-card-description">
                  {truncateDescription(item.description)}
                </p>
              </div>
          ))}
        </div>
      </div>
  );
};

export default News;