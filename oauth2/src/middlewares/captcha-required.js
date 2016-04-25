// Generated by LiveScript 1.3.1
module.exports = function (req, res, next) {
    if (!req.query.captcha_token) {
        res.set('Content-Type', 'application/json; charset=utf-8');
        return res.json({
            data: null,
            error: [{
                "message": "INVALID_REQUIRED",
                "type": "captcha",
                "value": null,
                "code": 0
            }],
            success: false
        });
    }
    return next();
};
