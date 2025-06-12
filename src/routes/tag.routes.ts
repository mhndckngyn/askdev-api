import TagController from '@/controllers/tag.controller';
import { authUser } from '@/middlewares/auth';
import { Router } from 'express';

const router = Router();

router.get('/', TagController.searchTags);

router.post('/generate-description', authUser, TagController.generateDescription);

export default router;
