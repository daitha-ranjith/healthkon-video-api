## API

Simple and intuitive API for building your own video conference applications.

- Make One-to-Many video calls
- Conferences with live chat
- Single presenter type conferences
- And more..

## Installation

#### Access key

Get your application Access Key under your **[Account](https://sandbox.healthkon.com/rural/public/av/public/account)** settings.

#### Include the CSS and JS libraries

**CSS:**
```html
<link rel="stylesheet" href="https://sandbox.healthkon.com/rural/public/av/public/public/video.css">
```
**JS:**
```html
<script src="https://sandbox.healthkon.com/rural/public/av/public/public/sdk/video.1.1.min.js"></script>
```

## Usage

A conference basically consists of a Local Participant, Remote Participants and a Room for them to participate. If it is a single presenter type conference, which requires a host or a presenter to start the conference. The conference can be optionally setup with text chat.

To initiate the video conference,

```javascript
var video = new Video({
	identity: identity,
	room: room,
	localVideoContainer: 'local-video-container',
	remoteVideoContainer: 'remote-video-container',
	presenterIdentity: 'presenter@healthkon.com',
	presenterVideoContainer: 'presenter-video-container'
});

video.presenterInitiation(true);
```

Here, identity could be an unique identifier of the participant. `localVideoContainer`, `remoteVideoContainer`, and `presenterVideoContainer` refers to the div ids of their respective containers. You can set the presenter initiation to `true` for single presenter type video conference.

#### Connection

Pass the access key and get connected by,

```javascript
video.authorize(accessTokenFromServer).then(callback);
```

Now, in the callback function, you get all the details regarding the video conference room and chat channel details.
Dig more by looking at the below code.

```javascript
function callback() {
	video.connect().then(function (room) {
		// `room` is the video conference room
		var joined = video.joinRoom(room);
		// if participant is joined in the room
		if (joined.status) {
			// if chat is required
			var chat = video.withChat({
	  			messagesContainer: 'messages', // div id where the chat messages appear
	  			messageInput: 'chat-input' // div id to type in the chat
	  		}).then(function (chatClient) {
				var channelFound = chatClient.getChannelByUniqueName(video.room);
				video.pushChatInfo('Connecting..'); // you can broadcast info to the others with the `pushChatInfo` method
				channelFound.then(function (channel) {
					// `channel` is the chat channel
					// if channel is already found
					video.pushChatInfo('Connected');
		            video.setupChatConversation(channel);
		            channel.sendMessage('has joined'); // trigger messages from the participant with the `sendMessage` method    	
				}, function (error) {
					if (error.status == 404) {
						// create channel if not found
						chatClient.createChannel({
							uniqueName: video.room,
							friendlyName: 'General Channel'
						}).then(function (channel) {
							video.chatChannel = channel;
							video.pushChatInfo('Connected');
							video.setupChatConversation(channel);
							channel.sendMessage('has joined');
						});
					}
				});
			});
		}
	});
}
```

To disconnect the participant from chat channel, `channel.leave()` and to disconnect from the video conference itself, `room.disconnect()`.

## License

Pay-as-you-go subscription model. Link coming soon.
