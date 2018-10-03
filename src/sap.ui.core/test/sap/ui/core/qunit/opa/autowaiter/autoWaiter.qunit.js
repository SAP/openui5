/*global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"../utils/customQUnitAssertions",
	"./_navigationContainerWaiter",
	"./_timeoutWaiter",
	"./_promiseWaiter",
	"./_autoWaiterAsync",
	"./_utils",
	"./_XHRWaiter"
], function () {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

});
