import { IncomingMessage, Server, ServerResponse } from "http";
import { Socket } from "net";
import { Counter, Gauge } from "prom-client";
import { addressToString } from "../middleware/helpers";

export const connectionCount = new Counter({
  name: "server_connections_total",
  help: "The total tcp socket connections created",
  labelNames: ["address"],
  registers: []
});
export const connections = new Gauge({
  name: "server_connections",
  help: "The current number connected tcp sockets",
  labelNames: ["address"],
  registers: []
});
export const unusedConnections = new Gauge({
  name: "server_unused_connections",
  help: "The current number of tcp sockets yet to be used",
  labelNames: ["address"],
  registers: []
});
export const inFlightRequests = new Gauge({
  name: "server_requests_in_flight",
  help: "The number of http requests in flight",
  labelNames: ["address"],
  registers: []
});

export function instrumentConnections(server: Server) {
  if (server.listening) {
    throw new Error("Must instrument server before calling listen");
  }

  server.once("listening", () => {
    const address = addressToString(server.address());

    connections.set({ address }, 0);
    unusedConnections.set({ address }, 0);
    connectionCount.inc({ address }, 0);

    const unusedSockets = new WeakSet<Socket>();

    function instrumentSocket(socket: Socket) {
      connectionCount.inc({ address });
      connections.inc({ address });

      unusedConnections.inc({ address });
      unusedSockets.add(socket);

      socket.once("close", () => {
        connections.dec({ address });
      });
    }

    server.on("connection", instrumentSocket);
    server.on("secureConnection", instrumentSocket);

    function instrumentRequest(req: IncomingMessage, res: ServerResponse) {
      let done = false;

      if (unusedSockets.delete(req.socket)) {
        unusedConnections.dec({ address });
      }

      inFlightRequests.inc({ address });

      const recordDone = () => {
        if (done) { return; }
        inFlightRequests.dec({ address });
        done = true;
      };

      res.once("finish", recordDone);
      req.socket.once("close", recordDone);
    }

    server.on("request", instrumentRequest);
  });
}
