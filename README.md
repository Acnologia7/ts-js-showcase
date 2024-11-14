# Alert Evidence

## Prequisities

### Docker

1. Make sure you have working Docker on your system

### Clone this repo

Use command `git clone https://github.com/Acnologia7/ts-js-showcase`

## Instalation

### 1. Prepare .env file

You can copy this and edit paths to your liking. Also make sure you have it on same level as `docker-compose.yml`

```
# Postgres configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=passwd123
POSTGRES_DB=alert_db
POSTGRES_PORT=5432

# Backend cofiguration
SERVER_PORT=5000
MAX_FILES_ALLOWED=3  # configure limit how many files can be uploaded and stored per Record
DEFAULT_USER_ID=1    # default user symulating "account" under which are records stored in db
ALLOWED_MIME_TYPES=['image/jpeg', 'image/png', 'application/pdf'] # filter which filetypes could be uploaded
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# Frontend configuration
FRONTEND_PORT=3000
REACT_APP_API_URL="http://localhost:${SERVER_PORT}/api"
```

### 3. Build and start app

Run `docker compose up` command

### How to navigate app

1. Main page:

- "View Alert" - takes you to the page where all records are listed
- "Create New Alert" - takes you to the page where you can find form for inputs

2. Create New Alert page:

- "Create Alert" - submit form
- "Back" - takes you back on main page
- "Explore/Procházet" - choose files to upload
- Form inputs:
  - `sender : required (string)`
  - `age : required (positive number)`
  - `description : optional (string)`
  - `files upload : optional (Mime types)`
- success - green
- fail - red

2. View Alert page:

- "Detail" - takes you to the detail info of specific record
- "Back" - takes you back to the main page
- If no record in db then red error msg shows up

3. Detail page:

- "Update Alert" - submit form
- "Back" - takes you back on View Alert page
- "Explore/Procházet" - choose files to upload
- "Delete Alert" - deletes whole record with all associated files
- "Delete file" - marks file to be deleted in next update confirmation

- Form inputs:
  - `sender : optinal (string) - prefilled`
  - `age : optional (positive number) - prefilled`
  - `description : optional (string) - prefilled `
  - `files upload : optional (Mime types)`
  - `list of uploaded files`
- success - green
- fail - red

### Files upload rules:

- max file size - 5MB
- max file count - configurable via .env
- allowed file types - configurable via .env

#### The logic behind file count restriction is following:

- user can upload how many files they wish via one or multiple uploads up to the limit
- user also can upload and delete files in way that still is in limit, so for example:
  - max upload limit = 3
  - already uploaded files count = 1
  - want to upload next 3 files in one update that means: 1+3=4 -> not allowed
  - you have to mark already uploaded file for delete then: 1-1+3=3 -> allowed
  - or upload less files: 1+2=3 -> allowed

### Known issues:

- not implemented Detailed error messages to inform user
- weird bug after trying to upload files with not allowed mime type (going back or refresh helps, files are not uploaded due to restriction but no fail msg is given)
- not nice looking FE
- not best UI/UX impression
- upload file button language is probably based on browser localization
- not tests for FE
- few tests for BE (mostly tested via Postman)
