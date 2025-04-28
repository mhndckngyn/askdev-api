import { Router } from "express";
import QuestionController from "@/controllers/question.controller";
import { authMiddleware } from "@/middlewares/auth";
import upload from "@/middlewares/multer";

const router = Router();

router.get("/:id",  QuestionController.getById);

router.post(
  "/",
  upload.array("images"),
  authMiddleware,
  QuestionController.create
);

router.put("/:id", authMiddleware, QuestionController.update);

router.delete("/:id", authMiddleware, QuestionController.delete);

router.post("/:id/vote", authMiddleware, QuestionController.vote);

router.get(
  "/:id/vote-status",
  authMiddleware,
  QuestionController.getVoteStatus
);

router.get(
  "/:id/edit-history",
  
  QuestionController.getEditHistory
);

export default router;
