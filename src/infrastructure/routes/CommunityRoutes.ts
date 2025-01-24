import { Request, Response, Router } from "express";

export class CommunityRoutes {
  static get routes(): Router {
    const router = Router();
    // const respository = new MongoAuthRepository();
    // const loginUseCase = new LoginUseCase(respository);
    // const signupUseCase = new SignupUseCase(respository);
    // const findbyemailUseCase = new FindUserByEmail(respository);
    // const controller = new AuthController(
    //   loginUseCase,
    //   signupUseCase,
    //   findbyemailUseCase
    // );
    // Test route to check if `/api/auth` is working
    router.get("/", (req: Request, res: Response) => {
      res.status(200).send({ message: "Auth route is working!" });
    });
    // router.post("/login", controller.login);
    // router.post("/signup", controller.signup);
    return router;
  }
}