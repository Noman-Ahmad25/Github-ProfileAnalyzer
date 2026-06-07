import { Request, Response, NextFunction } from 'express';
import { stack } from 'sequelize/lib/utils';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    console.error(`[API Error Hook]: ${err.stack || err.message}`);

    const statusCode = err.status || err.statusCode || 500;

    return res.status(statusCode).json({
        succes: false,
        message: err.message || 'Internal Server Error',

        stack: process.env.NODE_ENV === "development" ? err.stack : undefined  
    });

}