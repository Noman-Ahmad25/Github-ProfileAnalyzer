export interface GithubProfileAttributes {
    updatedAt?: Date;
    id: number;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    followersCount: number;
    followingCount: number;
    publicReposCount: number;
    totalStars: number;
    mostUsedLanguages: Record<string, number> | null; // Language name and count
    publicGistsCount: number;
}   

export interface GithubProfileCreationAttributes extends Omit<GithubProfileAttributes, 'id'> {}