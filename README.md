# The Game

![Tentative Architecture](image.png)

## A write up to guide myself

The user plays the game in a browser. The web content is served by Cludfront, where the actual html file(s) are hosted in S3 (tentative)

The current plan is to have a single paged application be used for the UI, using React.

In order for the client to login/register/make a game/resume game session/etc, etc (EXCLUDING the actual gameplay), it has to go through the rest api gateway.

The rest api gateway tells Lambda to do one of the following:

1. Handle user sign-in/registration logic including connection to Aurora

2. Retrieve leaderboard stuff, gameplay history, etc. If session was interuptted last time, also display the previous session

3. Tell ECS to make fargate instance, give a session id


The Fartgate (hehe) bears the folliwing responsibilities:

1. Upon making server, store its location into dynamodb using session id as the key. Create entry in aurora using user id and session id, along with current game state and status

2. Handle all gameplay logic including validating player intent/requests to do stuff

3. (Periodically) store game session data into Aurora to replay it to most recent state

