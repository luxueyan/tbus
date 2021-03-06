// Generated by LiveScript 1.3.1
module.exports = function (response, res) {
    var ref$, ref1$;
    if ((ref$ = response.headers) != null && ((ref1$ = ref$['set-cookie']) != null && ref1$.length)) {
        response.headers['set-cookie'] = response.headers['set-cookie'].filter(function (c) {
            return !c.match(/^JSESSIONID=[0-9a-z]+/i);
        });
        if (!response.headers['set-cookie'].length) {
            delete response.headers['set-cookie'];
        }
    }
    res.set('Cache-Control', 'no-cache');
};
