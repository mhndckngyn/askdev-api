import { Router } from "express";
import HomeController from "@/controllers/home.controller";

const router = Router();

router.get("/summary", HomeController.getSummary);
router.get("/trending-questions", HomeController.getTrendingQuestions);
router.get("/top-contributors", HomeController.getTopContributors);
router.get("/top-tags", HomeController.getTopTags);

export default router;
