/*global QUnit*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploadSetRenderer",
	"sap/m/upload/Uploader",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/upload/UploadSetTestUtils"
], function (jQuery, UploadSet, UploadSetItem, UploadSetRenderer, Uploader, Toolbar, Label, ListItemBaseRenderer,
			 Dialog, Device, MessageBox, JSONModel, TestUtils) {
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

	QUnit.module("UploadSet general functionality", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	/* ====== */
	/* Events */
	/* ====== */

	var NoopUploader = Uploader.extend("sap.m.qunit.upload.NoopUploader", {});
	NoopUploader.prototype.uploadItem = function (oItem, aHeaders) {};
	NoopUploader.prototype.downloadItem = function (oItem, aHeaders, bAskForLocation) {};

	QUnit.test("Events beforeItemAdded and afterItemAdded are called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(5);
		var oOrigUploader,
			oNoopUploader = new NoopUploader();

		oOrigUploader = this.oUploadSet.getUploader();
		this.oUploadSet.setUploader(oNoopUploader);

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "newFile.txt"}
				};
			}
		});

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			oEvent.preventDefault();
			assert.ok(true, "beforeItemAdded event should have been called.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(false, "afterItemAdded event should have not been called, as it was canceled.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "anotherNewFile.txt"}
				};
			}
		});

		this.oUploadSet.setUploader(oOrigUploader);
	});

	QUnit.test("Event beforeItemRemoved is called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(4);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = sap.ui.getCore().byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		// Now with the prevent default
		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getDeleteButton().firePress();

		// There should be no dialog
		oDialog = sap.ui.getCore().byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event afterItemRemoved is called at proper time and with correct parameters.", function (assert) {
		assert.expect(3);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("afterItemRemoved", function (oEvent) {
			assert.ok(true, "afterItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = sap.ui.getCore().byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[0].firePress();
		oDialog.getButtons()[0].getParent().fireAfterClose();
		oDialog.destroy();

		// There should be no dialog
		oDialog = sap.ui.getCore().byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event beforeItemEdited is called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(9);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		// With wanton prevent default there is no edit mode
		this.oUploadSet.attachEventOnce("beforeItemEdited", function (oEvent) {
			assert.ok(true, "beforeItemEdited event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getEditButton().firePress();
		sap.ui.getCore().applyChanges();

		// Check no edit mode in place
		assert.notOk(this.oUploadSet._oEditedItem, "UploadSet should know nothing about any edited item.");
		assert.notOk(oItem._bInEditMode, "Item should know it is NOT being edited.");
		assert.equal(oItem._getFileNameLink().$().length, 1, "File name link should be rendered.");
		assert.equal(oItem._getFileNameEdit().$().length, 0, "File name edit should be ignored.");

		oItem._getEditButton().firePress();
		sap.ui.getCore().applyChanges();

		// Check everybody on the same page regarding the edit mode
		assert.equal(this.oUploadSet._oEditedItem, oItem, "Item should be known to the UploadSet as the edited one.");
		assert.ok(oItem._bInEditMode, "Item should know it is being edited.");
		assert.equal(oItem._getFileNameEdit().$().length, 1, "File name edit should be rendered.");
		assert.equal(oItem._getFileNameLink().$().length, 0, "File name link should be ignored.");
	});

	QUnit.test("Event afterItemEdited is called at proper time and with correct parameters.", function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
		});
		oItem._getEditButton().firePress();
		sap.ui.getCore().applyChanges();

		oItem._getConfirmRenameButton().firePress();
		sap.ui.getCore().applyChanges();

	});

	QUnit.test("Allow Curly bracees in the fileName property", function (assert) {
        //Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "{newFile}.txt"}
				};
			}
		});
	});

	QUnit.test("No data rendering - with default text and description", function(assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var sNoDataText = this.oUploadSet._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		var sNoDataDescription = this.oUploadSet._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");

		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oUploadSet.getNoDataText(), sNoDataText, "default text is returned for getNoDataText");
		assert.equal(this.oUploadSet.getNoDataDescription(), sNoDataDescription, "default description is returned for getNoDataDescription");
		assert.equal(jQuery.sap.byId(this.oUploadSet.getId() + "-no-data-text").text(), sNoDataText, "default no data text is rendered in upload set");
		assert.equal(jQuery.sap.byId(this.oUploadSet.getId() + "-no-data-description").text(), sNoDataDescription, "default no data description is rendered in upload set");
	});

	QUnit.test("No data rendering - with user specified no data text", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataText("myNoDataText");
		this.oUploadSet.unbindAggregation("items");

		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(jQuery.sap.byId(this.oUploadSet.getId() + "-no-data-text").text(), "myNoDataText", "The no data text set by user is rendered");
	});

	QUnit.test("No data rendering - with user specified no data description", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataDescription("myNoDataDescription");
		this.oUploadSet.unbindAggregation("items");

		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(jQuery.sap.byId(this.oUploadSet.getId() + "-no-data-description").text(), "myNoDataDescription", "The no data description set by user is rendered");
	});

	QUnit.module("Drag and drop", {
		beforeEach: function () {
			this.$RootNode = jQuery(document.body);
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Drag & Drop behaviour on change of UploadEnabled property", function(assert) {
		//Arrange
		this.oUploadSet.setUploadEnabled(true);
		//Act
		this.$RootNode.trigger("dragenter");
		//Assert
		assert.notOk(this.oUploadSet.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is visible when UploadEnabled is true");

		//Arrange
		this.oUploadSet.$("drag-drop-area").addClass("sapMUCDragDropOverlayHide");
		this.oUploadSet.setUploadEnabled(false);
		//Act
		this.$RootNode.trigger("dragenter");
		//Assert
		assert.ok(this.oUploadSet.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is not visible when UploadEnabled is false");
	});


});