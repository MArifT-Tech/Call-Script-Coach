import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roleplayRouter from "./roleplay";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roleplayRouter);

export default router;
