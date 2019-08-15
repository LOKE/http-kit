import { join as joinPath } from "path";
import pathToRegexp from "path-to-regexp";
import { parse as parseUrl } from "url";

import { IncomingMessage, ServerResponse } from "http";
import { HttpError, Next } from "./helpers";

interface Params {
  [key: string]: string;
}

interface HandlerArg<Req, Res> {
  req: Req & { routePath: string };
  res: Res;
  params: Params;
}

type Handler<Req, Res> = (arg: HandlerArg<Req, Res>) => void | Promise<void>;

interface Route<Req, Res> {
  method: string;
  routePath: string;
  handler: Handler<Req, Res>;
}

interface PopulatedRoute<Req, Res> extends Route<Req, Res> {
  regexp: RegExp;
  keys: pathToRegexp.Key[];
}

export class Router<Req extends IncomingMessage, Res extends ServerResponse> {
  routes: Array<Route<Req, Res>>;

  constructor() {
    this.routes = [];
  }

  use(pathPrefix: Router<Req, Res> | string, router?: Router<Req, Res>) {
    if (pathPrefix instanceof Router) {
      router = pathPrefix;
      pathPrefix = "/";
    }

    if (typeof pathPrefix !== "string") {
      throw new Error("route path must be a string");
    }
    if (!router) {
      throw new Error("must use container");
    }

    for (const { method, routePath, handler } of router.routes) {
      this._registerHandler(method, joinPath(pathPrefix, routePath), handler);
    }

    return this;
  }

  _registerHandler(
    method: string,
    routePath: string,
    handler: Handler<Req, Res>
  ) {
    this.routes.push({ method, routePath, handler });
    return this;
  }

  get(routePath: string, handler: Handler<Req, Res>) {
    return this._registerHandler("GET", routePath, handler);
  }

  post(routePath: string, handler: Handler<Req, Res>) {
    return this._registerHandler("POST", routePath, handler);
  }

  put(routePath: string, handler: Handler<Req, Res>) {
    return this._registerHandler("PUT", routePath, handler);
  }

  patch(routePath: string, handler: Handler<Req, Res>) {
    return this._registerHandler("PATCH", routePath, handler);
  }

  delete(routePath: string, handler: Handler<Req, Res>) {
    return this._registerHandler("DELETE", routePath, handler);
  }

  createHandler() {
    // TODO: time routing, it's pretty dumb.
    const parsedRoutes: Array<PopulatedRoute<Req, Res>> = this.routes.map(r => {
      const keys: pathToRegexp.Key[] = [];
      const regexp = pathToRegexp(r.routePath, keys);

      return Object.assign({}, r, { regexp, keys });
    });

    return (req: Req, res: Res, next: Next) => {
      let match;
      let route: PopulatedRoute<Req, Res> | null = null;

      for (const r of parsedRoutes) {
        if (r.method !== req.method) {
          continue;
        }
        const { pathname } = parseUrl(req.url || "");

        match = r.regexp.exec(pathname || "");

        if (match) {
          route = r;
          break;
        }
      }

      if (!match || !route) {
        return next();
      }

      const params: Params = {};

      for (let i = 1; i < match.length; i++) {
        const { name } = route.keys[i - 1];
        const value = decodeParam(match[i]);

        if (value !== undefined) {
          params[name] = value;
        }
      }

      handleMatch(route, params, req, res, next);
    };
  }
}

function handleMatch<Req extends IncomingMessage, Res extends ServerResponse>(
  route: Route<Req, Res>,
  params: Params,
  req: Req,
  res: Res,
  next: Next
) {
  Promise.resolve()
    .then(() => {
      const { routePath } = route;

      return route.handler({ req: { ...req, routePath }, res, params });
    })
    .catch(err => next(err));
}

function decodeParam(value?: string): string | undefined {
  if (!value || value.length === 0) {
    return value;
  }

  try {
    return decodeURIComponent(value);
  } catch (err) {
    if (err instanceof URIError) {
      const err: HttpError = new Error(`Failed to decode param '${value}'`);
      err.status = err.statusCode = 400;
      throw err;
    }

    throw err;
  }
}
