# The Game

![Tentative Architecture](image.png)

## A write up to guide myself

The user plays the game in a browser. The web content is served by Cludfront, where the actual html file(s) are hosted in S3 (tentative)

The current plan is to have a single paged application be used for the UI, using React.

In order for the client to login/register/make a game/resume game session/etc, etc (EXCLUDING the actual gameplay), it has to go through the rest api gateway.

The rest api gateway tells Lambda 