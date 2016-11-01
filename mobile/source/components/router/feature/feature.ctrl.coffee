
do (_, angular) ->

    angular.module('controller').controller 'FeatureCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams', class
            constructor: (@api, @$scope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                {feature} = @$routeParams

                angular.extend @$scope, {
                    feature: feature or 'safety'
                }

                if feature is 'product'
                    EXTEND_API @api
                    @query()


            query: ->

                @$scope.loading = true

                (@api.get_feature_product()

                    .then (data) =>
                        @$scope.data = data

                    .finally =>
                        @$scope.loading = false
                )





    EXTEND_API = (api) ->

        api.__proto__.get_feature_product = ->

            encode_name_value = encodeURIComponent('私募基金信息披露')

            @$http
                .get "/api/v2/cms/category/PRODUCT/name/#{ encode_name_value }", {cache: true}

                .then @TAKE_RESPONSE_DATA

                .then (data) =>

                    product = _.find(data, {'title': '产品列表'})

                    return {} unless product

                    @$http
                        .get "/api/v2/cms/article/#{ product.id }"

                        .then @TAKE_RESPONSE_DATA

                .catch @TAKE_RESPONSE_ERROR


