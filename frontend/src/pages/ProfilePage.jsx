import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import "../styles/ProfilePage.scss";
import { FaEdit, FaEnvelope, FaUser, FaCheckCircle } from "react-icons/fa";

const DEFAULT_PROFILE_PIC = "https://via.placeholder.com/100?text=User";
const BACKEND_URL = 'http://localhost:5000';

const ProfilePage = () => {
    const { user, token } = useSelector((state) => state.auth,
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    );

    useEffect(() => {
        console.log("ProfilePage user data:", user);
    }, [user]);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (!user) {
        return <div className="loading-state">Loading user data...</div>;
    }

    const profilePicture = user.profilePictureUrl
        ? `${BACKEND_URL}${user.profilePictureUrl}`
        : DEFAULT_PROFILE_PIC;

    return (
        <div className="profile-container">
            <div className="profile-header-banner">
                <div className="profile-avatar-container">
                    <img src={profilePicture} alt={`${user.username}'s profile`} className="profile-avatar"/>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-card user-info-card">
                    <div className="card-header">
                        <h2>Profile Information</h2>
                        <Link to="/profile/edit" className="edit-profile-button">
                            <FaEdit /> Edit
                        </Link>
                    </div>

                    <div className="user-name-section">
                        <h1>{user.firstName} {user.lastName}</h1>
                        <div className="username-badge">
                            <span>@{user.username}</span>
                        </div>
                        {user.isEmailVerified && (
                            <div className="verified-badge">
                                <FaCheckCircle /> Verified
                            </div>
                        )}
                    </div>

                    <div className="profile-details-grid">
                        <div className="detail-item">
                            <div className="detail-icon"><FaUser /></div>
                            <div className="detail-content">
                                <span className="detail-label">First Name</span>
                                <span className="detail-value">{user.firstName}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon"><FaUser /></div>
                            <div className="detail-content">
                                <span className="detail-label">Last Name</span>
                                <span className="detail-value">{user.lastName}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon"><FaUser /></div>
                            <div className="detail-content">
                                <span className="detail-label">Username</span>
                                <span className="detail-value">@{user.username}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon"><FaEnvelope /></div>
                            <div className="detail-content">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;