'use strict';
var debug = require('debug')('cc:os:cache');
var db = require('@cc/redis');
var config = require("config");
var ef = require('./ef');
var tenderQueue = [];
var working = {};
function onresponse() {
    var loanId = this.params.loanId;
    var maxc = this._maxc;
    working[loanId] -= 1;
    nextInQueue(loanId, maxc);
    return false;
}
function nextInQueue(loanId, maxc) {
    var next;
    if (!working[loanId]) {
        working[loanId] = 0;
    }
    while (working[loanId] < maxc) {
        next = tenderQueue.shift();
        if (typeof next === 'function') {
            working[loanId] += 1;
            next();
        } else {
            break;
        }
    }
}
exports = module.exports = function (req, res, next) {
    var maxc, maxq;
    var investorLimit, now;
    if (!(req.authPass && config.cache.tender && (config.investorLimit || config.investorLimit2))) {
        return next();
    }
    if (req._forInvestorLimit2Test) {
        maxc = req._forInvestorLimit2Test.maxc;
        maxq = req._forInvestorLimit2Test.maxq;
    } else if (config.investorLimit2) {
        maxc = config.investorLimit2.maxConnectionPerWorker;
        maxq = config.investorLimit2.maxQueuePerWorker;
    }
    var loanId = req.params.loanId;
    if (maxc && maxq) {
        if (tenderQueue.length + working[loanId] >= maxq) {
            return res.json({
                data: null,
                error: [{
                    message: 'TOO_CROWD',
                    type: 'loanId',
                    value: loanId,
                    code: 0,
                }],
                success: false,
            });
        }
        req.onProxyResponse = onresponse;
        req._maxc = maxc;
        tenderQueue.push(next);
        nextInQueue(loanId, maxc);
        return;
    }
    investorLimit = req.investorLimit && req.investorLimit < config.investorLimit
      ? req.investorLimit
      : config.investorLimit;
    now = Math.round(Date.now() / 1000);
    db.incr(loanId + "_LOAN_INVESTOR_" + now, function (err, investorCount) {
        if (err) {
            return next(err);
        }
        db.expireat(loanId + "_LOAN_INVESTOR_" + now, now * 1000 + 2000);
        if (investorCount > investorLimit) {
            return res.json({
                data: null,
                error: [{
                    message: 'TOO_CROWD',
                    type: 'loanId',
                    value: loanId,
                    code: 0,
                }],
                success: false,
            });
        }
        return next();
    });
};

exports._tenderQueue = tenderQueue;
exports._working = working;
