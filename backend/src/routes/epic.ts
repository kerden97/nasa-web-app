import { Router } from 'express'
import { getEpicImages, getEpicDates } from '../controllers/epic'

const router = Router()

router.get('/api/epic', getEpicImages)
router.get('/api/epic/dates', getEpicDates)

export default router
