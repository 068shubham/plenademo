import axios, { AxiosError } from 'axios'
import logger from '../logger'
import { KaggleBabyName } from '../manager/kaggle.manager'

function validateEnv() {
    if (!process.env.HUBSPOT_TOKEN) {
        throw new Error('Auth token missing')
    }
    if (!process.env.HUBSPOT_HOST) {
        throw new Error('Hub spot host missing')
    }
}

validateEnv()

const CREATE_CONTACT_V3_ENDPOINT = `${process.env.HUBSPOT_HOST}/crm/v3/objects/contacts/batch/create`
const headers = {
    'content-type': 'application/json',
    'authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
}

export class HubSpotCreateContactRequest {
    properties: {
        firstname: string
        gender: string
        yearofbirth: string
        number: string
    }

    constructor({ YearOfBirth: yearofbirth, Name: firstname, Sex: gender, Number: number }: KaggleBabyName) {
        this.properties = { yearofbirth, firstname, gender, number }
    }
}

export async function createContact(rawList: any[]) {
    const startMillis = Date.now()
    try {
        const inputs = rawList.map(raw => new HubSpotCreateContactRequest(raw))
        const requestBody = { inputs }
        const response = await axios.post(CREATE_CONTACT_V3_ENDPOINT, requestBody, { headers })
        if (response.data.status != 'COMPLETE') {
            logger.error('Error from hubspot', response.data.code)
            throw new Error('Error from hubspot')
        }
        if (response.data.results.length != inputs.length) {
            logger.warn('Missmatch in number of contacts created.', { requested: inputs.length, created: response.data.results.length })
        }
        return []
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            logger.error('Error from hubspot.', { statusCode: err.response?.status, errorMessage: err.response?.data?.message })
        } else {
            logger.error('Unknown error from hubspot')
        }
        return rawList
    } finally {
        logger.debug(`createContact took ${(Date.now() - startMillis)}ms`)
    }
}