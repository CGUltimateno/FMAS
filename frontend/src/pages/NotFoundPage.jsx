import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFoundPage.scss";

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <h1>404 - Site not found</h1>
            <p>The Site that you're trying to find is not available.</p>
            <Link to="/">Go back to Main Page</Link>
        </div>
    );
};

export default NotFoundPage;