/*global QUnit */
sap.ui.require(['sap/ui/initjQuerySupport'], function(initjQuerySupport){

	QUnit.module("sap.ui.initjQuerySupport");

	QUnit.test("jQuery.support", function(assert) {
		var jQuery = initjQuerySupport();
		assert.ok(jQuery.support);
	});

});