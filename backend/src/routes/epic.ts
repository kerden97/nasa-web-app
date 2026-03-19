import { Router } from 'express'
import { getEpicImages, getEpicDates, getEpicImage } from '../controllers/epic'

const router = Router()

router.get('/api/epic', getEpicImages)
router.get('/api/epic/dates', getEpicDates)
router.get('/api/epic/image', getEpicImage)

export default router
