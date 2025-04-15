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
import {useFollowTeamMutation, useUnfollowTeamMutation} from "../services/userApi.jsx";
import {useDispatch, useSelector} from "react-redux";
import {FaHeart, FaRegHeart} from "react-icons/fa";
import {setCredentials} from "../services/authSlice.jsx";

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
    const isFollowed = user?.favoriteTeams?.some(team =>
        team.id === teamId
    );

    const [followTeam, { isLoading: isFollowing }] = useFollowTeamMutation();
    const [unfollowTeam, { isLoading: isUnfollowing }] = useUnfollowTeamMutation();

    const { data, isLoading, error } = useGetTeamDetailsQuery(teamId);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading team details.</div>;

    const { details, matches, additionalDetails } = data;
    const handleFollowClick = async () => {
        if (!isLoggedIn) {
            alert("You need to be logged in to follow teams");
            return;
        }

        try {
            if (isFollowed) {
                const result = await unfollowTeam(teamId).unwrap();
                dispatch(setCredentials({
                    token: user.token || sessionStorage.getItem("token"),
                    user: {
                        ...user,
                        favoriteTeams: result.favoriteTeams || []
                    }
                }));
            } else {
                const teamData = {
                    id: teamId,
                    name: details.name,
                    crest: details.crest
                };
                const result = await followTeam({ teamId, teamData }).unwrap();

                dispatch(setCredentials({
                    token: user.token || sessionStorage.getItem("token"),
                    user: {
                        ...user,
                        favoriteTeams: result.favoriteTeams || []
                    }
                }));
            }
        } catch (err) {
            console.error("Error updating team follow status:", err);
        }
    };
    const tabs = ["Overview", "Fixtures", "Squad", "Stats"];

    return (
        <div className="team-details-page">
            <div className="team-header">
                <div className="team-header-inner">
                    <div className="team-identity">
                        <img src={details.crest} alt={`${details.shortName} Crest`} className="team-crest"/>
                        <div className="team-info">
                            <h1 className="team-name">{details.name}</h1>
                            <span className="team-meta">
                                {additionalDetails?.response?.details?.sportsTeamJSONLD?.location?.address?.addressCountry || "xd"}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`follow-button ${isFollowed ? 'following' : ''}`}
                        onClick={handleFollowClick}
                        disabled={isFollowing || isUnfollowing}
                    >
                        {isFollowed ? (
                            <>
                                <FaHeart/> Following
                            </>
                        ) : (
                            <>
                                <FaRegHeart/> Follow
                            </>
                        )}
                    </button>

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
                                details={{
                                    ...details,
                                    id: teamId,
                                    leagueId: leagueId,
                                    runningCompetitions: [{ id: leagueId }]
                                }}
                            />
                            <NextMatch matches={matches} />
                        </div>
                        <div className="row">
                            {leagueId && <MiniLeagueTable leagueId={leagueId} selectedTeamId={teamId}/>}
                        </div>
                        <div className="row">
                            <StadiumInfo details={details} additionalDetails={additionalDetails} />
                            <UpcomingFixtures matches={matches} />
                            <SeasonStats />

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
                        <TeamStats teamId={teamId} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamDetailsPage;