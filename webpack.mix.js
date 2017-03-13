const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css');

// SDK specific
mix.js([
		'resources/assets/js/sdk/VideoConference.js',
		'resources/assets/js/video.js'
	], 'public/public/sdk/video.1.1.min.js')
	.sass('resources/assets/sass/sdk/video.scss', 'public/public');
