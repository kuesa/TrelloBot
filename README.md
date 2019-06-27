# TrelloBot

A Discord bot that integrates Trello and informs users of changes made to a Trello board. Created for Discord Hack Week 2019.

## Requirements

TrelloBot runs on Node.js, using discord.js, Express, and a few other helper modules, all using the webhook features in Trello's Developer API. Since a webserver is required to accept webhook requests, it is recommended that the bot is hosted on a webserver for production. During testing, you can use [ngrok](https://ngrok.com/) to run on a local machine (more below). A Trello API key is required to create webhooks, and permisions to modify a board are also required.

## Getting Started

1. For development and testing, simply run `npm install` to install all dependencies.
2. Run [ngrok](https://ngrok.com/) on your local machine and copy the address.
3. Create the file `client_info.json` and populate it with your Discord bot secret, your [Trello API key](https://trello.com/app-key) (and the token, yes they are different), the URL of your board, the ID of the channel that TrelloBot should post to, and the URL that points to your webserver or your ngrok url. It should look like this:
    ```json
    {
        "discord_token": "<BOT TOKEN>",
        "trello_token": "<TRELLO TOKEN>",
        "trello_key": "<TRELLO KEY>",
        "board_url": "<TRELLO BOARD ID>",
        "channel_id": "<CHANNEL ID>",
        "callback_url": "<WEBSERVER URL>"
    }
    ```
4. Run `npm start`.
5. TrelloBot will now post updates to Discord describing changes to the board. Any errors will be logged to the console.

## Maintenance & Troubleshooting

As of now, editing anything in `client_info.json` via commands to the bot is disabled due to the inherent unsafety of sending API tokens/keys over instant messaging. You can, however, delete the webhook when needed. For each board, the bot will only create and use one webhook. It is recommended, however, that you delete the webhook when you want to restart the bot or discontinue its use. To do this, type `t!del` in the chat. This will only work for those with Administrator priviledges.

If TrelloBot is sending duplicate messages, a number of things could be happening. If the webhook fails to post an action from the Trello API to your webserver/ngrok, it will attempt to retry three times. Make sure that you are able to send post request responses (to let the Trello API know you're alive). Another possibility is that you have multiple webhooks. If `t!del` is not fixing the issue, the fastest way is to get a new key and/or token from Trello, since this will actually delete the unwanted webhooks.

## Future Goals

I would like to add a wider variety of responses and updates. There are quite a few different types of actions, all of which need to be experimented with. Since I am limited by testing on a single-person Trello board, I don't have a lot of information regarding use with multiple people, and with large projects. If you would like a feature to be added, feel free to submit an issue!

## Contributing

All contributions are welcome. Please be descriptive of your changes and why you want to change something. The following formatting guidelines should be followed, for readability sake:

* All local variables must be in `snake_case`.
* Semicolons must be used where proper.
* Files must have LF set as their end-of-line sequence.
* Use `let` over `var` unless scope requires the use of `var`.
* No drop brackets
* Use arrow functions (they look cooler, come on now)

When in doubt, just try to emulate the coding style present in the code already.