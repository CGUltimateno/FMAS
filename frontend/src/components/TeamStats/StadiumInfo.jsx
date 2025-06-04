import React from "react";
import "../../styles/TeamStats/StadiumInfo.scss";
import { FaMapMarkerAlt, FaBuilding, FaCalendarAlt, FaLayerGroup, FaUsers } from "react-icons/fa";

const StadiumInfo = ({ venue, team }) => {
    if (!venue) {
        return (
            <div className="stadium-wrapper">
                <h2 className="stadium-title">Stadium</h2>
                <p>No stadium information available</p>
            </div>
        );
    }

    return (
        <div className="stadium-card">
            {/* Stadium Image Section */}
            <div className="stadium-image-container">
                {venue.image ? (
                    <img src={venue.image} alt={venue.name} className="stadium-image" />
                ) : (
                    <div className="stadium-image-placeholder">
                        <FaBuilding className="placeholder-icon" />
                    </div>
                )}
                <div className="stadium-image-overlay">
                    <h2 className="stadium-name">{venue.name}</h2>
                </div>
            </div>

            {/* Stadium Details Section */}
            <div className="stadium-details">
                <h3 className="section-title">Stadium Info</h3>

                <div className="info-row">
                    <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Location</span>
                            <span className="info-value">{venue.city}{venue.address ? `, ${venue.address}` : ''}</span>
                        </div>
                    </div>
                </div>

                <div className="info-stats">
                    {venue.capacity && (
                        <div className="stat-item">
                            <FaUsers className="stat-icon" />
                            <span className="stat-value">{parseInt(venue.capacity).toLocaleString()}</span>
                            <span className="stat-label">Capacity</span>
                        </div>
                    )}

                    {team.founded && (
                        <div className="stat-item">
                            <FaCalendarAlt className="stat-icon" />
                            <span className="stat-value">{team.founded}</span>
                            <span className="stat-label">Founded</span>
                        </div>
                    )}

                    {venue.surface && (
                        <div className="stat-item">
                            <FaLayerGroup className="stat-icon" />
                            <span className="stat-value">
                                {venue.surface.charAt(0).toUpperCase() + venue.surface.slice(1)}
                            </span>
                            <span className="stat-label">Surface</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StadiumInfo;