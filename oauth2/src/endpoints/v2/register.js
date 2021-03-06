// Generated by LiveScript 1.3.1
var marketPrefix, url, http, auth, sn, captchaRequired, router, bodyParser, ef;
marketPrefix = require('config').proxy.market;
url = require('url');
http = require('http');
auth = require('../../auth');
sn = require('../../sn');
captchaRequired = require('../../middlewares/captcha-required');
router = require('express').Router();
bodyParser = require('body-parser');
ef = require('../../ef');
module.exports = router;
router.get('/api/v2/register', auth.pass());
router.all('/api/v2/register/captcha', sn(function (req) {
    return req.url = '/api/v2/captcha';
}));
router.post("/api/v2/register/check_name", sn(function (req) {
    return req.url = '/api/v1/register/check_name';
}), auth.pass());
router.post("/api/v2/register/check_email", sn(function (req) {
    return req.url = '/api/v1/register/check_email';
}), auth.pass());
router.post("/api/v2/register/check_id_number", sn(function (req) {
    return req.url = '/api/v1/register/check_id_number';
}), auth.pass());
router.post("/api/v2/register/check_login_name", sn(function (req) {
    return req.url = '/api/v1/register/check_login_name';
}), auth.pass());
router.post("/api/v2/register/check_mobile", sn(function (req) {
    return req.url = '/api/v1/register/check_mobile';
}), auth.pass());
router.post("/api/v2/register/from_web", sn(function (req) {
    return req.url = '/api/v1/register/from_web';
}), auth.pass());
router.post("/api/v2/register/from_web_without_auth", sn(function (req) {
    return req.url = '/api/v1/register/from_web_without_auth';
}), auth.pass());
router.post("/api/v2/register/from_api", sn(function (req) {
    return req.url = '/api/v1/register/from_api';
}), auth.pass());
router.post("/api/v2/register/reset_password", sn(function (req) {
    return req.url = '/api/v2/auth/reset_password';
}), auth.pass(), captchaRequired);
router.post("/api/v2/auth/reset_password", auth.pass(), captchaRequired);
router.post("/api/v2/auth/verify/loginName/mobile", auth.pass(), captchaRequired);
router.post("/api/v2/auth/verify/captcha", auth.pass());
router.post("/api/v2/register/reset_password_with_login_name", sn(function (req) {
    req.url = '/api/v2/auth/reset_password_with_login_name';
    return req.headers['cookie'] = "JSESSIONID=" + req.query['token'];
}), auth.pass());
router.post("/api/v2/register", sn(function (req) {
    return req.url = '/api/v2/users/register';
}), auth.pass());
router.get("/api/v2/register/smsCaptcha", sn(function (req) {
    return req.url = "/api/v2/users/smsCaptcha?mobile=" + req.query['mobile'];
}), auth.pass());
router.get("/api/v2/register/smsCaptcha", sn(function (req) {
    return req.url = '/api/v2/users/smsCaptcha';
}), auth.pass());
router.get("/api/v2/register/voiceCaptcha", sn(function (req) {
    return req.url = "/api/v2/users/voiceCaptcha?mobile=" + req.query['mobile'];
}), auth.pass());
router.post("/api/v2/register/voiceCaptcha", sn(function (req) {
    return req.url = '/api/v2/users/voiceCaptcha';
}), auth.pass());
router.get('/api/v2/confirm_email', auth.pass());
router.post('/api/v2/auth/reset_password/password', auth.pass());
router.post("/api/v2/register/activate_email", sn(function (req) {
    return req.url = '/api/v1/register/activate_email';
}), auth.pass());
