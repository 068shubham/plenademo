import { DataTypes, Model } from 'sequelize'
import databaseManager from '..'
import logger from '../../logger'
import { KaggleBabyName } from '../../manager/kaggle.manager'

export const mapToBabyNameModel = ({ Name: name, Sex: sex }: KaggleBabyName) => ({ name, sex })

export class BabyName extends Model {
    declare id: number
    declare name: string
    declare sex: string
    declare createdAt: Date
}

export async function saveBabyNames(rawNames: KaggleBabyName[]) {
    const startMillis = Date.now()
    try {
        await BabyName.bulkCreate(rawNames.map(mapToBabyNameModel))
        return []
    } catch (err) {
        logger.error('Error saving to database', err)
        return rawNames
    } finally {
        logger.debug(`saveBabyNames took ${(Date.now() - startMillis)}ms`)
    }
}

BabyName.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        field: 'name',
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sex: {
        field: 'sex',
        type: DataTypes.CHAR(1),
        allowNull: false
    }
}, {
    tableName: 'demo_babynames',
    sequelize: databaseManager.connection,
    createdAt: true,
    updatedAt: false
})

BabyName.sync().then(() => {
    logger.info('BabyName table synced with DB')
}).catch(err => {
    logger.error('Error syncing BabyName table', err)
})
