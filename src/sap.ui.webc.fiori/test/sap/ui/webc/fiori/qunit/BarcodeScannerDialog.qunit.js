/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/fiori/BarcodeScannerDialog",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, BarcodeScannerDialog, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oBarcodeScannerDialog = new BarcodeScannerDialog({
				scanError: function(oEvent) {
					// console.log("Event scanError fired for BarcodeScannerDialog with parameters: ", oEvent.getParameters());
				},
				scanSuccess: function(oEvent) {
					// console.log("Event scanSuccess fired for BarcodeScannerDialog with parameters: ", oEvent.getParameters());
				}
			});
			this.oBarcodeScannerDialog.placeAt("uiArea");
			await nextUIUpdate();
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