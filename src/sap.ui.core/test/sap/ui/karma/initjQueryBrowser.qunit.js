/*global QUnit */
sap.ui.require(['sap/ui/initjQueryBrowser'], function(initjQueryBrowser){

	QUnit.module("sap.ui.initjQueryBrowser", {
		before: function(){
			initjQueryBrowser();
		}
	});

	QUnit.test("jQuery.browser", function(assert) {
		assert.ok(jQuery.browser);
	});

});