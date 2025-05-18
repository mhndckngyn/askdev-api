import DashboardController from "@/controllers/dashboard.controller";
import { Router } from "express";

const router = Router();
router.get("/general-stats", DashboardController.getGeneralStatsWithPercentage);

router.get("/top-tags-stats", DashboardController.getTopTagsWithStats);

router.get("/top-users-posts", DashboardController.getTopUsersByPostCount);

router.get("/posts-tags-month", DashboardController.getPostTagStats);

router.get("/posts-tags-year", DashboardController.getPostTagStatsinYear);

router.get("/top-tags-year", DashboardController.getTopTagsWithPostCountInYear);

router.get("/top-tags", DashboardController.getTopTagsAllTimeWithOthers);

router.get("/monthly-report-stats", DashboardController.getMonthlyReportStats);

router.get(
  "/daily-report-stats",
  DashboardController.getDailyReportStatsByMonthYear
);

router.get("/report-counts", DashboardController.getTotalReportsByType);

export default router;
