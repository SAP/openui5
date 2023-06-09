/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSetTable",
	"sap/m/upload/UploadSetTableItem",
	"sap/m/upload/UploadSetTableRenderer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (UploadSetTable, UploadSetTableItem, UploadSetTableRenderer, JSONModel, oCore) {
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
	QUnit.module("UploadSetTable general functionality", {
		beforeEach: function () {
			this.oUploadSetTable = new UploadSetTable("uploadSetTable", {
				items: {
					path: "/items",
					template: new UploadSetTableItem(),
					templateShareable: false
				}
			});
			this.oUploadSetTable.setModel(new JSONModel(getData()));
			this.oUploadSetTable.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSetTable.destroy();
			this.oUploadSetTable = null;
		}
	});

	QUnit.test("Test for UploadSetTable Instance Creation", function (assert) {
		//arrange
		assert.ok(this.oUploadSetTable, "Instance created successfully");
	});

});