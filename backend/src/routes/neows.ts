import { Router } from 'express'
import { getNeoFeed } from '../controllers/neows'
import { getNeoRadarBrief } from '../controllers/neowsRadarBrief'

const router = Router()

router.get('/api/neows/feed', getNeoFeed)
router.get('/api/neows/radar-brief', getNeoRadarBrief)

export default router
