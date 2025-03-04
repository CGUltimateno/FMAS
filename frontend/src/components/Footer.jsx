import React from 'react';
import { Trophy, Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Trophy size={24} className="text-yellow-400" />
                            <h3 className="text-xl font-bold">FootballZone</h3>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Your ultimate destination for football news, live scores, statistics, and in-depth analysis from leagues around the world.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">News</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fixtures</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Results</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tables</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Stats</a></li>
                        </ul>
                    </div>

                    {/* Top Leagues */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Top Leagues</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Premier League</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">La Liga</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Serie A</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bundesliga</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ligue 1</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Champions League</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest news and updates.</p>
                        <form className="space-y-2">
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                                />
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-md transition-colors"
                                >
                                    <Mail size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                            </p>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-400">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p>© 2025 FootballZone. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;