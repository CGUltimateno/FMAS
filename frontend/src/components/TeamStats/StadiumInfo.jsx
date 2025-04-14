import React from "react";
import "../../styles/TeamStats/StadiumInfo.scss";

const StadiumInfo = ({ details, additionalDetails }) => {
    const stadiumDetails = additionalDetails?.response?.details?.faqJSONLD?.mainEntity || [];
    const stadiumCapacityText = stadiumDetails.find(item => item.name.includes("capacity"))?.acceptedAnswer?.text;
    const stadiumOpenedText = stadiumDetails.find(item => item.name.includes("opened"))?.acceptedAnswer?.text;
    const stadiumCapacity = stadiumCapacityText ? stadiumCapacityText.match(/\d+/)?.[0] : null;
    const stadiumOpened = stadiumOpenedText ? stadiumOpenedText.match(/\d+/)?.[0] : null;
    const stadiumLocation = additionalDetails?.response?.details?.sportsTeamJSONLD?.location?.address?.addressLocality;
    const stadiumSurface = "Grass";

    return (
        <div className="stadium-wrapper">
            <h2 className="stadium-title">Stadium</h2>

            <div className="stadium-info">
                <p className="stadium-venue">{details.venue}</p>
                {stadiumLocation && <p className="stadium-location">{stadiumLocation}</p>}
            </div>

            <hr className="stadium-divider" />

            <div className="stadium-stats-row">
                {stadiumCapacity && (
                    <div className="stadium-stats-item">
                        <p className="stat-value">{parseInt(stadiumCapacity).toLocaleString()}</p>
                        <p className="stat-label">Capacity</p>
                    </div>
                )}
                {stadiumOpened && (
                    <div className="stadium-stats-item">
                        <p className="stat-value">{stadiumOpened}</p>
                        <p className="stat-label">Opened</p>
                    </div>
                )}
                <div className="stadium-stats-item">
                    <p className="stat-value">{stadiumSurface}</p>
                    <p className="stat-label">Surface</p>
                </div>
            </div>
        </div>
    );
};

export default StadiumInfo;
