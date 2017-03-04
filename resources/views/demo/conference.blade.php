@extends('layouts.app')

@section('content')

	<div id="presenter-video-container">
		
	</div>

	<div id="remote-video-container">
		
	</div>

@endsection

<!-- Script(s) -->
@section('scripts')
	<script src="{{ asset('public/sdk/video.js') }}"></script>

	<script>
		VideoConference.init(
			'{{ Auth::user()->api_token }}',
			'some-room',
			'presenter-video-container',
			'remote-video-container'
		);
	</script>
@endsection