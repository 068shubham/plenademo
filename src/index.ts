import 'dotenv/config'

import { randomUUID } from 'crypto'
import decompress from 'decompress'
import { rmSync, unlinkSync } from 'fs'
import { Page, chromium } from 'playwright'
import { readCsvAsJSON } from './util'

import logger from './logger'
import { BabyName } from './database/model/baby-name.model'
import { createContact } from './client/hubspot.client'

const mapToBabyNameModel = ({ YearOfBirth: birthYear, Name: firstName, Sex: gender, Number: phoneNumber }: any) => ({ firstName, gender, birthYear, phoneNumber })
const mapToHubSpotRequest = ({ YearOfBirth: yearofbirth, Name: firstname, Sex: gender, Number: phone }: any) => ({ firstname, gender, yearofbirth, phone })


interface HandlerConfig {
    baseUrl: string
    username: string
    password: string
    downloadPageUrl: string
}


export class Handler {
    baseUrl: string = 'https://www.kaggle.com/'
    username: string = 'shubhamagrawal068@gmail.com'
    password: string = '!V9K6mhTaGZ8XMV'
    downloadPageUrl: string = 'https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv'

    constructor({ baseUrl, username, password, downloadPageUrl }: HandlerConfig) {
        this.baseUrl = baseUrl
        this.username = username
        this.password = password
        this.downloadPageUrl = downloadPageUrl
    }

    async run() {
        const browser = await chromium.launch()
        const context = await browser.newContext()
        try {
            const page = await context.newPage()
            await this.login(page)
            logger.info(`Login completed for ${this.username}`)
            await page.goto(this.downloadPageUrl)
            logger.info(`${this.downloadPageUrl} loaded`)
            const zipFileName = await this.download(page)
            await page.close()
            const names = await this.extractJSON(zipFileName)
            const filteredNames = names.filter(n => n.Sex && n.Number && n.Name && n.YearOfBirth)
            logger.info(`Total ${filteredNames.length} records to process`)
            // await this.saveInDatabase(filteredNames.map(mapToBabyNameModel))
            await this.updateToHubspot(filteredNames.map(mapToHubSpotRequest))
            // await Promise.all([
            //     this.saveInDatabase(filteredNames.map(mapToBabyNameModel)),
            //     this.updateToHubspot(filteredNames.map(mapToHubSpotRequest))
            // ])
        } catch (err) {
            logger.error("Error whiling processing", err)
        } finally {
            await context.close()
        }
    }

    async login(page: Page) {
        await page.goto(this.baseUrl)
        const goToSignPageInButton = page.getByText('Sign In')
        await goToSignPageInButton.click()
        const signInWithEmailButton = page.getByText('Sign in with Email')
        await signInWithEmailButton.click()
        const usernameInput = page.getByPlaceholder('Enter your email address or username')
        await usernameInput.fill(this.username)
        const passwordInput = page.getByPlaceholder('Enter password')
        await passwordInput.fill(this.password)
        const signInButton = page.getByRole('button').getByText('Sign In')
        await signInButton.click()
        await page.waitForSelector(`div:has-text("Welcome,")`)
    }

    async download(page: Page) {
        await page.waitForSelector(`body:has-text("babyNamesUSYOB-full.csv")`)
        const locator = page.getByText('babyNamesUSYOB-full.csv')
        const allMatches = await locator.all()
        const heading = allMatches[0]
        const parent = heading.locator('..')
        const allButtons = await parent.locator('i').all()
        const downloadButton = allButtons[0]
        const downloadPromise = page.waitForEvent('download')
        await downloadButton.click()
        const download = await downloadPromise
        const zipFile = `.temp/${randomUUID()}.zip`
        await download.saveAs(zipFile)
        return zipFile
    }

    async extractJSON(zipFile: string) {
        const files = await decompress(zipFile, ".temp")
        const csvFileName = `.temp/${files[0].path}`
        const jsonData = await readCsvAsJSON(csvFileName)
        unlinkSync(csvFileName)
        rmSync(zipFile)
        return jsonData
    }

    async saveInDatabase(json: any[]) {
        const batchSize = process.env.DB_BATCH_SIZE || 10000
        while (json.length > 0) {
            const batch = json.splice(0, +batchSize)
            try {
                await BabyName.bulkCreate(batch)
            } catch (err) {
                logger.error('Error saving to database', err)
            }
        }
    }

    async updateToHubspot(json: any[]) {
        const batchSize = process.env.HUBSPOT_SIZE || 2000
        const failedMessages = []
        while (json.length > 0) {
            const batch = json.splice(0, +batchSize)
            const promises = []
            while (batch.length > 0) {
                const chunk = batch.splice(0, 100)
                promises.push(createContact(chunk))
            }
            const responses = await Promise.all(promises)
            for (let res of responses) {
                if (res.length > 0) {
                    failedMessages.push(...res)
                }
            }
        }
        await this.updateToHubspot(failedMessages)
    }

}
