'use strict';
function getGetter(module) {
    return function getter() {
        var name = module.split('/')[0];
        console.warn('please do not use ' + name +
            ' in node.js runtime, required it here only for compatibility case.');
        var m = require(module);
        return m;
    };
}
var getJQuery = getGetter('jquery');
Object.defineProperties(GLOBAL, {
    _: {value: require('lodash')},
    Promise: {value: require('bluebird')},
    Bacon: {value: require('baconjs').Bacon},
});
Object.defineProperties(GLOBAL, {
    jQuery: {get: getJQuery},
    $: {get: getJQuery},
    baconflux: {get: getGetter('baconflux')},
    moment: {value: require('moment')},
});
require('moment/locale/zh-cn');
var qs = require('qs');
var proagent = require('promisingagent');
function serializer(query) {
    return qs.stringify(query, {arrayFormat: 'repeat'});
}
proagent.bodySerializer['application/x-www-form-urlencoded'] = serializer;
proagent.querySerializer = serializer;
Object.defineProperties(GLOBAL, {
    qs: {value: qs},
    Ractive: {value: require('ractive')},
    proagent: {value: proagent},
});
