import axios from 'axios'
import { randomUUID } from 'crypto'
import csvtojson from 'csvtojson'
import decompress from 'decompress'
import { createWriteStream, unlinkSync } from 'fs'
import logger from '../logger'

export function wait(duration: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _) => {
        setTimeout(resolve, duration)
    })
}

export function getFilenameFromUrl(fileUrl: string) {
    const split = fileUrl.split('?')[0].split('/')
    return split[split.length - 1]
}

export async function downloadFile(fileUrl: string) {
    return new Promise<string[]>((resolve, reject) => {
        axios.get(fileUrl, { responseType: 'stream' }).then(response => {
            const tempFilename = `.${randomUUID()}`
            const writeStream = createWriteStream(tempFilename)
            writeStream.on('close', () => {
                decompress(tempFilename, '.').then((files) => {
                    resolve(files.map(f => f.path))
                }).catch(err => {
                    logger.error('Error whiling decompressing', err)
                    reject(err)
                }).finally(() => {
                    unlinkSync(tempFilename)
                })
            })
            writeStream.on('error', (err) => {
                logger.error('Error whiling writing', err)
                reject(err)
            })
            response.data.pipe(writeStream)
        }).catch(err => {
            logger.error('Error downloading', err)
            reject(err)
        })
    })
}

export async function readCSVAsJSON(csvFile: string) {
    return await csvtojson().fromFile(csvFile)
}
