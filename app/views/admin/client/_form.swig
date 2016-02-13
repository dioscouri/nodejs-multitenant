
{% set tenantIdDisabled = 'disabled' %}
{% if (canEditTenant) %}
    {% set tenantIdDisabled = '' %}
{% endif %}

<form action="{{ actionUrl }}" id="frmCreateOrUpdate" method="post" class="form-horizontal form-bordered">

    <div class="row">
        <div class="col-sm-3 col-md-3 col-lg-2">
            <h5 class="sm-title">Detail Tabs</h5>
            <ul class="nav nav-pills nav-stacked nav-msg">
                <li role="presentation" class="active">
                    <a href="#tab-client-info" aria-controls="tab-client-info" role="tab" data-toggle="tab">Client Info</a>
                </li>
                <li role="presentation">
                    <a href="#tab-user-info" aria-controls="tab-user-info" role="tab" data-toggle="tab">User Info</a>
                </li>
            </ul>
        </div>
        <div class="col-sm-9 col-md-9 col-lg-10">
            <div class="tab-content">
                {% include "tabs/client-info.swig" %}
                {% include "tabs/user-info.swig" %}
            </div>
        </div>
    </div>

    <div class="row">
        <div class="form-group">
            <label class="col-sm-2 control-label"></label>
            <div class="col-sm-10">
                <button type="submit" class="btn btn-success">Save</button>
                <button type="button" class="btn btn-default" onclick="if (confirm('Are you sure you want to cancel save this record?')) {document.location.href = '{{ cancelUrl }}';}">Cancel</button>
            </div>
        </div>
    </div>
</form>

<script type="text/javascript">

    $('#frmCreateOrUpdate').submit(function (event) {
        var validationSummary = true;

        if (!$('#tenantId').val()) {
            alert('Tenant Id could not be empty');
            event.preventDefault();
            return false;
        }
        if (!$('#subdomain').val()) {
            alert('Subdomain could not be empty');
            event.preventDefault();
            return false;
        }

        return validationSummary;
    });


    $('#tenantId').blur(function(event){
        var tenantIdText = $('#tenantId').val();
        var valueValidated = tenantIdText.replace(/[^a-z0-9\_\-]/gi, '').toLowerCase();
        $('#tenantId').val(valueValidated);
    });
    $('#subdomain').blur(function(event){
        var subdomainText = $('#subdomain').val();
        var valueValidated = subdomainText.replace(/[^a-z0-9\_\-]/gi, '').toLowerCase();
        $('#subdomain').val(valueValidated);
    });
</script>
