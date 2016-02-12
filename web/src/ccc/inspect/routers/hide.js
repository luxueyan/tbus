'use strict';
var url = require('url');
var glob = require('glob');
var config = require('config');
var httpProxy = require('http-proxy');
var APP_ROOT = config.dsAppRoot;

var viewPaths = glob.sync('ccc/*/views/**/*.html', {
        cwd: APP_ROOT,
    })
    .map(function (viewPath) {
        return viewPath.split('/').slice(3).join('/')
            .replace(/\.html$/, '')
            .replace(/\/index$/, '')
    });

var isUat = process.env.NODE_APP_INSTANCE === 'uat';

module.exports = function (router) {
    router.get('/templates', function (req, res) {
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.write('<!doctype html><p>以下是所有页面模板路径（不一定所有路径都可以直接访问</p><ul>');
        viewPaths.forEach(function (viewPath) {
            res.write('<li><a href="'+viewPath+'" target="_blank">'+escape(viewPath)+'</a></li>');
        });
        res.end('</ul>');
    });
    router.get('/ajax/config', function (req, res) {
        res.json(require('config'));
    });

    if (!isUat || !config.startOAuthServer || typeof (config.proxy && config.proxy.market) !== 'string') {
        return;
    }
    var urlBackend = config.proxy.market;
    var proxyApi = httpProxy.createProxyServer({
        target: urlBackend.replace(/\/$/, ''),
    });
    var urlParsed = url.parse(urlBackend);
    // 代理到后端 GlashFish 服务器
    router.use('/proxy2market', function (req, res, next) {
        if (req.headers.host) {
            req.headers.host = urlParsed.host;
        }
        proxyApi.web(req, res, {}, next);
    });
}
