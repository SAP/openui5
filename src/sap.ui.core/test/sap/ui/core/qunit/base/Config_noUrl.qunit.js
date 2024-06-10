/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

globalThis.fnInit = () => {
	"use strict";

	sap.ui.require([
		"sap/base/config"
	], (BaseConfiguration) => {
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

		QUnit.start();
	});
};
