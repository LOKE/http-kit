import { IncomingMessage, Server, ServerResponse } from "http";
import { Socket } from "net";

export function graceful(server: Server) {
  // let port;
  let shuttingDown = false;

  if (server.listening) {
    throw new Error("Must wrap server before calling listen");
  }

  // server.once("listening", () => {
  //   port = server.address().port;
  // });

  const connections = new Set<Socket>();
  const activeConnections = new WeakSet<Socket>();

  function observeSocket(socket: Socket) {
    connections.add(socket);

    socket.on("close", () => {
      connections.delete(socket);
    });
  }

  function observeRequest(req: IncomingMessage, res: ServerResponse) {
    activeConnections.add(req.socket);

    res.on("finish", () => {
      activeConnections.delete(req.socket);

      if (shuttingDown) {
        req.socket.end(); // destroy?
      }
    });
  }

  server.on("connection", observeSocket);
  server.on("secureConnection", observeSocket);

  server.on("request", observeRequest);

  function shutdown() {
    return new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });

      shuttingDown = true;

      for (const socket of connections) {
        if (!activeConnections.has(socket)) {
          socket.end();
        }
      }
    });
  }

  return { shutdown };
}
