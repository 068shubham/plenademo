# Introduction
Build a system to fetch data from Kaggle datasets & push the data to Hubspot

The following needs t be done to fetch the data from Kaggle in headless chrome using playwright
* Login into https://www.kaggle.com/ with email & password
* Navigate to https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv & download the csv file there with the names of the babies
* Store the names in mysql db
* Following fields should be extracted & stored in DB:
  * Name
  * Sex
* Send this data to Hubspot using API & store there as Contacts
* Final expected output: 
  * Working demo
  * Brief description of the code
  * Proposal of new steps to escalate this to a production level
* Tech stack to be used for this
  * Nodejs
  * Sequelize ORM & mysql db
  * Playwright 

## Links:
* https://playwright.dev/
* https://developers.hubspot.com/docs/api/crm/contacts

# Local setup
* run docker-compose up -d
* update app.ts file with username and password
* update .env file with correct data
* `npm run build`
* `npm run start`
