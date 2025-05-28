import { Router } from "express";
import NotificationController from "@/controllers/notification.controller";
import { authUser } from "@/middlewares/auth";

const router = Router();

router.get("/", authUser, NotificationController.getAllByUser);

router.delete("/:id", authUser, NotificationController.deleteById);
router.delete("/", authUser, NotificationController.deleteAll);

router.patch("/:id/read", authUser, NotificationController.markAsRead);
router.patch("/read-all", authUser, NotificationController.markAllAsRead);

router.patch("/:id/unread", authUser, NotificationController.markAsUnread);
router.patch("/unread-all", authUser, NotificationController.markAllAsUnread);

export default router;
