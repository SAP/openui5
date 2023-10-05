/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/m/upload/FilePreviewDialog",
	"sap/ui/core/Element"
], function(UploadSetwithTable, UploadSetwithTableItem, JSONModel, oCore, FilePreviewDialog, Element) {
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
	QUnit.module("FilePreviewDialog general functionality", {
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

	QUnit.test("Test for FilePreviewDialog Instance Creation", function (assert) {
        const associatedControl = new FilePreviewDialog();

        this.oUploadSetwithTable.setPreviewDialog(associatedControl);

        const oAssociatedControlRef = Element.registry.get(this.oUploadSetwithTable.getPreviewDialog());
		//arrange
		assert.ok(oAssociatedControlRef, "Instance created successfully");
	});

});