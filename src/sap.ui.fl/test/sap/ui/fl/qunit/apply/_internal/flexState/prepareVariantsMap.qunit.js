/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap"
], function (
	prepareVariantsMap
) {
	"use strict";

	QUnit.module("prepareVariantsMap: ", {}, function () {
		QUnit.test("when called with no parameters", function (assert) {
			var oExpectedMap = {};
			assert.deepEqual(prepareVariantsMap(), oExpectedMap, "the function returns an object with a map inside");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
