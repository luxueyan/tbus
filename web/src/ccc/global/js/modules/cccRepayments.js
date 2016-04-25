'use strict';

/**
 * 还款计划
 *
 * 用法：
 * 1. 引入lib	var Plan = require('assets/js/modules/repayments');
 * 2. 示例一个对象 var plan = new Plan();
 * 3. render repayments	plan.render({ container: '.plan-wrap', loanId: 'xxx' });
 * 	  该方法返回一个完整的repaymetns table
 */

var utils = require('ccc/global/js/lib/utils');

var tpl = require('ccc/global/partials/modules/repayments.html');

module.exports = function (options) {
    var Method = {
        // default config
        defaults: {
            oninit: function () {},
            api: '/api/v2/loan/invest/$ID/repayments',
            template: tpl,
            oncomplete: function () {},
            cache: true,
            debug: false
        },

        // runtime config
        config: {},

        // list tpl
        template: null,

        // for cache
        datas: {},

        initialize: function (options) {
            $.extend(this.config, this.defaults, options);

            if (this.config.debug) {
                console.log('debug:repayments-config', this.config);
            }

            this.api = this.config.api;
            this.template = this.config.template;
            return this;
        },

        render: function (o) {
            var self = this;

            if (this.config.debug) {
                console.log('debug:repayments-render', o);
            }

            if (this.config.cache) {
                if (this.datas[o.investId] !== undefined) {
                    o.data = this.datas[o.investId];
                    this.toReactive(o);
                } else {
                    this.getDatas(o.investId)
                        .then(function (r) {
                            if (self.config.debug) {
                                console.log('debug:repayments-datas', r);
                            }

                            // 加入到cache
                            self.datas[o.investId] = r;

                            o.data = self.datas[o.investId];
                            self.toReactive(o);
                        });
                }
            } else {
                this.getDatas(o.investId)
                    .then(function (r) {
                        if (self.config.debug) {
                            console.log('debug:repayments-datas', r);
                        }

                        o.data = r;
                        self.toReactive(o);
                    });
            }
        },

        toReactive: function (o) {
            // r.data.repayments
            new Ractive({
                el: o.container,
                template: this.template,
                data: {
                    details: this.parseRepayments(o.data) || [],
                },
                onrender: function () {},
                oncomplete: function () {
                    o.complete();
                }
            });
        },

        getDatas: function (id) {
            return request('GET', this.api.replace('$ID', id))
                .end()
                .then(function (r) {
                    return r.body;
                });
        },

        parseRepayments: function (datas) {
            if (this.config.debug) {
                console.log('debug:repayments-parse', datas);
            }
            for (var i = 0; i < datas.length; i++) {
                var o = datas[i];
                var r = o.repayment.repayment;
                datas[i].Fprincipal = utils.format.amount(r.amountPrincipal, 2);
                datas[i].Finterest = utils.format.amount(r.amountInterest, 2);
                datas[i].total = utils.format.amount(r.amountPrincipal + r.amountInterest,
                    2);
                datas[i].time = r.dueDate;
                datas[i].Fstatus = utils.i18n.RepaymentStatus[o.repayment.status];                

                switch (o.repayment.status) {
                case 'REPAYED': // 已还清
                    datas[i].klass = 'text-success-light';
                    break;
                case 'UNDUE': // 未到期
                    datas[i].klass = 'text-muted';
                    break;
                case 'OVERDUE': // 逾期
                    datas[i].klass = 'text-warning';
                    break;
                case 'BREACH': // 违约
                    datas[i].klass = 'text-danger';
                    break;
                default:
                    datas[i].klass = '';
                }
                
                //有逾期的,按照以结算计算
                if( o.repayment.status === 'OVERDUE' ){
                    datas[i].Fstatus = utils.i18n.InvestStatus.SETTLED;    
                    datas[i].klass = '';
                }
            }
            return datas;
        }
    };

    return Method.initialize(options);
};
