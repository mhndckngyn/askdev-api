import AnswerController from "@/controllers/answer.controller";
import { authUser } from "@/middlewares/auth";
import { Router } from "express";
import upload from "@/middlewares/multer";

const router = Router();

router.get("/:id", authUser, AnswerController.getById);

router.post("/", upload.array("images"), authUser, AnswerController.create);

router.put("/:id", upload.array("images"), authUser, AnswerController.update);

router.delete("/:id", authUser, AnswerController.delete);

router.get("/question/:questionId", authUser, AnswerController.getByQuestionId);

router.post("/:id/vote", authUser, AnswerController.vote);

router.get("/:id/vote-status", authUser, AnswerController.getVoteStatus);

router.post("/grade-toxicity", authUser, AnswerController.getToxicityGrading);

router.post("/:id/mark-chosen", authUser, AnswerController.markChosen);

router.patch("/:id/toggle-hidden", authUser, AnswerController.toggleHidden);

export default router;
