import TagController from "@/controllers/tag.controller";
import { Router } from "express";

const router = Router();
router.post("/merge", TagController.mergeTags);
router.put("/:id", TagController.updateTag);
router.post("/", TagController.createTag);
export default router;
