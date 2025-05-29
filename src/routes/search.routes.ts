import { Router } from "express";
import SearchController from "@/controllers/search.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.get("/", SearchController.search);

export default router;
