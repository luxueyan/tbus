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

var ds = require('@ds/ds');
var {app, server} = require('@ds/ds/instance');

require('./node-global')

var port = Number(process.env.PORT || config.port) || 4000;
app.locals.dsLayoutPath = 'ccc/global/views/layouts/default';

/*
if (config.startOAuthServer) {
    config.urlBackend = 'http://127.0.0.1:' + port + '/';
}
*/
ds.request(app, config.urlBackend);

app.use('/api/web', ds.loader('api'));

/*
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
*/
ds.apiproxy(app, config.urlBackend);

require('@ccc/inspect/middleware')(app);
app.use(async function (req, res, next) {
    res.locals.title = '汇财富-土巴士资本旗下互联网金融资产交易服务平台';
    res.locals.keywords = '土巴士,互联网金融,投资理财,财富管理,理财产品';
    res.locals.description = '汇财富是由土巴士资本倾力打造的互联网金融资产交易服务平台，专门为白领、中产精英等高潜力人群提供专业、可信赖的投资理财，财富管理服务，实现财富增值。汇财富由原深发展总行行长、平安银行原董事长肖遂宁领衔打造，专注于世界500强，优质上市公司和信用评级AA+以上等优质资产，从源头上保证资产安全。投资理财用户在汇财富官网或APP可通过理财产品、高端理财、债权转让等方式进行投资获得稳定收益。';

    res.expose(Date.now(), 'serverDate');

    // global user
    if (!req.cookies.ccat) {
        res.expose({}, 'user');
        return next();
    }

    var user = ((await req.uest.get('/api/v2/whoamiplz').end().get('body')) || {}).user;

    // isMMC
    if(user){
        var isMMC = (await req.uest.get('/api/v2/user/MYSELF/isMMC').end().get('body') || {});
        user.isMMC = isMMC.success ? isMMC.data.isMMC : false;
    }

    res.expose(user || {}, 'user');
    if (!user) {
        return next();
    }
    res.locals.user = user;

    user.logined = true;
    if (user.email === 'notavailable@creditcloud.com') {
        user.email = '';
    }
    if (!user.accountId) {
        return next();
    }
    user.agreement = (await req.uest.get('/api/v2/user/MYSELF/agreement').end().get('body') || {});

    next();
});
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
//退出后跳转到登录
app.all('/logoutNew', function (req, res) {
    res.clearCookie('ccat');
    if (req.xhr) {
        res.send('');
    } else {
        res.redirect('/login');
    }
});

app.get('/getClientIp', function (req, res) {
    function getClientIp(req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }

    res.send(getClientIp(req));
});

server.listen(port, '0.0.0.0', function () {
    console.log("server listening at http://127.0.0.1:%d",
        this.address()
        .port);
    if (process.argv.indexOf('--start-then-close') > -1) {
        process.exit(0);
    }
});
