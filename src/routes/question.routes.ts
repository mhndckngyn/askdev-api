import { Router } from "express";
import QuestionController from "@/controllers/question.controller";
import { authUser } from "@/middlewares/auth";
import upload from "@/middlewares/multer";

const router = Router();

router.get("/:id", QuestionController.getById);

router.get("/by-tag/:tagId", QuestionController.getByTag);

router.get("/", QuestionController.getByParams);

router.post("/", upload.array("images"), authUser, QuestionController.create);

router.put("/:id", authUser, QuestionController.update);

// router.delete('/:id', authMiddleware, QuestionController.delete);

router.post("/:id/vote", authUser, QuestionController.vote);

router.get("/:id/vote-status", authUser, QuestionController.getVoteStatus);

router.get("/:id/edit-history", authUser, QuestionController.getEditHistory);

export default router;
