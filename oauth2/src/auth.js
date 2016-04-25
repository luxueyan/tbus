'use strict';
var passport = require('./passport');
var auth = exports = module.exports = require('oauth2-auth')(passport.authenticate('bearer', {
    session: false,
    failWithError: true
}));
/*
ef = require('errto')

myself = require('./middlewares/myself')
owner = module.exports.owner.call(auth)

这里麻烦的地方在于，myself 本来在 auth.user() 之后可以取得
req.user.id，这时候替换就可以，但是在 auth.owner() 里面如果
url 和 req.params.userId 还没有被替换就可能是 'MYSELF'，那
就与请求中的 url 不相符。解决办法是对于 auth.owner() 的 API
接口 先过 auth.user 取得 req.user，然后过 myself 替换
req.params.userID 和 req.url，最后才走 真正的 owner 逻辑。
auth.owner = () ->
  (req, res, next) ->
    efn = ef.bind(null, next)
    auth.user() req, res, efn ->
      myself req, res, efn ->
        owner req, res, next
*/
