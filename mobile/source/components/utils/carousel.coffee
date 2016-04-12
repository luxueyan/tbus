
do (angular) ->

    angular.module('directive').directive 'carouselBanner',

        _.ai 'api', (api) ->

            restrict: 'AE'

            scope:
                interval: '=delayInSeconds'

            template: '''
                <uib-carousel interval="interval * 1000" no-wrap="noWrapSlides">
                    <uib-slide ng-repeat="slide in slides | orderBy: 'pubDate'" active="slide.active">
                        <a ng-href="{{ slide.url }}" target="_self">
                            <img ng-src="assets/banner/{{ slide.content }}" style="margin:auto;">

                            <div class="carousel-caption" ng-if>
                                <p>{{ slide.title }}</p>
                            </div>
                        </a>
                    </uib-slide>
                </uib-carousel>
            '''

            link: (scope, element, attr) ->

                api.get_carousel_banners().then (data) ->
                    scope.slides = data
