
do (_, angular) ->

    angular.module('controller').controller 'MobileChangeCtrl',

        _.ai '            @user, @api, @$scope, @$rootScope, @$location, @$window, @$interval, @$routeParams, @$q', class
            constructor: (@user, @api, @$scope, @$rootScope, @$location, @$window, @$interval, @$routeParams, @$q) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                @captcha_new = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                angular.extend @$scope, {
                    store: {}
                }

                EXTEND_API @api


            send_mobile_captcha: ->

                (@api.send_captcha_for_change_mobile()

                    .then @api.process_response

                    .then =>
                        @captcha.timer = @$interval =>
                            @captcha.count -= 1

                            if @captcha.count < 1
                                @$interval.cancel @captcha.timer
                                @captcha.count = @captcha.count_default
                                @captcha.buffering = false
                        , 1000

                        @captcha.has_sent = @captcha.buffering = true

                    .catch (data) =>
                        error = _.get data, 'error[0].message', 'UNKNOWN'
                        error = _.result @$scope.msg, error
                        @$window.alert error
                )


            send_mobile_captcha_new: (mobile_new) ->

                (@api.check_mobile(mobile_new)

                    .then @api.process_response

                    .then => @api.send_captcha_new_for_change_mobile(mobile_new)

                    .then @api.process_response

                    .then =>
                        @captcha_new.timer = @$interval =>
                            @captcha_new.count -= 1

                            if @captcha_new.count < 1
                                @$interval.cancel @captcha_new.timer
                                @captcha_new.count = @captcha_new.count_default
                                @captcha_new.buffering = false
                        , 1000

                        @captcha_new.has_sent = @captcha_new.buffering = true

                    .catch (data) =>
                        error = _.get data, 'error[0].message', 'UNKNOWN'
                        error = _.result @$scope.msg, error
                        @$window.alert error
                )


            change_mobile: ({mobile_captcha, mobile_new, mobile_captcha_new}) ->

                @submit_sending = true

                (@api.change_mobile(mobile_captcha, mobile_new, mobile_captcha_new)

                    .then @api.process_response

                    .then (data) =>
                        @$scope.action_result = { success: true }

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        error = _.get data, 'error[0].message', 'UNKNOWN'

                        if error is 'INVALID_MOBILE_CAPTCHA'
                            type = _.get data, 'error[0].type'

                            if type is 'smsCaptcha'
                                error = 'INVALID_MOBILE_CAPTCHA_OLD'
                            else if type is 'newSmsCaptcha'
                                error = 'INVALID_MOBILE_CAPTCHA_NEW'

                        error = _.result @$scope.msg, error
                        @$window.alert error

                    .finally =>
                        @submit_sending = false
                )








    EXTEND_API = (api) ->

        api.__proto__.send_captcha_for_change_mobile = ->

            @$http
                .post '/api/v2/smsCaptcha/MYSELF',
                    {smsType: 'CREDITMARKET_RESET_MOBILE'}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.send_captcha_new_for_change_mobile = (mobile) ->

            @$http
                .post '/api/v2/smsCaptcha',
                    {mobile, smsType: 'CREDITMARKET_RESET_MOBILE'}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.change_mobile = (smsCaptcha, newMobile, newSmsCaptcha) ->

            @$http
                .post '/api/v2/user/MYSELF/resetMobile',
                    {smsCaptcha, newMobile, newSmsCaptcha}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


