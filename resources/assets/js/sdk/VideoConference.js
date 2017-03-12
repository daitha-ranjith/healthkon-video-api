/*!
The following license applies to all parts of this software except as
documented below.

    Copyright (c) 2017, Santosh Baggam.
    All rights reserved.
*/
/* Video conference code */


const Video = require('./../vendors/twilio-video');
const plyr  = require('plyr');

class VideoConference {
	constructor(config) {
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
			url: '/api/conference/authenticate',
			data: {
				identity: this.identity
			},
			dataType: 'json',
			error: (error) => {
				alert(error.statusText + ': Check your API key.');
			},
			success: (data) => {
				this.jwt = data.jwt;
				this.user_id = data.user_id;
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

		const client = new Video.Client(this.jwt);
		const localMedia = new Video.LocalMedia();

		Video.getUserMedia().then((mediaStream) => {
			localMedia.addStream(mediaStream);
			const video = this.attachLocalVideo(localMedia);
		});

		client.connect({
			to: this.room,
			localMedia: localMedia
		}).then((room) => {
			this.joinedRoom(room);
		}, (error) => {
			alert('Failed to connect to conference. Error: ', error);
		});
	}

	attachLocalVideo(localMedia) {
		const container = this.localVideoContainer;

		localMedia.tracks.forEach((track) => {
			const wrapper = document.createElement('div');
			const video = document.createElement('video');

			if (track.kind == 'video') {
				wrapper.appendChild(video);
				video.setAttribute('controls', true);
				video.setAttribute('autoplay', true);
				video.setAttribute('id', track.id);
				video.srcObject = track.mediaStream;
				container.appendChild(wrapper);

				const controls = this.localPlayerControls();

				plyr.setup(video, {
					html: controls
				});
			}
		});
	}

	joinedRoom(room) {
		const localParticipant = room.localParticipant;

		// check for presenter initiation
		if (this.presenterInitiation) {
			if (this.identity != this.presenterIdentity) {
				var presenterFound = false;
				room.participants.forEach((participant) => {
					if (participant.identity == this.presenterIdentity) presenterFound = true;
				});

				if (! presenterFound) {
					room.disconnect();
					alert('Waiting for presenter!');
					location.reload(true);
					return;
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
	}

	setConferenceTimeout(seconds) {
		this.timeout = seconds;
	}

	addVideo(participant, track, room) {
		const timeout = this.timeout;

		if (track.kind == 'video') {
			var container = '';

			if (participant.identity == this.presenterIdentity) {
				container = this.presenterVideoContainer;
			} else {
				container = this.remoteVideoContainer;
			}

			const wrapper = document.createElement('div')
			wrapper.setAttribute('id', participant.sid);

			const video = document.createElement('video');
			video.setAttribute('class', 'remote-video');

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
				duration: this.timeout
			});

			var self = this;

			video.addEventListener('timeupdate', function () {
				if (!this._startTime) this._startTime = this.currentTime;
				const playedTime = this.currentTime - this._startTime;

				const timeEl = document.querySelector('#player__time');

				if (timeEl) {
					// add event to the player current time
					var seconds = Math.floor(playedTime);
					seconds = ('0' + seconds).slice(-2);
					var minutes = Math.floor(playedTime / 60);
					minutes = ('0' + minutes).slice(-2);
					var hours = Math.floor(playedTime / 3600);
				    hours = ('0' + hours).slice(-2);
				    var time = minutes + ":" + seconds;
				    if (hours > 0) {
				    	time = hours + ":" + time;
				    }
					timeEl.innerHTML = time;
				}

				// add timeout event
				if (playedTime >= timeout) {
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
			    <span class='plyr__time'>
			        <span class='plyr__sr-only'>Current time</span>
			        <span class='plyr__time' id='player__time'>00:00</span>
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
			        <span class='plyr__time' id='player__time'>00:00</span>
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

	logConnection(room, participant) {
		return $.ajax({
			method: 'POST',
			url: '/api/conference/connect',
			data: {
				user_id: this.user_id,
				room_sid: room.sid,
				room_name: room.name,
				participant: participant.identity,
				participant_sid: participant.sid
			},
			success: (data) => {
				console.info('OK. Connected');
			},
			error: (error) => {
				// console.error(error.statusText);
			}
		});
	}

	logDisconnection(participant) {
		return $.ajax({
			method: 'POST',
			url: '/api/conference/disconnect',
			data: {
				participant_sid: participant.sid
			},
			success: (data) => {
				console.info('OK. Disconnected');
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
