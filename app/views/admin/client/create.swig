{% extends 'app/views/admin/layout.swig' %}

{% block title %}{{ header }}{% endblock %}

{% block pageheader %}
    {% include "../partials/pageheader.swig" with { 'pageTitle': 'Client Management - Create New Client'} %}
{% endblock %}

{% block pagecontent %}
<div class="panel">
    <div class="panel-body">
        {% include "_form.swig" with { 'newItem': true } %}
    </div>
</div>
{% endblock %}
