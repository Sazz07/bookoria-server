import mongoose from 'mongoose';
import { Server } from 'http';
import config from './app/config';
import app from './app';
import seedAdmin from './app/DB';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    seedAdmin();
    server = app.listen(config.port, () => {
      console.log(`app listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`😈 unhandledRejection is detected , shutting down...`);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit();
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
