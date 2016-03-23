'use strict';
var path = require('path');
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, '..', 'config');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('config');
config.dsAppRoot = path.resolve(__dirname, '..');
var logger = require('bunyan-hub-logger');
if (process.env.NODE_ENV !== 'development') {
    logger.replaceConsole();
}
console.log('config:', JSON.stringify(require('config'), null, '    '));
logger.replaceDebug();
var fs = require('fs');
var userAgent = require('useragent');

var ds = require('dysonshell');
var {app, server} = require('dysonshell/instance');

require('./node-global')

var port = Number(process.env.PORT || config.port) || 4000;
app.locals.dsLayoutPath = 'ccc/global/views/layouts/default';

app.locals.title = '华瑞金控';
app.locals.keywords = '华瑞金控';
app.locals.description = '华瑞金控';

if (config.startOAuthServer) {
    config.urlBackend = 'http://127.0.0.1:' + port + '/';
}
ds.request(app, config.urlBackend);

app.use('/api/web', ds.loader('api'));

if (config.startOAuthServer) {
    console.log('plug oauth2 server');
    var oauth2 = require('@cc/oauth2');
    app.use(function (req, res, next) {
        if ((req.url||'').match(/^\/api\//)) {
            return oauth2(req, res);
        }
        next();
    });
} else {
    ds.apiproxy(app, config.urlBackend);
}

require('@ccc/inspect/middleware')(app);

// mobile page (H5) redirection
_.each([
    {path: '/'},
    {path: '/login'},
    {path: '/register'},
    {path: '/invest', new_path: '/list'},
    {path: '/account', new_path: '/dashboard'},

], function (item) {
    var prefix = '/h5',
        path = item.path,
        new_path = item.new_path,
        LLUN = null;

    app.get(path, function (req, res, next) {
        var ua = userAgent.parse(req.headers['user-agent']);

        if ((ua.source || '').match(/MicroMessenger|Android|webOS|iPhone|iPod|BlackBerry/)) {
            return res.redirect(prefix + (new_path || req.url));
        }

        next();
    });
});

app.use(require('@ccc/login/middlewares').setBackUrl); // 全局模板变量添加 loginHrefWithUrl 为登录后返回当前页的登录页面链接
app.use('/__', ds.loader('hide'));
app.use(ds.loader('page'));

app.all('/logout', function (req, res) {
    res.clearCookie('ccat');
    if (req.xhr) {
        res.send('');
    } else {
        res.redirect('/');
    }
});

server.listen(port, '0.0.0.0', function () {
    console.log("server listening at http://127.0.0.1:%d",
        this.address()
        .port);
    if (process.argv.indexOf('--start-then-close') > -1) {
        process.exit(0);
    }
});
