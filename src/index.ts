import 'dotenv/config';
import express, { Express } from 'express';
import configureExpress from './config/express';
import routes from './routes';
import { setupCandidateManagement } from './server-integration/candidateManagementServer';
import { shutdownDatabase } from './db/mysql';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

import session from "express-session";

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configureExpress(app);

// Setup candidate management routes
setupCandidateManagement(app);

app.use('/', routes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Scout Express server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
shutdownSignals.forEach((signal) => {
  process.on(signal, async () => {
    // eslint-disable-next-line no-console
    console.log(`\nReceived ${signal}. Shutting down...`);
    try {
      await shutdownDatabase();
    } catch {
      // ignore
    } finally {
      process.exit(0);
    }
  });
});


