import { Router } from 'express'
import { searchImages } from '../controllers/nasaImage'

const router = Router()

router.get('/api/nasa-image', searchImages)

export default router
