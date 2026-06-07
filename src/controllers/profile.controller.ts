import { raw, Request, Response } from "express";
import { GithubService } from "../services/github.services.js";
import { GithubProfile } from "../models/GithubProfile.js";
import { success } from "zod";

const githubService = new GithubService()


const fetchAndSaveProfile = async (username: string) => {
    // 1. Fetch both profile data and repositories in parallel to minimize latency
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

    // 3. Upsert into MySQL (Updates existing record, or creates one if it doesn't exist)
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
    });

    return profile;
};


export const getProfileHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const username = req.params.username as string;

        let profile = await GithubProfile.findOne({ where: { username }});
        console.log(profile)
        if(profile) {
            const  _24_hrs_ago = Date.now() - 24 * 60 * 60 * 1000;
            const rawUpdatedAt = profile.dataValues.updatedAt || new Date(0);
            const dbupdatedTime = new Date(rawUpdatedAt).getTime();
            console.log(_24_hrs_ago, dbupdatedTime)
            if(dbupdatedTime > _24_hrs_ago){
                return res.status(200).json({
                    success: true,
                    source: 'database',
                    data: profile,
                })
            }
            console.log(`[Cache] Profile for ${username} is stale. Fetching updates...`);

        }
       const freshProfile = await fetchAndSaveProfile(username);
       return res.status(profile ? 200 : 201).json({
        success: true,
        source: profile ? 'github_api_update' : 'github_api_create',
        data: freshProfile.toJSON(),
       });
    }
    catch(error: any){
        console.error(`[ProfileController] Resolution failed:`, error.message);
        
        if (error.status === 404) {
            return res.status(404).json({ success: false, message: 'GitHub account not found.' });
        }
        
        return res.status(500).json({ success: false, message: 'Internal server processing error.' });
    }
}


export const updateProfileHandler = async (req: Request, res : Response): Promise<any> => {
    try{
        const username = req.params.username as string;
        const updatedProfile = await fetchAndSaveProfile(username);

        return res.status(200).json({
            succss: true,
            source: 'github_api_force_refresh',
            message: 'Profile refreshed successfully from GitHub API',
            data: updatedProfile.toJSON(),
        })
    }
    catch(error: any) {
        console.error(`[UpdateController] Force update failed:`, error.message)
        if (error.status = 404) 
            return res.status(404).json({success: false, message: "GitHub account not found."  })
    
        return res.status(500).json({succes: false, message: "Failed to manually refresh profle"});
    
    }   
};

export const deleteProfileHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const username = req.params.username as string;

        const deletedRows = await GithubProfile.destroy({ where: { username } });

        if (!deletedRows) {
            return res.status(404).json({
                success: false,
                message: 'Profile records do not exist inside local database.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile cache wiped successfully from MySQL database.',
        });

    } catch (error: any) {
        console.error(`[DeleteController] Deletion failed:`, error.message);
        return res.status(500).json({ success: false, message: 'Internal server deletion failure.' });
    }
};

export const getAllProfiles = async (req: Request, res: Response): Promise<any> => {
    try {
        const rawLimit = req.query.limit;
        const rawPage = req.query.page;

        // 1. Convert incoming query parameters to base-10 integers
        let limit = rawLimit ? parseInt(rawLimit as string, 10) : 10;
        let page = rawPage ? parseInt(rawPage as string, 10) : 1;

        // 🚀 2. CRITICAL SAFETY GUARD: Correct boundaries BEFORE computing offset
        if (isNaN(limit) || limit <= 0) limit = 10; // If broken or missing, default to 10
        if (isNaN(page) || page <= 0) page = 1;     // SAFE GATE: Instantly forces page=0 or page=-5 to become page 1

        // 💡 3. Now the math is guaranteed to never be negative: (1 - 1) * 4 = 0
        const offset = (page - 1) * limit;

        console.log(`[Pagination Debug] Executing query with Limit: ${limit}, Offset: ${offset}`);

        // 4. Execute the safe database query slice
        const { count, rows } = await GithubProfile.findAndCountAll({
            limit: limit,   
            offset: offset, 
            order: [['createdAt', 'DESC']], // Newest profiles show up on page 1
        });

        // 5. Serialize and respond
        const serializedProfiles = rows.map(profile => profile.toJSON());
        const totalPages = Math.ceil(count / limit) || 1;

        return res.status(200).json({
            success: true,
            pagination: {
                totalItems: count, // This will correctly display your total of 7 items
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            data: serializedProfiles,
        });

    } catch (error: any) {
        console.error(`[GetAllProfiles] Database pull failed:`, error.message);
        return res.status(500).json({ success: false, message: 'Failed to retrieve stored profile matrix.' });
    }
};
