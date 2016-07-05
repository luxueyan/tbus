'use strict';

var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var navRactive = new Ractive({
	el: '.account-nav',
	template: require('ccc/newAccount/partials/nav.html'),
	data: {
		showInvestToggleMenu : false,
		showAccountToggleMenu : false,
        showFundToggleMenu:false,
		isEnterprise: CC.user.enterprise
	},
	oninit: function () {
		var location = window.location.pathname.split('/');
		if (location.length <= 3) {
			var tab = location[location.length-1];
			this.set(tab, true);
		} else {
			var tab = location[location.length -2];
			var menu = location[location.length -1];
			//console.log('tab111'+tab);
			//console.log(menu)
			this.set(tab, true);
			this.set(menu, true);
			if (tab === 'invest') {
				this.set('showInvestToggleMenu', true);
			} else if (tab === 'loanRequest') {
				this.set('showLoanToggleMenu', true);
			}else if (tab === 'fund') {
				this.set('showFundToggleMenu', true);
            }
            else {
				this.set('showAccountToggleMenu', true);
			}
		}
	}
});
	
navRactive.on('toggleMenu', function (event) {
	var toggleMenu = event.node.getAttribute('data-toggle');
	this.set(toggleMenu, !this.get(toggleMenu));
});



var banksabled = _.filter(CC.user.bankCards, function (r) {
	return r.deleted === false;
});

var infoRactive = new Ractive({
	el: '.user-nav',
	template: require('ccc/newAccount/partials/home/userinfo.html'),
	data: {
		user: CC.user,
		paymentPasswordHasSet : CC.user.paymentPasswordHasSet,
		isEnterprise : CC.user.enterprise,
		banksabled : banksabled.length? true : false,
		safetyProgress: 25,
		riskText: '中',
		vip:'普通用户',
		showVip: true
	},

	oninit: function () {
		var safetyProgress = 25;
		accountService.getVipLevel(function (r) {
			if(r.success && r.data) {
				infoRactive.set('vip', r.data.level.name);
			}
		});
		accountService.checkAuthenticate(function (r) {
			accountService.getUserInfo(function (res) {
				infoRactive.set('user', res.user);
				infoRactive.set('emailAuthenticated', r.emailAuthenticated);

				if (res.user.name) {
					safetyProgress += 25;
				}
				if (r.emailAuthenticated) {
					safetyProgress += 25;
				}
				if (infoRactive.get('paymentPasswordHasSet')) {
					safetyProgress += 25;
				}
				infoRactive.set('safetyProgress', safetyProgress)
				if (safetyProgress > 75) {
					infoRactive.set('riskText', '高');
				}
			});
		});

		accountService.getGroupMedal(function (r) {
			infoRactive.set('groupMedal', r);
		});
	}
});