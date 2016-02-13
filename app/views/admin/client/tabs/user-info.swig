<div class="tab-pane" id="tab-user-info">

    {% set userPasswordRequired = ' requited' %}
    {% if userItem.id %}
        {% set userPasswordRequired = '' %}
    {% endif %}
    <h4>User info</h4>

    <div class="row">
        <div class="col-sm-6">
            <div class="input-group mb15">
                <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                <input type="text" class="form-control" name="userDetails[firstName]" placeholder="Enter Firstname"
                       value="{{ userItem.name.first }}" required autofocus>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="input-group mb15">
                <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                <input type="text" class="form-control" name="userDetails[lastName]" placeholder="Enter Lastname"
                       value="{{ userItem.name.last }}" required>
            </div>
        </div>
    </div>

    <br/>

    <div class="row">
        <div class="col-sm-6">
            <div class="input-group mb15">
                <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                <input type="email" class="form-control" name="userDetails[email]" placeholder="Enter Email Address"
                       value="{{ userItem.email }}" required>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="input-group mb15">
                <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                <input type="password" class="form-control" name="userDetails[password]" placeholder="Enter Password" {{ userPasswordRequired }}>
            </div>
        </div>
    </div>

    <input type="hidden" name="userDetails[id]" value="{{ userItem.id }}" />

</div>
