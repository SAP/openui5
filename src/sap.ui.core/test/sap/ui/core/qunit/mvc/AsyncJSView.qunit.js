/*global QUnit */
sap.ui.define([
	"./AnyViewAsync.qunit",
	"sap/ui/core/mvc/JSView",
	"sap/base/Log"
], function(asyncTestsuite, JSView, Log) {
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
	asyncTestsuite("JSView Factory", oConfig);

	QUnit.test("New create factory", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var that = this;
		this.oLogMock = this.mock(Log);
		this.oLogMock.expects("warning").never();

		JSView.create({
			viewName : "testdata.mvc.Async"
		})
		.then(function(oViewLoaded) {
			assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof JSView, "Views equal deeply");
			done();
		});
	});
});