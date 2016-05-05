request.get(encodeURI('/api/v2/cms/category/IMAGE/name/投资详情'))
    .end()
    .then(function (res) {
        var count = new Ractive({
        el: '.detailBanner',
        template: '{{#each items}}<img src="{{content}}"/>{{/each}}',
        data: {
            items: res.body
        }
    });
    });