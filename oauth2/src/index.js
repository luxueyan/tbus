'use strict';
GLOBAL.Promise = require('bluebird');
var onresponse;
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var express = require('express');
var server = exports = module.exports = express();
var config = require('config');
var use = require('multiuse');
var os = require('./oauth-server');
var passport = require('./passport');
var auth = require('./auth');

// Reids Error Hand
var redis = require('@cc/redis');
redis.on('error', function(err){
  console.log("\nRedis error: 请确认redis是否连接正确\n");
  redis.disconnect();
  throw err;
});

/*
var bodyParser = require('body-parser');
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }));
*/

// 加入第三方接入白名单
//server.use(require('./thirdparty'));

require('./middlewares/encpass').forEach(function (mid) {
    server.use(mid);
});
server.use(passport.initialize());
server.use(require('./exchange'));

use(server, (config.before || []).map(function (m) {
    return path.resolve(__dirname, 'middlewares', m);
}));

server.use(require('./endpoints'));
use(server, (config.additionalEndpoints || []).map(function (m) {
    return path.resolve(__dirname, 'endpoints', m);
}));

/*
var appRoot = path.dirname(module.parent.parent.filename); // which requires /index.js
var addepaths = [
    path.resolve(appRoot, 'additional-endpoints.js'),
    path.resolve(path.dirname(appRoot), 'additional-endpoints.js'),
    path.resolve(path.dirname(path.dirname(appRoot)), 'additional-endpoints.js'),
];
addepaths.forEach(function (addepath) {
    if (fs.existsSync(addepath)) {
        var router = express.Router();
        require(addepath)(router, auth);
        server.use(router);
    }
});
*/

var appRoot = path.dirname(module.parent.filename); // which requires /index.js
var addepath = path.resolve(appRoot + '/additional-endpoints.js');
if (fs.existsSync(addepath)) {
    var router = express.Router();
    require(addepath)(router, auth, require('./middlewares'));
    server.use(router);
}


use(server, (config.after || []).map(function (m) {
    return path.resolve(__dirname, 'middlewares', m);
}));
onresponse = require('./onresponse');
server.use(require('api-pass')(config.proxy.market, {
    onresponse: function (response, res) {
        if (typeof res.req.onProxyResponse === 'function' && res.req.onProxyResponse(response, res)) {
            return true;
        }
        return onresponse(response, res);
    }
}));
console.log('config:', JSON.stringify(require('config'), null, '    '));
use(server, require('@os/oauth2-errorhandlers')(os));
