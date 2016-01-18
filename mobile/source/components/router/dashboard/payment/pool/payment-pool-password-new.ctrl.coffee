
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolPasswordNewCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$q, @$location, @$interval, @$routeParams, @mg_alert', class
            constructor: (@user, @api, @$scope, @$window, @$q, @$location, @$interval, @$routeParams, @mg_alert) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back or 'dashboard/settings'
                @next_path = @$routeParams.next or @back_path

                angular.extend @$scope, {
                    type: @$routeParams.type
                    step: if @$routeParams.type is 'set' then 'two' else 'one'
                    store: {}
                }

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}
                @submit_sending = false

                EXTEND_API @api


            send_mobile_captcha: ->

                do @api.payment_pool_set_password_send_captcha

                @captcha.timer = @$interval =>
                    @captcha.count -= 1

                    if @captcha.count < 1
                        @$interval.cancel @captcha.timer
                        @captcha.count = @captcha.count_default
                        @captcha.buffering = false
                , 1000

                @captcha.has_sent = @captcha.buffering = true


            check_password: (key, step, remote_check = false) ->

                password = @$scope.store[key]

                (@$q.resolve(!!"#{ password }".match /^[0-9]+$/)

                    .then (only_numbers) =>
                        return if only_numbers

                        @$q.reject @$scope.msg.ONLY_NUMBERS

                    .then =>
                        return true unless remote_check

                        @api.payment_password_check(password)

                    .then (correct) =>
                        return @$q.reject(@$scope.msg.INCORRECT) unless correct

                        @$scope.step = step

                    .catch (msg) =>
                        @$scope.store[key] = ''
                        if _.get(msg, 'error') is 'access_denied'
                            @mg_alert @$scope.msg.ACCESS_DENIED
                                .result.finally =>
                                    @$location.path 'login'
                        else
                            @mg_alert msg
                )


            submit: ({confirm_new_password, new_password, old_password, mobile_captcha}) ->

                unless confirm_new_password is new_password
                    return @mg_alert @$scope.msg.NOT_MATCH_UP

                func = {
                    set: @api.payment_password_set.bind @api, new_password
                    change: @api.payment_password_change.bind @api, old_password, new_password
                    reset: @api.payment_password_reset.bind @api, new_password, mobile_captcha

                }[@$scope.type]

                @submit_sending = true

                (func()

                    .then (data) =>
                        return @$q.reject(data) unless data is true or data.success is true
                        return data

                    .then (data) =>
                        @user.has_payment_password = true

                        @mg_alert @$scope.msg.SUCCESS
                            .result.finally =>
                                @$location
                                   .path @next_path
                                   .search next: null, back: null

                    .catch (data) =>
                        @submit_sending = false
                        @mg_alert _.get data, 'error[0].message', @$scope.msg.FAILURE
                )







    EXTEND_API = (api) ->

        api.__proto__.payment_password_check = (password) ->

            @$http
                .get '/api/v2/user/MYSELF/validatePaymentPassword',
                    params: {password}
                    cache: false

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_password_set = (password) ->

            @$http
                .post '/api/v2/user/MYSELF/setPaymentPassword',
                    {password}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_password_change = (oldPassword, newPassword) ->

            @$http
                .post '/api/v2/user/MYSELF/updatePaymentPassword',
                    {oldPassword, newPassword}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_password_reset = (password, smsCaptcha) ->

            @$http
                .post '/api/v2/user/MYSELF/resetPaymentPassword',
                    {password, smsCaptcha}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
