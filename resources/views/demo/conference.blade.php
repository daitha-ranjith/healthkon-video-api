@extends('layouts.app')

@section('content')
	<style>
		#preview {
		    max-width: 610px;
		    max-height: 650px;
		    border: none;
		}
		#remote-video-container {
			min-height: 350px;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
		}
		#remote-video-container > div {
			width: 50%;
		}
		#remote-video-container > div:only-child {
			width: 100%;
		}
		#remote-video-container .plyr__video-wrapper {
			background-color: #f2f2f2;
		}
		video.remote-video {
			max-height: 350px;
		}
		#local-video-container {
			background-color: rgba(0, 0, 0, 0.18);
			min-width: 313px;
			text-align: center;
		}
		#local-video-container .plyr {
			min-width: 150px;
		}
		#local-video-container > div {
			display: inline-block;
			margin: 0 auto;
			max-width: 150px;
		}
		#chat-container {
			padding: 5px;
		}
		.video-chat-user {
			display: inline;
			font-weight: bold;
		    color: green;
		}
		.video-chat-message {
			display: inline;
		}
	</style>

	<div class="container">
		<div class="row">
			<div class="col-md-10 col-md-offset-1">
				<div class="panel panel-default">
	                <div class="panel-heading">Conference Demo</div>

	                <div class="panel-body">

						<form class="form-inline" id="conference">
						  <div class="form-group">
						    <label for="room-name">Enter the room name: </label>
						    <input type="room-name" class="form-control" id="room-name" placeholder="room name..">
						  </div>
						  <button id="connect-button" type="submit" class="btn btn-success">Connect</button>
						  <a href="#" id="disconnect-button" class="btn btn-danger disabled">Disconnect</a>
						</form>

						<hr>

						<!-- Videocon container -->
						<div class="col-md-8" id="videocon-container">
							<div id="presenter-video-container"></div>
							<div id="remote-video-container"></div>
							<div id="local-video-container"></div>
						</div>

						<!-- Chat container -->
						<div class="col-md-4" id="chat-container">
							<h4>Chat</h4>
							<hr>
							<div id="chat-container"></div>
							<div>
								<input class="form-control" id="chat-input" type="text">
								<br>
							</div>
						</div>

	                </div>
	            </div>
			</div>
		</div>
	</div>

@endsection

<!-- Script(s) -->
@section('scripts')

	<!-- <script src="https://healthkon-video-api.herokuapp.com/public/sdk/video.1.1.min.js"></script> -->
	<script src="{{ asset('public/sdk/video.1.1.min.js') }}"></script>

	<script>
		$('a#disconnect-button').click(function() {
		    location.reload();
		});

		$('form#conference').submit(function (e) {
			var room = $('#room-name').val();

			if (! room) {
				alert('Enter a room name.');
			} else {
				e.preventDefault();

				$('button#connect-button').attr('disabled', 'disabled');
				$('a#disconnect-button').removeClass('disabled');

				var identity = '{{ Auth::user()->email }}';

				var video = new Video({
					identity: identity,
					room: room,
					localVideoContainer: 'local-video-container',
					remoteVideoContainer: 'remote-video-container',
					presenterIdentity: 'presenter@healthkon.com',
					presenterVideoContainer: 'remote-video-container'
				});

				video.presenterInitiation(true);
				video.setConferenceTimeout(3600);

				video.authorize('{{ $token }}').then(connected);

				function connected() {
			  		video.connect().then(function (room) {
						var joined = video.joinRoom(room);

						if (joined.status) {
							video.withChat({
					  			messagesContainer: 'chat-container',
					  			messageInput: 'chat-input'
					  		}).then(function (chatClient) {
					  			var channelFound = chatClient.getChannelByUniqueName(video.room);
								channelFound.then(function (channel) {
									video.pushChatInfo('Connected');
								    video.setupChatConversation(channel);
								    channel.sendMessage('has joined');
								}, function (error) {
									if (error.status == 404) {
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
						} else {
							setTimeout(function () {
								console.log('Waiting for presenter@healthkon.com');
								connected();
							}, 2000);
						}
					});
				}

			}
		});
	</script>

@endsection
