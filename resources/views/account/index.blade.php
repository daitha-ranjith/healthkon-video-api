@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">

                @if (session('status'))
                    <div class="alert alert-success">
                        {{ session('status') }}
                    </div>
                @endif

                <div class="panel-heading">Account</div>
                <div class="panel-body">
                    <form class="form-horizontal" action="{{ route('user.update', Auth::user()->id) }}" method="POST">
                        {{ csrf_field() }}

                        {{ method_field('PUT') }}

                        <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                            <label for="name" class="col-sm-2 control-label">Name</label>
                            <div class="col-sm-5">
                                <input type="text" class="form-control" id="name" placeholder="Name" name="name" value="{{ Auth::user()->name }}" required>
                                @if ($errors->has('name'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('name') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <label for="email" class="col-sm-2 control-label">Email</label>
                            <div class="col-sm-5">
                                <input type="email" class="form-control" id="email" placeholder="Email" name="email" value="{{ (old('email')) ?: Auth::user()->email }}" required>
                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-sm-offset-2 col-sm-10">
                                <button type="submit" class="btn btn-default">Update</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="panel-heading">Change password</div>
                <div class="panel-body">
                    <form class="form-horizontal" method="POST" action="{{ route('account.change-password') }}">
                        {{ csrf_field() }}

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <label for="password" class="col-sm-2 control-label">Password</label>
                            <div class="col-sm-5">
                                <input type="password" class="form-control" id="password" placeholder="Password" name="password" required>
                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <label for="confirm-password" class="col-sm-2 control-label">Confirm password</label>
                            <div class="col-sm-5">
                                <input type="password" class="form-control" id="confirm-password" placeholder="Password" name="password_confirmation" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-offset-2 col-sm-10">
                                <button type="submit" class="btn btn-primary">Change</a>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="panel-heading">API Token</div>
                <div class="panel-body">
                    <form class="form-horizontal" method="POST" action="{{ route('account.reset-api-token') }}">
                        {{ csrf_field() }}
    
                        {{ method_field('PUT') }}

                        <div class="form-group">
                            <label for="token" class="col-sm-2 control-label">Token</label>
                            <div class="col-sm-8">
                                <input type="password" class="form-control hideShowPassword-field" id="token" name="token" value="{{ Auth::user()->api_token }}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-sm-offset-2 col-sm-10">
                                <button type="submit" class="btn btn-danger" id="regenerate-token">Refresh</a>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
</div>
@endsection
