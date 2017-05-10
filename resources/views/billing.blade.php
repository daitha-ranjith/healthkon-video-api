@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading">Billing</div>

                <div class="panel-body">

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Conference ID</th>
                                <th>Participants</th>
                                <th>Start time</th>
                                <th>Duration (approx.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($conferences as $conference)
                                <tr>
                                    <td> {{ $conference->date() }} </td>
                                    <td> {{ $conference->room_sid }} </td>
                                    <td> {{ $conference->participants->count() }} </td>
                                    <td> {{ $conference->time() }} </td>
                                    <td> {{ $conference->duration() }} </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    </div>
</div>
@endsection
