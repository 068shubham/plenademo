import { randomUUID } from 'crypto'
import decompress from 'decompress'
import { unlinkSync } from 'fs'
import { BrowserContext } from 'playwright'
import logger from '../logger'
import { BABY_NAMES_PAGE_URL, KAGGLE_BASE_URL, NUMBER_REGEX, YEAR_OF_BIRTH_REGEX } from '../common/constant'

type RawBabyNameJson = {
    YearOfBirth: string
    Name: string
    Sex: string
    Number: string
}

export class KaggleBabyName {
    YearOfBirth: string
    Name: string
    Sex: string
    Number: string

    constructor(rawObj: RawBabyNameJson) {
        const { Name, Sex, YearOfBirth, Number } = rawObj
        this.Name = Name
        this.Sex = Sex
        this.YearOfBirth = YearOfBirth
        this.Number = Number
    }

    isValid() {
        return this.Name &&
            ['F', 'M'].includes(this.Sex) &&
            YEAR_OF_BIRTH_REGEX.test(this.YearOfBirth) &&
            NUMBER_REGEX.test(this.Number)
    }

}

export class KaggleError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export interface KaggleConfig {
    context: BrowserContext
}

export class KaggleManager {

    private context: BrowserContext

    constructor({ context }: KaggleConfig) {
        this.context = context
    }

    /**
     * Goes to the KAGGLE_BASE_URL and logs in using the provided credentials.
     * @param username
     * @param password 
     */
    async kaggleLogin(username: string, password: string) {
        const page = await this.context.newPage()
        try {
            await page.goto(KAGGLE_BASE_URL)
            const goToSignPageInButton = page.getByText('Sign In')
            await goToSignPageInButton.click()
            const signInWithEmailButton = page.getByText('Sign in with Email')
            await signInWithEmailButton.click()
            const usernameInput = page.getByPlaceholder('Enter your email address or username')
            await usernameInput.fill(username)
            const passwordInput = page.getByPlaceholder('Enter password')
            await passwordInput.fill(password)
            const signInButton = page.getByRole('button').getByText('Sign In')
            await signInButton.click()
            await page.waitForSelector(`div:has-text('Welcome,')`)
            await page.close()
        } catch (err: unknown) {
            logger.error('Error in kaggleLogin', err)
            if (err instanceof Error) {
                throw new KaggleError(err.message)
            } else {
                throw new KaggleError('Unknown error')
            }
        } finally {
            await page.close()
        }
    }

    /**
     * Goes to the BABY_NAMES_PAGE_URL and downloads babyNamesUSYOB-full.csv file
     * @param targetFolder folder to download the filer
     * @returns downloaded CSV file
     */
    async downloadBabyNamesCsv(targetFolder: string) {
        const page = await this.context.newPage()
        try {
            await page.goto(BABY_NAMES_PAGE_URL)
            await page.waitForSelector(`body:has-text('babyNamesUSYOB-full.csv')`)
            const locator = page.getByText('babyNamesUSYOB-full.csv')
            const allMatches = await locator.all()
            const heading = allMatches[0]
            const parent = heading.locator('..')
            const allButtons = await parent.locator('i').all()
            const downloadButton = allButtons[0]
            const downloadPromise = page.waitForEvent('download')
            await downloadButton.click()
            const download = await downloadPromise
            const zipFilename = `${targetFolder}/${randomUUID()}.zip`
            await download.saveAs(zipFilename)
            const files = await decompress(zipFilename, targetFolder)
            unlinkSync(zipFilename)
            if (files && files.length > 0) {
                return files[0].path
            } else {
                throw new KaggleError('File not found')
            }
        } catch (err: unknown) {
            logger.error('Error in downloadBabyNamesCsv', err)
            throw err
        } finally {
            await page.close()
        }
    }

}
