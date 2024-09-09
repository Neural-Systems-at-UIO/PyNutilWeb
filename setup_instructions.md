first clone PyNutil web
```bash
https://github.com/Neural-Systems-at-UIO/PyNutilWeb
```
cd into server folder and clone pynutil with 
```bash
https://github.com/Neural-Systems-at-UIO/PyNutil
```
create .env file which includes the following values
```
REACT_APP_WORKBENCH_OIDC_CLIENT_ID = value
REACT_APP_OIDC_CLIENT_REDIRECT_URL = value
REACT_APP_WORKBENCH_OIDC_CLIENT_SECRET= value
```
export the following
```
export FLASK_ENV=development
```
run 
```
python app.py
```
exit folder and cd into PyNutilWeb/client

create another  file called .env.test.local with the same values as the previous .env file

run 
```
npm i
```
and then 
```
npm run start
```

to access the app we have to specify a bucket. 

use the following url (it may be a good idea to bookmark it as it will make refreshing easier)

http://localhost:3000/?clb-collab-id=space-for-testing-the-nutil-web-applicat
