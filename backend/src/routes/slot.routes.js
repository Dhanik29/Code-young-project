import { Router } from 'express';
import { listSlots } from '../controllers/slot.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { slotQuerySchema } from '../validators/booking.validator.js';

const router = Router();

router.get('/', validateRequest(slotQuerySchema, 'query'), listSlots);

export default router;
