import { Router } from "express";
import questionRoute from "./question.routes";
import answerRoute from "./answer.routes";
import commentRoute from "./comment.routes";
import tagRoute from "./tag.routes";
import reportRoute from "./report.routes";
import dashboardRoute from "./dashboard.routes";
import userRoute from './user.routes';
import banRoute from './ban.routes';

const router = Router();

router.use("/question", questionRoute);
router.use("/answer", answerRoute);
router.use('/comment', commentRoute);
router.use("/tag", tagRoute);
router.use("/report", reportRoute);
router.use("/dashboard", dashboardRoute);
router.use("/user", userRoute);
router.use("/ban", banRoute);
export default router;
