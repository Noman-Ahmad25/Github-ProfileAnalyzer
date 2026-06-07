import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types";
  

type GithubUserResponse = Endpoints["GET /users/{username}"]["response"]["data"];
type GitHubReposResponse = Endpoints["GET /users/{username}/repos"]["response"]["data"];
export class GithubService {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });
    }

    async fetchUserProfile(username: string): Promise<GithubUserResponse> {
        try {
            const { data } = await this.octokit.request('GET /users/{username}', {
                username,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            return data;
        } 
        catch (error: any) {

            console.error(`[GithubService] Error fetching GitHub profile for ${username}:`, error.message);
            throw error;
        }
    }
    async fetchUserRepos(username: string): Promise<GitHubReposResponse>{
        try{
            const { data } = await this.octokit.request('GET /users/{username}/repos', {
                username,
                per_page: 100,
                sort: 'updated',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            return data; 
        }
        catch(error: any){
            console.error(`[GithubService] Error  Error fetching repositories for "${username}":`, error.message)
            throw error
        }
    }
}