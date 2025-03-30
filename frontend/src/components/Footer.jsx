import React from 'react';
import "../styles/Footer.scss";
const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="links">
                    <a href="#" className="hover:text-white transition-colors">Terms Of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Report Abuse</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy & Data Policy</a>
                </div>
                <p className="text-gray-400">© 2025 All Rights Reserved © Onesport</p>
            </div>
        </footer>
    );
};

export default Footer;