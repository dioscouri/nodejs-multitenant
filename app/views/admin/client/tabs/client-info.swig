<div class="tab-pane active" id="tab-client-info">

    <h4>Client info</h4>

    <div class="row">
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
    </div>

</div>
