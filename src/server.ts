import { createServer } from "http";
import app from "./app";
import { WSService } from "./services/websocket";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);


WSService.init(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});