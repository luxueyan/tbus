
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


            set_password: ({password, mobile_captcha}) ->

                @submit_sending = true

                (@api.payment_pool_set_password(password, mobile_captcha)

                    .then @api.process_response

                    .then (data) =>
                        @user.has_payment_password = true
                        @$window.alert @$scope.msg.SUCCESS
                        @$location.path @next_path

                    .catch (data) =>
                        @submit_sending = false
                        @$window.alert _.get data, 'error[0].message',  @$scope.msg.FAILURE
                )
