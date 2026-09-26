import { Router } from 'express';
import { listMentors, getMentor } from '../controllers/mentor.controller.js';

const router = Router();

router.get('/', listMentors);
router.get('/:id', getMentor);

export default router;
