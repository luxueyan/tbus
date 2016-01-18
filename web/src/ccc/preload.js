'use strict';
console.log(global);
var _ = global._ = require('lodash');
global.Promise = require('bluebird');
global.$ = global.jQuery = require('jquery');
global.Bacon = require('baconjs');
global.baconflux = require('baconflux');
global.moment = require('moment/moment');
require('moment/locale/zh-cn');
var Ractive = global.Ractive = require('ractive');
Ractive.defaults.data.moment = moment;
global.request = global.proagent = require('promisingagent');
var qs = require('qs');
function serializer(query) {
    return qs.stringify(query, {arrayFormat: 'repeat'});
}
global.request.bodySerializer['application/x-www-form-urlencoded'] = serializer;
global.request.querySerializer = serializer;
