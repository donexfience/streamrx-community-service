import { Request, Response, Router } from "express";
import { CommunityRoutes } from "../../infrastructure/routes/CommunityRoutes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Added test route for `/api`
    router.get("/", (req: Request, res: Response) => {
      res.status(200).send({ message: "API is working!" });
    });
    router.use("/community", CommunityRoutes.routes);

    return router;
  }
}
