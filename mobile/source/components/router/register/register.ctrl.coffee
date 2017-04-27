
do (_, angular) ->

    angular.module('controller').controller 'RegisterCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$interval, @$location, @$routeParams, @$window, @$q, @$uibModal, @popup_payment_state', class
            constructor: (@api, @$scope, @$rootScope, @$interval, @$location, @$routeParams, @$window, @$q, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                {next} = @$routeParams

                @next_path = next

                referral = do ({ref, rel, refm, reftf, referral} = @$routeParams) ->
                    _.first _.compact [ref, rel, refm, reftf, referral]

                @$scope.store = {
                    referral
                }

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                @$scope.has_referral = !!@$scope.store.referral
                @submit_sending = false

                EXTEND_API @api

                if @$scope.has_referral
                    @get_referral_info(referral)
                else
                    @$rootScope.state = 'dashboard'


            get_referral_info: (referral) ->

                @$scope.loading_referral_info = true

                (@api.get_referral_info(referral)

                    .then @api.process_response

                    .then (response) =>
                        @$scope.referral_info = _.get(response, 'data')

                    .finally =>
                        @$scope.loading_referral_info = false
                )


            get_verification_code: ({mobile, captcha}) ->

                (@api.check_mobile(mobile)

                    .then @api.process_response

                    # .catch (data) =>
                    #     @$q.reject error: [message: 'MOBILE_EXISTS']

                    .then => @api.send_verification_code(mobile, captcha, @img_captcha?.token)

                    .then @api.process_response

                    .then (data) =>

                        @captcha.timer = @$interval =>
                            @captcha.count -= 1

                            if @captcha.count < 1
                                @$interval.cancel @captcha.timer
                                @captcha.count = @captcha.count_default
                                @captcha.buffering = false
                                # @fetch_new_captcha(false) if @captcha?.token
                        , 1000

                        @captcha.has_sent = @captcha.buffering = true

                    .catch (data) =>

                        key = _.get data, 'error[0].message'

                        @$window.alert @$scope.msg[key] or @$scope.msg.UNKNOWN

                        do @fetch_new_captcha if key in _.split '
                            INVALID_CAPTCHA
                            IMG_CAPTCHA_NULL
                            IMG_CAPTCHA_REQUIRED
                        '
                )


            fetch_new_captcha: (reset = true) ->

                @api.fetch_register_captcha().then (data) =>
                    @img_captcha = data
                    @$scope.store.captcha = '' if reset


            signup: ({password, mobile, mobile_captcha, referral}) ->
                @submit_sending = true

                optional = {}

                do (optional, referral) ->
                    if /^1\d{10}/.test referral
                        optional.referral = referral
                    else if referral?.length > 3
                        optional.inviteCode = referral

                do (optional, {bind_social_weixin} = @$routeParams) =>
                    if bind_social_weixin then _.merge optional, {
                        socialType: 'WEIXIN'
                        socialId: bind_social_weixin
                    }

                (@api.register(password, mobile, mobile_captcha, optional)

                    .then @api.process_response

                    .then => @api.login(mobile, password)

                    .then @api.process_response

                    .then (data) =>
                        (@$q.resolve()
                            .then =>
                                return @$q.reject() unless @$scope.has_referral

                                (@api.get_user_coupons_by_type({type: 'PRINCIPAL'})

                                    .then @api.process_response
                                    .then @api.TAKE_RESPONSE_DATA

                                    .then ({results}) =>
                                        coupon_8888 = _.find(
                                            results,
                                            (item) -> item.couponPackage.parValue is 8888
                                        )

                                        return @$q.reject() unless coupon_8888

                                        @close_form()

                                        @show_coupon({
                                            mobile,
                                            expire_time: _.get(coupon_8888, 'timeExpire')
                                        })
                                )

                            .catch =>
                                @$scope.is_register_successful = true

                                @$scope.$on '$locationChangeStart', (event, new_path) =>
                                    event.preventDefault()
                                    @$window.location = new_path

                                @$location
                                    .path 'download-app'
                                    .search {}
                        )

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key

                    .finally =>
                        @submit_sending = false
                )


            agreement: (segment) ->

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center'
                    animation: true
                    templateUrl: 'ngt-register-agreement.tmpl'

                    resolve: {
                        content: _.ai '$http', ($http) ->
                            $http
                                .get "/api/v2/cms/category/DECLARATION/name/#{ segment }", {cache: true}
                                .then (response) -> _.get response.data, '[0].content'
                    }

                    controller: _.ai '$scope, content',
                        (             $scope, content) ->
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once


            popup_form: ({mobile}) ->
                @submit_sending = true

                unless mobile
                    @$window.alert('请输入手机号码')
                    @submit_sending = false
                    return

                (@api.check_mobile(mobile)

                    .then @api.process_response

                    .then (data) =>
                        prompt = @$uibModal.open {
                            size: 'lg'
                            backdrop: 'static'
                            windowClass: 'center modal-register'
                            animation: true
                            templateUrl: 'ngt-register-form.tmpl'

                            controller: _.ai '$scope',
                                (             $scope) =>
                                    @close_form = -> prompt?.close()

                                    unless @captcha.buffering
                                        @get_verification_code(@$scope.store)

                                    angular.extend $scope, {
                                        self: @
                                        store: @$scope.store
                                    }
                        }

                        once = @$scope.$on '$locationChangeStart', ->
                            prompt?.dismiss()
                            do once

                    .catch (data) =>
                        key = _.get data, 'error[0].message'

                        if key in _.split 'MOBILE_EXISTS MOBILE_USED'
                            @confirm_login(mobile)
                            return

                        @$window.alert(@$scope.msg[key] or @$scope.msg.UNKNOWN)

                    .finally =>
                        @submit_sending = false
                )


            confirm_login: (mobile) ->

                prompt = @$uibModal.open {
                    size: 'sm'
                    keyboard: false
                    backdrop: 'static'
                    windowClass: 'center modal-confirm'
                    animation: false
                    template: '''
                        <div class="modal-body text-center">
                            该手机号已注册
                        </div>

                        <div class="modal-buttons">
                            <div class="modal-button" ng-click="$close()">重新输入</div>
                            <a class="modal-button" ng-href="login?mobile={{ mobile }}">去登录</a>
                        </div>
                    '''

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, { mobile }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result


            show_coupon: (data) ->

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-register-coupon.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) =>
                            angular.extend $scope, data
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once







    angular.module('factory').factory 'popup_payment_state', _.ai '$uibModal', ($uibModal) ->

        (options = {}) ->

            prompt = $uibModal.open {
                size: 'lg'
                animation: false
                backdrop: 'static'
                templateUrl: 'components/templates/ngt-payment-state.tmpl.html'
                windowClass: 'modal-payment-state'

                controller: _.ai '$scope',
                    (             $scope) ->
                        angular.extend $scope, options
            }

            once = @$scope.$on '$locationChangeStart', ->
                prompt?.dismiss('cancel')
                do once

            return prompt.result





    EXTEND_API = (api) ->

        api.__proto__.get_referral_info= (inviteCode) ->

            @$http
                .post '/api/v2/users/getReferralInfo', {inviteCode}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


