import dotenv from 'dotenv';    
dotenv.config();

import { Sequelize } from 'sequelize';

const connectionString = process.env.MySQLConnectionString;

if (!connectionString) {
  throw new Error("CRITICAL FAILURE: process.env.MySQLConnectionString is missing in your environment configuration.");
}

export const db = new Sequelize(connectionString, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
    },
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await db.authenticate();
    await db.sync({ alter: true });
    console.log("MySQL Database Connection Pool Verified successfully!");
  } catch (error: any) {
    console.error("MySQL Connection Failed:", error.message);
    throw error; 
  }
};
