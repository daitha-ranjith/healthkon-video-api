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

						<div class="row text-center">
							<div id="presenter-video-container"></div>
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
	<script src="https://healthkon-video-api.herokuapp.com/public/sdk/video.js"></script>
	<!-- <script src="{{ asset('public/sdk/video.js') }}"></script> -->

	<script>
		var video = VideoConference.init(
			'{{ Auth::user()->api_token }}',
			'some-room',
			'presenter-video-container',
			'remote-video-container'
		);
	</script>
@endsection