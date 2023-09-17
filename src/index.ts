import 'dotenv/config'

import logger from './logger'
import { crawlForBabyNames } from './crawler'

const [_, __, _username, _password] = process.argv

const { KAGGLE_USERNAME: username = _username, KAGGLE_PASSWORD: password = _password } = process.env

if (!username || !password) {
    logger.error('username / password not found')
    process.exit(-1)
}
logger.info(`Starting for ${username}`)
const startMillis = Date.now()

crawlForBabyNames(username, password).then((res: any) => {
    logger.info('processing completed')
    process.exit(0)
}).catch((err: any) => {
    logger.error('errored', err)
    process.exit(1)
}).finally(() => {
    logger.info(`took ${(Date.now() - startMillis) / 1000} seconds`)
})
