{% extends 'app/views/admin/layout.swig' %}

{% block title %}{{ header }}{% endblock %}

{% block pageheader %}
    {% include "app/views/admin/partials/pageheader.swig" with { 'pageTitle': 'Client Management'} %}
{% endblock %}

{% block pagecontent %}
<div class="panel">
    <div class="panel-body">
        {% include "_form.swig" with { 'newItem': false } %}
    </div>
</div>
{% endblock %}
