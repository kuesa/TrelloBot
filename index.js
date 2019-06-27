const Discord = require('discord.js');
const express = require('express');
const request = require('request');
const body_parser = require('body-parser');
const fs = require('fs');

const client = new Discord.Client();

const app = express();

// Parses POST requests for JSON
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// Exposed port for Express
const port = 3000;

// Loads client information from client_info.json (See README.md)
let client_info = JSON.parse(fs.readFileSync('client_info.json'));

let board_id;
let hook_id;

// Obtain board ID from Trello, given the URL of the board
request(`${client_info.board_url}.json?key=${client_info.trello_key}&token=${client_info.trello_token}`, (error, response, body) => {
    console.log(response && response.statusCode); // Should be 200
    board_id = JSON.parse(String(body)).id;
    console.log(board_id);
});

// Once Discord client is ready
client.on('ready', () => {

    console.log(`Logged in as ${client.user.tag}!`);

    // Create webhook once Discord client is ready, by sending a POST request to the Trello API
    request.post(`https://api.trello.com/1/tokens/${client_info.trello_token}/webhooks/?key=${client_info.trello_key}`, {
        json: {
            description: "TrelloBot Webhook",
            callbackURL: client_info.callback_url,
            idModel: board_id
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            return;
        }
        hook_id = body.id;
    });


});

// Delete webhook if Admin sends command message
client.on('message', (msg) => {
    if (msg.content === 't!del' && msg.member.hasPermission("ADMINISTRATOR")) {
        console.log('sending delete request')
        request.delete(`https://api.trello.com/1/webhooks/${hook_id}?key=${client_info.trello_key}`, (res) => console.log('Webhook deleted'));
    }
});

// Respond to HEAD requests with a status (because Trello API requires it for security)
app.get('/', (req, res) => res.send('TrelloBot is alive!'));

// Recieve update from Trello webhook
app.post('/', (req, res) => {

    console.log('recieved webhook action');

    let body;
    let value = '-----';

    // Logs the type of action to the console
    console.log(req.body.action.display.translationKey);
    display_values = req.body.action.display;

    // The current list of common action types listed on the Trello API documentation
    switch (String(req.body.action.type)) {
        case 'addMemberToBoard':
            body = 'Added Member to Board';
            break;
        case 'addMemberToCard':
            body = 'Added Member to Card';
            break;
        case 'addMemberToOrganization':
            body = 'Added Member to Organization';
            break;
        case 'commentCard':
            body = 'Added Comment';
            value = `*"${display_values.entities.comment.text}"* on **${display_values.entities.card.text}**`;
            break;
        case 'createCard':
            body = 'Created a Card';
            value = `**${display_values.entities.card.text}** in **__${display_values.entities.list.text}__**`;
            break;
        case 'createChecklist':
            body = 'Created a Checklist';
            break;
        case 'createList':
            body = 'Created a List';
            value = `Created **__${display_values.entities.list.text}__**`;
            break;
        case 'deleteCard':
            body = 'Deleted a Card';
            break;
        case 'createLabel':
            body = 'Added a Label';
            break;
        case 'deleteLabel':
            body = 'Deleted a Label';
            break;
        case 'memberJoinedTrello':
            body = 'Joined Board';
            break;
        case 'moveCardFromBoard':
            body = 'Moved Card From Board';
            break;
        case 'moveCardToBoard':
            body = 'Moved Card To Board';
            break;
        case 'updateBoard':
            body = 'Updated Board';
            break;
        case 'updateCard':
            body = 'Updated a Card';
            if (display_values.translationKey === 'action_move_card_from_list_to_list') {
                value = `Moved **${display_values.entities.card.text}** from **__${display_values.entities.listBefore.text}__** to **__${display_values.entities.listAfter.text}__**`;
            } else if (display_values.translationKey === 'action_renamed_card') {
                value = `Renamed **${display_values.entities.name.text}** to **${display_values.entities.card.text}**`;
            } else if (display_values.translationKey === 'action_archived_card') {
                value = `Archived **${display_values.entities.card.text}**`;
            } else {
                value = `Updated **${display_values.entities.card.text}**`;
            }
            break;
        case 'updateChecklist':
            body = 'Updated a Checklist';
            break;
        case 'updateLabel':
            body = 'Updated a Label';
            break;
        case 'commentCard':
            body = 'Added a Comment';
            break;
        case 'updateList':
            body = 'Updated a List';
            break;
        case 'updateMember':
            body = 'Updated a Member';
            break;
        case 'updateOrganization':
            body = 'Updated Organization';
            break;
        default:
            body = 'Made a Misc. Change to Board';
            console.log(req.body.action.type);
            break;
    }

    // Creates embed based on the Discord.RichEmbed class
    let update_embed = new Discord.RichEmbed()
        .setColor('#0079bf')
        .setAuthor(req.body.action.memberCreator.fullName, '', req.body.model.url)
        .addField(body, value)
        .setTimestamp(req.body.action.date);

    client.channels.get(client_info.channel_id).send(update_embed);

    // Respond to Trello API when it dispatches a webhook action, so that it doesn't think the connection failed
    res.send("Action Recieved!");
});

// Starts Express and Discord client
app.listen(port, () => console.log(`Listening on port ${port}!`));
client.login(client_info.discord_token);