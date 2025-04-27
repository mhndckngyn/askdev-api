import { Router } from "express";
import CommentController from "@/controllers/comment.controller";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.get(
  "/answer/:answerId",
  authMiddleware,
  CommentController.getByAnswerId
);

router.post("/", authMiddleware, CommentController.create);

router.put("/:id", authMiddleware, CommentController.update);

router.delete("/:id", authMiddleware, CommentController.delete);

router.post("/:id/vote", authMiddleware, CommentController.vote);

router.get("/:id/vote-status", authMiddleware, CommentController.getVoteStatus);

export default router;
