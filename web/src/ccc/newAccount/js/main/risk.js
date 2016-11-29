"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var riskId = '', rank = '';
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/risk/risk.html'),

    data: {
        question: true,
        result: false,
        list: '',
        timeLastUpdated: '',
        type: '',
    },
    init: function () {
        var self = this;
        accountService.getQuestion(function (res) {
            self.set("listA", res.questions.slice(0, 3));
            self.set("listB", res.questions.slice(3, 7));
            self.set("listC", res.questions.slice(7, 9));
            self.set("listD", res.questions.slice(9, 10));
            riskId = res.id;
        });
    },
    oncomplete: function () {
        var self = this;
        accountService.getUserInfo(function (userinfo) {
            console.log(userinfo)
            if (userinfo.surveyFilling) {
                self.set("timeLastUpdated", moment(userinfo.surveyFilling.timeLastUpdated).format('YYYY-MM-DD HH:mm:ss'));
                rank = userinfo.surveyScore.rank;
                if (rank) {
                    self.set('question', false);
                    self.set('result', true);
                }
                self.set('type', userinfo.surveyScore.name);
            }

            if (userinfo.userInfo.user.idNumber) {
                self.on('getScore', function () {
                    var sum = 0;
                    var len = $('input:radio:checked').length;
                    if (len < 10) {
                        alert("请确保每个选项都已选择!");
                        return;
                    }
                    $('input:radio:checked').each(function (i) {
                        var score = parseInt($(this).val());
                        sum += score;
                    });
                    request.post('/api/v2/user/MYSELF/surveyFilling')
                        .query({
                            userId: CC.user.id,
                            surveyId: riskId,
                            fillingStatus: 'FINISHED',
                            score: sum,
                            //rank: rank,
                            content: ''
                        })
                        .end()
                        .then(function (r) {
                            window.location.reload();
                            var res = r.body;
                            if (!res) {
                                return alert("获取数据失败...");
                            }
                            //console.log(res.error);
                            if (res.success) {
                                //console.log(res.data);
                                self.set('timeLastUpdated', moment(res.data.timeLastUpdated).format('YYYY-MM-DD HH:mm:ss'));

                                self.set('question', false);
                                self.set('result', true);
                                return;
                            }
                            alert(res.error.toString() + '\n');
                        });
                });
            } else {
                alert("请先实名认证！");
                location.href = '/newAccount/settings/authentication';
            }
        })
    }
});

ractive.on('reEvaluation', function () {
    this.set('question', true);
    this.set('result', false);
});

ractive.on('submit', function () {
    var male = $('#male').val();
    var companyIndustry = this.get('companyIndustry');
    var educationLevel = this.get('educationLevel');
    var salary = this.get('salary');
    var maritalStatus = this.get('maritalStatus');
    accountService.updatePersonalInfo(male, educationLevel, maritalStatus, function (r) {
        if (!r.error) {
            accountService.updateCareerInfo(companyIndustry, salary, function (r) {
                //console.log(r);
                if (!r.error) {
                    alert('信息编辑成功');
                    window.location.reload();
                } else {
                    alert('信息编辑失败,请稍后重试！');
                }
            });
        } else {
            alert('信息编辑失败,请稍后重试！');
        }
    });
    return false;
});
           
