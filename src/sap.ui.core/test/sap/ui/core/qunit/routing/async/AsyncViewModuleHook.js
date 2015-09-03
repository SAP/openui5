sap.ui.define([], function() {
	var aViews = [{
		path: "../../testdata/routing/Async1.view.xml",
		content: undefined // content will be set later
	}, {
		path: "../../testdata/routing/Async2.view.xml"
	}, {
		path: "../../testdata/routing/Async3.view.xml"
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
						var fnRespond = function() {
							request.respond(200, {
								"Content-Type": "application/xml",
								"Cache-Control": "no-cache, no-store, must-revalidate",
								"Pragma": "no-cache",
								"Expires": "0"
							}, aViews[parseInt(request.url.slice(-10, -9)) - 1].content);
						};
						request.onSend = function() {
							if (!request.async) {
								fnRespond();
							} else {
								setTimeout(fnRespond, 50);
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
