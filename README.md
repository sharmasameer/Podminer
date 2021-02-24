# Podminer
Podminer uses the iTunes API to provide a catalog of Podcast Rankings on the iTunes Store. 

The app consists of a Frontend React Application and a Backend Django Application, which serves the API. The Django Application is accompanied by other additional services that need to be running for the application to work as expected.


### Frontend
Setting up the React App is pretty trivial. The guidelines are provided [here](frontend/README.md).

If you are only working on the Frontend part, you may ignore the Django Setup and instead point the API URL in your source code to the staging server, which is currently `http://app0api.pikkalfm.com`. Otherwise, the API URL should be set to `http://localhost:8000`


### Backend
The guildelines for setting up the Backend are provided [here](backend/README.md).

### CI/CD - Jenkins
CI/CD is configured for master branch in the below jenkins url:
`http://13.250.106.253:8080/job/app0_prod/`