import { IncomingMessage } from "http";
import { AddressInfo } from "net";

export type Next = (e?: Error) => void;
type EndTimer = () => [number, number];

export interface HttpError extends Error {
  code?: string;
  statusCode?: number;
  status?: number;
  expose?: boolean;
}

const durationTimers = new WeakMap<IncomingMessage, EndTimer>();

export function createDurationTimer(req: IncomingMessage): EndTimer {
  let end = durationTimers.get(req);

  if (end) {
    return end;
  }

  const start = process.hrtime();
  let duration: [number, number];

  end = () => {
    if (!duration) {
      duration = process.hrtime(start);
    }
    return duration;
  };

  durationTimers.set(req, end);

  return end;
}

export function addressToString(addr: string | AddressInfo | null) {
  if (addr === null) {
    return "";
  }
  if (typeof addr === "string") {
    return addr;
  }
  const { port, address, family } = addr;
  return family === "IPv6" ? `[${address}]:${port}` : `${address}:${port}`;
}
