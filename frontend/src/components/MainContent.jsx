import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const MainContent = () => {
    // Sample data for featured match
    const featuredMatch = {
        league: 'Premier League',
        teamA: 'Manchester United',
        teamB: 'Liverpool',
        time: '20:00',
        date: 'Sunday, Oct 24'
    };

    // Sample data for news articles
    const newsArticles = [
        {
            id: 1,
            title: 'Ronaldo scores hat-trick in dramatic comeback victory',
            excerpt: 'Cristiano Ronaldo led his team to an incredible comeback with three goals in the final 15 minutes of the match.',
            image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            category: 'Match Report',
            time: '2 hours ago'
        },
        {
            id: 2,
            title: 'Transfer rumors: Top striker linked with Premier League move',
            excerpt: 'Several Premier League clubs are reportedly interested in signing the prolific goalscorer during the January transfer window.',
            image: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            category: 'Transfers',
            time: '5 hours ago'
        },
        {
            id: 3,
            title: 'Manager under pressure after fourth consecutive defeat',
            excerpt: 'Following another disappointing result, speculation is mounting about the future of the under-fire manager.',
            image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            category: 'Club News',
            time: '8 hours ago'
        }
    ];

    // Sample data for upcoming matches
    const upcomingMatches = [
        { id: 1, teamA: 'Arsenal', teamB: 'Chelsea', time: '15:00', date: 'Sat, Oct 23' },
        { id: 2, teamA: 'Man City', teamB: 'Tottenham', time: '17:30', date: 'Sat, Oct 23' },
        { id: 3, teamA: 'Leicester', teamB: 'Everton', time: '14:00', date: 'Sun, Oct 24' },
        { id: 4, teamA: 'West Ham', teamB: 'Newcastle', time: '16:30', date: 'Sun, Oct 24' }
    ];

    return (
        <main className="flex-1 p-6 bg-gray-50">
            {/* Featured Match */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white mb-8 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Featured Match</h2>
                    <span className="text-sm bg-white text-green-800 px-3 py-1 rounded-full font-medium">{featuredMatch.league}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">{featuredMatch.teamA}</h3>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-3xl font-bold mb-2">VS</div>
                        <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                            <Clock size={16} />
                            <span>{featuredMatch.time}</span>
                        </div>
                        <div className="mt-2 text-sm">{featuredMatch.date}</div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">{featuredMatch.teamB}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latest News */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Latest News</h2>
                        <a href="#" className="text-green-600 hover:text-green-800 flex items-center">
                            View All <ArrowRight size={16} className="ml-1" />
                        </a>
                    </div>
                    <div className="space-y-6">
                        {newsArticles.map(article => (
                            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                                <div className="md:w-1/3">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="h-48 w-full object-cover"
                                    />
                                </div>
                                <div className="p-6 md:w-2/3">
                                    <div className="flex items-center mb-2">
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">{article.category}</span>
                                        <span className="text-gray-500 text-sm ml-2 flex items-center">
                      <Clock size={14} className="mr-1" /> {article.time}
                    </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h3>
                                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                                    <a href="#" className="text-green-600 hover:text-green-800 font-medium">Read more</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Matches */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Matches</h2>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="space-y-4">
                            {upcomingMatches.map(match => (
                                <div key={match.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-medium">{match.teamA}</div>
                                        <div className="text-sm text-gray-500">vs</div>
                                        <div className="font-medium text-right">{match.teamB}</div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Clock size={14} className="mr-1" /> {match.time}
                                        </div>
                                        <div>{match.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            View Full Schedule
                        </button>
                    </div>

                    {/* League Table Preview */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Premier League Table</h2>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="pb-2 text-left">Pos</th>
                                <th className="pb-2 text-left">Team</th>
                                <th className="pb-2 text-right">P</th>
                                <th className="pb-2 text-right">Pts</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-2">1</td>
                                <td className="py-2 font-medium">Man City</td>
                                <td className="py-2 text-right">8</td>
                                <td className="py-2 text-right font-medium">20</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2">2</td>
                                <td className="py-2 font-medium">Liverpool</td>
                                <td className="py-2 text-right">8</td>
                                <td className="py-2 text-right font-medium">18</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2">3</td>
                                <td className="py-2 font-medium">Chelsea</td>
                                <td className="py-2 text-right">8</td>
                                <td className="py-2 text-right font-medium">16</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2">4</td>
                                <td className="py-2 font-medium">Man United</td>
                                <td className="py-2 text-right">8</td>
                                <td className="py-2 text-right font-medium">14</td>
                            </tr>
                            <tr>
                                <td className="py-2">5</td>
                                <td className="py-2 font-medium">Brighton</td>
                                <td className="py-2 text-right">8</td>
                                <td className="py-2 text-right font-medium">14</td>
                            </tr>
                            </tbody>
                        </table>
                        <button className="w-full mt-4 text-green-600 hover:text-green-800 font-medium py-2 px-4 rounded-lg transition-colors border border-green-600 hover:border-green-800">
                            Full Table
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MainContent;