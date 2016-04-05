
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolPasswordCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$q, @$location, @$interval, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$q, @$location, @$interval, @$routeParams) ->

                @$window.scrollTo 0, 0

                @next_path = @$routeParams.next or 'dashboard'

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}
                @submit_sending = false

                angular.extend @$scope, {
                    type: @$routeParams.type
                    store: {}
                }

                EXTEND_API @api


            send_mobile_captcha: ->

                (@api.payment_pool_password_reset_send_captcha()

                    .then @api.process_response

                    .then (data) =>

                        @captcha.timer = @$interval =>
                            @captcha.count -= 1

                            if @captcha.count < 1
                                @$interval.cancel @captcha.timer
                                @captcha.count = @captcha.count_default
                                @captcha.buffering = false
                        , 1000

                        @captcha.has_sent = @captcha.buffering = true

                    .catch (data) =>

                        key = _.get data, 'error[0].message'

                        @$window.alert @$scope.msg[key] or @$scope.msg.UNKNOWN
                )


            set_password: ({password, mobile_captcha}) ->

                @submit_sending = true

                (@api.payment_pool_password_reset(password, mobile_captcha)

                    .then @api.process_response

                    .then (data) =>
                        @user.has_payment_password = true
                        @$window.alert @$scope.msg.SUCCESS
                        @$location.path @next_path

                    .catch (data) =>
                        @submit_sending = false
                        @$window.alert _.get data, 'error[0].message',  @$scope.msg.FAILURE
                )







    EXTEND_API = (api) ->

        api.__proto__.payment_pool_password_set = (password) ->

            @$http
                .post '/api/v2/user/MYSELF/setPaymentPassword',
                    {password}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_password_change = (oldPassword, newPassword) ->

            @$http
                .post '/api/v2/user/MYSELF/updatePaymentPassword',
                    {oldPassword, newPassword}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_password_reset = (password, smsCaptcha) ->

            @$http
                .post '/api/v2/user/MYSELF/resetPaymentPassword',
                    {password, smsCaptcha}

                .then (response) -> success: response.data is true
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_password_reset_send_captcha = ->

            @$http
                .post '/api/v2/smsCaptcha/MYSELF',
                    {smsType: 'CONFIRM_CREDITMARKET_RESET_PAYMENTPASSWORD'}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
