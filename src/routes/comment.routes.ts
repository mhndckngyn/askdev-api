import { Router } from "express";
import CommentController from "@/controllers/comment.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.get(
  "/answer/:answerId",
  authUser,
  CommentController.getByAnswerId
);

router.post("/", authUser, CommentController.create);

router.put("/:id", authUser, CommentController.update);

router.delete("/:id", authUser, CommentController.delete);

router.post("/:id/vote", authUser, CommentController.vote);

router.get("/:id/vote-status", authUser, CommentController.getVoteStatus);

export default router;
