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

				$('body').prepend( this.controlIcons() );

				const controls = this.localPlayerControls();

				const player = plyr.setup(video, {
					html: controls
				});

				player[0].on('play', function (event) {
					localMedia.unpause();
				});

				player[0].on('pause', function (event) {
					localMedia.pause();
				});

				$('#plyr-mic-mute').on('click', function () {
					if ( localMedia.isMuted ) {
						localMedia.unmute();
						$('.plyr-mic-icon').toggle();
						$('.plyr-mic-off-icon').toggle();
					} else {
						localMedia.mute();
						$('.plyr-mic-icon').toggle();
						$('.plyr-mic-off-icon').toggle();
					}
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

	controlIcons() {
		return `<div id="plyr-icon-sprite-hidden">
			<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<defs>
			<symbol id="plyr-captions-off" viewBox="0 0 20 20">
			<title>plyr-captions-off</title>
			<path d="M1.111 1.111h17.778c0.667 0 1.111 0.444 1.111 1.111v12.222c0 0.667-0.444 1.111-1.111 1.111h-5.111l-3 3c-0.222 0.222-0.444 0.333-0.778 0.333s-0.556-0.111-0.778-0.333l-3-3h-5.111c-0.667 0-1.111-0.444-1.111-1.111v-12.222c0-0.667 0.444-1.111 1.111-1.111zM6.133 12.389c2.211 0 3.344-1.467 3.644-2.678l-1.433-0.433c-0.211 0.733-0.867 1.611-2.211 1.611-1.267 0-2.444-0.922-2.444-2.6 0-1.789 1.244-2.633 2.422-2.633 1.367 0 1.978 0.833 2.167 1.589l1.444-0.456c-0.311-1.278-1.433-2.611-3.611-2.611-2.111 0-4.011 1.6-4.011 4.111s1.833 4.1 4.033 4.1zM14.544 12.389c2.211 0 3.344-1.467 3.644-2.678l-1.433-0.433c-0.211 0.733-0.867 1.611-2.211 1.611-1.267 0-2.444-0.922-2.444-2.6 0-1.789 1.244-2.633 2.422-2.633 1.367 0 1.978 0.833 2.167 1.589l1.444-0.456c-0.311-1.278-1.433-2.611-3.611-2.611-2.111 0-4.011 1.6-4.011 4.111s1.833 4.1 4.033 4.1z"></path>
			</symbol>
			<symbol id="plyr-captions-on" viewBox="0 0 20 20">
			<title>plyr-captions-on</title>
			<path d="M1.111 1.111h17.778c0.667 0 1.111 0.444 1.111 1.111v12.222c0 0.667-0.444 1.111-1.111 1.111h-5.111l-3 3c-0.222 0.222-0.444 0.333-0.778 0.333s-0.556-0.111-0.778-0.333l-3-3h-5.111c-0.667 0-1.111-0.444-1.111-1.111v-12.222c0-0.667 0.444-1.111 1.111-1.111zM6.133 12.389c2.211 0 3.344-1.467 3.644-2.678l-1.433-0.433c-0.211 0.733-0.867 1.611-2.211 1.611-1.267 0-2.444-0.922-2.444-2.6 0-1.789 1.244-2.633 2.422-2.633 1.367 0 1.978 0.833 2.167 1.589l1.444-0.456c-0.311-1.278-1.433-2.611-3.611-2.611-2.111 0-4.011 1.6-4.011 4.111s1.833 4.1 4.033 4.1zM14.544 12.389c2.211 0 3.344-1.467 3.644-2.678l-1.433-0.433c-0.211 0.733-0.867 1.611-2.211 1.611-1.267 0-2.444-0.922-2.444-2.6 0-1.789 1.244-2.633 2.422-2.633 1.367 0 1.978 0.833 2.167 1.589l1.444-0.456c-0.311-1.278-1.433-2.611-3.611-2.611-2.111 0-4.011 1.6-4.011 4.111s1.833 4.1 4.033 4.1z"></path>
			</symbol>
			<symbol id="plyr-enter-fullscreen" viewBox="0 0 20 20">
			<title>plyr-enter-fullscreen</title>
			<path d="M11.111 3.333h4l-4.444 4.444 1.556 1.556 4.444-4.444v4h2.222v-7.778h-7.778z"></path>
			<path d="M7.778 10.667l-4.444 4.444v-4h-2.222v7.778h7.778v-2.222h-4l4.444-4.444z"></path>
			</symbol>
			<symbol id="plyr-exit-fullscreen" viewBox="0 0 20 20">
			<title>plyr-exit-fullscreen</title>
			<path d="M1.111 13.333h4l-4.444 4.444 1.556 1.556 4.444-4.444v4h2.222v-7.778h-7.778z"></path>
			<path d="M17.778 0.667l-4.444 4.444v-4h-2.222v7.778h7.778v-2.222h-4l4.444-4.444z"></path>
			</symbol>
			<symbol id="plyr-fast-forward" viewBox="0 0 20 20">
			<title>plyr-fast-forward</title>
			<path d="M8.75 7.968l-8.75-6.857v17.778l8.75-6.857v6.857l11.25-8.889-11.25-8.889z"></path>
			</symbol>
			<symbol id="plyr-microphone-off" viewBox="0 0 20 20">
			<title>plyr-microphone-off</title>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M4.796 11.358c-0.12-0.481-0.18-0.933-0.18-1.358v-1.539c0-0.208-0.076-0.389-0.228-0.541s-0.332-0.228-0.541-0.228c-0.208 0-0.389 0.076-0.541 0.228s-0.228 0.333-0.228 0.541v1.539c0 0.889 0.168 1.747 0.505 2.572l1.214-1.214z"></path>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M10 13.846c1.058 0 1.963-0.377 2.716-1.129s1.13-1.659 1.13-2.716v-1.539l4.339-4.339c0.080-0.080 0.12-0.172 0.12-0.276s-0.040-0.196-0.12-0.276l-0.985-0.986c-0.080-0.080-0.172-0.12-0.277-0.12s-0.196 0.040-0.276 0.12l-14.831 14.831c-0.080 0.080-0.12 0.172-0.12 0.276s0.040 0.197 0.12 0.277l0.986 0.986c0.080 0.080 0.172 0.12 0.276 0.12s0.196-0.040 0.276-0.12l3.053-3.053c0.881 0.545 1.823 0.87 2.824 0.974v1.587h-3.077c-0.208 0-0.389 0.076-0.541 0.228s-0.229 0.332-0.229 0.541c0 0.208 0.076 0.389 0.229 0.541s0.332 0.228 0.541 0.228h7.692c0.208 0 0.389-0.076 0.541-0.228s0.228-0.333 0.228-0.541c0-0.208-0.076-0.389-0.228-0.541s-0.332-0.228-0.541-0.228h-3.077v-1.587c1.739-0.192 3.199-0.943 4.381-2.253s1.773-2.85 1.773-4.621v-1.539c0-0.208-0.076-0.389-0.228-0.541s-0.333-0.228-0.541-0.228c-0.208 0-0.389 0.076-0.541 0.228s-0.228 0.332-0.228 0.541v1.539c0 1.482-0.527 2.75-1.581 3.804s-2.322 1.58-3.804 1.58c-0.865 0-1.687-0.204-2.464-0.613l1.154-1.153c0.433 0.152 0.87 0.228 1.31 0.228z"></path>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M12.218 0.709c-0.661-0.473-1.4-0.709-2.218-0.709-1.058 0-1.963 0.377-2.716 1.13s-1.13 1.659-1.13 2.716v6.154l7.464-7.464c-0.273-0.745-0.739-1.354-1.4-1.827z"></path>
			</symbol>
			<symbol id="plyr-microphone" viewBox="0 0 20 20">
			<title>plyr-microphone</title>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M10 13.846c1.058 0 1.963-0.377 2.716-1.129s1.13-1.659 1.13-2.716v-6.154c0-1.058-0.376-1.963-1.13-2.716s-1.658-1.13-2.716-1.13c-1.058 0-1.963 0.377-2.716 1.13s-1.13 1.659-1.13 2.716v6.154c0 1.058 0.377 1.963 1.13 2.716s1.659 1.129 2.716 1.129z"></path>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M16.694 7.921c-0.152-0.152-0.332-0.228-0.541-0.228s-0.388 0.076-0.541 0.228c-0.152 0.152-0.228 0.332-0.228 0.541v1.539c0 1.482-0.527 2.75-1.581 3.804s-2.321 1.581-3.804 1.581c-1.482 0-2.75-0.527-3.804-1.581s-1.58-2.322-1.58-3.804v-1.539c0-0.208-0.076-0.389-0.228-0.541s-0.332-0.228-0.541-0.228-0.389 0.076-0.541 0.228c-0.152 0.152-0.228 0.332-0.228 0.541v1.539c0 1.771 0.591 3.311 1.773 4.621s2.642 2.061 4.381 2.253v1.587h-3.077c-0.208 0-0.389 0.076-0.541 0.229s-0.228 0.332-0.228 0.541c0 0.208 0.076 0.389 0.228 0.541s0.332 0.229 0.541 0.229h7.692c0.208 0 0.389-0.076 0.541-0.229s0.229-0.333 0.229-0.541c0-0.208-0.076-0.389-0.229-0.541s-0.332-0.229-0.541-0.229h-3.077v-1.587c1.739-0.192 3.199-0.943 4.381-2.253s1.773-2.85 1.773-4.621v-1.539c0-0.208-0.076-0.388-0.229-0.541z"></path>
			</symbol>
			<symbol id="plyr-muted" viewBox="0 0 20 20">
			<title>plyr-muted</title>
			<path d="M13.778 13.889l2.333-2.333 2.333 2.333 1.556-1.556-2.333-2.333 2.333-2.333-1.556-1.556-2.333 2.333-2.333-2.333-1.556 1.556 2.333 2.333-2.333 2.333z"></path>
			<path d="M4.206 6.676h-3.413c-0.476 0-0.794 0.334-0.794 0.836v5.013c0 0.501 0.317 0.836 0.794 0.836h3.413l4.524 4.286c0.556 0.334 1.27 0 1.27-0.668v-13.92c0-0.668-0.714-1.086-1.27-0.668l-4.524 4.286z"></path>
			</symbol>
			<symbol id="plyr-camera-off" viewBox="0 0 20 20">
			<title>plyr-camera-off</title>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M19.434 6.062c-0.346-0.214-0.792-0.234-1.155-0.052l-3.010 1.499v-1.623c0-0.649-0.51-1.159-1.158-1.159h-7.044l-2.629-3.115c-0.419-0.495-1.159-0.561-1.655-0.142-0.495 0.419-0.557 1.158-0.138 1.653l12.918 15.266c0.232 0.274 0.563 0.415 0.897 0.415 0.268 0 0.537-0.091 0.758-0.278 0.495-0.419 0.549-1.16 0.13-1.655l-2.078-2.447v-0.766l3.005 1.499c0.166 0.083 0.35 0.124 0.529 0.124 0.214 0 0.44-0.059 0.628-0.175 0.346-0.214 0.568-0.592 0.568-0.999v-7.046c0-0.407-0.22-0.785-0.566-0.999z"></path>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M0 5.887v9.395c0 0.649 0.544 1.177 1.192 1.177h10.029l-10.072-11.741c-0.632 0.018-1.149 0.533-1.149 1.17z"></path>
			</symbol>
			<symbol id="plyr-pause" viewBox="0 0 20 20">
			<title>plyr-pause</title>
			<path d="M6.667 1.111h-3.333c-0.667 0-1.111 0.444-1.111 1.111v15.556c0 0.667 0.444 1.111 1.111 1.111h3.333c0.667 0 1.111-0.444 1.111-1.111v-15.556c0-0.667-0.444-1.111-1.111-1.111v0z"></path>
			<path d="M13.333 1.111c-0.667 0-1.111 0.444-1.111 1.111v15.556c0 0.667 0.444 1.111 1.111 1.111h3.333c0.667 0 1.111-0.444 1.111-1.111v-15.556c0-0.667-0.444-1.111-1.111-1.111h-3.333z"></path>
			</symbol>
			<symbol id="plyr-play" viewBox="0 0 20 20">
			<title>plyr-play</title>
			<path d="M17.291 9l-12.99-8.75c-0.909-0.625-2.078 0-2.078 1v17.5c0 1 1.169 1.625 2.078 1l12.99-8.75c0.649-0.5 0.649-1.5 0-2v0z"></path>
			</symbol>
			<symbol id="plyr-restart" viewBox="0 0 20 20">
			<title>plyr-restart</title>
			<path d="M10.778 1.333l0.778 7.111 2.333-2.333c2.111 2.111 2.111 5.667 0 7.778-1 1.111-2.444 1.667-3.889 1.667s-2.889-0.556-3.889-1.667c-2.111-2.111-2.111-5.667 0-7.778 0.667-0.667 1.556-1.222 2.556-1.444l-0.667-2.111c-1.333 0.333-2.556 1-3.556 2-3 3-3 7.889 0 11 1.444 1.444 3.444 2.222 5.444 2.222 2.111 0 4-0.778 5.444-2.222 3-3 3-7.889 0-11l2.444-2.444-7-0.778z"></path>
			</symbol>
			<symbol id="plyr-rewind" viewBox="0 0 20 20">
			<title>plyr-rewind</title>
			<path d="M11.25 1.111l-11.25 8.889 11.25 8.889v-6.857l8.75 6.857v-17.778l-8.75 6.857z"></path>
			</symbol>
			<symbol id="plyr-volume" viewBox="0 0 20 20">
			<title>plyr-volume</title>
			<path d="M17.333 3.667c-0.444-0.444-1.111-0.444-1.556 0s-0.444 1.111 0 1.556c1.333 1.333 2 3 2 4.778s-0.667 3.444-2 4.778c-0.444 0.444-0.444 1.111 0 1.556 0.222 0.222 0.556 0.333 0.778 0.333 0.333 0 0.556-0.111 0.778-0.333 1.667-1.667 2.667-3.889 2.667-6.333s-1-4.667-2.667-6.333v0z"></path>
			<path d="M12.536 5.869c-0.418 0.418-0.418 1.044 0 1.462 0.817 0.817 1.106 1.62 1.106 2.669 0 1.040-0.473 2.13-1.106 2.763-0.418 0.418-0.418 1.044 0 1.462 0.161 0.161 0.706 0.291 1.131 0.174 0.125-0.035 0.24-0.091 0.331-0.174 1.306-1.189 1.704-2.937 1.704-4.225 0-0.189-0.003-0.378-0.013-0.567-0.058-1.102-0.354-2.227-1.691-3.564-0.418-0.418-1.044-0.418-1.462 0z"></path>
			<path d="M4.206 6.676h-3.413c-0.476 0-0.794 0.334-0.794 0.836v5.013c0 0.501 0.317 0.836 0.794 0.836h3.413l4.524 4.286c0.556 0.334 1.27 0 1.27-0.668v-13.92c0-0.668-0.714-1.086-1.27-0.668l-4.524 4.286z"></path>
			</symbol>
			<symbol id="plyr-camera" viewBox="0 0 20 20">
			<title>plyr-camera</title>
			<path fill="#fff" style="fill: var(--color1, #fff)" d="M20 5.837v8.319c0 0.643-0.696 1.044-1.253 0.725l-3.465-1.999v0.569c0 1.712-1.388 3.101-3.101 3.101h-9.080c-1.712 0-3.101-1.388-3.101-3.101v-6.902c0-1.712 1.388-3.101 3.101-3.101h9.085c1.712 0 3.101 1.388 3.101 3.101v0.569l3.465-1.999c0.553-0.328 1.249 0.078 1.249 0.717z"></path>
			</symbol>
			</defs>
			</svg>
		</div>`;
	}

	localPlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play' title='Camera'>
			        <svg><use xlink:href='#plyr-camera-off'></use></svg>
			        <span class='plyr__sr-only'>Camera off</span>
			    </button>
			    <button type='button' data-plyr='pause' title='Camera'>
			        <svg><use xlink:href='#plyr-camera'></use></svg>
			        <span class='plyr__sr-only'>Camera on</span>
			    </button>
			    <button type='button' id='plyr-mic-mute' title='Mic'>
			        <svg class="plyr-mic-icon"><use xlink:href='#plyr-microphone'></use></svg>
			        <svg class="plyr-mic-off-icon" style="display:none;"><use xlink:href='#plyr-microphone-off'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <button type='button' data-plyr='fullscreen' title='Fullscreen'>
			        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
			        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
			        <span class='plyr__sr-only'>Toggle Fullscreen</span>
			    </button>
			</div>`;
	}

	remotePlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play' title='Video'>
			        <svg><use xlink:href='#plyr-play'></use></svg>
			        <span class='plyr__sr-only'>Play</span>
			    </button>
			    <button type='button' data-plyr='pause' title='Video'>
			        <svg><use xlink:href='#plyr-pause'></use></svg>
			        <span class='plyr__sr-only'>Pause</span>
			    </button>
			    <button type='button' data-plyr='mute' title='Mute'>
			        <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
			        <svg><use xlink:href='#plyr-volume'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <button type='button' data-plyr='fullscreen' title='Fullscreen'>
			        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
			        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
			        <span class='plyr__sr-only'>Toggle Fullscreen</span>
			    </button>
			</div>`;
	}

	presenterPlayerControls() {
		return `<div class='plyr__controls'>
			    <button type='button' data-plyr='play' title='Video'>
			        <svg><use xlink:href='#plyr-play'></use></svg>
			        <span class='plyr__sr-only'>Play</span>
			    </button>
			    <button type='button' data-plyr='pause' title='Video'>
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
			    <button type='button' data-plyr='mute' title='Mute'>
			        <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
			        <svg><use xlink:href='#plyr-volume'></use></svg>
			        <span class='plyr__sr-only'>Toggle Mute</span>
			    </button>
			    <span class='plyr__volume'>
			        <label for='volume{id}' class='plyr__sr-only'>Volume</label>
			        <input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>
			        <progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>
			    </span>
			    <button type='button' data-plyr='fullscreen' title='Fullscreen'>
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

		return chatClient.initialize();
	}

	/*
	chatConnected(chatClient) {
		const channelFound = chatClient.getChannelByUniqueName(this.room);

		this.pushChatInfo('Connecting..');

		channelFound.then((channel) => {
			this.pushChatInfo('Connected');
            this.setupChatConversation(channel);
		}, (error) => {
			if (error.status == 404) {
				chatClient.createChannel({
					uniqueName: this.room,
					friendlyName: 'General Channel'
				}).then((channel) => {
					this.chatChannel = channel;
					this.pushChatInfo('Connected');
					this.setupChatConversation(channel);
				});
			}
		});
	}
	*/

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
	        if (e.keyCode == 13 && input.val() != '') {
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
