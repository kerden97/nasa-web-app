import { Router } from 'express'
import { getNasaImage, getNasaImageAssets, searchImages } from '../controllers/nasaImage'

const router = Router()

router.get('/api/nasa-image', searchImages)
router.get('/api/nasa-image/assets', getNasaImageAssets)
router.get('/api/nasa-image/image', getNasaImage)

export default router
