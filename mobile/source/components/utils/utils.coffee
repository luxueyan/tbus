
do (_, angular, Math) ->

    angular.module('filter')
        .filter 'parseFloat', ->
            (num) -> parseFloat num

        .filter 'parseInt', ->
            (num) -> parseInt num

        .filter 'sanitize', _.ai '$sce', ($sce) ->
            (html) -> $sce.trustAsHtml html

        .filter 'string_mask', ->
            (string, fixed, [a, rest..., b] = (string or '').split '') ->
                return '' unless string
                rest.length = fixed if fixed > 0
                rest = _.repeat '*', rest.length
                return a + rest + b

        .filter 'string_replace', ->
            (text, reg, new_text) -> text.replace /// #{ reg }///, new_text

        .filter 'fund_type_cn', ->
            table = {
                'INVEST': '投标'
                'WITHDRAW': '提现'
                'DEPOSIT': '充值'
                'LOAN': '放款'
                'LOAN_REPAY': '贷款还款'
                'DISBURSE': '垫付还款'
                'INVEST_REPAY': '回款'
                'CREDIT_ASSIGN': '债权转让'
                'TRANSFER': '平台奖励'
                'REWARD_REGISTER': '注册奖励'
                'REWARD_REFERRAL': '推荐奖励'
                'REWARD_INVEST': '投标奖励'
                'REWARD_DEPOSIT': '充值奖励'
                'COUPON_CASH': '现金券'
                'COUPON_INTEREST': '加息券'
                'COUPON_PRINCIPAL': '增值券'
                'COUPON_REBATE': '返现券'
                'FEE_WITHDRAW': '提现手续费'
                'FEE_AUTHENTICATE': '身份验证手续费'
                'FEE_INVEST_INTEREST': '回款利息管理费'
                'FEE_LOAN_SERVICE': '借款服务费'
                'FEE_LOAN_MANAGE': '借款管理费'
                'FEE_LOAN_INTEREST': '还款管理费'
                'FEE_LOAN_VISIT': '实地考察费'
                'FEE_LOAN_GUARANTEE': '担保费'
                'FEE_LOAN_RISK': '风险管理费'
                'FEE_LOAN_OVERDUE': '逾期管理费'
                'FEE_LOAN_PENALTY': '逾期罚息(给商户)'
                'FEE_LOAN_PENALTY_INVEST': '逾期罚息(给投资人)'
                'FEE_DEPOSIT': '充值手续费'
                'FEE_ADVANCE_REPAY': '提前还款违约金(给商户)'
                'FEE_ADVANCE_REPAY_INVEST': '提前还款违约金(给投资人)'
                'FEE_CREDIT_ASSIGN': '债权转让手续费'
                'FEE_BIND_CARD': '用户绑卡手续费'
                'FSS': '生利宝'
                'OFFLINE_DEPOSIT': '线下充值'
            }

            (type) ->
                table[type] or type









do (_, angular, Holder) ->

    do Holder.run

    angular.module('directive').directive 'holder', ->

        restrict: 'AC'

        link: (scope, element, attrs) ->

            attrs.$set('data-src', attrs.holder) if attrs.holder
            scope.$evalAsync -> Holder.run images: element[0]



    angular.module('directive').directive 'gyroIncludeBackfire', ->

        restrict: 'AE'
        replace: true

        scope: {}

        link: (scope, element, attr) ->

            element.replaceWith element.children()



    angular.module('directive').directive 'focusOn',

        _.ai '$timeout', ($timeout) ->
            (scope, elem, attrs) ->
                scope.$watch attrs.focusOn, (newval) ->
                    return unless newval

                    $timeout (->
                        do elem[0].focus
                    ), 0, false



    angular.module('directive').directive 'autoSubmit',

        _.ai '$timeout', ($timeout) ->
            (scope, element, attr) ->
                if attr.autoSubmit is 'true'
                    $timeout ->
                        do element[0].submit



    angular.module('directive').directive 'goBack',

        _.ai '$window', ($window) ->
            (scope, element, attr) ->
                element.on 'click', ->
                    do $window.history.back



    angular.module('directive').directive 'gyroComment', ->

        multiElement: true
        transclude: 'element'
        priority: 9999
        terminal: true
        restrict: 'A'
        $$tlb: true

        compile: (element) ->
            do element.remove
            element = null



    angular.module('directive').directive 'gyroDisableAnimation',

        _.ai '$animate', ($animate) ->

            restrict: 'A'

            link: (scope, element) ->

                $animate.enabled element, false









do (_, angular) ->

    angular.module('factory')

        .factory 'param',

            _.ai '$httpParamSerializer, $httpParamSerializerJQLike',
                ( $httpParamSerializer, $httpParamSerializerJQLike) ->

                    (obj, traditional) ->

                        return $httpParamSerializer(obj) if traditional
                        return $httpParamSerializerJQLike(obj)



        .factory 'cookie2root', _.ai '$document, baseURI', ($document, baseURI) ->

            (name, value, base = baseURI) ->

                value = encodeURIComponent base + value

                # at least in AngularJS v1.3.15, the $cookieStore service
                # does not has ability to set `path`, therefor it has to be
                # written in bare hand as below. (v1.4.0-beta.6 has it covered tho)
                $document[0].cookie = "#{ name }=#{ value }; path=/"



        .factory 'checkChinaID', ->

            mask = '10X98765432'.split ''
            factor = '68947310526894731'.split('').map (n) -> ~~n + 1
            reduce = (func) -> factor.reduce func, 0

            (id) ->
                id_str = "#{ id ? '' }"
                mark = id_str[factor.length] or '-'

                return mark is mask[reduce((s, n, i) -> s + n * parseInt(id_str[i])) % mask.length]



        .factory 'mg_alert', _.ai '$window, $q', ($window, $q) ->

            (message) ->

                $window.alert message
                return result: $q.resolve()



        .factory 'popup_payment_state', _.ai '$uibModal', ($uibModal) ->

            (options = {}) ->

                $uibModal.open {
                    size: 'lg'
                    animation: true
                    backdrop: 'static'

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, options

                    windowClass: "center modal-payment-state modal-payment-state-page-#{ options.page }"

                    template: '
                        <div ng-switch="page">
                            <div class="modal-header" ng-switch-when="register">
                                <img class="icon" width="39" ng-src="assets/image/register-icon.png">
                                <h4>您已成功注册账户</h4>
                            </div>
                            <div class="modal-header" ng-switch-when="login">
                                <img class="icon" width="44" ng-src="assets/image/user-icon.png">
                                <h4>您已成功登录账户</h4>
                            </div>
                            <div class="modal-header" ng-switch-when="bind-card">
                                <img class="icon" width="44" ng-src="assets/image/user-icon.png">
                                <h4>欢迎回来</h4>
                            </div>
                        </div>

                        <div class="modal-body">
                            <h5>为顺利投资<br>还需进行以下认证</h5>
                            <h5 x-gyro-comment>您已经在我们平台上进行过注册认证<br>为了能顺利投资还需设置交易密码</h5>

                            <ul class="list-unstyled state-list">
                                <li>
                                    <div class="state">
                                        <param class="icon icon-bank-card">银行卡绑定
                                    </div>
                                </li>
                                <li>
                                    <div class="state">
                                        <param class="icon icon-payment-password">交易密码
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div class="modal-footer">
                            <a class="btn btn-theme btn-block btn-lg btn-action" href="">立即认证</a>
                            <a class="btn btn-link btn-block" href="" ng-click="$close()">以后再说</a>
                        </div>
                    '
                }
