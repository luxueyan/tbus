
do (_, angular) ->

    angular.module('controller').controller 'RegisterCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$interval, @$location, @$routeParams, @$window, @$q, @$uibModal, @popup_payment_state', class
            constructor: (@api, @$scope, @$rootScope, @$interval, @$location, @$routeParams, @$window, @$q, @$uibModal, @popup_payment_state) ->

                {mobile, next} = @$routeParams

                @next_path = next

                referral = do ({ref, rel, refm, reftf, referral} = @$routeParams) ->
                    _.first _.compact [ref, rel, refm, reftf, referral]

                unless mobile
                    @$location
                        .replace()
                        .path 'login'
                        .search if referral then {referral} else {}
                    return

                @$scope.store = {
                    mobile
                    referral
                }

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                @$scope.has_referral = !!@$scope.store.referral
                @submit_sending = false


            get_verification_code: ({mobile, captcha}) ->

                (@api.check_mobile(mobile)

                    .then @api.process_response

                    .catch (data) =>
                        @$q.reject error: [message: 'MOBILE_EXISTS']


                    .then => @api.send_verification_code(mobile, captcha, @captcha?.token)

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

                        # do @fetch_new_captcha if key in _.split '
                        #     INVALID_CAPTCHA
                        #     IMG_CAPTCHA_NULL
                        #     IMG_CAPTCHA_REQUIRED
                        # '
                )


            fetch_new_captcha: (reset = true) ->

                @api.fetch_register_captcha().then (data) =>
                    @captcha = data
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
                        @$scope.is_register_successful = true

                        @$rootScope.$on '$locationChangeSuccess', =>
                            @$window.location.reload()

                        @api.fetch_current_user()
                            .then (user) =>
                                @popup_payment_state {
                                    user
                                    page: 'register'
                                    next_path: @next_path || 'dashboard'
                                }

                        return

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key
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









    angular.module('factory').factory 'popup_payment_state', _.ai '$uibModal', ($uibModal) ->

        (options = {}) ->

            prompt = $uibModal.open {
                size: 'lg'
                animation: true
                backdrop: 'static'
                templateUrl: 'components/templates/ngt-payment-state.tmpl.html'

                windowClass: "
                    center
                    modal-payment-state
                    modal-payment-state-page-#{ options.page }
                "

                controller: _.ai '$scope',
                    (             $scope) ->
                        angular.extend $scope, options
            }

            if options.page isnt 'register' and options.page isnt 'login'
                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

            return prompt.result
