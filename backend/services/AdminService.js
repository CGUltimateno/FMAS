// filepath: c:\Users\moham\PhpstormProjects\FMAS\backend\services\AdminService.js
const logger = require('../logger');
const UserTeam = require('../models/UserTeam'); // Corrected import path
const sequelize = require('../config/database'); // Or wherever your sequelize instance is

class AdminService {
    static async getClubFollowerAnalysis() {
        logger.info('AdminService.getClubFollowerAnalysis called');
        try {
            // 1. Get total follower counts for each team
            const followerCounts = await UserTeam.findAll({
                attributes: [
                    'teamId',
                    'teamName',
                    [sequelize.fn('COUNT', sequelize.col('userId')), 'totalFollowers'],
                ],
                group: ['teamId', 'teamName'],
                order: [['teamName', 'ASC']],
                raw: true,
            });

            // 2. Get all follow records to build growth timelines
            const allFollows = await UserTeam.findAll({
                attributes: ['teamId', 'createdAt'],
                order: [['teamId', 'ASC'], ['createdAt', 'ASC']],
                raw: true,
            });

            // 3. Process raw follow data into daily new follower counts per team
            const dailyNewFollowersByTeam = {};
            allFollows.forEach(follow => {
                const teamId = follow.teamId;
                const date = follow.createdAt.toISOString().split('T')[0]; // Format as YYYY-MM-DD

                if (!dailyNewFollowersByTeam[teamId]) {
                    dailyNewFollowersByTeam[teamId] = {};
                }
                if (!dailyNewFollowersByTeam[teamId][date]) {
                    dailyNewFollowersByTeam[teamId][date] = 0;
                }
                dailyNewFollowersByTeam[teamId][date]++;
            });

            // 4. Convert daily new followers into cumulative growth timelines
            const cumulativeGrowthByTeam = {};
            for (const teamId in dailyNewFollowersByTeam) {
                cumulativeGrowthByTeam[teamId] = [];
                let currentTotalFollowers = 0;
                const sortedDates = Object.keys(dailyNewFollowersByTeam[teamId]).sort();

                for (const date of sortedDates) {
                    currentTotalFollowers += dailyNewFollowersByTeam[teamId][date];
                    cumulativeGrowthByTeam[teamId].push({
                        date: date,
                        count: currentTotalFollowers,
                    });
                }
            }

            // 5. Combine total counts with growth data
            const analysisData = followerCounts.map(fc => ({
                clubId: fc.teamId,
                clubName: fc.teamName,
                totalFollowers: parseInt(fc.totalFollowers, 10),
                followerDemographics: {
                    // Placeholder - no data available for demographics
                },
                followerGrowth: cumulativeGrowthByTeam[fc.teamId] || [], // Assign processed growth data
            }));

            logger.info('Successfully generated club follower analysis data with growth timelines from UserTeam.');
            return analysisData;
        } catch (error) {
            logger.error(`Error in AdminService.getClubFollowerAnalysis: ${error.message}`);
            console.error(error); // Log the full error for debugging
            throw new Error('Failed to get club follower analysis.');
        }
    }
}

module.exports = AdminService;
