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
							<div id="local-video-container"></div>
						</div>

						<div class="row text-center">
							<div id="remote-video-container"></div>
						</div>

	                </div>
	            </div>
			</div>
		</div>
	</div>

@endsection

<!-- Script(s) -->
@section('scripts')
	<!-- <script src="https://healthkon-video-api.herokuapp.com/public/sdk/video.js"></script> -->
	<script src="{{ asset('public/sdk/video.1.1.min.js') }}"></script>

	<script>
		var video = new Video({
			identity: 'santosh',
			token: '{{ $token }}',
			room: 'some-room',
			localVideoContainer: 'local-video-container',
			remoteVideoContainer: 'remote-video-container',
			presenterIdentity: 'admin@healthkon.com',
			presenterVideoContainer: 'presenter-video-container'
		});

		video.setTimeout(10);

		video.connect();

		// $('form#conference').submit(function (e) {
		// 	var room = $('#room-name').val();

		// 	if (! room) {
		// 		alert('Enter a room name.');
		// 	} else {
		// 		$('button#submit-button').attr('disabled', 'disabled');
		// 		var video = VideoConference.init(
		// 			'Wke2U9COs08In0bmgIjHCDgxfe6cpPq4ZDU0mdtTZm1CYSJC69z9rdAfgGKL',
		// 			room,
		// 			'presenter-video-container',
		// 			'remote-video-container'
		// 		);
		// 	}

		// 	e.preventDefault();
		// });
	</script>
@endsection
