@extends('layouts.app')

@section('content')
	<style>
		#presenter-video-container {
			width: 600px;
			margin: auto;
			margin-bottom: 0;
		}
		#presenter-video-container video {
			width: 600px;
		}
		#remote-video-container {
			max-width: 600px;
			margin: auto;
		}
		#remote-video-container > div {
			display: inline-block;
		}
		video.remote-video {
			max-width: 200px
		}
		#local-video-container {
			max-width: 50px;
			margin: auto;
		}
		#local-video-container > div {
			display: inline-block;
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
						  <button id="submit-button" type="submit" class="btn btn-success">Join</button>
						</form>

						<hr>

						<div class="row text-center">
							<div id="presenter-video-container"></div>
						</div>

						<div class="row text-center">
							<div id="local-video-container"></div>
						</div>

						<div class="row text-center">
							<div id="remote-video-container"></div>
						</div>

						<div id="messages-container"></div>
						<div>
							<input type="text" id="message-input">
						</div>
	                </div>
	            </div>
			</div>
		</div>
	</div>

@endsection

<!-- Script(s) -->
@section('scripts')
	<script src="https://healthkon-video-api.herokuapp.com/public/sdk/video.1.1.min.js"></script>
	<!-- <script src="{{ asset('public/sdk/video.1.1.min.js') }}"></script> -->

	<script>
		$('form#conference').submit(function (e) {
			var room = $('#room-name').val();

			if (! room) {
				alert('Enter a room name.');
			} else {
				e.preventDefault();

				var video = new Video({
					identity: '{{ Auth::user()->email }}',
					room: room,
					localVideoContainer: 'local-video-container',
					remoteVideoContainer: 'remote-video-container',
					presenterIdentity: 'presenter@healthkon.com',
					presenterVideoContainer: 'presenter-video-container'
				});

				video.presenterInitiation(true);
				video.setConferenceTimeout(10);

				video
					.authorize('{{ $token }}')
					.then(function () {
				  		video.connect();

				  		video.withChat({
				  			messagesContainer: 'messages-container',
				  			messageInput: 'message-input'
				  		});
					});

			}
		});
	</script>
@endsection
