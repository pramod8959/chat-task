// File: backend/src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, params, or query against Joi schema
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      res.status(400).json({
        error: 'Validation error',
        details: errors,
      });
      return;
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(2).max(50).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Message schemas
  sendMessage: Joi.object({
    recipient: Joi.string().required(),
    content: Joi.string().min(1).max(5000).required(),
    mediaUrl: Joi.string().uri().optional(),
    mediaType: Joi.string().valid('image', 'video', 'audio', 'file').optional(),
  }),

  // Upload schemas
  signedUrl: Joi.object({
    fileName: Joi.string().required(),
    fileType: Joi.string().required(),
    fileSize: Joi.number().max(10 * 1024 * 1024).optional(), // 10MB max
  }),

  // Pagination schemas
  pagination: Joi.object({
    limit: Joi.number().min(1).max(100).default(50),
    cursor: Joi.string().optional(),
  }),
};
