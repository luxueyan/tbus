'use strict';

var utils = require('ccc/global/js/lib/utils');
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/cccTab');

var couponTpl = require('ccc/account/partials/coupon/coupon.html');

var pagesize = 9;
var page = 1;
var totalPage = 1;

var getCurrentType = function() {
	return $('.ccc-tab li.active').data('type');
};

$('ul.tabs li a').on('click', function() {
	var type = $(this).parent().data('type');
	init(type);
});

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function init (type) {
	if (type) {
		var couponRactive = new Ractive ({
			el: '.panel-' + type,
			template: couponTpl,
			size: pagesize,
			page: page,
			totalPage: totalPage,
			api: '/api/v2/coupon/MYSELF/coupons',
			data: {
				loading: true,
				list: [],
				total: 0,
                type: ''
			}, 
			bindTime:0,
			status: {
	            'INITIATED': '未使用',
	            'PLACED': '未使用',
	            'USED': '打款中',
	            'CANCELLED': '已作废',
	            'EXPIRED': '已过期',
	            'REDEEMED': '已使用'
	        },
	        type: {
	            'CASH': '现金券',
	            'INTEREST': '加息券',
	            'PRINCIPAL': '增值券',
	            'REBATE': '返现券'
	        },
			onrender: function() {
				var self = this;
				self.getCouponData(function (o){
					self.set('total',o.totalSize);
					self.setData(self.parseData(o.results));
				});
				if (self.bindTime == 0) {
					self.initClick();
					self.bindTime ++;
				}
			},
			getCouponData: function(callback) {
				var self = this;

				$.post(self.api,{
					type: type,
					page: self.page,
					size: self.size
				},function (o){
					if (o.success) {
						self.pageOneData = o.data.results;
						callback(o.data);
					}
				});
			},
			setData: function(o) {
				var self = this;
				self.set('loading', false);
				self.set('list', o);
                self.set('type', type);
				self.renderPager();
			},
			parseData: function(o) {
	            for (var i = 0; i < o.length; i++) {
	                o[i].displayName = o[i].couponPackage.displayName;
	                o[i].parValue = o[i].couponPackage.parValue;
	                o[i].type = o[i].couponPackage.type;
	                o[i].typeKey = o[i].couponPackage.displayName;
	                o[i].canuse = false;
	                if (o[i].type === 'CASH') {
	                    if (o[i].status === 'INITIATED' || o[i].status === 'PLACED') {
	                        o[i].canuse = true;
	                    }
	                }
	                if (o[i].type === 'INTEREST') {
	                	o[i].interest  = true;
	                    o[i].displayValue = (parseFloat(o[i].parValue)/100).toFixed(1) + '%';
	                } else if (o[i].type === 'CASH') {
	                    o[i].displayValue = parseInt(o[i].parValue);
	                } else if (o[i].type === 'PRINCIPAL') {
	                    o[i].displayValue = parseInt(o[i].parValue);
	                } else if (o[i].type === 'REBATE') {
	                    o[i].displayValue = parseInt(o[i].parValue);
	                }
	                if (o[i].status === 'INITIATED' || o[i].status === 'PLACED') {
	                	o[i].notUse = true;
	                    o[i].displayStatus = '未使用';
	                } else if (o[i].status === 'USED') {
	                	o[i].USED = true;
	                    o[i].displayStatus = '待处理';
	                } else if (o[i].status === 'REDEEMED') {
	                	o[i].REDEEMED = true;
	                    o[i].displayStatus = '已兑换';
	                } else if (o[i].status === 'EXPIRED') {
	                	o[i].EXPIRED = true;
	                    o[i].displayStatus = '已过期';
	                } else if (o[i].status === 'CANCELLED') {
	                	o[i].CANCELLED = true;
	                    o[i].displayStatus = '已失效';
	                }
	                o[i].used = false;
	                if (o[i].status === 'USED' || o[i].status === 'REDEEMED') {
	                    o[i].used = true;
	                }
	                o[i].status = this.status[o[i].status];
	                o[i].timePlaced = (new Date(o[i].timePlaced)).Format("yyyy-MM-dd");//分发时间
	                o[i].timeRedeemed = o[i].timeRedeemed;//兑换时间
	                o[i].description = o[i].couponPackage.description;
	                o[i].totalAmount = o[i].couponPackage.totalAmount;
	                o[i].timeIssued = o[i].couponPackage.timeIssued;
	                o[i].timeStart = o[i].couponPackage.timeStart;
	                if(o[i].couponPackage.timeExpire == null) {
	                	o[i].timeExpire = "永不过期";
	                } else {
	                	o[i].timeExpire = (new Date(o[i].couponPackage.timeExpire)).Format("yyyy-MM-dd");
	                }
	                if (o[i].description === "") {
	                    o[i].description = "暂无描述";
	                }
	            }
	            return o;

			},
			initClick: function (){
				var self = this;
				var currentPage = $(".currentPage").text();
				$(".prev").click(function(){
					if ( self.page == 1 ) {
						return false
					} else {
						self.page = self.page - 1;
						self.onrender();
					}
				});

				$(".next").click(function(){
					if ( self.page == self.totalPage ) {
						return false
					} else {
						self.page = self.page + 1;
						self.onrender();
					}
				});
			},
			renderPager: function (){
				var self = this;
				var totalSize = self.get('total');
				
				if (totalSize != 0) {
					self.totalPage = Math.ceil(totalSize / self.size);
				}

				$(".currentPage").text(self.page);
				$(".totalPage").text(self.totalPage);
			}
		});		
	}
}

init(getCurrentType());

window.redeemCoupon = function(btn) {
    var id = $(btn).data("id");
    $.post("/api/v2/coupon/MYSELF/redeemCoupon", {
    	placementId: id
    }, function (res) {
    	console.log(res);
        if (res) {
            alert("使用成功");
            location.reload();
        } else {
            alert("使用失败");
        }
    });
}
