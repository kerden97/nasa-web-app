import { Router } from 'express'
import { getApod } from '../controllers/apod'

const router = Router()

router.get('/api/apod', getApod)

export default router
