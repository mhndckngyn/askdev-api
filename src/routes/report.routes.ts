import { Router } from "express";
import ReportController from "@/controllers/report.controller";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.post("/", authMiddleware, ReportController.create);

router.delete("/:id", authMiddleware, ReportController.delete);

export default router;
