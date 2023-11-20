/*global QUnit */
sap.ui.define([
	"require",
	"sap/ui/test/opaQunit",
	"../utils/customQUnitAssertions",
	"./_navigationContainerWaiter",
	"./_cssTransitionWaiter",
	"./_cssAnimationWaiter",
	"./_fetchWaiter",
	"./_jsAnimationWaiter",
	"./_timeoutWaiter",
	"./_promiseWaiter",
	"./_moduleWaiter",
	"./_resourceWaiter",
	"./_autoWaiterAsync",
	"./_utils"
], function (require) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	// ensure to load and create XHRWaiter tests last as the used MockServer interferes with other tests
	return new Promise(function(resolve, reject) {
		require(["./_XHRWaiter"], function() {
			resolve();
		}, reject);
	});
});
