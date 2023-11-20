/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/util/Resources"
],
function (
	ResourcesUtil
) {
	"use strict";

	QUnit.module("getResourceOriginPath", {
		beforeEach: function () {
			window['sap-ui-documentation-config'] || (window['sap-ui-documentation-config'] = {});
		}
	});

	QUnit.test("Default origin", function (assert) {
		// Setup
		window['sap-ui-documentation-config'].demoKitResourceOrigin = undefined;

		// Act
		var sPath = ResourcesUtil.getResourceOriginPath("myPath");

		// Check
		assert.strictEqual(sPath, "./myPath", "correct path");
	});

	QUnit.test("Configured origin", function (assert) {
		// Setup
		window['sap-ui-documentation-config'].demoKitResourceOrigin = "https://another.origin.com";

		// Act
		var sPath = ResourcesUtil.getResourceOriginPath("myPath");

		// Check
		assert.strictEqual(sPath, "https://another.origin.com/myPath", "correct path");
	});

	QUnit.test("relative path with ./", function (assert) {
		// Setup
		window['sap-ui-documentation-config'].demoKitResourceOrigin = "https://another.origin.com";

		// Act
		var sPath = ResourcesUtil.getResourceOriginPath("./myPath");

		// Check
		assert.strictEqual(sPath, "https://another.origin.com/myPath", "correct path");
	});

	QUnit.test("relative path with ../", function (assert) {
		// Setup
		window['sap-ui-documentation-config'].demoKitResourceOrigin = "https://another.origin.com/root";

		// Act
		var sPath = ResourcesUtil.getResourceOriginPath("../myPath");

		// Check
		assert.strictEqual(sPath, "https://another.origin.com/root/../myPath", "correct path");
	});

	QUnit.test("relative path with /", function (assert) {
		// Setup
		window['sap-ui-documentation-config'].demoKitResourceOrigin = "https://another.origin.com/root";

		// Act
		var sPath = ResourcesUtil.getResourceOriginPath("/myPath");

		// Check
		assert.strictEqual(sPath, "https://another.origin.com/root/myPath", "correct path");
	});
});