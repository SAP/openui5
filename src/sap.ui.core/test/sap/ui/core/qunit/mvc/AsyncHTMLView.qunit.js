sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/HTMLView",
	"./AnyViewAsync.qunit"
], function(View, HTMLView, asyncTestsuite) {

	// setup test config with generic factory
	var oConfig = {
		type : "HTML",
		factory : function(bAsync) {
			return sap.ui.view({
				type : "HTML",
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
		return sap.ui.htmlview({
			viewName : "testdata.mvc.Async",
			async : bAsync
		});
	};
	asyncTestsuite("HTMLView Factory", oConfig);

	QUnit.test("New create factory", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var that = this;
		this.oLogMock = this.mock(jQuery.sap.log);
		this.oLogMock.expects("warning").never();

		HTMLView.create({
			viewName : "testdata.mvc.Async"
		})
		.then(function(oViewLoaded) {
			assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof HTMLView, "View created");
			done();
		});
	});

});