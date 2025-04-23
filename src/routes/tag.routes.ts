import TagController from '@/controllers/tag.controller';
import { Router } from 'express';

const router = Router();

router.get('/', TagController.searchTags);

export default router;
