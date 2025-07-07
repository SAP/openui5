/*global QUnit */

sap.ui.define([
	"sap/m/SelectDialog",
	"sap/ui/core/CustomData"
],
	function(
		SelectDialog,
		CustomData
	) {
		"use strict";

		QUnit.module("UI Flexibility", {
			beforeEach: function () {
				this.oSelectDialog = new SelectDialog({
					title: "my SelectDialog",
					noDataText: "Sorry, no data is available",
					growingThreshold: 50,
					multiSelect: true
				});
			},
			afterEach: function () {
				// cleanup
				this.oSelectDialog.destroy();
			}
		});

		QUnit.test("Instance-Specific Design-Time Metadata", function (assert) {
			const oValue = {
				"sap.ui.dt": {
					"designtime": "not-adaptable-tree"
				}
			};

			this.oSelectDialog.addCustomData(new CustomData({
				key : "sap-ui-custom-settings",
				value : oValue
			}));

			const oDialogCustomData = this.oSelectDialog._oDialog.getCustomData()[0];

			assert.strictEqual(oDialogCustomData.getKey(), "sap-ui-custom-settings", "Custom data key is correct");
			assert.deepEqual(oDialogCustomData.getValue(), oValue, "Custom data value is correct");
		});
	});
