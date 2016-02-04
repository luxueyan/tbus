
do (_, angular) ->

    angular.module('controller').controller 'RegisterCtrl',

        _.ai '            @api, @$scope, @$interval, @$location, @$routeParams, @$window, @$cookies, @$q, @$uibModal, @mg_alert, @baseURI', class
            constructor: (@api, @$scope, @$interval, @$location, @$routeParams, @$window, @$cookies, @$q, @$uibModal, @mg_alert, @baseURI) ->

                {mobile} = @$routeParams
                @$scope.back_path = "login?mobile=#{ mobile }" if mobile

                @$scope.store = {
                    mobile
                    referral: do ({ref, rel, refm, reftf, referral} = @$routeParams) ->
                        _.first _.compact [ref, rel, refm, reftf, referral]
                }

                @cell_buffering = false
                @cell_buffering_count = 59.59

                @$scope.has_referral = !!@$scope.store.referral
                @submit_sending = false

            get_verification_code: ({mobile, captcha}) ->

                @mobile_verification_code_has_sent = true

                (@api.check_mobile(mobile)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

                    .catch (data) =>
                        @$q.reject error: [message: 'MOBILE_EXISTS']


                    .then => @api.send_verification_code(mobile, captcha, @captcha?.token)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

                    .then (data) =>

                        timer = @$interval =>
                            @cell_buffering_count -= 1

                            if @cell_buffering_count < 1
                                @$interval.cancel timer
                                @cell_buffering_count += 100 * (@cell_buffering_count % 1)
                                @cell_buffering = false
                                @fetch_new_captcha(false) if @captcha?.token
                        , 1000

                        @cell_buffering = true

                    .catch (data) =>

                        key = _.get data, 'error[0].message'

                        @mg_alert @$scope.msg[key] or @$scope.msg.UNKNOWN

                        do @fetch_new_captcha if key in _.split '
                            INVALID_CAPTCHA
                            IMG_CAPTCHA_NULL
                            IMG_CAPTCHA_REQUIRED
                        '

                        @mobile_verification_code_has_sent = false
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

                    .then (data) =>
                        unless data.success is true
                            @$q.reject data.error

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @$location.path 'dashboard'

                    .catch (data) =>
                        key = _.get data, '[0].message'
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

            $uibModal.open {
                size: 'lg'
                animation: true
                backdrop: 'static'

                controller: _.ai '$scope',
                    (             $scope) ->
                        angular.extend $scope, options

                windowClass: "center modal-payment-state modal-payment-state-page-#{ options.page }"

                templateUrl: 'components/templates/ngt-payment-state.tmpl.html'
            }
