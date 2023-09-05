/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/m/upload/UploadSetwithTableRenderer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (UploadSetwithTable, UploadSetwithTableItem, UploadSetwithTableRenderer, JSONModel, oCore) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4"
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false
				}
			]
		};
	}
	QUnit.module("UploadSetwithTable general functionality", {
		beforeEach: function () {
			this.oUploadSetwithTable = new UploadSetwithTable("UploadSetwithTable", {
				items: {
					path: "/items",
					template: new UploadSetwithTableItem(),
					templateShareable: false
				}
			});
			this.oUploadSetwithTable.setModel(new JSONModel(getData()));
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Test for UploadSetwithTable Instance Creation", function (assert) {
		//arrange
		assert.ok(this.oUploadSetwithTable, "Instance created successfully");
	});

});