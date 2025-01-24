import express, {
  type Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  HttpCode,
  ONE_HUNDRED,
  ONE_THOUSAND,
  SIXTY,
} from "./_lib/errors/constants-http-status";
import { AppError } from "./_lib/errors/customError";
import { ErrorMiddleware } from "./Presentation/express-http/Errors/error-middleware";
import { Database } from "./infrastructure/database";

interface ServerOptions {
  port: number;
  routes: Router;
  apiPrefix: string;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly routes: Router;
  private readonly apiPrefix: string;

  constructor(configOptions: ServerOptions) {
    const { port, apiPrefix, routes } = configOptions;
    this.port = port;
    this.routes = routes;
    this.apiPrefix = apiPrefix;
  }

  public async start(): Promise<void> {
    console.log(`API Prefix: ${this.apiPrefix}`);
    // Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS Configuration
    this.app.use((req, res, next) => {
      const allowedOrigins = ["http://localhost:3001"];
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin!)) {
        res.setHeader("Access-Control-Allow-Origin", origin!);
      }
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

    // Routes
    this.app.use(this.apiPrefix, this.routes);
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}...`);
    });
    await Database.connect();
  }
}
