
# Pikkal Analytics Backend

This Django Project comprises of two App modules: **core** and **podminer**

`core` is a shared module while `podminer` contains all the specifics for this Microapp. The upcoming Microapps in Pikkal Analytics pipeline will be built as their own separate app modules inside the same project.

The `core` app contains components that will be shared across all of the Pikkal Analytics Microapps (Authentication Models and Show Records, for instance).

The Microapps (`podminer` and the upcoming ones) should not have any dependency on each other, so that each they can be developed and tested independently. They can only have a dependency on the `core` app.

## Components:
For a Development setup, you require the following components running:
- **The Django App**: To serve the API
- **The Redis Server**: Used as a broker for Celery
- **The Celery Worker**: to handle background update jobs

We use **Postgres** as the database on our servers. But for local development use, we can simply use a self-contained **SQLite** database.

## Prerequisites:
- [Python3](https://www.python.org/) 
- [Pipenv](https://realpython.com/pipenv-guide/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Redis](https://redis.io/)

## Installation
- Clone and checkout the code
```
$ git clone https://gitlab.com/pikkalco/podminer
$ cd podminer/backend
```
- Create the Virtual Environment and activate it.
```
$ pipenv shell
```
- Install the Dependencies
```
$ pipenv install
```
- Set the Environment Variable `ANALYTICS_APP_ENV` to `development`. You can do this by simply `export ANALYTICS_APP_ENV=development` every time you run the app or you can create a file named `.env` with this command and `source ./.env` everytime before running the app.
This Environment Variable tells the app to run in a development environment (use a SQLite database instead of Postgres, for example).

- Run the migrations
```
$ python manage.py migrate
```

- Load the dummy data
```
$ python manage.py loaddata fixtures/genre.json fixtures/countries.json
$ python manage.py loaddata fixtures/shows.json fixtures/rankings.json
```

- Run the API Server
```
$ python manage.py runserver
```

### Running the Celery Worker
We use Celery to asynchronously update the Rankings database by fetching data from iTunes. Celery uses Redis as a Broker, so you must have that installed first. Run the Redis server using.
```
$ redis-server
```
To get the Celery worker running, use,
```
$ celery worker --beat -A pikkal_analytics --loglevel=INFO
```
The `--beat` flag runs the CeleryBeat Scheduler in the same process as the Celery Worker. This is for development only. In production, the two must be running in separate services using systemd.
