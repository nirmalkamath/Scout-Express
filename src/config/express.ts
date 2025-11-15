import express, { Express } from 'express';
import path from 'path';

export default function configureExpress(app: Express): void {
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'views'));
  app.use(express.static(path.join(process.cwd(), 'public')));
}


