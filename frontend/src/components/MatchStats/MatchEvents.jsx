// frontend/src/components/MatchStats/MatchEvents.jsx
import React from "react";
import {
    FaFutbol, FaExchangeAlt,
    FaClock, FaCaretRight
} from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";
import { motion } from "framer-motion";
import "../../styles/MatchStats/MatchEvents.scss";
import { useGetMatchEventsQuery } from "../../services/footballApi";

const MatchEvents = ({ matchId, teams }) => {
    const { data, isLoading, error } = useGetMatchEventsQuery(matchId);

    if (isLoading) {
        return (
            <div className="me-loading">
                <div className="me-loading-spinner"></div>
                <p>Loading match events...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="me-no-events">
                <p>Could not load match events.</p>
            </div>
        );
    }

    const events = data.response || [];

    if (events.length === 0) {
        return (
            <div className="me-no-events">
                <p>No events recorded for this match.</p>
            </div>
        );
    }

    const sortedEvents = [...events].sort((a, b) => {
        const timeA = a.time.elapsed + (a.time.extra || 0);
        const timeB = b.time.elapsed + (b.time.extra || 0);
        return timeA - timeB;
    });

    const totalEvents = sortedEvents.length;

    const calculatePosition = (index, totalEventsCount, _eventTime, _maxMatchTime) => {
        if (totalEventsCount <= 1) {
            return 50;
        }
        const basePosition = (index / (totalEventsCount - 1)) * 100;
        return Math.max(5, Math.min(95, basePosition));
    };

    const homeTeamId = teams?.home?.id;

    const getEventIcon = (type, detail) => {
        switch (type) {
            case "Goal":
                return detail === "Own Goal" ?
                    <FaFutbol className="me-icon me-own-goal" /> :
                    <FaFutbol className="me-icon me-goal" />;
            case "Card":
                return <div className={`me-card ${detail === "Yellow Card" ? "me-yellow" : "me-red"}`} />;
            case "subst":
                return <FaExchangeAlt className="me-icon me-substitution" />;
            case "Var":
                return <GiWhistle className="me-icon me-var" />;
            default:
                return <FaClock className="me-icon" />;
        }
    };

    const getEventDescription = (event) => {
        const { player, assist, detail, comments, type } = event;
        let description = player?.name || "";

        if (type === "Goal") {
            if (detail === "Own Goal") description = `${player?.name} (Own Goal)`;
            else if (detail === "Penalty") description = `${player?.name} (Penalty)`;
            else if (assist?.name) {
                description = (
                    <>
                        <span className="me-player-name">{player?.name}</span>
                        <span className="me-assist">
                            <FaCaretRight className="me-assist-icon" />
                            <span>{assist.name}</span>
                        </span>
                    </>
                );
            }
        } else if (type === "subst") {
            description = (
                <>
                    <span className="me-player-out">{player?.name}</span>
                    <span className="me-substitution-arrow">
                        <FaCaretRight className="me-sub-icon" />
                    </span>
                    <span className="me-player-in">{assist?.name}</span>
                </>
            );
        } else if (comments) {
            description = `${player?.name} (${comments})`;
        }
        return description;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.07 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Calculate minimum timeline width to ensure spacing
    const EVENT_CARD_WIDTH = 190; // From SCSS .me-event width: 190px
    const MIN_DESIRED_GAP_BETWEEN_CARDS = 40; // Desired visual gap between event cards
    let timelineStyle = {};

    if (totalEvents > 0) {
        let minContentWidthForEvents;

        if (totalEvents === 1) {
            // For a single event, content width just needs to fit the card
            minContentWidthForEvents = EVENT_CARD_WIDTH;
        } else {
            // For multiple events, calculate width needed for cards + gaps, distributed over 90% of timeline
            const centerToCenterMinDistance = EVENT_CARD_WIDTH + MIN_DESIRED_GAP_BETWEEN_CARDS;
            // The 90% span (from 5% to 95% event centers) must accommodate (totalEvents - 1) such center-to-center distances.
            minContentWidthForEvents = (centerToCenterMinDistance * (totalEvents - 1)) / 0.9;
        }

        // SCSS for .me-timeline has padding: 50px 30px;
        // Assuming box-sizing: border-box for .me-timeline (common in modern CSS)
        // The minWidth style will set the border-box width.
        const horizontalPaddingInTimeline = 60; // 30px left + 30px right
        const calculatedMinTimelineElementWidth = minContentWidthForEvents + horizontalPaddingInTimeline;

        timelineStyle = {
            minWidth: `${calculatedMinTimelineElementWidth}px`,
        };
    }

    return (
        <div className="me-container">
            <motion.div
                className="me-timeline"
                style={timelineStyle} // Apply calculated min-width
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {sortedEvents.map((event, index) => {
                    const isHomeTeam = event.team.id === homeTeamId;
                    const position = calculatePosition(index, totalEvents, event.time, 90);

                    return (
                        <motion.div
                            key={`${event.time.elapsed}-${event.player.id}-${index}`}
                            className={`me-event ${isHomeTeam ? "me-home" : "me-away"}`}
                            style={{ left: `${position}%` }}
                            variants={itemVariants}
                        >
                            <div className="me-time">
                                <span className="me-minute">
                                    {event.time.elapsed}'
                                    {event.time.extra ? <sup>+{event.time.extra}</sup> : ""}
                                </span>
                            </div>
                            <div className="me-timeline-connector">
                                <div className="me-timeline-point">
                                    {getEventIcon(event.type, event.detail)}
                                </div>
                            </div>
                            <div className="me-event-card">
                                <div className="me-team-badge">
                                    <img
                                        src={event.team.logo}
                                        alt={event.team.name}
                                    />
                                </div>
                                <div className="me-details">
                                    <div className="me-type">
                                        {event.type} {event.detail && event.type !== event.detail ? `• ${event.detail}` : ""}
                                    </div>
                                    <div className="me-description">
                                        {getEventDescription(event)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default MatchEvents;