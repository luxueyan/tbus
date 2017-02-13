
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams, @popup_information_disclosure_agreement', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams, @popup_information_disclosure_agreement) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                current_tab = @$routeParams.tab or 'loan'

                query_set = {}

                if current_tab is 'loan'
                    query_set.product = _.split 'GDSY CPTJ NEW'
                    query_set.recommedInFront = true

                else if current_tab is 'high'
                    query_set.product = 'GDLC'

                    unless @user.has_logged_in
                        @popup_information_disclosure_agreement()

                angular.extend @$scope, {
                    current_tab
                    query_set
                }

                @query(query_set)


            query: (query_set, options = {}) ->

                if @$scope.current_tab in _.split 'loan high'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 1
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_loan_list_by_config(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat results.map(@map_loan_summary)

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )

                else if @$scope.current_tab is 'assignment'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 0
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_assignment_list(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat(
                                _(results.map(@map_assignment_summary))
                                    .sortBy (item) ->
                                        ['OPENED', 'FINISHED'].indexOf(item.status)
                                    .value()
                            )

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')










    angular.module('factory').factory 'popup_information_disclosure_agreement', _.ai '$uibModal', ($uibModal) ->

            ->

                prompt = $uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center'
                    animation: false
                    template: '''
                        <div class="modal-body"
                             style="max-height: 300px; overflow-y: auto;"
                             ng-bind-html="content | sanitize"
                        ></div>

                        <div class="modal-footer container">
                            <div class="row">
                                <div class="col-xs-6">
                                    <a class="btn btn-block btn-default"
                                       href="./"
                                    >离开</a>
                                </div>
                                <div class="col-xs-6">
                                    <a class="btn btn-block btn-theme"
                                       href="login?next=list?tab=high"
                                    >确认</a>
                                </div>
                            </div>
                        </div>
                    '''

                    controller: _.ai '$scope',
                        (             $scope) ->
                            content = '''
                                <h4 class="text-center">合格投资者承诺</h4>
                                <p>根据监管要求，了解及认购高端理财须完成以下承诺要求，给您带来不便，敬请谅解：<p>
                                <p>1、本人已经或未来提供给平台的所有资料合法、真实、准确、完整，不存在任何虚假陈述、重大遗漏和误导，该等信息资料如发生任何实质性变更，本人将及时通过平台进行修改。</p>
                                <p>2、本人符合相关法律法规规定的合格投资者标准，即具备相应风险识别能力和风险承担能力，投资于单只私募产品的金额不低于100 万元，且个人金融类资产不低于300万元或者最近三年个人年均收入不低于50万元人民币。</p>
                                <p>3、本人拟用于购买理财产品的资金为本人自有资金，该资金来源合法，本人未非法汇集他人资金，亦未涉嫌从事任何洗钱活动。</p>
                                <p>特此承诺！</p>
                                <p>请详细阅读本提示，点击【确认】，并完成注册登录，方可查看相关产品信息及进行投资。</p>
                            '''
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result

