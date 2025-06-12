import questionRoute from "@/routes/question.routes";
import answerRoute from "@/routes/answer.routes";
import commentRoute from "@/routes/comment.routes";
import { Router } from "express";
import adminRoute from "./admin/admin.routes";
import authRoute from "./auth.routes";
import userRoute from "./user.routes";
import tagRoute from "./tag.routes";
import reportRoute from "./report.routes";
import homeRoute from "./home.routes";
import notificationRoute from "./notification.routes";
import searchRoute from "./search.routes";
import historyRoute from "./history.routes";
import memberRoute from "./member.routes";

import { authAdmin, authUser } from "@/middlewares/auth";
const router = Router();

router.use("/home", homeRoute);
router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/question", questionRoute);
router.use("/tag", tagRoute);
router.use("/answer", answerRoute);
router.use("/comment", commentRoute);
router.use("/report", reportRoute);
router.use("/admin", authUser, authAdmin, adminRoute);
router.use("/notification", notificationRoute);
router.use("/search", searchRoute);
router.use("/history", historyRoute);
router.use("/member", memberRoute);

export default router;
