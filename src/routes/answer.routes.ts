import { Router } from "express";
import AnswerController from "@/controllers/answer.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.get("/:id", authUser, AnswerController.getById);

router.post("/", authUser, AnswerController.create);

router.put("/:id", authUser, AnswerController.update);

router.delete("/:id", authUser, AnswerController.delete);

router.get(
  "/question/:questionId",
  authUser,
  AnswerController.getByQuestionId
);

router.post("/:id/vote", authUser, AnswerController.vote);

router.get("/:id/vote-status", authUser, AnswerController.getVoteStatus);

export default router;
