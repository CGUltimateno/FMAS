import React from 'react';
import { useGetClubFollowerAnalysisQuery } from '../../services/footballApi';
import "../../styles/Admin/ClubFollowerAnalysis.scss";

const ClubFollowerAnalysis = () => {
    const { data: analysisData, error, isLoading, isFetching } = useGetClubFollowerAnalysisQuery();

    if (isLoading || isFetching) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading club follower analysis...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-icon">!</div>
            <p>Error loading analysis data: {error.data?.message || error.error}</p>
        </div>
    );

    if (!analysisData || analysisData.length === 0) return (
        <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No follower analysis data available.</p>
        </div>
    );

    return (
        <div className="club-analysis-container">
            <header className="analysis-header">
                <h2>Club Follower Analysis</h2>
                <p className="subtitle">Tracking fan engagement across teams</p>
            </header>

            <div className="stats-summary">
                <div className="stat-card total">
                    <span className="stat-label">Total Clubs</span>
                    <span className="stat-value">{analysisData.length}</span>
                </div>
                <div className="stat-card followers">
                    <span className="stat-label">Total Followers</span>
                    <span className="stat-value">
                        {analysisData.reduce((sum, club) => sum + club.totalFollowers, 0)}
                    </span>
                </div>
            </div>

            <div className="club-cards-grid">
                {analysisData.map((club) => (
                    <div key={club.clubId} className="club-card">
                        <div className="club-header">
                            <div className="club-avatar">{club.clubName.charAt(0)}</div>
                            <div className="club-info">
                                <h3 className="club-name">{club.clubName}</h3>
                                <span className="club-id">ID: {club.clubId}</span>
                            </div>
                            <div className="follower-badge">
                                <span className="follower-count">{club.totalFollowers}</span>
                                <span className="follower-label">Followers</span>
                            </div>
                        </div>

                        <div className="analytics-section">
                            <h4>Follower Demographics</h4>
                            {Object.keys(club.followerDemographics || {}).length > 0 ? (
                                <div className="demographics-chart">
                                    {Object.entries(club.followerDemographics).map(([region, count]) => (
                                        <div key={region} className="chart-bar">
                                            <div className="bar-label">{region}</div>
                                            <div className="bar-container">
                                                <div
                                                    className="bar-fill"
                                                    style={{
                                                        width: `${(count / club.totalFollowers) * 100}%`,
                                                        minWidth: '10%'
                                                    }}
                                                ></div>
                                                <span className="bar-value">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-chart">
                                    <p>No demographic data available</p>
                                </div>
                            )}
                        </div>

                        <div className="analytics-section">
                            <h4>Growth Timeline</h4>
                            {club.followerGrowth && club.followerGrowth.length > 0 ? (
                                <div className="growth-timeline">
                                    {club.followerGrowth.map((point, index) => (
                                        <div key={point.date} className="timeline-point">
                                            <div className="point-date">
                                                {new Date(point.date).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="point-connector">
                                                <div className="connector-dot"></div>
                                                {index < club.followerGrowth.length - 1 && <div className="connector-line"></div>}
                                            </div>
                                            <div className="point-value">{point.count} followers</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-chart">
                                    <p>No growth data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClubFollowerAnalysis;