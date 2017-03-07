/*!

The following license applies to all parts of this software except as
documented below.

    Copyright (c) 2017, Santosh Baggam.
    All rights reserved.
*/

/* Our video conference code */
var VideoConference = {
	token: "",
	room: "",
	localVideoContainer: "",
	remoteVideoContainer: "",

	init: function (token, room, localVideoContainer, remoteVideoContainer) {
		this.room = room;
		this.localVideoContainer = document.getElementById(localVideoContainer);
		this.remoteVideoContainer = document.getElementById(remoteVideoContainer);

		var self = this;

		// make the ajax call and validate the connect
		$.ajax({
			method: 'POST',
			url: '/api/conference/connect',
			data: 'api_token=' + token,
			success: function (data) {
				//
				console.log(data.jwt);
				//
				self.token = data.jwt;
				self.connect();
			},
			error: function (data) {
				alert(data.statusText + ': Check your API key.');
			}
		});
	},

	connect: function () {
		if (
                !navigator.getUserMedia &&
                !navigator.webkitGetUserMedia &&
                !navigator.mozGetUserMedia &&
                !navigator.msGetUserMedia
            )
        {
			alert('Video conference is not available in your browser. Kindly use Chrome / Firefox / Opera');
		}
		//
		console.log(this.token);
		//
		var Video = Twilio.Video;
		var client = new Video.Client(this.token);

		var localMedia = new Video.LocalMedia();

		Video.getUserMedia().then(function (mediaStream) {
			localMedia.addStream(mediaStream);
		});

		var self = this;

		client.connect({
			to: this.room,
			localMedia: localMedia
		}).then(function (room) {
			self.conferenceJoined(room);
		}, function (error) {
			alert('Failed to connect to conference. Error:', error);
		});
	},

	conferenceJoined: function conferenceJoined(room) {
		var self = this;
		var localParticipant = room.localParticipant;
		var localContainer = localParticipant.media.attach();

		self.localVideoContainer.appendChild(localContainer);
		// ajax call to server goes here for logs..

		// already connected remote participant(s)
		room.participants.forEach(function (participant) {
			participant.on('trackAdded', function (track) {
				self.addVideo(participant, track);
			});
		});

		// new remote participant(s)
		room.on('participantConnected', function (participant) {
			participant.on('trackAdded', function (track) {
				self.addVideo(participant, track);
			});
		});

		// disconnected participant(s)
		room.on('participantDisconnected', function (participant) {
			// ajax call to server goes here for logs.. using participant identity
			self.removeVideo(participant);
		});
	},

	addVideo: function (participant, track) {
		if (track.kind == 'video') {
			var container = this.remoteVideoContainer;

			var wrapper = document.createElement('div')
			wrapper.setAttribute('id', participant.identity);

			var video = document.createElement('video');
			video.setAttribute('class', 'remote-video');

			wrapper.appendChild(video);

			video.setAttribute('controls', true);
			video.setAttribute('autoplay', true);
			video.setAttribute('id', track.id);

			video.srcObject = track.mediaStream;

			container.appendChild(wrapper);
		}
	},

	removeVideo: function (participant) {
		var id = '#' + participant.identity;
		$(id).remove();
	}
}
