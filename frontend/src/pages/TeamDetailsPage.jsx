import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useGetTeamDetailsQuery } from "../services/footballApi";
import TeamForm from "../components/teamStats/TeamForm";
import NextMatch from "../components/teamStats/NextMatch";
import StadiumInfo from "../components/teamStats/StadiumInfo";
import TeamFixtures from "../components/TeamStats/TeamFixtures.jsx";
import SeasonStats from "../components/TeamStats/StatsXI.jsx";
import MiniLeagueTable from "../components/LeaguePage/MiniLeagueTable.jsx";
import "../styles/TeamStats/TeamDetailsPage.scss";
import UpcomingFixtures from "../components/TeamStats/UpcomingFixtures.jsx";
import TeamSquad from "../components/TeamStats/TeamSquad.jsx";
import TeamStats from "../components/TeamStats/TeamStats.jsx";
import { useFollowTeamMutation, useUnfollowTeamMutation } from "../services/userApi.jsx";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { setCredentials } from "../services/authSlice.jsx";

const TeamDetailsPage = () => {
    const { teamId } = useParams();
    const location = useLocation();
    const leagueId = location.state?.leagueId;
    const [activeTab, setActiveTab] = useState("Overview");
    const dispatch = useDispatch();

    // Get current user from Redux store
    const user = useSelector((state) => state.auth.user);
    const isLoggedIn = !!user;

    // Check if team is already followed
    const isFollowed = user?.favoriteTeams?.some(team => team.id === teamId);

    const [followTeam, { isLoading: isFollowing }] = useFollowTeamMutation();
    const [unfollowTeam, { isLoading: isUnfollowing }] = useUnfollowTeamMutation();
    const [followError, setFollowError] = useState(null);
    const { data, isLoading, error } = useGetTeamDetailsQuery(teamId);

    if (isLoading) return <div className="loading-container">Loading team details...</div>;
    if (error) return <div className="error-container">Error loading team details: {error.message}</div>;
    if (!data) return <div className="error-container">No team data available</div>;

    const teamData = data?.details?.response?.[0]?.team;
    const venueData = data?.details?.response?.[0]?.venue;
    const matchesData = data?.matches?.response || [];
    if (!teamData) return <div className="error-container">Team information not available</div>;
    const handleFollowClick = async () => {
        // Clear any previous errors
        setFollowError(null);

        // Check if user is logged in first
        if (!isLoggedIn) {
            setFollowError("You must be logged in to follow teams");
            return;
        }

        try {
            if (isFollowed) {
                const result = await unfollowTeam(teamId).unwrap();
                dispatch(setCredentials({ user: result }));
            } else {
                const result = await followTeam({
                    teamId,
                    teamData: {
                        name: teamData.name,
                        crest: teamData.logo
                    }
                }).unwrap();
                dispatch(setCredentials({ user: result }));
            }
        } catch (err) {
            console.error("Error updating team follow status:", err);
            setFollowError(err.data?.message || "Failed to update team follow status");
        }
    };


    const tabs = ["Overview", "Fixtures", "Squad", "Stats"];

    return (
        <div className="team-details-page">
            <div className="team-header">
                <div className="team-header-inner">
                    <div className="team-identity">
                        <img src={teamData.logo} alt={`${teamData.name} Logo`} className="team-crest"/>
                        <div className="team-info">
                            <h1 className="team-name">{teamData.name}</h1>
                            <span className="team-meta">
                                {teamData.country} {teamData.founded && `• Est. ${teamData.founded}`}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleFollowClick}
                        disabled={isFollowing || isUnfollowing}
                        className={`follow-button ${isFollowed ? 'followed' : ''}`}
                    >
                        {isFollowed ? <FaHeart/> : <FaRegHeart/>}
                        {isFollowed ? 'Following' : 'Follow'}
                    </button>
                    {followError && <div className="follow-error">{followError}</div>}
                </div>
                <div className="team-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="team-content">
                {activeTab === "Overview" && (
                    <>
                        <div className="row">
                            <TeamForm
                                teamId={teamId}
                                leagueId={leagueId}
                                matches={matchesData}
                            />
                            <NextMatch matches={matchesData} />
                        </div>
                        <div className="row">
                            {leagueId && <MiniLeagueTable leagueId={leagueId} selectedTeamId={teamId}/>}
                        </div>
                        <div className="row">
                            <StadiumInfo venue={venueData} team={teamData} />
                            <UpcomingFixtures matches={matchesData} />
                            <SeasonStats teamId={teamId} leagueId={leagueId} />
                        </div>
                    </>
                )}

                {activeTab === "Fixtures" && (
                    <>
                        <TeamFixtures teamId={teamId} />
                    </>
                )}

                {activeTab === "Squad" && (
                    <>
                        <TeamSquad teamId={teamId} />
                    </>
                )}

                {activeTab === "Stats" && (
                    <>
                        <TeamStats teamId={teamId} leagueId={leagueId} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamDetailsPage;