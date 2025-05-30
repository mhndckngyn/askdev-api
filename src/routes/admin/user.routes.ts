import UserController from "@/controllers/user.controller";
import { Router } from "express";

const router = Router();

router.get('/', UserController.adminGet);

router.patch("/:id/ban", UserController.banUser);

router.patch("/:id/unban", UserController.unbanUser);

export default router;
