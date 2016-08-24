
do (_, angular) ->

    angular.module('controller').controller 'HelpCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window', class
            constructor: (@api, @$scope, @$rootScope, @$window) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'more'

                EXTEND_API @api


            query: (group) ->

                group.loading = true

                (@api.get_help_content(group.name)

                    .then (data) =>
                        group.list = data

                    .finally =>
                        group.loading = false
                )





    EXTEND_API = (api) ->

        api.__proto__.get_help_content = (name_value, cache = true) ->

            encode_name_value = encodeURIComponent(name_value)

            @$http
                .get "/api/v2/cms/category/HELP/name/#{ encode_name_value }", {cache}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR

