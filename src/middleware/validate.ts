import { Request, Response, NextFunction } from "express";
import { ZodSchema , ZodError} from 'zod';
import {  } from "zod/v3";

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try{
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            })
            return next();
        }
        
        catch (error){
            if(error instanceof ZodError){
                return res.status(400).json({
                    succes: false,
                    message: "Validation failed",
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })
                )
            })
            

            }
        }
    }
}