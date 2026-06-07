import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { GithubService } from "../services/github.services.js";
import { GithubProfile } from "../models/GithubProfile.js";
import { generateAIProfileAnalysis } from "../utils/aiEngine.js";
const githubService = new GithubService();



const fetchAndSaveProfile = async (username: string) => {
    try {
        // 1. Attempt parallel extraction out of third-party API routes
        const [rawUserData, rawReposData] = await Promise.all([
            githubService.fetchUserProfile(username),
            githubService.fetchUserRepos(username)
        ]);

        // 2. Compute aggregate repository metrics
        let totalStars = 0;
        const languageCounts: Record<string, number> = {};

        for (const repo of rawReposData) {
            totalStars += repo.stargazers_count || 0;
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            }
        }

        const aiAnalysisResults = await generateAIProfileAnalysis(
            rawUserData.login,
            rawUserData.bio,
            rawUserData.public_repos,
            rawUserData.followers,
            totalStars,
            languageCounts
        )

        // 3. Persist fresh profile mappings down into structured columns
        const [profile] = await GithubProfile.upsert({
            username: rawUserData.login,
            name: rawUserData.name || null,
            avatarUrl: rawUserData.avatar_url || null,
            bio: rawUserData.bio || null,
            location: rawUserData.location || null,
            followersCount: rawUserData.followers,
            followingCount: rawUserData.following,
            publicReposCount: rawUserData.public_repos,
            publicGistsCount: rawUserData.public_gists,
            totalStars,
            mostUsedLanguages: languageCounts,

            analysisData: aiAnalysisResults
        });

        return profile;

    } catch (error: any) {
        if (error.status === 404) {
            const customError: any = new Error(`GitHub account "${username}" does not exist.`);
            customError.status = 404; // Set status so your error middleware picks it up
            throw customError; // Throw your clean custom error instead of Octokit's
        }

        // Re-throw any other unexpected infrastructure issues (e.g., rate limits, DB timeouts)
        throw error;
    }
};



export const getProfileHandler = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const username = req.params.username as string;

    let profile = await GithubProfile.findOne({ where: { username }});
    
    if (profile) {
        const _24_hrs_ago = Date.now() - 24 * 60 * 60 * 1000;
        const rawUpdatedAt = profile.dataValues.updatedAt || new Date(0);
        const dbupdatedTime = new Date(rawUpdatedAt).getTime();
        
        if (dbupdatedTime > _24_hrs_ago) {
            return res.status(200).json({
                success: true,
                source: 'database',
                data: profile.toJSON(),
            });
        }
        console.log(`[Cache] Profile for ${username} is stale. Fetching updates...`);
    }

    const freshProfile = await fetchAndSaveProfile(username);
    
    return res.status(profile ? 200 : 201).json({
        success: true,
        source: profile ? 'github_api_update' : 'github_api_create',
        data: freshProfile.toJSON(),
    });
});


export const updateProfileHandler = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const username = req.params.username as string;
    const updatedProfile = await fetchAndSaveProfile(username);

    return res.status(200).json({
        success: true,
        source: 'github_api_force_refresh',
        message: 'Profile refreshed successfully from GitHub API',
        data: updatedProfile.toJSON(),
    });
});


export const deleteProfileHandler = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const username = req.params.username as string;
    const deletedRows = await GithubProfile.destroy({ where: { username } });

    if (!deletedRows) {
        const error: any = new Error('Profile records do not exist inside local database.');
        error.status = 404;
        throw error; // Caught automatically by catchAsync and processed by your Error Middleware!
    }

    return res.status(200).json({
        success: true,
        message: 'Profile cache wiped successfully from MySQL database.',
    });
});


export const getAllProfiles = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;

    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'DESC';

    let limit = rawLimit ? parseInt(rawLimit as string, 10) : 10;
    let page = rawPage ? parseInt(rawPage as string, 10) : 1;

    if (isNaN(limit) || limit <= 0) limit = 10;
    if (isNaN(page) || page <= 0) page = 1;

    const offset = (page - 1) * limit;

    const { count, rows } = await GithubProfile.findAndCountAll({
        limit: limit,   
        offset: offset, 
        order: [[sortBy, order]], 
    });

    const serializedProfiles = rows.map(profile => profile.toJSON());
    const totalPages = Math.ceil(count / limit) || 1;

    return res.status(200).json({
        success: true,
        pagination: {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        data: serializedProfiles,
    });
});
