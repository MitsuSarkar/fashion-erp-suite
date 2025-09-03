import type { AppConfig } from '../types'
import defaultConfig from '../config/app.config.json'
export async function loadConfig(): Promise<AppConfig> { return defaultConfig as AppConfig }
