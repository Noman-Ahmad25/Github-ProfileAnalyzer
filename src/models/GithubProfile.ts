import {DataTypes} from "sequelize";
import { db } from "../config/db.js";

    export const GithubProfile = db.define("GithubProfile", {
        id: {
            type: DataTypes.INTEGER,
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
            type: DataTypes.JSON,
            allowNull: true,
        },
        publicGistsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });

   