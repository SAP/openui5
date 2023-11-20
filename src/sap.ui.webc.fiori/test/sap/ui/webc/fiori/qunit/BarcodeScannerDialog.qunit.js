/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/BarcodeScannerDialog",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, BarcodeScannerDialog, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oBarcodeScannerDialog = new BarcodeScannerDialog({
				scanError: function(oEvent) {
					// console.log("Event scanError fired for BarcodeScannerDialog with parameters: ", oEvent.getParameters());
				},
				scanSuccess: function(oEvent) {
					// console.log("Event scanSuccess fired for BarcodeScannerDialog with parameters: ", oEvent.getParameters());
				}
			});
			this.oBarcodeScannerDialog.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oBarcodeScannerDialog.destroy();
			this.oBarcodeScannerDialog = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oBarcodeScannerDialog.$(), "Rendered");
	});
});