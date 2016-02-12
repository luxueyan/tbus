'use strict';
var Ractive = require('ractive');
var _ = require('lodash');

exports.RInput = Ractive.extend({
    isolated: true,
    template: '{{>content}}',
    oninit: function () {
        this.set('rinputId', 'rinput-' + Math.random().toString().substring(2, 8));
        var lazy = Number(this.get('valueStableDuration')) || 600;
        this.observe('value', function () {
            this.fire('startEditing');
        });
        this.observe('value', _.debounce(function (value) {
            this.fire('valueStable', value);
        }, lazy));
    },
    data: {
        value: '',
    }
});

exports.Step = Ractive.extend({
    isolated: true,
    template: '{{>content}}',
    init: function () {
    },
    components: {
        RInput: exports.RInput,
    },
    data: {
        loading: true,
        // stepIndex: '', // should be set by root
    }
});
