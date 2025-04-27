import questionRoute from "@/routes/question.routes";
import answerRoute from "@/routes/answer.routes";
import commentRoute from "@/routes/comment.router";
import { Router } from "express";
import authRoute from "./auth.routes";
import userRoute from "./user.routes";
import tagRoute from "./tag.routes";

const router = Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/question", questionRoute);
router.use("/tag", tagRoute);
router.use("/answer", answerRoute);
router.use("/comment", commentRoute);
export default router;
