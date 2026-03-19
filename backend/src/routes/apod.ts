import { Router } from 'express'
import { getApod, getApodImage } from '../controllers/apod'

const router = Router()

router.get('/api/apod', getApod)
router.get('/api/apod/image', getApodImage)

export default router
