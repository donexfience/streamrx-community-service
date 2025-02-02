import { Router } from "express";
import { CommunityChatRoutes } from "./CommunityRoutes";
import { SubscriptionRoutes } from "./subscriptionRoutes";

class CommonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.use((req, res, next) => {
      console.log(
        `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`
      );
      next();
    });
    this.router.use("/community", new CommunityChatRoutes().router);
    this.router.use("/subscription", new SubscriptionRoutes().router);
  }
}

export default new CommonRoutes().router;
