'use strict';
var url = require('url');
var router = require('express').Router();
var config = require('config');
var debug = require('debug')('whitelist');
var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');
var crypto = require('crypto');
var ccBody = require('cc-body');
var WHITELIST = require('../whitelist');

//module.exports = router;

/*
router.all('*', function(req, res, next){
  // 被授权的第三方接入支持跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CLIENT, X-THIRD-PARTY, X-DEV');
  next();
});
//router.get('*', thirdPartyMiddleware);
//router.post('*', thirdPartyMiddleware);
*/

// function thirdPartyMiddleware (req, res, next) {
module.exports = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CLIENT, X-THIRD-PARTY, X-DEV');
  var Url = url.parse(req.url);
  var current = getCurrentUrl(req, Url);

  if (!config.thirdParty.open) {
    return next();
  }

  // 非第三方请求直接next
  if (!isThirdPartyReq(req)) {
    return next();
  }

  // check url
  if (!current) {
    return res.send({
      success: false,
      code: 1001,
      error: 'RESOURCE_NOT_FOUND'
    });
  }

  debug('whitelist url: %s', req.url, req.method);

  // check client
  var client = config.clients.filter(function (c) {
      return c.id === req.headers[config.thirdParty.client.toLowerCase()];
  })[0];
  if (!client) {
    return res.send({
      success: false,
      code: 1002,
      error: 'INVALID_CLIENT'
    });
  }

  // check referer
  // TODO
  // req.headers.referer
  // req.headers.origin
  // error code: 1003
  // error des: INVALID_REFERER

  // check method
  if (current.method.toUpperCase() !== req.method.toUpperCase()) {
    return res.send({
      success: false,
      code: 1004,
      error: 'METHOD_NOT_ALLOWED'
    });
  }

  // check signature
  if (current.signature) {
    if (!checkeSignature(client, req)) {
      return res.send({
        success: false,
        code: 1005,
        error: 'SIGN_FAILED'
      });
    }
  }

  next();
}

function getCurrentUrl (req, Url) {
  var its;
  _.each(WHITELIST, function (u) {
    var re = pathToRegexp(u.url);
    if (re.exec(Url.pathname)) {
      its = u;
      return false;
    }
  });
  return its;
}

function checkeSignature (client, req) {
  var catchedSign, params;
  /*
  if (req.method.toUpperCase() === 'GET') {
    catchedSign = req.query.sign;
    delete req.query.sign;
    params = buildParams(req.query);
  } else {
    catchedSign = req.body.sign;
    delete req.body.sign;
    params = buildParams(req.body);
  }
  */
  catchedSign = req.query.sign;
  delete req.query.sign;
  params = buildParams(req.query);

  var timestamp = parseInt(req.query.timestamp, 10);

  if ((Date.now() - timestamp) / 1000 > config.thirdParty.signExpireSeconds) {
    // timestamp过期
    return false;
  }

  var computedSign = crypto
    .createHash('md5')
    .update(params + '&sign=' + client.secret)
    .digest('hex');

  return computedSign === catchedSign;
}

// utils
function buildParams (params) {
  var strs = [], str = '';
  for (var key of Object.keys(params).sort()) {
    strs.push(key + '=' + params[key])
  }
  return strs.join('&');
}

function isThirdPartyReq (req) {
  // super model, for local test
  if (process.env.NODE_APP_THIRD) {
    return true;
  }

  // local dev
  if (!process.env.NODE_ENV) {
    return false;
  }

  // uat环境并且header中有三方dev标识
  if (process.env.NODE_APP_INSTANCE === 'uat') {
    // 如果三方在请求中注明dev则判为三方请求
    return req.headers[config.thirdParty.devmark.toLowerCase()] ? true : false;
  } else {
    // 生产环境要依赖nginx上注册的第三方IP来判断是否是第三方请求
    return req.headers[config.thirdParty.mark.toLowerCase()] === 'true' ? true : false;
  }

  /*
  // others
  var referer = req.headers['referer'];
  var u = referer ? url.parse(referer) : null;
  if (!u || ['localhost', '127.0.0.1'].indexOf(u.hostname) > -1) {
    return false;
  }

  return true;
  */
}
