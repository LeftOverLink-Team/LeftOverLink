const { config } = require("./src/config/env");
const { connectDB } = require("./src/config/db");
const { createApp } = require("./src/app");

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

