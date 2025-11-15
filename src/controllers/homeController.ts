import { Request, Response } from 'express';

export function renderHome(req: Request, res: Response): void {
  res.render('index');
}
