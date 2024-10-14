import { app } from "./app.js";
import { PORT, SENDGRID_API_KEY } from "./config/index.js";
import { connectDB } from "./database/index.js";
import sendgridMail from "@sendgrid/mail";

export const runServer = async () => {
  try {
    await connectDB();

    sendgridMail.setApiKey(SENDGRID_API_KEY);

    const server = app.listen(PORT, () => {
      console.log(`Success: Server started on PORT: ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Error: Server Error -", error);
    process.exit(1);
  }
};
