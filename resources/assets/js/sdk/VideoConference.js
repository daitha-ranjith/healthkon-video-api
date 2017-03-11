/*!
The following license applies to all parts of this software except as
documented below.

    Copyright (c) 2017, Santosh Baggam.
    All rights reserved.
*/
/* Video conference code */


const Video = require('./../vendors/twilio-video');

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
			url: '/api/conference/connect',
			data: {
				identity: this.identity
			},
			dataType: 'json',
			error: (error) => {
				alert(error.statusText + ': Check your API key.');
			},
			success: (data) => {
				this.jwt = data.jwt;
			},
			beforeSend: (xhr, settings) => {
				xhr.setRequestHeader('Authorization', 'Bearer: ' + token);
			}
		});
	}

	connect() {
		this.checkBrowserSupport();

		const client = new Video.Client(this.jwt);

		const localMedia = new Video.LocalMedia();

		Video.getUserMedia().then(function (mediaStream) {
			localMedia.addStream(mediaStream);
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

	joinedRoom(room) {
		const localParticipant = room.localParticipant;
		const localContainer = localParticipant.media.attach();

		this.localVideoContainer.appendChild(localContainer);
		console.log(localParticipant);
		// ajax call to server goes here for logs..

		// already connected remote participant(s)
		room.participants.forEach((participant) => {
			participant.on('trackAdded', (track) => {
				this.addVideo(participant, track);
			});
		});

		// new remote participant(s)
		room.on('participantConnected', (participant) => {
			participant.on('trackAdded', (track) => {
				this.addVideo(participant, track);
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

	addVideo(participant, track) {
		const timeout = this.timeout;

		if (track.kind == 'video') {
			var container = '';
			// check for presenter participation
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

			// add the timeout event listener
			video.addEventListener('timeupdate', function () {
				if (timeout) {
					if (!this._startTime) this._startTime = this.currentTime;
					const playedTime = this.currentTime - this._startTime;
					if (playedTime >= timeout) {
						this.pause();
						console.log('video stopped');
					}
				}
			});

			video.srcObject = track.mediaStream;

			container.appendChild(wrapper);
		}
	}

	removeVideo(participant) {
		var id = '#' + participant.identity;
		$(id).remove();
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
