
do (_, angular, Math) ->

    angular.module('controller').controller 'InviteCtrl',

        _.ai '            wx, @user, @api, @$location, @$scope, @$rootScope, @$window, @baseURI, @$routeParams', class
            constructor: (wx, @user, @api, @$location, @$scope, @$rootScope, @$window, @baseURI, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                Object.defineProperties @$scope,
                    share_link: {
                        get: =>
                            result = @$location.absUrl().split('/')[0..2]
                            result.push 'register?refm=' + @user.info?.invite_code or ''
                            return result.join '/'
                    }

                @wechat = {
                    inside: /MicroMessenger/.test @$window.navigator.userAgent
                    ready: false
                    wx
                }

                @init_wechat() if @wechat.inside

                @$scope.loading_have_invited = true

                (@api.get_refer_count_and_reward()

                    .then (data) =>
                        @$scope.have_invited = data

                    .finally =>
                        @$scope.loading_have_invited = false
                )

                ###
                @$scope.loading_invite_list = true

                (@api.get_user_invite_list()

                    .then (response) =>
                        @$scope.invite_list = _.get(response, 'data.results')

                    .finally =>
                        @$scope.loading_invite_list = false
                )
                ###

                EXTEND_API @api

                (@api.get_invite_title_and_desc()

                    .then ({title, desc}) =>
                        @$scope.msg ?= {}
                        @$scope.msg.SOCIAL_TITLE = title if title
                        @$scope.msg.SOCIAL_DESC = desc if desc
                )

                query_set = {}
                angular.extend(@$scope, { query_set })
                @query_invite_list(query_set)


            query_invite_list: (query_set, options = {}) ->

                if options.on_next_page
                    query_set.pageNo++
                else
                    query_set.pageNo = 1
                    @$scope.invite_list = []

                @$scope.loading_invite_list = true

                (@api.get_user_invite_list_v2(query_set, false)

                    .then @api.TAKE_RESPONSE_DATA

                    .then ({results, totalSize}) =>
                        @$scope.invite_list = @$scope.invite_list.concat results
                        angular.extend @$scope.invite_list, {totalSize}

                    .finally =>
                        @$scope.loading_invite_list = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query_invite_list(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')


            init_wechat: ->

                API_LIST = _.split '
                    onMenuShareAppMessage
                    onMenuShareTimeline
                    onMenuShareQQ
                    onMenuShareQZone
                '

                @wechat.wx.ready =>
                    @on_wechat_ready API_LIST

                    @$scope.$evalAsync =>
                        @wechat.ready = true

                config = {
                    timestamp: _.now() // 1000
                    nonceStr: Math.random().toString(36)[2...16]
                    url: @$location.absUrl().split('#')[0]
                }

                @api.exchange_wechat_signature(config).then (data) =>

                    {timestamp, nonceStr, appId, signature} = data
                    data = {timestamp, nonceStr, appId, signature}

                    return unless +timestamp is +config.timestamp and
                                  nonceStr is config.nonceStr

                    @wechat.wx.config _.merge data, {
                        debug: false

                        jsApiList: API_LIST
                    }


            on_wechat_ready: (api_list) ->

                @$scope.$evalAsync =>

                    {SOCIAL_TITLE, SOCIAL_DESC, SOCIAL_IMG} = @$scope.msg
                    SOCIAL_TITLE = ( @user.info.name ? '小伙伴') + SOCIAL_TITLE

                    _.each api_list, (api) =>

                        @wechat.wx[api] {
                            title: SOCIAL_TITLE
                            desc: SOCIAL_DESC
                            link: @$scope.share_link
                            imgUrl: @baseURI + SOCIAL_IMG
                            success: _.noop
                            cancel: _.noop
                        }






    EXTEND_API = (api) ->

        api.__proto__.get_invite_title_and_desc = ->

            encode_name_value = encodeURIComponent('邀请好友')

            @$http
                .get "/api/v2/cms/category/ACTIVITY/name/#{ encode_name_value }", {cache: false}

                .then @TAKE_RESPONSE_DATA

                .then (data) =>
                    pick_content = (key) -> _.trim(_.result(_.find(data, {'title': key}), 'content'))

                    return {
                        title: pick_content('TITLE')
                        desc:  pick_content('CONTENT')
                    }

                .catch @TAKE_RESPONSE_ERROR


