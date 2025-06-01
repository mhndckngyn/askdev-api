import BanController from "@/controllers/ban.controller";
import { Router } from "express";

const router = Router();

router.get('/', BanController.getAll);

export default router;
