/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(
	[
		"sap/base/config"
	], function (BaseConfiguration) {
	"use strict";

	QUnit.module("Base Configuration");

	QUnit.test("Basic: Check getter for URL provider with config from meta tag noUrl", function(assert) {
		assert.expect(1);

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiFooBar",
			type: "string",
			defaultValue: "defaultValue",
			external: true
		}), "defaultValue", "BaseConfiguration.get for param 'sapUiFooBar' returns default value 'defaultValue'");
	});
});