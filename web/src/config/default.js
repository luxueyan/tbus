"use strict";
var xtend = require('xtend');
var path = require('path');

module.exports = {

    appName: '华瑞金科',

    dsAppRoot: path.resolve(__dirname, '..', '..'),
    dsComponentPrefix: 'ccc',
    dsComponentFallbackPrefix: ['node_modules/@ccc'],
    dsExpressStateNameSpace: 'CC',
    dsRequestAllowCookie: ['ccat'],
    dsSupportIE8: true,
    dsMediaQueryRemoveWidth: '1200px',

    port: 4000,
    domain: 'hrjk.uats.cc',

    urlBackend: "http://www.land-bus.com:4100/",
    oauth2client: {
         id:  "client-id-for-node-dev",
         secret: "client-secret-for-node-dev",
    },

};
