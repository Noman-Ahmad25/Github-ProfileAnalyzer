import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/db.js"; // Import the verification helper
import { GithubProfile } from "./models/GithubProfile.js";
import { Sequelize } from "sequelize";
import sequelize from "sequelize/lib/sequelize";

dotenv.config();
const PORT = process.env.PORT || 3000;


const startServer = async () => {
    try {
        // Await actual verification promise from MySQL driver
        await connectDB();
        
        app.listen(PORT, () => console.log(`🚀 Server is Running on port ${PORT}`));
    } catch (error) {
        console.error("💥 Failed to start server due to fatal setup errors:", error);
        process.exit(1); // Exit with failure status
    }
};

startServer();
