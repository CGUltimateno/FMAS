import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetTeamDetailsQuery } from "../services/footballApi";
import { useFollowTeamMutation, useUnfollowTeamMutation } from "../services/footballApi";
import { updateUserFavoriteTeams } from "../services/authSlice"; // Corrected import path
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
import { FaHeart, FaRegHeart } from "react-icons/fa";

const TeamDetailsPage = () => {
    const { teamId } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
    const isLoggedIn = !!user;

    const [activeTab, setActiveTab] = useState("Overview");
    const [followError, setFollowError] = useState(null);

    const { data: teamPageData, isLoading, error } = useGetTeamDetailsQuery(teamId);
console.log(`[TeamDetailsPage] Fetched teamPageData for teamId ${teamId}:`, teamPageData);
    const [leagueIdForTable, setLeagueIdForTable] = useState(null);

    const isFollowed = Array.isArray(user?.favoriteTeams) && user.favoriteTeams.some(team => team.id === teamId);

    const [followTeam, { isLoading: isFollowing }] = useFollowTeamMutation();
    const [unfollowTeam, { isLoading: isUnfollowing }] = useUnfollowTeamMutation();


    useEffect(() => {
        let determinedLeagueId = null;

        // Priority 1: Infer from the current team's most recent non-friendly match data's league.
        if (teamPageData?.matches?.response?.length > 0) {
            const firstNonFriendlyMatch = teamPageData.matches.response.find(
                match => match.league &&
                         match.league.id &&
                         match.league.name &&
                         !match.league.name.toLowerCase().includes("friendlies") &&
                         !match.league.name.toLowerCase().includes("friendly")
                // Ideally, your API would provide a more direct way to identify league matches,
                // e.g., match.league.type === 'League'
            );

            if (firstNonFriendlyMatch) {
                determinedLeagueId = firstNonFriendlyMatch.league.id;
                console.log(`[TeamDetailsPage] Using leagueId ${determinedLeagueId} from team's first non-friendly match ('${firstNonFriendlyMatch.league.name}') for team ${teamId}`);
            } else {
                console.log(`[TeamDetailsPage] No non-friendly league match found in teamPageData.matches for team ${teamId}. Will check location state.`);
            }
        }

        // Priority 2: Fallback to location.state.leagueId if no suitable league found from matches.
        if (!determinedLeagueId && location.state?.leagueId) {
            determinedLeagueId = location.state.leagueId;
            console.log(`[TeamDetailsPage] Using leagueId ${determinedLeagueId} from location.state (fallback) for team ${teamId}`);
        }

        if (!determinedLeagueId) {
            console.log(`[TeamDetailsPage] No leagueId found from team's matches or location.state for team ${teamId}.`);
        }

        setLeagueIdForTable(determinedLeagueId);

    }, [teamPageData, location.state?.leagueId, teamId]); // Dependencies for this effect


    if (isLoading) return <div className="loading-container">Loading team details...</div>;
    if (error) return <div className="error-container">Error loading team details: {error.message || JSON.stringify(error)}</div>;
    if (!teamPageData) return <div className="error-container">No team data available</div>;

    const teamDetails = teamPageData?.details?.response?.[0]?.team;
    const venueData = teamPageData?.details?.response?.[0]?.venue;
    const matchesData = teamPageData?.matches?.response || [];

    if (!teamDetails) return <div className="error-container">Team information not available</div>;

    const handleFollowClick = async () => {
        setFollowError(null);
        if (!isLoggedIn) {
            setFollowError("You must be logged in to follow teams");
            return;
        }
        try {
            let result;
            if (isFollowed) {
                result = await unfollowTeam(teamId).unwrap();
            } else {
                if (!teamDetails.name || !teamDetails.logo) {
                    setFollowError("Team name or logo is missing, cannot follow.");
                    console.error("Missing team name or logo:", teamDetails);
                    return;
                }
                result = await followTeam({
                    teamId: teamId,
                    teamData: { name: teamDetails.name, crest: teamDetails.logo }
                }).unwrap();
            }
            dispatch(updateUserFavoriteTeams(result));
        } catch (err) {
            console.error("Failed to follow/unfollow team:", err);
            setFollowError(err.data?.message || err.message || "An error occurred while updating follow status.");
        }
    };

    const tabs = ["Overview", "Fixtures", "Squad", "Stats"];

    return (
        <div className="team-details-page">
            <div className="team-header">
                <div className="team-header-inner">
                    <div className="team-identity">
                        <img src={teamDetails.logo} alt={`${teamDetails.name} Logo`} className="team-crest"/>
                        <div className="team-info">
                            <h1 className="team-name">{teamDetails.name}</h1>
                            <span className="team-meta">
                                {teamDetails.country} {teamDetails.founded && `• Est. ${teamDetails.founded}`}
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
                                // leagueId is not explicitly passed; TeamForm uses useLocation if needed for its own links
                                matches={matchesData}
                            />
                            <NextMatch matches={matchesData} />
                        </div>
                        <div className="row">
                            {leagueIdForTable ? (
                                <MiniLeagueTable leagueId={leagueIdForTable} selectedTeamId={teamId}/>
                            ) : (
                                <p style={{ padding: "1rem" }}>League standings could not be loaded. League ID missing or not found.</p>
                            )}
                        </div>
                        <div className="row">
                            <StadiumInfo venue={venueData} team={teamDetails} />
                            <UpcomingFixtures matches={matchesData} />
                            <SeasonStats teamId={teamId} leagueId={leagueIdForTable} />
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
                        <TeamStats teamId={teamId} leagueId={leagueIdForTable} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamDetailsPage;
