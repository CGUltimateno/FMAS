import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFoundPage.scss";

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <h1>404 - Seite nicht gefunden</h1>
            <p>Die Seite, die Sie suchen, existiert nicht.</p>
            <Link to="/">Zurück zur Startseite</Link>
        </div>
    );
};

export default NotFoundPage;