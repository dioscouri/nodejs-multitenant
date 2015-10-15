
{% set tenantIdDisabled = 'disabled' %}
{% if (canEditTenant) %}
    {% set tenantIdDisabled = '' %}
{% endif %}

<form action="{{ actionUrl }}" id="frmCreateOrUpdate" method="post" class="form-horizontal form-bordered">
    <div class="form-group">
        <label class="col-sm-2 control-label">Client name</label>
        <div class="col-sm-10">
            <input type="text" placeholder="Name" name="name" class="form-control" value="{{ item.name }}" required autofocus />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Description</label>
        <div class="col-sm-10">
            <input type="text" placeholder="Description" name="description" class="form-control" value="{{ item.description }}" />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Tenant ID</label>
        <div class="col-sm-10">
            <input type="text" id="tenantId" placeholder="Tenant ID" name="tenantId" class="form-control" value="{{ item.tenantId }}" {{ tenantIdDisabled }} />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Hostname</label>
        <div class="col-sm-10">
            <input type="text" placeholder="Hostname" name="hostname" class="form-control" value="{{ item.hostname }}" />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Subdomain</label>
        <div class="col-sm-4">
            <input type="text" placeholder="Subdomain" id="subdomain"  name="subdomain" class="form-control" value="{{ item.subdomain }}" style="text-align: right;" />
        </div>
        <div class="col-sm-6">
            <input type="text" class="form-control" name="baseDomain" placeholder="Subdomain" disabled value="{{ baseDomain }}" />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Hostname Aliases</label>
        <div class="col-sm-10">
            <input type="text" placeholder="Aliases (divided by comma: ',')" name="aliases" class="form-control" value="{{ item.aliasesString }}" />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label" for="ckbIsEnabled">Enabled</label>
        <div class="col-sm-10">
            {% if item.isEnabled %}{% set isChecked = ' checked' %}{% endif %}
            <input type="checkbox" name="isEnabled" id="ckbIsEnabled" {{ isChecked }} />
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label"></label>
        <div class="col-sm-10">
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" class="btn btn-default" onclick="if (confirm('Are you sure you want to cancel save this record?')) {document.location.href = '{{ cancelUrl }}';}">Cancel</button>
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
