import express, {Request, Response}from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import profileRoutes from "./routes/profile.route.js"

const app = express();

app.use(helmet());
app.use(cors());

app.use(morgan('dev'))

app.use(express.json())
;

app.use('/api/profiles', profileRoutes)

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "GitHub Profile Analyzer API is active" });
});

export { app };