import express from 'express';
import { getArtistById, getArtistsByArtForm } from '../controllers/artistController.js';

const router = express.Router();

router.get('/:id', getArtistById);
router.get('/artform/:artFormId', getArtistsByArtForm);

export default router;