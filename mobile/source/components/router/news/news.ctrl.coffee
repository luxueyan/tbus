
do (_, angular) ->

    angular.module('controller').controller 'NewsCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams, @$location', class
            constructor: (@api, @$scope, @$window, @$routeParams, @$location) ->

                @$window.scrollTo 0, 0

                @is_from_app = @$routeParams.from == 'app'

                EXTEND_API @api

                @query()


            query: ->

                @$scope.loading = true

                if @$routeParams.id
                    (@api.get_news_detail(@$routeParams.id)
                        .then (data) =>
                            @$scope.detail = data

                        .finally =>
                            @$scope.loading = false
                    )

                else
                    (@api.get_news_list(@is_from_app)
                        .then (data) =>
                            @$scope.list = data

                        .finally =>
                            @$scope.loading = false
                    )





    EXTEND_API = (api) ->

        api.__proto__.get_news_list = (is_from_app, cache = false) ->

            name_value = if is_from_app then 'App资讯' else 'H5资讯'
            encode_name_value = encodeURIComponent(name_value)

            @$http
                .get "/api/v2/cms/category/PUBLICATION/name/#{ encode_name_value }", {cache}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.get_news_detail = (id, cache = false) ->

            @$http
                .get "/api/v2/cms/article/#{ id }", {cache}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
