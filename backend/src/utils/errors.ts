import { Response } from 'express';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

export const handleErrorResponse = (error: unknown, expressRes: Response) => {
  if (error instanceof ValidationError) {
    expressRes.status(400).json({ error: error.message });
    return;
  }
  expressRes.status(500).json({ error: 'Internal server error' });
};


