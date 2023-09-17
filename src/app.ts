import 'dotenv/config'

import { Handler } from './index'

const handler = new Handler({
    baseUrl: 'https://www.kaggle.com/',
    username: 'shubhamagrawal068@gmail.com',
    password: '!V9K6mhTaGZ8XMV',
    downloadPageUrl: 'https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv'
})
handler.run().then((res: any) => {
    console.log('Handler completed')
}).catch((err: any) => {
    console.error('Handler errored', err)
})