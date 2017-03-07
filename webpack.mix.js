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

mix.scripts([
	'resources/assets/js/vendors/jquery-3.1.1.min.js',
	'resources/assets/js/vendors/twilio-video.js',
	'resources/assets/js/sdk/video.js',
], 'public/public/sdk/video.js');

mix.scripts([
	'resources/assets/js/vendors/jquery-3.1.1.min.js',
	'resources/assets/js/vendors/twilio-video.js',
	'resources/assets/js/sdk/video-1.1.js',
], 'public/public/sdk/video-1.1.js');
