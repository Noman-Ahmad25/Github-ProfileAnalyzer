import express from 'express';
import { 
  getProfileHandler,
  updateProfileHandler,
  deleteProfileHandler,
  getAllProfiles
} from '../controllers/profile.controller.js';
import { getProfileSchema } from '../validators/profile.validator.js';
import { validate } from '../middleware/validate.js'
const router = express.Router();



router.get('/', getAllProfiles)


router.get('/:username', validate(getProfileSchema), getProfileHandler);
router.put('/:username', validate(getProfileSchema),updateProfileHandler);
router.delete('/:username', validate(getProfileSchema),deleteProfileHandler);
export default router;