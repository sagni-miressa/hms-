/**
 * Request Validation Middleware
 * Zod-based input validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '@/utils/errors.js';

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Validate request data against Zod schema
 */
export const validate = (schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Validate params
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new ValidationError(
          'Validation failed',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * Email schema
 */
export const emailSchema = z.string().email().toLowerCase();

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

/**
 * URL schema
 */
export const urlSchema = z.string().url();

/**
 * Date range schema
 */
export const dateRangeSchema = z
  .object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine(
    data => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
    'dateFrom must be before dateTo'
  );
