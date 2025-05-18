import { Router } from "express";
import questionRoute from "./question.routes";
import answerRoute from "./answer.routes";
import tagRoute from "./tag.routes";
import reportRoute from "./report.routes";
import dashboardRoute from "./dashboard.routes";

const router = Router();

router.use("/question", questionRoute);
router.use("/answer", answerRoute);
router.use("/tag", tagRoute);
router.use("/report", reportRoute);
router.use("/dashboard", dashboardRoute);
export default router;
