sap.ui.define([
	"./AnyViewAsync.qunit"
], function(asyncTestsuite) {

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

});