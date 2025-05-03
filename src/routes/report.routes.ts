import { Router } from "express";
import ReportController from "@/controllers/report.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.post("/", authUser, ReportController.create);

router.delete("/:id", authUser, ReportController.delete);

export default router;
