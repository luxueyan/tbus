"use strict";

var utils = require('ccc/global/js/lib/utils');

var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/showbank.html'),
});
