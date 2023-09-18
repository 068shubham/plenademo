import logger from '../logger'

import { unlinkSync } from 'fs'
import { createContact } from '../client/hubspot.client'
import { TEMP_FOLDER } from '../common/constant'
import { readCSVAsJSON } from '../common/util'
import { saveBabyNames } from '../database/model/baby-name.model'
import { KaggleBabyName, KaggleManager } from './kaggle.manager'

interface BabyNameManagerConfig {
    kaggleManager: KaggleManager
}

export class BabyNameManager {

    private kaggleManager: KaggleManager

    constructor({ kaggleManager }: BabyNameManagerConfig) {
        this.kaggleManager = kaggleManager
    }

    getValidNames(csvData: KaggleBabyName[]) {
        return csvData.filter(d => d.isValid())
    }

    /**
     * Login to kaggle, download baby names csv and parse to JSON
     * @param username 
     * @param password 
     * @returns List of raw baby names
     */
    async extractBabyNames(username: string, password: string): Promise<KaggleBabyName[]> {
        try {
            await this.kaggleManager.kaggleLogin(username, password)
            const csvFilename = await this.kaggleManager.downloadBabyNamesCsv(TEMP_FOLDER)
            const filePath = `${TEMP_FOLDER}/${csvFilename}`
            const jsonData = await readCSVAsJSON(filePath)
            unlinkSync(filePath)
            return jsonData.map(j => new KaggleBabyName(j))
        } catch (err: unknown) {
            logger.error('Error in extractBabyNames', err)
            throw err
        }
    }

    /**
     * Persists names to db and creates contacts in hubspot
     * @param rawNames List of raw baby names
     */
    async processBabyNames(rawNames: KaggleBabyName[]) {
        logger.info(`Total ${rawNames.length} records to process`)
        await Promise.all([
            this.saveBabyNamesInDatabase(Object.assign([], rawNames)),
            this.pushToHubspot(Object.assign([], rawNames))
        ])
    }

    /**
     * Save the babyNames in the database in batches
     * @param babyNames list of baby names in raw form
     * @returns list of names for which db write failed
     */
    async saveBabyNamesInDatabase(babyNames: KaggleBabyName[]) {
        logger.info('Starting saveBabyNamesInDatabase')
        const batchSize = process.env.DB_BATCH_SIZE || 10000
        const failedMessages = []
        while (babyNames.length > 0) {
            const batch = babyNames.splice(0, +batchSize)
            const failures = await saveBabyNames(batch)
            failedMessages.push(...failures)
        }
        // Todo: Add retries
        return failedMessages
    }

    /**
     * Creates contacts in hubspot for each name in batches.
     * @param json list of baby names in raw form
     * @returns list of names for which creation failed
     */
    async pushToHubspot(babyNames: KaggleBabyName[]) {
        logger.info('Starting pushToHubspot')
        const batchSize = process.env.HUBSPOT_SIZE || 2000
        const failedMessages = []
        while (babyNames.length > 0) {
            const batch = babyNames.splice(0, +batchSize)
            const promises = []
            while (batch.length > 0) {
                const chunk = batch.splice(0, 100)
                promises.push(createContact(chunk))
            }
            const responses = await Promise.all(promises)
            for (const failures of responses) {
                if (failures.length > 0) {
                    failedMessages.push(...failures)
                }
            }
        }
        // Todo: Add retries
        logger.error(`Total ${failedMessages.length} records failed in pushToHubspot`)
        return failedMessages
    }

}
