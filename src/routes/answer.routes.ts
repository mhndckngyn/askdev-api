import { Router } from "express";
import AnswerController from "@/controllers/answer.controller";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.get("/:id", authMiddleware, AnswerController.getById);

router.post("/", authMiddleware, AnswerController.create);

router.put("/:id", authMiddleware, AnswerController.update);

router.delete("/:id", authMiddleware, AnswerController.delete);

router.get(
  "/question/:questionId",
  authMiddleware,
  AnswerController.getByQuestionId
);

router.post("/:id/vote", authMiddleware, AnswerController.vote);

router.get("/:id/vote-status", authMiddleware, AnswerController.getVoteStatus);

export default router;
