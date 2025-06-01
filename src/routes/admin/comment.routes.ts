import CommentController from '@/controllers/comment.controller';
import { Router } from 'express';

const router = Router();

router.get('/', CommentController.getByParams);

router.patch('/hide', CommentController.hideComments);

router.patch('/unhide', CommentController.unhideComments);

export default router;
