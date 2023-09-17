import axios from 'axios'
import { randomUUID } from 'crypto'
import csvtojson from 'csvtojson'
import decompress from 'decompress'
import { createWriteStream, unlinkSync } from 'fs'
import logger from '../logger'

export function wait(duration: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration)
    })
}

export function getFilenameFromUrl(fileUrl: string) {
    const split = fileUrl.split('?')[0].split('/')
    return split[split.length - 1]
}

export async function downloadFile(fileUrl: string) {
    return new Promise<string[]>(async (resolve, reject) => {
        const response = await axios.get(fileUrl, { responseType: 'stream' })
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
            logger.error('Error whiling downloading', err)
            reject(err)
        })
        response.data.pipe(writeStream)
    })
}

export async function readCSVAsJSON(csvFile: string) {
    return await csvtojson().fromFile(csvFile)
}
