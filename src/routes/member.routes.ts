import { Router } from "express";
import MemberController from "@/controllers/member.controller";

const router = Router();

router.get("/", MemberController.getMembers);

export default router;
