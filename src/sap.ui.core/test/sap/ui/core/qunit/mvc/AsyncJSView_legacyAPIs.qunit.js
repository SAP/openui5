/*global */
sap.ui.define([
	"./AnyViewAsync_legacyAPIs.qunit",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/JSView"
], function(asyncTestsuite, View, JSView) {
	"use strict";

	// setup test config with generic factory
	var oConfig = {
		type : "JS",
		factory : function(bAsync) {
			return sap.ui.view({
				type : "JS",
				viewName : "testdata.mvc.Async",
				async : bAsync
			});
		},
		receiveSource : function(source) {
			return source;
		}
	};
	asyncTestsuite("Generic View Factory", oConfig);

	// switch factory function
	oConfig.factory = function(bAsync) {
		return sap.ui.jsview("testdata.mvc.Async", !!bAsync);
	};
	asyncTestsuite("Legacy JSView Factory", oConfig);
});