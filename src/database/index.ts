import { Sequelize } from 'sequelize'
import logger from '../logger'

export class DatabaseManager {
    initialised = false
    connection: Sequelize
    mysqlConfig: any

    constructor() {
        if (!process.env.MYSQL_CONFIG) {
            throw new Error('Please provide valid MYSQL_CONFIG')
        }
        try {
            this.mysqlConfig = JSON.parse(process.env.MYSQL_CONFIG)
        } catch (err: any) {
            logger.error(`Error parsing MYSQL_CONFIG: ${process.env.MYSQL_CONFIG}`, err)
            throw 'MYSQL_CONFIG has invalid JSON.'
        }
        const { host, port, database, password, username, connectTimeout = 10000, ssl = true } = this.mysqlConfig
        this.connection = new Sequelize({
            dialect: 'mysql',
            host, port, database, username, password,
            ssl,
            dialectOptions: {
                ssl: ssl ? { require: true, rejectUnauthorized: false } : undefined,
                connectTimeout
            },
            logging: false,
            retry: {
                max: 10,
                backoffBase: 1000,
                backoffExponent: 1.1,
                report(message, obj, err) {
                    if (err) {
                        if (obj.$current > 5) {
                            logger.error(`[${obj.$current}] - Database connection error: ${message}`)
                        }
                    }
                },
            },
        })
    }
    async init() {
        if (!this.initialised) {
            await this.connection.authenticate()
            this.initialised = true
        }
    }
    async close() {
        await this.connection.close()
    }
}

export default new DatabaseManager()