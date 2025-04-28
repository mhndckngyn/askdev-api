import questionRoute from "@/routes/question.routes";
import answerRoute from "@/routes/answer.routes";
import commentRoute from "@/routes/comment.routes";
import { Router } from "express";
import authRoute from "./auth.routes";
import userRoute from "./user.routes";
import tagRoute from "./tag.routes";
import reportRoute from "./report.routes";
const router = Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/question", questionRoute);
router.use("/tag", tagRoute);
router.use("/answer", answerRoute);
router.use("/comment", commentRoute);
router.use("/report", reportRoute);
export default router;
