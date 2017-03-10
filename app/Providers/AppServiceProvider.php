<?php

namespace App\Providers;

use DB;
use Illuminate\Support\ServiceProvider;
use App\Services\Video\TwilioVideoService;
use App\Services\Video\VideoServiceContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // DB::listen(function ($q) {
        //     var_dump($q->sql);
        // });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(VideoServiceContract::class, TwilioVideoService::class);
    }
}
