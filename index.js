const https = require('https');
const axios = require('axios');

var roomId = process.env.ROOMID;
var token = process.env.TOKEN;
var heartbeat = " \n";

var roomMessagesOptions = {
  hostname: 'stream.gitter.im',
  port: 443,
  path: '/v1/rooms/' + roomId + '/chatMessages',
  method: 'GET',
  headers: {'Authorization': 'Bearer ' + token}
};

var sendMessageOptions = {
  hostname: 'api.gitter.im',
  port: 443,
  path: '/v1/rooms/' + roomId + '/chatMessages',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token, 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}

function getPayload(username) {
  return data = JSON.stringify({
    text: "Hi @" + username + " Welcome to coala! Please go through [Newcomer's guide](coala.io/newcomer) and request access to [gitlab](https://gitlab.com/groups/coala/roles/newcomers/), and be sure your username on gitlab is the same as your github username. A maintainer will send you an invite after you request the access to gitlab :-) Afterwards, you can start contributing by choosing any of the [newcomer issue](coala.io/new).  The invite may get delayed as maintainers are busy currently. Till then you can explore the coala docs to get a better understanding of codebase(how coala works!). - Message credits @KVGarg",
  });
}

var receiveAllMessagesRequest = https.request(roomMessagesOptions, (res) => {
  res.on('data', (chunk) => {
    var receivedPayload = chunk.toString();
    if(receivedPayload !== heartbeat) {
      console.log("Message: " + receivedPayload);
      let JSONData = JSON.parse(chunk);
      let message = JSONData.text;
      let username = JSONData.fromUser.username;
      if(message.toString().toLowerCase() === "hello world") {
        const sendMessageRequest = https.request(sendMessageOptions, (resp) => {
          resp.on('data', (d) => {
            console.log(d);
          });
        });
        sendMessageRequest.write(getPayload(username));
        sendMessageRequest.end();
      }
    }
  });
});

receiveAllMessagesRequest.on('error', (error) => {
  console.log("Exception encountered: " + error.message);
});

receiveAllMessagesRequest.end();

