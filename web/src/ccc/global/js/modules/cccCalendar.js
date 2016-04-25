'use strict';

require('ccc/global/js/modules/tooltip');
var Tips = require('ccc/global/js/modules/cccTips');

var ThisView = {

    el: ".ccc-calendar-wrap",
    selected: null,
    template: {
        calendar: require('ccc/global/partials/calendar.html'),
        calendarEvents: require('ccc/global/partials/calendarEvents.html'),
        calendarEventsItem: require('ccc/global/partials/calendarEventsItem.html')
    },

    // 日历事件请求api
    eventsApi: '/api/v2/user/MYSELF/calendar',
    type: {
        invest: {
            name: "投资",
            klass: "tender",
            value: "INVEST"
        },
        invest_repay: {
            name: "投资回款",
            klass: "invest-repay",
            value: "INVEST_REPAY"
        },
        recharge: {
            name: "充值",
            klass: "repayment",
            value: "DEPOSIT"
        },
        withdraw: {
            name: "提现",
            klass: "withdraw",
            value: "WITHDRAW"
        },
        loan: {
            name: "融资",
            klass: "tender",
            value: "LOAN"
        },
        loan_repay: {
            name: "还款日",
            klass: "invest-repay",
            value: "LOAN_REPAY"
        }
    },

    initialize: function (options) {
        this.countDays();

        /**
         * @this.type[month/double/year]
         * month: 单月
         * double: 双月
         * year: 全年
         */
        var defaults = {
            type: 'month',
            week: 'cn',
            complete: function () {},
            container: '.ccc-calendar-wrap',
            cyear: (new Date())
                .getFullYear(),
            cdate: new Date(),
            year: (new Date())
                .getFullYear(),
            el: this.el,
            template: this.template.calendar,
            per: null,
            renderEvents: false,
            debug: false,
        };

        var _config = {};
        $.extend(_config, defaults, options);

        this.config = _config;
        this.year = this.config.year;
        this.cyear = this.config.cyear;

        if (this.config.debug) {
            console.info('debug:config', this.config);
        }

        var __date = new Date();
        var set_year = __date.setFullYear(this.config.year);
        if (this.config.cyear) {
            if (this.config.cyear !== __date.getFullYear()) {
                __date.setDate(1);
                __date.setMonth(0);
                set_year = __date.setFullYear(this.config.cyear, __date.getMonth(),
                    __date.getDate());
            } else {
                set_year = __date.setFullYear(this.config.cyear);
            }
        }
        this.month = __date.getMonth();
        this.render(new Date(set_year));
        return this;
    },

    render: function (date) {
        var self = this;
        date = date || '';
        if (!date) {
            date = new Date();
        }
        this.date = date;
        this.year = moment(date)
            .format('YYYY');
        var datas = this.loadCalendar(date);

        if (this.config.debug) {
            console.info('debug:runtime-datas', this.year, this.month, this.getDate());
        }

        // render to dom
        new Ractive({
            el: this.config.container,
            template: this.config.template,
            data: datas,
            onrender: function () {
                self.config.complete(self);
                if (self.config.renderEvents) {
                    self.loadEvents();
                }
            }
        });
    },

    loadCalendar: function (date) {
        var datas_l;

        if (this.config.type === 'month') {
            datas_l = this.formate_month(date);
            datas_l.index = 0;
            datas_l.right_month = false;

            return {
                month: [datas_l]
            };
        }
        if (this.config.type === 'double') {
            datas_l = this.formate_month(date);
            datas_l.index = 0;
            datas_l.right_month = false;
            var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            today.setMonth(today.getMonth() + 1);
            var datas_r = this.formate_month(today);
            datas_r.index = 1;
            datas_r.right_month = true;

            return {
                month: [datas_l, datas_r]
            };
        }

        if (this.config.type === "year") {
            var month_arr = [],
                T, y, d;
            T = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            y = T.getFullYear();
            d = T.getDate();

            for (var i = 0; i <= 11; i++) {
                var _date = y + '-' + (i + 1)
                    .toString() + '-' + d;
                _date = new Date(y, i);
                var month = this.formate_month(_date);
                month.index = i;
                month.right_month = false;
                month_arr.push(month);
            }

            // 分组
            if (this.config.per) {
                var _tmp_arr = [],
                    new_arr = [];
                for (var j = 0; i < month_arr.length; j++) {
                    _tmp_arr.push(month_arr[j]);
                    if ((j + 1) % this.config.per === 0) {
                        new_arr.push({
                            month: _tmp_arr
                        });
                        _tmp_arr = [];
                    }
                }
                return {
                    per: new_arr
                };
            } else {
                return {
                    month: month_arr
                };
            }
        }
    },

    formate_month: function (date) {
        var i, T, y, m, d, w, current_month_count, current_date, curr_y,
            curr_m;

        current_date = new Date();
        curr_y = current_date.getFullYear();
        curr_m = current_date.getMonth() + 1;

        T = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        y = T.getFullYear();
        m = T.getMonth() + 1;
        d = T.getDate();
        w = T.getDay();
        current_month_count = T.countDays(y + '-' + m);

        var _T = new Date(y, parseInt(m) - 1, 1);
        var _w = _T.getDay();

        var prev_month = this.prevMonth(date);
        var prev_month_count = _T.countDays(prev_month);
        var prev_month_start = prev_month_count - _w + 1;
        var next_month = this.nextMonth(date);

        var _days_arr = [];
        var _day_o;
        for (i = 0; i < _w + current_month_count; i++) {
            _day_o = {};
            if (i < _w) {
                var _p_d = prev_month_start + i;
                _day_o = {
                    today: false,
                    current: false,
                    prev: true,
                    next: false,
                    date: prev_month + '-' + _p_d,
                    day: _p_d
                };
            } else {
                var _c_d = i - _w + 1;
                _day_o = {
                    today: (_c_d === (new Date()
                        .getDate()) && m === curr_m && y === curr_y) ? true : false,
                    current: true,
                    selected: (this.selected === y + '-' + m + '-' + _c_d) ?
                        true : false,
                    prev: false,
                    next: false,
                    date: y + '-' + m + '-' + _c_d,
                    day: _c_d
                };
            }
            _day_o.index = i;
            _days_arr.push(_day_o);
        }

        var month_array = [];
        var _day_ul = [];
        var j = 1;
        var _days_arr_length = _days_arr.length;
        for (i = 0; i < _days_arr_length; i++) {
            _days_arr[i].first = (j === 1 ? true : false);
            _day_ul.push(_days_arr[i]);
            j++;
            if ((i + 1) % 7 === 0 || i === _days_arr_length - 1) {
                if (i === _days_arr_length - 1) {
                    var _left_length = 7 - _day_ul.length;
                    if (_left_length > 0) {
                        for (var k = 0; k < _left_length; k++) {
                            var _n_d = k + 1;
                            _day_o = {
                                today: false,
                                current: false,
                                prev: false,
                                next: true,
                                date: next_month + '-' + _n_d,
                                day: _n_d
                            };
                            _day_ul.push(_day_o);
                        }
                    }

                }
                month_array.push({
                    "day_li": _day_ul
                });
                _day_ul = [];
                j = 1;
            }
        }
        // 如果少于六行则补全
        var _day_ul_len = month_array.length;

        // 预期纵排长度(不含week行)
        var FILL_OFFSET = 6;
        if (_day_ul_len < FILL_OFFSET) {
            var last_arr = month_array[_day_ul_len - 1].day_li;
            var last = last_arr[6].day;
            var last_date = last_arr[6].date.split("-");
            var day_li = [];

            // 如果array last是本月最后一天，alst置为0，新一列从0开始计算
            if (last === current_month_count) {
                last = 0;
            }

            var _i = 0;
            for (i = last + 1; i < last + 7 * (FILL_OFFSET - _day_ul_len) + 1; i++) {
                var add_day = {
                    first: (_i) % 7 === 0 ? true : false,
                    current: false,
                    date: last_date[0] + '-' + last_date[1] + '-' + i,
                    day: i,
                    next: true,
                    prev: false,
                    today: false
                };
                day_li.push(add_day);
                _i++;
            }
            month_array.push({
                day_li: day_li
            });
        }

        var return_month = {
            week: this.get_local_week(),
            date: y + '年' + m + '月',
            date_obj: {
                year: y,
                month: m
            },
            day_ul: month_array
        };

        if (this.config.debug) {
            console.info('debug:calendar-datas', return_month);
        }

        return return_month;
    },

    week_en: [{
        name: 'Su',
        first: true
    }, {
        name: 'Mo'
    }, {
        name: 'Tu'
    }, {
        name: 'We'
    }, {
        name: 'Th'
    }, {
        name: 'Fr'
    }, {
        name: 'So',
        last: true
    }],
    week_cn: [{
        name: '周日',
        first: true
    }, {
        name: '周一'
    }, {
        name: '周二'
    }, {
        name: '周三'
    }, {
        name: '周四'
    }, {
        name: '周五'
    }, {
        name: '周六',
        last: true
    }],

    get_local_week: function () {
        if (this.config.week === "en") {
            return this.week_en;
        }
        if (this.config.week === "cn") {
            return this.week_cn;
        }
    },

    // 上一月
    prev: function (offset) {
        offset = offset || 1;
        var T = new Date(this.date.getFullYear(), this.date.getMonth(), this.date
            .getDate());
        //T.setDate(1);
        T.setMonth(T.getMonth() - offset);
        this.month = T.getMonth();
        this.render(T);
        return this;
    },

    // 下一月
    next: function (offset) {
        offset = offset || 1;
        var T = new Date(this.date.getFullYear(), this.date.getMonth(), this.date
            .getDate());
        //T.setDate(1);
        T.setMonth(T.getMonth() + offset);
        this.month = T.getMonth();
        this.render(T);
        return this;
    },

    // 当前月
    curr: function () {
        this.month = this.config.cdate.getMonth();
        this.render(this.config.cdate);
        return this;
    },

    countDays: function () {
        Date.prototype.countDays = function (d) {
            if (!d) {
                var _d = new Date();
                d = _d.getFullYear() + '-' + (_d.getMonth() + 1);
            }
            var all = 0;
            d = d.split('-');
            var y = d[0];
            var m = parseInt(d[1]);
            d = parseInt(d[2]);
            this.getDate();
            var sin = [1, 3, 5, 7, 8, 10, 12];
            if (m === 2) {
                if ((y % 400 === 0) || (y % 4 === 0) && (y % 100 !== 0)) {
                    all = 29;
                } else {
                    all = 28;
                }
            } else {
                if ($.inArray(m, sin) !== -1) {
                    all = 31;
                } else {
                    all = 30;
                }
            }
            return all;
        };
    },

    // 载入日历事件
    loadEvents: function () {
        var self = this,
            T = new Date();

        var CONF = {
            sm: null, // start month
            em: null, // end month
            sd: 1, // start day
            ed: null // end day
        };

        switch (this.config.type) {
        case 'month':
            CONF.sm = this.month;
            CONF.em = this.month;
            CONF.ed = T.countDays(this.year + '-' + (this.month + 1));
            break;
        case 'year':
            CONF.sm = 0;
            CONF.em = 11;
            CONF.sd = 1;
            CONF.ed = 31;
            break;
        case 'double':
            throw new Error('cccCalendar type {double} not init!');
        }

        var apiDatas = {
            startDate: (new Date(this.year, CONF.sm, CONF.sd, 0, 0, 0))
                .getTime(),
            endDate: (new Date(this.year, CONF.em, CONF.ed, 23, 59, 59))
                .getTime()
        };

        $.get(this.eventsApi + "?t=" + (new Date())
            .getTime(), apiDatas, function (o) {
                if (self.config.debug) {
                    console.info('debug:events-datas', o);
                }
                self.renderEvents(o);
            });
    },

    renderEvents: function (datas) {
        var self = this;

        // parse datas
        var datas_key = [];
        var new_datas = {};
        for (var i = 0; i < datas.length; i++) {
            var T = new Date(datas[i].date);
            var year = T.getFullYear();
            var month = T.getMonth() + 1;
            var day = T.getDate();
            datas[i].date = this.setDate(year + '-' + month + '-' + day);
            datas_key.push(datas[i].date);
            new_datas[datas[i].date] = datas[i];
            for (var j = 0; j < datas[i].events.length; j++) {
                var _o = datas[i].events[j];
                if (_o.eventType === 'INVEST_REPAY') {
                    //var _eve_time = _o.eventTime;
                    var _real = moment(_o.eventTime)
                        .format('YYYY-MM-DD');
                    if (this.dateContrast(_real, datas[i].date) === -1) {
                        datas[i].events[j].real = _real;
                    }
                }
            }
        }

        var container = $(".xk-calendar-date-column li.current-month");
        container.each(function (i, obj) {
            var _date = self.setDate($(obj)
                .data("value"));
            if ($.inArray(_date, datas_key) !== -1) {
                var day = (_date)
                    .split("-")[2];
                if (day.substring(0, 1) === "0") {
                    day = day.replace("0", "");
                }
                new_datas[_date].day = day;
                self.setEvents($(this), new_datas[_date]);
            }
        });
        $('ul li.events')
            .tooltip({
                html: true,
                placement: 'left',
                container: 'body'
            });

        $("li.all, .cc-tips-wp")
            .hover(function () {
                var $this = $(this);
                var _that = $(this)
                    .data("value")
                    .split("-");
                var month = _that[1];
                var day = _that[2];

                var tit_date = month + "月" + day + "日事件";

                // render_current_events
                var render_current_events = function (date) {
                    var data = {
                        list: self.sortByEventTime(new_datas[self.setDate(
                            date)].events)
                    };

                    new Ractive({
                        el: ".cc-tips-wp .cc-tips-container",
                        template: self.template.calendarEvents,
                        data: data,
                    });
                    $("h3.events-tit")
                        .text(tit_date);
                };

                Tips.create({
                    obj: $this,
                    width: 250,
                    height: 'auto',
                    callback: function (_res) {
                        render_current_events($this.data("value"));
                        _res($('.cc-tips-wp')
                            .height());
                    }
                });
            }, function () {
                Tips.close();
            });
    },

    setEvents: function (obj, datas) {
        var self = this,
            title = "";
        var o, T, action = null;

        // 当天只有一个事件
        if (datas.events.length === 1) {
            o = datas.events[0];
            T = new Date(o.eventTime);
            datas.events[0].time = moment(o.eventTime)
                .format('HH:mm');
            if (datas.events[0].eventType === self.type.recharge.value) {
                datas.icon = "fa-plus";
                datas.repayment = true;
                action = self.type.recharge.name;

                // 指定该项显示的css class name
                datas.type = self.type.recharge.klass;
            } else if (datas.events[0].eventType === self.type.invest.value) {
                datas.icon = "fa-list-ul";
                datas.tender = true;
                action = self.type.invest.name;
                datas.type = self.type.invest.klass;
            } else if (datas.events[0].eventType === self.type.invest_repay.value) {
                datas.icon = "fa-money";
                datas.invest_repay = true;

                if (datas.events[0].real) {
                    action = '预期' + self.type.invest_repay.name;
                } else {
                    action = self.type.invest_repay.name;
                }

                datas.type = self.type.invest_repay.klass;
            } else if (datas.events[0].eventType === self.type.loan.value) {
                action = self.type.loan.name;
                datas.type = self.type.loan.klass;
                datas.icon = "fa-money";
            } else if (datas.events[0].eventType === self.type.loan_repay.value) {
                action = self.type.loan_repay.name;
                datas.type = self.type.loan_repay.klass;
                datas.icon = "fa-money";
            } else if (datas.events[0].eventType === self.type.withdraw.value) {
                datas.icon = "fa-briefcase";
                datas.withdraw = true;
                action = self.type.withdraw.name;
                datas.type = self.type.withdraw.klass;
            }
            title = action + o.amount + "元";
            obj.attr("data-original-title", title);
        } else {
            for (var i = 0; i < datas.events.length; i++) {
                o = datas.events[i];
                action = "";
                T = new Date(o.eventTime);
                datas.events[i].time = moment(o.eventTime)
                    .format('HH:mm');
                if (datas.events[i].eventType === self.type.recharge.value) {
                    action = self.type.recharge.name;
                }
                if (datas.events[i].eventType === self.type.invest.value) {
                    action = self.type.invest.name;
                }
                if (datas.events[i].eventType === self.type.invest_repay.value) {
                    if (datas.events[i].real) {
                        action = '预期' + self.type.invest_repay.name;
                    } else {
                        action = self.type.invest_repay.name;
                    }
                }
                if (datas.events[i].eventType === self.type.loan.value) {
                    action = self.type.loan.name;
                }
                if (datas.events[i].eventType === self.type.loan_repay.value) {
                    action = self.type.loan_repay.name;
                }
                if (datas.events[i].eventType === self.type.withdraw.value) {
                    action = self.type.withdraw.name;
                }
                datas.events[i].content = action + o.amount + "元";
            }
            datas.icon = "fa-credit-card";
            datas.all = true;
            datas.type = "all";
        }

        new Ractive({
            el: obj,
            template: self.template.calendarEventsItem,
            data: datas,
        });
        obj.addClass("events " + datas.type);
    },

    sortByEventTime: function (events) {
        if (events.length === 0) {
            return events;
        }
        events.sort(function compare(a, b) {
            return a.eventTime - b.eventTime;
        });
        return events;
    },

    prevMonth: function (date) {
        var T = new Date(date);
        T.setMonth(T.getMonth() - 1);
        return T.getFullYear() + '-' + (T.getMonth() + 1);
    },

    nextMonth: function (date) {
        var T = new Date(date);
        T.setMonth(T.getMonth() + 1);
        return T.getFullYear() + '-' + (T.getMonth() + 1);
    },

    setDate: function (date) {
        var _date, y, m, d;
        _date = date.split("-");
        y = parseInt(_date[0]);
        m = parseInt(_date[1]);
        d = parseInt(_date[2]);
        if (m < 10) {
            m = '0' + m;
        }
        if (d < 10) {
            d = '0' + d;
        }
        return y + '-' + m + '-' + d;
    },

    dateContrast: function (d1, d2) {

        var s = moment(d1)
            .unix();
        var n = moment(d2)
            .unix();
        if (s - n > 0) {
            return 1;
        } else if (s - n === 0) {
            return 0;
        } else {
            return -1;
        }
    },

    getYear: function () {
        return this.year;
    },

    getCurrentYear: function () {
        return this.config.cyear;
    },

    getMonth: function () {
        return this.month;
    },

    getDate: function (f) {
        f = typeof f === 'undefined' ? 'YYYY-MM-DD' : f;
        return moment(this.date)
            .format(f);
    }
};

function calendar(o) {
    return ThisView.initialize(o);
}

module.exports = calendar;
