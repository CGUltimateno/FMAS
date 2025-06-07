import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import "../styles/EditProfilePage.scss";
import { useUpdateProfileMutation } from "../services/userApi";
import { setCredentials } from "../services/authSlice";
import { FaCamera, FaUser, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const DEFAULT_PROFILE_PIC = "https://via.placeholder.com/120?text=User";
const BACKEND_URL = 'http://localhost:5000';

const EditProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);

    const [updateProfile, { isLoading, error: updateError }] = useUpdateProfileMutation();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(DEFAULT_PROFILE_PIC);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                username: user.username || "",
            });
            setProfilePicturePreview(
                user.profilePictureUrl
                    ? `${BACKEND_URL}${user.profilePictureUrl}`
                    : DEFAULT_PROFILE_PIC
            );
        }
    }, [user]);

    if (!token) {
        navigate("/login");
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSubmit = new FormData();
        dataToSubmit.append('firstName', formData.firstName);
        dataToSubmit.append('lastName', formData.lastName);
        dataToSubmit.append('username', formData.username);

        if (profilePictureFile) {
            dataToSubmit.append('profilePicture', profilePictureFile);
        }

        try {
            const result = await updateProfile(dataToSubmit).unwrap();
            console.log("Update result:", result);

            // Extract the actual user data from the nested structure if it exists
            const updatedUser = result.user || result;

            // Properly structure the user data
            dispatch(setCredentials({
                user: {
                    userId: updatedUser.userId,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    username: updatedUser.username,
                    profilePictureUrl: updatedUser.profilePictureUrl,
                    isEmailVerified: updatedUser.isEmailVerified,
                    isAdmin: updatedUser.isAdmin || user.isAdmin
                },
                token
            }));

            alert("Profile updated successfully!");
            navigate("/profile");
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert(`Failed to update profile: ${err.data?.error || err.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-header-banner">
                <Link to="/profile" className="back-button">
                    <FaArrowLeft /> Back to Profile
                </Link>
            </div>

            <div className="edit-profile-content">
                <div className="edit-profile-card">
                    <div className="card-header">
                        <h2>Edit Your Profile</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="profile-picture-container">
                            <div className="profile-picture-wrapper">
                                <img
                                    src={profilePicturePreview}
                                    alt="Profile Preview"
                                    className="profile-picture"
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                />
                                <div className="picture-overlay" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                                    <FaCamera />
                                </div>
                            </div>
                            <p className="picture-help-text">Click to upload a new profile picture</p>
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                onChange={handlePictureChange}
                                ref={fileInputRef}
                                style={{display: 'none'}}
                            />
                        </div>

                        <div className="form-fields-container">
                            <div className="form-field">
                                <div className="field-icon"><FaUser /></div>
                                <div className="field-input">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <div className="field-icon"><FaUser /></div>
                                <div className="field-input">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <div className="field-icon"><FaUser /></div>
                                <div className="field-input">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <div className="field-icon"><FaEnvelope /></div>
                                <div className="field-input">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={user?.email || ""}
                                        disabled
                                        placeholder="Your email address"
                                    />
                                    <small className="field-hint">Email cannot be changed</small>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => navigate("/profile")}>
                                Cancel
                            </button>
                            <button type="submit" className="save-button" disabled={isLoading}>
                                {isLoading ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>

                        {updateError && (
                            <div className="error-message">
                                {updateError.data?.error || updateError.message || "Failed to update profile"}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;