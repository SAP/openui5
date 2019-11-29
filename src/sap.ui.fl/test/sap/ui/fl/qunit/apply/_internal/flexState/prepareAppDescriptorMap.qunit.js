/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap"
], function (
	prepareAppDescriptorMap
) {
	"use strict";

	QUnit.module("prepareAppDescriptorMap: ", {}, function () {
		QUnit.test("when called with no parameters", function (assert) {
			var oExpectedMap = {};
			assert.deepEqual(prepareAppDescriptorMap(), oExpectedMap, "the function returns an object with a map inside");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
