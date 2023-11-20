/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Toast",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Toast, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oToast = new Toast({
				text: "Some text..."
			});
			this.oToast.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oToast.destroy();
			this.oToast = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oToast.$(), "Rendered");
	});
});