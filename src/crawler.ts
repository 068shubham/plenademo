
import { chromium } from 'playwright'
import databaseManager from './database'
import { BabyNameManager } from './manager/baby-name.manager'
import { KaggleManager } from './manager/kaggle.manager'

export const crawlForBabyNames = async (username: string, password: string) => {
    await databaseManager.init()
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const kaggleManager = new KaggleManager({ context })
    const babyNameManager = new BabyNameManager({ kaggleManager })
    const babyNames = await babyNameManager.extractBabyNames(username, password)
    const validBabyNames = babyNames.filter(b => b.isValid())
    // Improvement: This can be pushed to a queue and processed asynchronously with retries
    await babyNameManager.processBabyNames(validBabyNames)
}
