import { Router } from "express";
import HistoryController from "@/controllers/history.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.get("/", authUser, HistoryController.getAllByUser);

router.get("/types", HistoryController.getHistoryTypes);

router.delete("/:id", authUser, HistoryController.deleteById);

router.delete("/", authUser, HistoryController.deleteMultiple);

router.delete("/all", authUser, HistoryController.deleteAll);

export default router;
