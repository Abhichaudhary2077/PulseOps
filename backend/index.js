import { app } from "./app.js";

const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`PulseOps backend running on port ${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => {
    console.log(`Received ${signal}; closing the HTTP server`);
    server.close((error) => {
      if (error) {
        console.error("Error while closing the HTTP server:", error);
        process.exitCode = 1;
      }
    });
  });
}
