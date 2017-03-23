/*!
The following license applies to all parts of this software except as
documented below.

    Copyright (c) 2017, Santosh Baggam.
    All rights reserved.
*/
/* Video conference code */


const Video = require('./../vendors/twilio-video');
const Chat = require('./../vendors/twilio-chat');
const plyr  = require('plyr');
const m = require('moment');

class VideoConference {
	constructor(config) {
		this.baseUrl = 'https://healthkon-video-api.herokuapp.com',
		this.identity = config.identity,
		this.room = config.room;
		this.localVideoContainer = document.getElementById(config.localVideoContainer);
		this.remoteVideoContainer = document.getElementById(config.remoteVideoContainer);
		this.presenterIdentity = config.presenterIdentity;
		this.presenterVideoContainer = document.getElementById(config.presenterVideoContainer);

		this.checkBrowserSupport();
	}

	authorize(token) {
		return $.ajax({
			method: 'POST',
			url: this.baseUrl + '/api/conference/authenticate',
			data: {
				identity: this.identity
			},
			dataType: 'json',
			error: (error) => {
				alert('Error: Check your API key.');
			},
			success: (data) => {
				this.videoJwt = data.video_jwt;
				this.chatJwt = data.chat_jwt;
				this.userId = data.user_id;

				this.client = new Video.Client(this.videoJwt);
				this.localMedia = new Video.LocalMedia();

				Video.getUserMedia().then((mediaStream) => {
					this.localMedia.addStream(mediaStream);
					this.attachLocalVideo(this.localMedia);
				});
			},
			beforeSend: (xhr, settings) => {
				xhr.setRequestHeader('Authorization', 'Bearer: ' + token);
			}
		});
	}

	presenterInitiation(status) {
		this.presenterInitiation = status;
	}

	connect() {
		this.checkBrowserSupport();

		return this.client.connect({
			to: this.room,
			localMedia: this.localMedia
		});
	}

	attachLocalVideo(localMedia) {
		const container = $(this.localVideoContainer);

		localMedia.tracks.forEach((track) => {
			const wrapper = document.createElement('div');
			const video = document.createElement('video');

			if (track.kind == 'video') {
				wrapper.appendChild(video);
				video.setAttribute('controls', true);
				video.setAttribute('autoplay', true);
				video.setAttribute('muted', true);
				video.setAttribute('id', track.id);
				video.srcObject = track.mediaStream;
				container.html(wrapper);

				const controls = this.localPlayerControls();

				plyr.setup(video, {
					html: controls,
					audio: false
				});
			}
		});
	}

	joinRoom(room) {
		const localParticipant = room.localParticipant;

		// check for presenter initiation
		if (this.presenterInitiation) {
			if (this.identity != this.presenterIdentity) {
				var presenterFound = false;
				room.participants.forEach((participant) => {
					if (participant.identity == this.presenterIdentity) {
						presenterFound = true;
					}
				});

				if (! presenterFound) {
					room.disconnect();

					return {
						status: false,
						message: 'Waiting for presenter!'
					}
				}
			}
		}

		this.logConnection(room, localParticipant);

		// already connected remote participant(s)
		room.participants.forEach((participant) => {
			participant.on('trackAdded', (track) => {
				this.addVideo(participant, track, room);
			});
		});

		// new remote participant(s)
		room.on('participantConnected', (participant) => {
			participant.on('trackAdded', (track) => {
				this.addVideo(participant, track, room);
			});
		});

		// disconnected participant(s)
		room.on('participantDisconnected', (participant) => {
			// ajax call to server goes here for logs.. using participant identity
			this.removeVideo(participant);
		});

		return {
			status: true,
			message: 'Room connected.'
		}
	}

	setConferenceTimeout(seconds) {
		this.timeout = parseInt(seconds);
	}

	addVideo(participant, track, room) {
		const timeout = (this.timeout) ? this.timeout : 0;

		if (track.kind == 'video') {
			var container = '';

			if (participant.identity == this.presenterIdentity) {
				container = this.presenterVideoContainer;
			} else {
				container = this.remoteVideoContainer;
			}

			const wrapper = document.createElement('div')
			wrapper.setAttribute('id', participant.sid);
			wrapper.setAttribute('class', 'remote-video-wrapper');

			const video = document.createElement('video');

			wrapper.appendChild(video);

			video.setAttribute('controls', true);
			video.setAttribute('autoplay', true);
			video.setAttribute('id', track.id);

			video.srcObject = track.mediaStream;

			container.appendChild(wrapper);

			var controls = '';

			if (participant.identity == this.presenterIdentity) {
				controls = this.presenterPlayerControls();
			} else {
				controls = this.remotePlayerControls();
			}

			plyr.setup(video, {
				html: controls,
				duration: timeout
			});

			var self = this;

			video.addEventListener('timeupdate', function () {
				if (!this._startTime) this._startTime = this.currentTime;
				const playedTime = this.currentTime - this._startTime;

				const timeEl = document.querySelector('.player__time');
				const duration = m.duration(playedTime * 1000, 'milliseconds');

				const remainingTimeEl = document.querySelector('.player__remaining_time');
				const remainingDuration = m.duration(timeout*1000 - playedTime*1000, 'milliseconds');

				if (timeEl) {
					// add event to the player current time
					const hours = duration.hours();
					const minutes = (duration.minutes() > 9) ? duration.minutes() : '0' + duration.minutes();
					const seconds = (duration.seconds() > 9) ? duration.seconds() : '0' + duration.seconds();

				    let time = minutes + ":" + seconds;
				    if (hours > 0) {
				    	time = hours + ":" + time;
				    }

					timeEl.innerHTML = time;
				}

				if (remainingTimeEl) {
					const remainingHours = remainingDuration.hours();
					const remainingMinutes = (duration.minutes() > 9) ? duration.minutes() : '0' + duration.minutes();
					const remainingSeconds = (duration.seconds() > 9) ? duration.seconds() : '0' + duration.seconds();

					let remainingTime = remainingMinutes + ":" + remainingSeconds;
				    if (remainingHours > 0) {
				    	remainingTime = remainingHours + ":" + remainingTime;
				    }

					remainingTimeEl.innerHTML = remainingTime;
				}

				// add timeout event
				if (timeout > 0 && playedTime >= timeout) {
					room.disconnect();
					self.removeVideo(participant);
				}
			});
		}
	}

	localPlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play'>
			        <svg><use xlink:href='#plyr-play'></use></svg>
			        <span class='plyr__sr-only'>Play</span>
			    </button>
			    <button type='button' data-plyr='pause'>
			        <svg><use xlink:href='#plyr-pause'></use></svg>
			        <span class='plyr__sr-only'>Pause</span>
			    </button>
			    <button type='button' data-plyr='mute'>
			        <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
			        <svg><use xlink:href='#plyr-volume'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <button type='button' data-plyr='fullscreen'>
			        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
			        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
			        <span class='plyr__sr-only'>Toggle Fullscreen</span>
			    </button>
			</div>`;
	}

	remotePlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play'>
			        <svg><use xlink:href='#plyr-play'></use></svg>
			        <span class='plyr__sr-only'>Play</span>
			    </button>
			    <button type='button' data-plyr='pause'>
			        <svg><use xlink:href='#plyr-pause'></use></svg>
			        <span class='plyr__sr-only'>Pause</span>
			    </button>
			    <button type='button' data-plyr='mute'>
			        <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
			        <svg><use xlink:href='#plyr-volume'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <button type='button' data-plyr='fullscreen'>
			        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
			        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
			        <span class='plyr__sr-only'>Toggle Fullscreen</span>
			    </button>
			</div>`;
	}

	presenterPlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play'>
			        <svg><use xlink:href='#plyr-play'></use></svg>
			        <span class='plyr__sr-only'>Play</span>
			    </button>
			    <button type='button' data-plyr='pause'>
			        <svg><use xlink:href='#plyr-pause'></use></svg>
			        <span class='plyr__sr-only'>Pause</span>
			    </button>
			    <span class='plyr__time'>
			        <span class='plyr__sr-only'>Current time</span>
			        <span class='plyr__time player__time'>00:00</span>
			    </span>
			    <span class='plyr__time'>
			        <span class='plyr__sr-only'>Duration</span>
			        <span class='plyr__time--duration'>00:00</span>
			    </span>
			    <button type='button' data-plyr='mute'>
			        <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
			        <svg><use xlink:href='#plyr-volume'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <span class='plyr__volume'>
			        <label for='volume{id}' class='plyr__sr-only'>Volume</label>
			        <input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>
			        <progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>
			    </span>
			    <button type='button' data-plyr='fullscreen'>
			        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
			        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
			        <span class='plyr__sr-only'>Toggle Fullscreen</span>
			    </button>
			</div>`;
	}

	removeVideo(participant) {
		this.logDisconnection(participant);
		var id = '#' + participant.sid;
		$(id).remove();
	}

	withChat(chatConfig) {
		this.chatConfig = chatConfig;

		let chatClient = Chat.Client;
		chatClient = new Chat(this.chatJwt);

		chatClient.initialize().then((chatClient) => {
			return this.chatConnected(chatClient);
		});
	}

	chatConnected(chatClient) {
		const channelFound = chatClient.getChannelByUniqueName(this.room);

		this.pushChatInfo('Connecting..');

		channelFound.then((channel) => {
			this.pushChatInfo('Connected');
            this.setupChatConversation(channel);
		}, (error) => {
			if (error.status == 404) {
				return chatClient.createChannel({
					uniqueName: this.room,
					friendlyName: 'General Channel'
				});
				// .then((channel) => {
				// 	this.chatChannel = channel;
				// 	this.pushChatInfo('Connected');
				// 	this.setupChatConversation(channel);
				// });
			}
		});
	}

	setupChatConversation(channel) {
		channel.join().then((channel) => {
			this.pushChatInfo('Joined as ' + this.identity);
		});

		// new message event
		channel.on('messageAdded', (message) => {
			this.pushChatMessage(message.author, message.body);
		});

		// attach message input event
		const input = $('#' + this.chatConfig.messageInput);
	    input.on('keydown', function(e) {
	        if (e.keyCode == 13) {
	            channel.sendMessage(input.val());
	            input.val('');
	        }
	    });
	}

	pushChatMessage(member, message) {
		const el = $('#' + this.chatConfig.messagesContainer);
		const block = `<div class="video-chat-message-block">
				<div class="video-chat-user"> ${member}: </div>
				<div class="video-chat-message"> ${message} </div>
		</div>`;
		el.append(block);
	}

	pushChatInfo(message) {
		const el = $('#' + this.chatConfig.messagesContainer);
		const info = '<div class="video-chat-message-info">' + message + '</div>';
		el.append(info);
	}

	logConnection(room, participant) {
		return $.ajax({
			method: 'POST',
			url: this.baseUrl + '/api/conference/connect',
			data: {
				user_id: this.userId,
				room_sid: room.sid,
				room_name: room.name,
				participant: participant.identity,
				participant_sid: participant.sid
			},
			success: (data) => {
				// console.info('OK. Connected');
			},
			error: (error) => {
				// console.error(error.statusText);
			}
		});
	}

	logDisconnection(participant) {
		return $.ajax({
			method: 'POST',
			url: this.baseUrl + '/api/conference/disconnect',
			data: {
				participant_sid: participant.sid
			},
			success: (data) => {
				// console.info('OK. Disconnected');
			},
			error: (error) => {
				// console.error(error.statusText);
			}
		});
	}

	checkBrowserSupport() {
		if (
                !navigator.getUserMedia &&
                !navigator.webkitGetUserMedia &&
                !navigator.mozGetUserMedia &&
                !navigator.msGetUserMedia
            )
        {
			alert('Video conference is not available in your browser. Kindly use Chrome / Firefox / Opera');
		}
	}
}

export default VideoConference;
