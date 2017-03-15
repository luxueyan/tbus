
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
                'OFFLINE_DEPOSIT': '线下补录'
            }

            (type) ->
                table[type] or type


        .filter 'greeting_time_cn', _.ai '$filter', ($filter) ->

            (date) ->

                hour = parseInt($filter('date')(date, 'H'))

                greeting = switch
                    when 0 <= hour < 6  then '凌晨好'
                    when 6 <= hour < 9 then '早上好'
                    when 9 <= hour < 12  then '上午好'
                    when 12 <= hour < 14  then '中午好'
                    when 14 <= hour < 18 then '下午好'
                    when 18 <= hour < 24 then '晚上好'
                    else '您好'

                return greeting









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



        .factory 'alert', _.ai '$uibModal, $rootScope', ($uibModal, $rootScope) ->

            (message) ->

                prompt = $uibModal.open {
                    size: 'lg'
                    animation: false
                    backdrop: 'static'
                    windowClass: 'center modal-alert'
                    template: '''
                        <div class="modal-body text-center" ng-bind-html="message | sanitize"></div>
                        <div class="modal-footer">
                            <a ng-click="$close()">确定</a>
                        </div>
                    '''
                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, {message}
                }

                once = $rootScope.$on '$locationChangeStart', ->
                    prompt?.dismiss('cancel')
                    do once

                return prompt.result



        .factory 'toast', _.ai '$rootScope, $timeout', ($rootScope, $timeout) ->

            (message) ->

                {toast_timer} = $rootScope
                $timeout.cancel(toast_timer) if toast_timer

                $rootScope.toast_message = message

                $rootScope.toast_timer = $timeout (->
                    $rootScope.toast_message = ''
                    $rootScope.toast_timer = ''
                ), 2000



        .factory 'popup_captcha', _.ai '$uibModal, $rootScope', ($uibModal, $rootScope) ->

            ->

                prompt = $uibModal.open {
                    size: 'lg'
                    animation: false
                    backdrop: 'static'
                    windowClass: 'center modal-captcha'

                    controller: _.ai '$scope, $http',
                        (             $scope, $http) ->
                            store = {}

                            angular.extend $scope, {
                                store

                                fetch_captcha: ->
                                    $scope.loading_captcha = true

                                    ($http
                                        .get '/api/v2/captcha?timestamp=' + _.now()
                                        .then (response) ->
                                            $scope.loading_captcha = false

                                            {captcha, token} = response.data
                                            $scope.captcha_img = captcha
                                            store.captcha_token = token
                                    )
                            }

                    template: """
                        <div class="modal-header">
                            <span class="pull-right" ng-click="$dismiss('cancel')">
                                <param class="glyphicon glyphicon-remove">
                            </span>
                            <h4 class="modal-title">请输入图形验证码</h4>
                        </div>

                        <div class="modal-body">
                            <div class="form-group form-group-captcha">
                                <input class="form-control input-lg captcha" type="text"
                                    name="captcha"
                                    ng-model="store.captcha_answer"
                                    ng-pattern="/^[A-Za-z0-9]+$/"
                                    autocapitalize="none"
                                    autocomplete="off"
                                    autocorrect="off"
                                    maxlength="5"
                                    placeholder=""
                                    ng-change="store.captcha_answer.length == 5 && $close(store)"
                                >

                                <div class="action"
                                    ng-init="fetch_captcha()"
                                    ng-click="fetch_captcha()"
                                >
                                    <img ng-src="{{ captcha_img }}"
                                        class="captcha-img"
                                        width="72"
                                        height="24"
                                        ng-show="!loading_captcha"
                                    >
                                    <img src="assets/image/spinner.gif"
                                        class="loading"
                                        ng-show="loading_captcha"
                                    >
                                </div>
                            </div>
                        </div>
                    """
                }

                once = $rootScope.$on '$locationChangeStart', ->
                    prompt?.dismiss('cancel')
                    do once

                return prompt.result



        .factory 'view_pdf', _.ai '$uibModal, $rootScope, $window', ($uibModal, $rootScope, $window) ->

            (title, url) ->

                if /iPhone|mac|iPod|iPad/i.test($window.navigator.userAgent)
                    $window.location.href = url
                    return

                url = encodeURIComponent(url)
                url = "static/pdfjs/web/viewer.html?file=#{ url }"

                prompt = $uibModal.open {
                    size: 'lg'
                    backdrop: false
                    animation: false
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'

                    template: '''
                        <div id="view-pdf">

                            <nav class="container page-nav">
                            <div class="row">
                                <a class="col-xs-3 back" ng-click="$close()">
                                    <param class="glyphicon glyphicon-menu-left">
                                </a>
                                <span class="col-xs-6 title">{{ title }}</span>
                                <span class="col-xs-3">&nbsp;</span>
                            </div>
                            </nav>

                            <section class="pdf-iframe-wrap">
                                <iframe
                                    class="pdf-iframe"
                                    frameborder="0"
                                    ng-src="{{ url }}">
                                </iframe>
                            </section>

                        </div>
                    '''

                    controller: _.ai '$scope',
                        (             $scope) =>
                            angular.extend $scope, {title, url}
                }

                once = $rootScope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result


