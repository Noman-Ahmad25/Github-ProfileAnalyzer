import { Octokit } from "octokit";

export class GithubService {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit();
    }

    async fetchUserProfile(username: string) {
        try {
            const { data } = await this.octokit.request('GET /users/{username}', {
                username,
            });
            return data;
        } catch (error: any) {
            console.error(`Error fetching GitHub profile for ${username}:`, error.message);
            throw error;
        }
    }
}