'use strict';

exports.applyLoanService = {
    addNew: function (loan, next) {
        request("POST", "/api/v2/loanIntent/addNew")
            .type("form")
            .send(loan)
            .end()
            .then(function (res) {
                next(res.body);
            });
    }
}

