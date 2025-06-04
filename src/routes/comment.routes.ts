import { Router } from "express";
import CommentController from "@/controllers/comment.controller";
import { authUser } from "@/middlewares/auth";
import upload from "@/middlewares/multer";

const router = Router();

router.get("/answer/:answerId", authUser, CommentController.getByAnswerId);

router.post("/", upload.array("images"), authUser, CommentController.create);

router.put("/:id", upload.array("images"), authUser, CommentController.update);

router.delete("/:id", authUser, CommentController.delete);

router.post("/:id/vote", authUser, CommentController.vote);

router.get("/:id/vote-status", authUser, CommentController.getVoteStatus);

router.post("/grade-toxicity", authUser, CommentController.getToxicityGrading);

router.patch("/:id/toggle-hidden", authUser, CommentController.toggleHidden);

export default router;
