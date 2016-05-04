'use strict';
if ((process.env.HOSTNAME || '').match(/UAT$/)) {
    process.env.NODE_APP_INSTANCE = 'uat';
}
var path = require('path');
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');
var config = require('config');
config.dsAppRoot = __dirname;

require('./ccc/index.js');
