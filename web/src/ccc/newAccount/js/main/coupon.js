'use strict';

var utils = require('ccc/global/js/lib/utils');
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/cccTab');

var couponTpl = require('ccc/newAccount/partials/coupon/coupon.html');

var pagesize = 6;
var page = 1;
var totalPage = 1;

var getCurrentType = function() {
	return $('.ccc-tab li.active').data('type');
};

$('ul.ttabs li a').on('click', function() {
	var type = $(this).parent().data('type');
	init(type);

	//getcouponId();
	jQuery('#zhuangtai-'+type).val('');
	if (type='REBATE') {
		jQuery('#huoqu-'+type).val('');
	}

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
	console.log(type);
	if (type) {
		var couponRactive = new Ractive ({
			el: '.bodypanel-' + type,
			template: couponTpl,
			size: pagesize,
			perpage:self.size,
			page: page,
			totalPage: totalPage,
			//totalMoney:

			api:'/api/v2/rebateCounpon/listUserCouponPlacementByCond/'+CC.user.userId,
			data: {
				loading: true,
				list: [],
				total: 0
			},
			bindTime:0,
			status: {
				'INITIATED': '未使用',
				'ACHIEVE_UP': '已领完',
				'PLACED': '未使用',
				'USED': '已使用',
				'CANCELLED': '已作废',
				'EXPIRED': '已过期',
				'REDEEMED': '已使用',
				'USING' :'使用中',
			},
			type: {
				'CASH': '现金券',
				'INTEREST': '加息券',
				'PRINCIPAL': '增值券',
				'REBATE': '返现券'
			},

			onrender: function() {
				var self = this;
				var isClick=false;

				if (isClick==false) {
					self.getCouponData(function (o){
						self.set('total',o.totalSize);
						self.actualAmount(o.results);
						var parseResult = self.parseData(o.results);
						console.log('parseResult-----',parseResult);
						self.setData(parseResult);
						jQuery('.xiangxi').removeClass('dtr').addClass('dn');
						jQuery('td[colspan="7"] tbody').html('');
						getcouponId();
					});
				}

				//点击查询红包按钮start
				
				jQuery('.chaxunBtn-'+type).click(function(){
					isClick=true;
					self.getCouponCond(function(z){
						self.set('total',z.totalSize);
						console.log(z);
						console.log(z.totalSize);
						var chaxun = self.parseData(z.results);
						var getcouponIdClick=true;
						self.setData(chaxun);
						if(getcouponIdClick){
							getcouponId();
							getcouponIdClick=false;
						}
					})
				})
				//点击查询红包按钮 end

				if (self.bindTime == 0) {
					self.initClick();
					self.bindTime ++;
				}

			},
			//根据状态查询红包
			getCouponCond:function (callback){
				var self = this;
				var couponPackageId='';
				var statusCha=jQuery('#zhuangtai-'+type).find("option:selected").val();
				if (type=='REBATE') {
					couponPackageId=jQuery('#huoqu-REBATE').find("option:selected").val();
					$.post("/api/v2/rebateCounpon/getUserCouponPlacementsByCond/"+CC.user.userId,{
						type:type,
						page:(self.page - 1),
						pageSize: self.size,
						couponPackageId:couponPackageId,
						status:statusCha
					},function(z){
						console.log(z);
						callback(z);
					});
				}else{
					$.post("/api/v2/rebateCounpon/getUserCouponPlacementsByCond/"+CC.user.userId,{
						type:type,
						page:(self.page - 1),
						pageSize: self.size,
						status:statusCha
					},function(z){
						callback(z);
					});
				}


			},
			getCouponData: function(callback) {
				var self = this;
				$.post(self.api,{
					type:type,
					page: (self.page - 1) ,
					pageSize: self.size
				},function (o){
					if (o.results.length>0) {
						self.pageOneData = o.results;
						callback(o);
					}
				});
			},
			setData: function(o) {
				var self = this;
				self.set('loading', false);
				self.set('list', o);
				self.renderPager();
			},
			actualAmount:function(o){
				jQuery('#actualAmount').html(o[0].actualAmount);
				jQuery('#priv').html(o[0].priv);
			},
			parseData: function(o) {
				for (var i = 0; i < o.length; i++) {
					if(o[i].couponPackage!=null){
						o[i].displayName = o[i].couponPackage.displayName;
						o[i].parValue = o[i].couponPackage.parValue;
						o[i].type = o[i].couponPackage.type;
						o[i].typeKey = o[i].couponPackage.displayName;
						o[i].minimumInvest = o[i].couponPackage.minimumInvest;
						o[i].minimumDuration = o[i].couponPackage.minimumDuration;
						o[i].parValue=parseFloat(o[i].couponPackage.parValue).toFixed(2);
					}

					o[i].actualAmount=parseFloat(o[i].actualAmount).toFixed(2);
					o[i].ableAmount=parseFloat(o[i].parValue-o[i].actualAmount).toFixed(2);
					o[i].canuse = false;
					if (o[i].type === 'CASH') {
						if (o[i].status === 'INITIATED' || o[i].status === 'PLACED') {
							o[i].canuse = true;
						}
					}
					if (o[i].type === 'INTEREST') {//加息
						o[i].interest  = true;
						o[i].displayValue = (parseFloat(o[i].parValue)/100).toFixed(2) + '%';
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
						o[i].displayStatus = '已使用';
					} else if (o[i].status === 'ACHIEVE_UP') {
						o[i].USED = true;
						o[i].displayStatus = '已领完';
					} else if (o[i].status === 'USING') {
						o[i].USED = true;
						o[i].displayStatus = '使用中';
					} else if (o[i].status === 'REDEEMED') {
						o[i].REDEEMED = true;
						o[i].displayStatus = '已兑换';
					} else if (o[i].status === 'EXPIRED') {
						o[i].EXPIRED = true;
						o[i].displayStatus = '已过期';
					} else if (o[i].status === 'CANCELLED') {
						o[i].CANCELLED = true;
						o[i].displayStatus = '已作废';
					}
					o[i].used = false;
					if (o[i].status === 'USED' || o[i].status === 'REDEEMED') {
						o[i].used = true;
					}
					o[i].status = this.status[o[i].status];
					o[i].timePlaced = (new Date(o[i].timePlaced)).Format("yyyy-MM-dd");//分发时间
					o[i].timeRedeemed = o[i].timeRedeemed;//兑换时间
					if(o[i].couponPackage!=null){
						o[i].description = o[i].couponPackage.description;
						o[i].totalAmount = o[i].couponPackage.totalAmount;
						o[i].timeIssued = o[i].couponPackage.timeIssued;
						o[i].timeStart = o[i].couponPackage.timeStart;
						if(o[i].couponPackage.timeExpire == null) {
							o[i].timeExpire = "永不过期";
						} else {
							o[i].timeExpire = (new Date(o[i].couponPackage.timeExpire)).Format("yyyy-MM-dd");
						}
					}

					if(o[i].timeExpire != "永不过期"){
						if(o[i].displayStatus === '未使用'){
							if(o[i].couponPackage.timeExpire<new Date()){
								o[i].status = 'EXPIRED';
								o[i].notUse = false;
								o[i].EXPIRED = true;
								o[i].displayStatus = '已过期';
							}
						}

					}
					if (o[i].description === "") {
						o[i].description = "暂无描述";
					}
//                    o[i].status = this.status[o[i].status];
				}
				return o;

			},
			initClick: function (){
				var self = this;
				var currentPage = $(".currentPage").text();
				$(".prev").click(function(){

					if ( self.page == 0 ) {

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
			renderPager: function () {
				var self = this;
				var totalSize = self.get('total');
				if (totalSize != 0) {
					self.totalPage = Math.ceil(totalSize / self.size);
				}else{
					self.totalPage=1;
				}

				var totalPage = [];
				for (var i = 0; i < self.totalPage; i++) {
					totalPage.push(i+1);
				}

				renderPager(totalPage, self.page);
			}
		});

		function renderPager(totalPage, current) {
			console.log("===>render")
			if (!current) {
				current = 1;
			}
			var pagerRactive = new Ractive({
				el: '#coupon-pager',
				template: require('ccc/loan/partials/pager.html'),
				data: {
					totalPage: totalPage,
					current: current
				}
			});

			pagerRactive.on('previous', function (e) {
				e.original.preventDefault();

				var current = this.get('current');
				if (current > 1) {
					current -= 1;
					this.set('current', current);
					couponRactive.page = current;
					couponRactive.onrender();
				}
			});

			pagerRactive.on('page', function (e, page) {
				e.original.preventDefault();
				if (page) {
					current = page;
				} else {
					current = e.context;
				}
				this.set('current', current);
				couponRactive.page = current;
				couponRactive.onrender();

			});
			pagerRactive.on('next', function (e) {
				e.original.preventDefault();
				var current = this.get('current');
				if (current < this.get('totalPage')[this.get('totalPage')
						.length - 1]) {
					current += 1;
					this.set('current', current);
					couponRactive.page = current;
					couponRactive.onrender();
				}
			});
		}
	}
}


//var ctype=['CASH','INTEREST','PRINCIPAL','REBATE'];
init(getCurrentType());

//点击查看红包详情
window.onload=function(){
	CouponPackage();
}
function couponInfData(Id,callback,errorFn){
	$.ajax({
	  	url: "/api/v2/rebateCounpon/getRebateCouponRecordsByCouponId/"+Id,
	  	data: {couponId:Id },
	  	type:'get',
	  	success:	function(o){ callback(o)},
		error:	function(){errorFn()}
	});
	// $.get("/api/v2/rebateCounpon/getRebateCouponRecordsByCouponId/"+Id, {couponId:Id },
	// 	function(o){
	// 		callback(o);
	// 	});
}
function getcouponId(event){
	$('.checkInforBtn').click(function(){
		var couponId='';
		console.log('youmeiyou');
		couponId=jQuery(this).siblings('.couponId').text();
		if (jQuery('#'+couponId).parents('.xiangxi').hasClass('dn')) {
			console.log(111+"   "+couponId);
			couponInfData(couponId,function(o){
				var trHtml="";
				console.log(111+" ===   "+couponId);
				for (var i = 0; i < o.data.length; i++) {
					o.data[i].useTimeDate=(new Date(o.data[i].useTime)).Format("yyyy-MM-dd");
					o.data[i].amount=o.data[i].amount;
					trHtml=trHtml+'<tr><td style="text-indent:20px;">'+o.data[i].useTimeDate+'</td><td>'+o.data[i].amount+'</td><td>'+'投资'+'</td></tr>';
				}
				jQuery('#'+couponId).html(trHtml);
				jQuery('#'+couponId).parents('.xiangxi').removeClass('dn').addClass('dtr');
			},function(){console.log('ajaxerror')});
		}else{
			jQuery('#'+couponId).parents('.xiangxi').removeClass('dtr').addClass('dn');
		}
		event.stopPropagation();
	})

}

// function stopPropagation(evt) {
//     if (stopPropagation!= undefined) {
//         evt.stopPropagation();
//     } else {
//         evt.cancelBubble = true;
//     }
// }

//奖券获取原因下来列表
function getUsingCouponPackage(callback){
	$.get("/api/v2/rebateCounpon/getUsingCouponPackage",
		function(o){
			callback(o);
		});
}
function CouponPackage(){
	getUsingCouponPackage(function(o){
		var optionHtml='<option value="">全部</option>';
		for (var i = 0; i < o.data.length; i++) {
			if(o.data[i].type='REBATE'){
				var optionHtml=optionHtml+'<option value='+o.data[i].id+'>'+o.data[i].displayName+'</option>';
			}
		}
		// if (jQuery('#huoqu-REBATE').html()=false) {
		jQuery('#huoqu-REBATE').html(optionHtml);
		// }

	})
}

window.redeemCoupon = function(btn) {
	var id = $(btn).data("id");
	$.post("/api/v2/coupon/MYSELF/redeemCoupon", {
		placementId: id
	}, function (res) {
		if (res) {
			alert("兑换申请提交成功!");
			location.reload();
		} else {
			alert("兑换申请提交失败!");
		}
	});
}

