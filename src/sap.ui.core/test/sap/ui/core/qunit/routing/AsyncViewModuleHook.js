sap.ui.define([], function() {
	var aViews = [{
		path: "../testdata/routing/Async.view.xml",
		content: undefined // content will be set later
	}];

	aViews.forEach(function(oViewSetting, iIndex) {
		// preload the view source
		jQuery.ajax({
			url : oViewSetting.path,
			success : function(data) {
				oViewSetting.content = new XMLSerializer().serializeToString(data);
			},
			async : false
		});
	});

	return {
		create: function(oSetting) {
			return {
				beforeEach: function() {
					var xhr = this.xhr = sinon.useFakeXMLHttpRequest();
					xhr.useFilters = true;
					xhr.addFilter(function(method, url) {
						return url.indexOf("testdata/routing") === -1;
					});

					xhr.onCreate = function(request) {
						request.onSend = function() {
							if (!request.async) {
								request.respond(200,  {"Content-Type": "application/xml"}, aViews[0].content);
							} else {
								setTimeout(function() {
									request.respond(200,  {"Content-Type": "application/xml"}, aViews[0].content);
								}, 50);
							}
						};
					};

					if (oSetting && oSetting.beforeEach) {
						oSetting.beforeEach.apply(this);
					}
				},

				afterEach: function() {
					if (oSetting && oSetting.afterEach) {
						oSetting.afterEach.apply(this);
					}
				}
			};
		}
	};
});
