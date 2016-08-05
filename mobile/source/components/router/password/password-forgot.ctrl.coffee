
do (_, angular) ->

    angular.module('controller').controller 'PasswordForgotCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$location, @$window, @$interval, @$routeParams, @$q', class
            constructor: (@api, @$scope, @$rootScope, @$location, @$window, @$interval, @$routeParams, @$q) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                angular.extend @$scope, {
                    store: {}
                }


            fetch_new_captcha: ->

                @api.fetch_password_captcha().then (data) =>
                    @captcha = data
                    @$scope.store.captcha = ''


            send_mobile_captcha: (mobile) ->

                (@api.check_mobile(mobile)

                    .then (data) =>
                        return @$q.reject({error: [message: 'MOBILE_NOT_EXISTS']}) if data.success is true
                        return data

                    # .catch (data) =>
                    #     @$q.reject error: [message: 'MOBILE_NOT_EXISTS']

                    .then => @api.send_captcha_for_reset_password(mobile)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

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


            send_password_reset: ({mobile, captcha, password}) ->

                @new_password_sending = true

                (@api.reset_password(mobile, captcha, password)

                    .then (data) =>
                        return @$q.reject data unless data.success is true
                        return data

                    .then (data) =>
                        @$scope.action_result = { success: true }

                        # @$window.alert @$scope.msg.SUCCEED
                        # @$location.path '/login'

                        # @$scope.$on '$locationChangeSuccess', =>
                        #     @$window.location.reload()

                    .catch (data) =>
                        error = _.get data, 'error[0].message', 'UNKNOWN'
                        error = _.result @$scope.msg, error
                        @$window.alert error

                    .finally =>
                        @new_password_sending = false
                )
