import axios, { AxiosError } from "axios"
import logger from "../logger"


interface ContactDetails {
    firstname: string,
    gender: string,
    yearofbirth: string,
    phone: string
}

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

export async function createContact(contacts: ContactDetails[]) {
    try {
        const requestBody = { inputs: contacts.map(properties => ({ properties })) }
        const response = await axios.post(CREATE_CONTACT_V3_ENDPOINT, requestBody, { headers })
        if (response.data.status != 'COMPLETE') {
            logger.error('Error from hubspot', response.data.code)
            throw new Error('Error from hubspot')
        }
        if (response.data.results.length != contacts.length) {
            logger.warn('Missmatch in number of contacts created.', { requested: contacts.length, created: response.data.results.length })
        }
        return []
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            logger.error('Error from hubspot.', { statusCode: err.response?.status })
        } else {
            logger.error('Unknown error from hubspot')
        }
        return contacts
    }
}