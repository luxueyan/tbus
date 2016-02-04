
do (_, angular) ->

    angular.module('controller').controller 'LoginCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @mg_alert, @$q, @$http', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @mg_alert, @$q, @$http) ->

                {back, next, mobile, bind_social_weixin} = @$routeParams

                @back_path = back
                @next_path = next
                @page_path = @$location.path()

                @submit_sending = false
                @flashing_error_message = false

                @bind_weixin = !!bind_social_weixin and
                               /MicroMessenger/.test @$window.navigator.userAgent

                @$scope.store = {mobile}
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
                                .search mobile: mobile

                        .catch (data) =>
                            @step = 'two'
                            @submit_sending = false
                    )

                    return

                (@api.login(mobile, password)

                    .then (data) =>
                        return @$q.reject(data) unless data?.success is true
                        return data

                    .then (data, {bind_social_weixin} = @$routeParams) =>
                        if @bind_weixin
                            @api.bind_social 'WEIXIN', bind_social_weixin

                        return data

                    .then (data) =>
                        @api.fetch_current_user().then =>
                            unless @next_path
                                @$location
                                    .path '/'
                                    .search t: _.now()
                            else
                                @$location
                                    .path @next_path
                                    .search 'next', null

                            @$scope.$on '$locationChangeStart', (event, new_path) =>
                                event.preventDefault()
                                @$window.location.href = new_path

                    .catch (data) =>
                        result = _.get data, 'error_description.result'

                        if result in _.split 'TOO_MANY_ATTEMPT USER_DISABLED'
                            @mg_alert @$scope.msg.DISABLED
                        else
                            do @error_message_flash

                        @submit_sending = false
                )



