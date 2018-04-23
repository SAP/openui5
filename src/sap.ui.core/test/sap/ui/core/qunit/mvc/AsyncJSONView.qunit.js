sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/JSONView",
	"./AnyViewAsync.qunit"
], function(View, JSONView, asyncTestsuite) {

	// setup test config with generic factory
	var oConfig = {
		type : "JSON",
		factory : function(bAsync) {
			return sap.ui.view({
				type : "JSON",
				viewName : "testdata.mvc.Async",
				async : bAsync
			});
		},
		receiveSource : function(source) {
			return JSON.stringify(source);
		}
	};
	asyncTestsuite("Generic View Factory", oConfig);

	// switch factory function
	oConfig.factory = function(bAsync) {
		return sap.ui.jsonview({
			viewName : "testdata.mvc.Async",
			async : bAsync
		});
	};
	asyncTestsuite("JSONView Factory", oConfig);

	QUnit.test("Promise - loaded() for async view", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var that = this;
		this.oLogMock = this.mock(jQuery.sap.log);
		this.oLogMock.expects("warning").never();

		JSONView.create({
			viewName : "testdata.mvc.Async"
		})
		.then(function(oViewLoaded) {
			assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");
			done();
		});
	});
});