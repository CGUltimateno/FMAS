import React from 'react';
import "../styles/Footer.scss";
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 text-sm py-6">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                {/* Left Section - Links */}
                <div className="flex space-x-6 mb-4 md:mb-0">
                    <a href="#" className="hover:text-white transition-colors">Terms Of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Report Abuse</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy & Data Policy</a>
                </div>

                {/* Right Section - Copyright */}
                <p className="text-gray-400">© 2022 All Rights Reserved © Onesport</p>
            </div>
        </footer>
    );
};

export default Footer;
