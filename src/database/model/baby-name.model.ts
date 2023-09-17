import { DataTypes, Model } from "sequelize"
import databaseManager from ".."

export class BabyName extends Model {
    declare id: number
    declare firstName: string
    declare gender: string
    declare birthYear: string
    declare phoneNumber: string
    declare createdAt: Date
}

BabyName.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        field: "first_name",
        type: DataTypes.STRING,
        unique: true
    },
    gender: {
        field: "gender",
        type: DataTypes.CHAR,
        unique: true
    },
    birthYear: {
        field: "birth_year",
        type: DataTypes.NUMBER,
        unique: true
    },
    phoneNumber: {
        field: "phone_number",
        type: DataTypes.NUMBER,
        unique: true
    },
    createdAt: {
        field: "created_at",
        type: DataTypes.DATE
    }
}, {
    tableName: "demo_babynames",
    sequelize: databaseManager.connection,
    createdAt: 'created_at',
    updatedAt: false
})