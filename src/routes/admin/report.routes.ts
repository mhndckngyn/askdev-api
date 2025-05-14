import ReportController from "@/controllers/report.controller";
import { Router } from "express";

const router = Router();

router.get("/", ReportController.getAll);
router.post("/hide", ReportController.hideReports);
router.post("/unhide", ReportController.unhideReports);

export default router;
