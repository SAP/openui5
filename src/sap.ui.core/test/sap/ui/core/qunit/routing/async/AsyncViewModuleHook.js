/*global sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function(jQuery) {
	"use strict";

	var aViews = [{
		path: sap.ui.require.toUrl("qunit/view/Async1.view.xml"),
		content: undefined // content will be set later
	}, {
		path: sap.ui.require.toUrl("qunit/view/Async2.view.xml")
	}, {
		path: sap.ui.require.toUrl("qunit/view/Async3.view.xml")
	}];

	aViews.forEach(function(oViewSetting) {
		// preload the view source
		jQuery.ajax({
			dataType: 'text',
			url : oViewSetting.path,
			success : function(data) {
				oViewSetting.content = data;
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
						return url.indexOf("routing/fixture") === -1;
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
					this.xhr.restore();
				}
			};
		}
	};
});
