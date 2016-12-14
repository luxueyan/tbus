'use strict';
module.exports = function (router) {
    var ccBody = require('cc-body');

    router.post('/preBindCardNew', ccBody, function (req, res) {
        req.uest('/api/v2/user/MYSELF').end().get('body').then(function (r) {
            if(r.idNumber){
                req.body.idNumber = r.idNumber;
            }
            req.uest.post("/api/v2/baofoo/MYSELF/preBindCard")
                .send(req.body)
                .end()
                .then(function (r) {
                    // console.log(req.body);
                    // console.log(r.body);
                    res.json(r.body)
                });
        });
    });

};
