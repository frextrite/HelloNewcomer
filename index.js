const axios = require('axios');

var roomId = process.env.ROOMID;
var token = process.env.TOKEN;
var heartbeat = " \n";

const sendEndpoint = 'https://api.gitter.im/v1/rooms/' + roomId + '/chatMessages';

var roomStreamConfig = {
  method: 'GET',
  url: 'https://stream.gitter.im/v1/rooms/' + roomId + '/chatMessages',
  headers: {'Authorization': 'Bearer ' + token, 'Accept': 'application/json',},
  responseType: 'stream',
};

var sendMessageConfig = {
  headers: {
    'Authorization': 'Bearer ' + token, 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

function getPayload(username) {
  return data = JSON.stringify({
    text: `Hi @${username} Welcome to coala! Please go through [Newcomer's guide](coala.io/newcomer) and request access to [gitlab](https://gitlab.com/groups/coala/roles/newcomers/), and be sure your username on gitlab is the same as your github username. A maintainer will send you an invite after you request the access to gitlab :-) Afterwards, you can start contributing by choosing any of the [newcomer issue](coala.io/new). 
    The invite may get delayed as maintainers are busy currently. Till then you can explore the coala docs to get a better understanding of codebase(how coala works!). 
    Message credits @KVGarg`,
  });
}

function createAndSendMessage(username) {
  let data = getPayload(username);
  axios.post(sendEndpoint, data, sendMessageConfig)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.message);
    })
}

// run the script
axios(roomStreamConfig)
  .then((response) => {
    const stream = response.data;
    stream.on('data', (chunk) => {
      var receivedPayload = chunk.toString();
      if(receivedPayload !== heartbeat) {
        console.log("Message: " + receivedPayload);
        let JSONData = JSON.parse(chunk);
        let message = JSONData.text;
        let username = JSONData.fromUser.username;
        if(message.toString().toLowerCase() === "hello world") {
          createAndSendMessage(username);
        }
      }
    })
  })
  .catch((error) => {
    console.log(error);
  })
