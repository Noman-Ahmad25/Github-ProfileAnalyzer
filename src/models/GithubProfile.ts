import {DataTypes, Model} from "sequelize";
import { db } from "../config/db.js";
import { ProfileAnalysis } from "../types/github.types.js";
import { GithubProfileAttributes, GithubProfileCreationAttributes } from "../types/github.types.js";

export class GithubProfile
 extends Model <GithubProfileAttributes, GithubProfileCreationAttributes>
    implements GithubProfileAttributes
     {
    declare id: number;
    declare username: string;
    declare name: string | null;
    declare avatarUrl: string | null;
    declare bio: string | null;
    declare location: string | null;
    declare followersCount: number;
    declare followingCount: number;
    declare publicReposCount: number;
    declare totalStars: number;
    declare mostUsedLanguages: Record<string, number> | null; // Language name and count
    declare publicGistsCount: number;
    declare analysisData: ProfileAnalysis | null;

}

GithubProfile.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        followersCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        followingCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        publicReposCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        totalStars: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        mostUsedLanguages: {
            type: DataTypes.JSON, // Store as JSON in MySQL
            allowNull: true,
        },
        publicGistsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        analysisData: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "github_profiles",
        sequelize: db, // passing the `sequelize` instance is required
    }
);  