# Introduction
Build a system to fetch data from Kaggle datasets & push the data to Hubspot

The following needs to be done to fetch the data from Kaggle in headless chrome using playwright
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

## Sample .env file
Below is a sample .env file for the demo.
```
MYSQL_CONFIG={"host":"localhost","port":3306, "database":"plenademo", "username":"plenademo", "password":"plenademo", "connectTimeout": 20000, "ssl": false}
HUBSPOT_HOST=https://api.hubapi.com
HUBSPOT_TOKEN=<token>
ENABLE_FILE_LOGS=true
KAGGLE_USERNAME=<username>
KAGGLE_PASSWORD=<password>
```


## DB setup
If you already have a mysql server running then update .env file with correct details else follow below steps.
* ensure docker engine is running
* ensure 3306 port is available or change to a different port in local-db/docker-compose.yml
* `chmod +x ./local-db/setup.sh`
* `./local-db/setup.sh`
* wait for mysql to start accepting connection

## Running the demo
* `chmod +x ./scripts/*`
* create and update .env file
* `npm install`
* `npm run local`

# Data model details

## Hubgspot mappings
* Name - firstname
* Sex - gender
* YearOfBirth - yearofbirth
* Number - phone

## Mysql mappings
table - demo_babynames
* Name - name
* Sex - sex
