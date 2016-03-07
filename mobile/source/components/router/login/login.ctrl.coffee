
do (_, angular) ->

    angular.module('controller').controller 'LoginCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @mg_alert, @$q, @popup_payment_state', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @mg_alert, @$q, @popup_payment_state) ->

                {back, next, mobile, bind_social_weixin} = @$routeParams

                @back_path = back
                @next_path = next

                @submit_sending = false
                @flashing_error_message = false

                @bind_weixin = !!bind_social_weixin and
                               /MicroMessenger/.test @$window.navigator.userAgent

                angular.extend @$scope, {
                    store: {mobile}
                    page_path: @$location.path()[1..]
                }

                @step = 'one'


            error_message_flash: ->
                @flashing_error_message = true
                @$timeout.cancel @timer

                @timer = @$timeout (=>
                    @flashing_error_message = false
                ), 2000


            goto: (new_path) ->

                @$location.path new_path


            login: ({mobile, password} = {}) ->

                # unless username and password
                #     return do @error_message_flash

                @submit_sending = true
                @flashing_error_message = false

                if @step is 'one'

                    (@api.check_mobile(mobile)

                        .then @api.process_response

                        .then (data) =>
                            @$location
                                .path 'register'
                                .search 'mobile', mobile

                        .catch (data) =>
                            @step = 'two'
                            @submit_sending = false
                    )

                    return

                (@api.login(mobile, password)

                    .then @api.process_response

                    .then (data, {bind_social_weixin} = @$routeParams) =>
                        if @bind_weixin
                            @api.bind_social 'WEIXIN', bind_social_weixin

                        return data

                    .then (data) =>
                        @$scope.is_login_successful = true

                        @$rootScope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path

                        @api.fetch_current_user()

                            .then (user) =>
                                return user if user.has_bank_card and user.has_payment_password
                                return @$q.reject(user)

                            .then =>
                                unless @next_path
                                    @$location
                                        .path 'dashboard'
                                        .search t: _.now()
                                else
                                    @$location
                                        .path @next_path
                                        .search 'next', null

                            .catch (user) =>
                                @popup_payment_state {
                                    user
                                    page: 'login'
                                    page_path: 'login'
                                    next_path: @next_path || 'dashboard'
                                }

                        return

                    .catch (data) =>
                        result = _.get data, 'error_description.result'

                        if result in _.split 'TOO_MANY_ATTEMPT USER_DISABLED'
                            @mg_alert @$scope.msg.DISABLED
                        else
                            do @error_message_flash

                        @submit_sending = false
                )



