import { Router } from 'express'
import { getNeoFeed } from '../controllers/neows'

const router = Router()

router.get('/api/neows/feed', getNeoFeed)

export default router
