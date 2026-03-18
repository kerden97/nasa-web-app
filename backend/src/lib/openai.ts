import OpenAI from 'openai'
import { config } from '../config'

export const radarBriefModel = config.ai.model
export const openAiEnabled = Boolean(config.ai.apiKey)

export const openai = openAiEnabled ? new OpenAI({ apiKey: config.ai.apiKey }) : null
