import express from 'express';
import { getExperiencesByArtForm, getExperiencesByArtist, createExperience } from '../controllers/experienceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/artform/:artFormId', getExperiencesByArtForm);
router.get('/artist/:artistId', getExperiencesByArtist);
router.post('/', protect, createExperience);

export default router;