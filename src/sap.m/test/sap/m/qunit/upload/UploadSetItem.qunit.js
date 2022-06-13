/*global QUnit */
sap.ui.define([
	"sap/ui/events/KeyCodes",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploadSetRenderer",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./UploadSetTestUtils",
	"sap/ui/core/IconPool",
	"sap/m/upload/Uploader",
	"sap/ui/core/Item",
	"sap/ui/core/Core"
], function (KeyCodes, UploadSet, UploadSetItem, UploadSetRenderer, Toolbar, Label, ListItemBaseRenderer,
			 Dialog, Device, MessageBox, JSONModel, TestUtils, IconPool, Uploader, Item, oCore) {
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

	QUnit.module("UploadSetItem general functionality", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	/* ====== */
	/* Flags  */
	/* ====== */

	QUnit.test("Flags enableDelete, enableEdit, visibleRemove, visibleEdit", function (assert) {
		var oItem0 = this.oUploadSet.getItems()[0],
			oItem1 = this.oUploadSet.getItems()[1];

		assert.ok(oItem0._getDeleteButton().getEnabled(), "Delete button should be enabled by default.");
		assert.ok(oItem0._getDeleteButton().getVisible(), "Delete button should be visible by default.");
		assert.ok(oItem0._getEditButton().getEnabled(), "Edit button should be enabled by default.");
		assert.ok(oItem0._getEditButton().getVisible(), "Edit button should be visible by default.");

		assert.notOk(oItem1._getDeleteButton().getEnabled(), "Delete button should be disabled for 'enabledRemove' set to false.");
		assert.notOk(oItem1._getDeleteButton().getVisible(), "Delete button should be invisible by for 'visibleRemove' set to false.");
		assert.notOk(oItem1._getEditButton().getEnabled(), "Edit button should be disabled for 'enabledEdit' set to false.");
		assert.notOk(oItem1._getEditButton().getVisible(), "Edit button should be invisible for 'visibleEdit' set to false.");

		// Disable/hide ex-post
		oItem0.setEnabledRemove(false);
		oItem0.setVisibleRemove(false);
		oItem0.setEnabledEdit(false);
		oItem0.setVisibleEdit(false);

		assert.notOk(oItem0._getDeleteButton().getEnabled(), "Delete button should be disabled for 'enabledRemove' set ex-post to false.");
		assert.notOk(oItem0._getDeleteButton().getVisible(), "Delete button should be invisible by for 'visibleRemove' set ex-post to false.");
		assert.notOk(oItem0._getEditButton().getEnabled(), "Edit button should be disabled for 'enabledEdit' set ex-post to false.");
		assert.notOk(oItem0._getEditButton().getVisible(), "Edit button should be invisible for 'visibleEdit' set ex-post to false.");
	});

	QUnit.test("Flags visibleRemove, visibleEdit after UploadSetItem state is complete", function (assert) {
		var oItem1 = this.oUploadSet.getItems()[1];
		oItem1.setUploadState("Complete");

		assert.notOk(oItem1._getDeleteButton().getVisible(), "Delete button should be invisible by for 'visibleRemove' set to false.");
		assert.notOk(oItem1._getEditButton().getVisible(), "Edit button should be invisible for 'visibleEdit' set to false.");
	});

	/* ====== */
	/* Events */
	/* ====== */

	QUnit.test("Event 'openPressed' is fired when file name linked clicked, prevent default applies.", function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		oItem.attachOpenPressed(function (oEvent) {
			oEvent.preventDefault();
			assert.ok(true, "openPressed event should have been called.");
		});
		oItem._getFileNameLink().firePress();
	});

	QUnit.test("Event 'removePressed' is fired when delete button clicked, prevent default applies.", function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		oItem.attachRemovePressed(function (oEvent) {
			assert.ok(true, "removePressed event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();
	});

	/* ======== */
	/* Keyboard */
	/* ======== */

	QUnit.test("Keyboard actions [Enter, Delete, Escape, F2] are handled properly.", function (assert) {
		assert.expect(7);
		var oItem = this.oUploadSet.getItems()[0],
			oTarget = {id: oItem.getListItem().getId()},
			oPressedSpy = this.spy(UploadSetItem.prototype, "_handleFileNamePressed"),
			oDeleteSpy = this.spy(UploadSet.prototype, "_handleItemDelete");

		oItem.getListItem().focus();
		oItem.attachOpenPressed(function (oEvent) {
			oEvent.preventDefault();
		});
		this.oUploadSet.onkeydown({
			target: oTarget,
			keyCode: KeyCodes.ENTER
		});
		assert.equal(oPressedSpy.callCount, 1, "Upload set item handler for hitting a file name should be called.");

		this.oUploadSet.onkeydown({
			target: oTarget,
			keyCode: KeyCodes.F2
		});
		assert.ok(this.oUploadSet._oEditedItem, "After hitting F2 upload set should see the item in edit mode.");
		assert.ok(oItem._bInEditMode, "After hitting F2 item itself should be in edit mode.");
		this.oUploadSet.onkeydown({
			target: oItem._getFileNameEdit().$("inner")[0],
			keyCode: KeyCodes.ESCAPE
		});
		assert.notOk(this.oUploadSet._oEditedItem, "After hitting F2 again upload set should not see the item in edit mode.");
		assert.notOk(oItem._bInEditMode, "After hitting F2 again item should be out of edit mode.");

		this.oUploadSet.onkeydown({
			target: oTarget,
			keyCode: KeyCodes.DELETE
		});
		assert.equal(oDeleteSpy.callCount, 1, "Upload set item handler for removing a file should be called.");

		// Close the dialog
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		oItem._setInEditMode(true);
		oCore.applyChanges();
		oItem.$("fileNameEdit").addClass( "sapMInputFocused" );
		this.oUploadSet.onkeydown({
			target: oTarget,
			keyCode: KeyCodes.DELETE
		});
		assert.equal(oDeleteSpy.calledTwice, false, "When focus is on input element delete handler should not be called");
	});

	/* ============== */
	/* Inner Controls */
	/* ============== */

	QUnit.test("Inner controls are created lazily, not eagerly.", function (assert) {
		assert.expect(30);
		var oItem = new UploadSetItem({
				fileName: "fileName.txt"
			}),
			fnAsserNotEager = function (o, s) {
				assert.notOk(o, "Inner " + s + " should not be created eagerly.");
			},
			fnAssertLazy = function (o, s) {
				assert.ok(o, "Inner " + s + " should be created lazily.");
			};

		fnAsserNotEager(oItem._oListItem, "list item");
		fnAsserNotEager(oItem._oIcon, "icon");
		fnAsserNotEager(oItem._oFileNameLink, "hyperlink");
		fnAsserNotEager(oItem._oFileNameEdit, "file name edit");
		fnAsserNotEager(oItem._oDynamicContent, "dynamic content");
		fnAsserNotEager(oItem._oRestartButton, "Inner restart button should not be created eagerly");
		fnAsserNotEager(oItem._oEditButton, "edit button");
		fnAsserNotEager(oItem._oDeleteButton, "delete button");
		fnAsserNotEager(oItem._oTerminateButton, "terminate button");
		fnAsserNotEager(oItem._oConfirmRenameButton, "confirm button");
		fnAsserNotEager(oItem._oCancelRenameButton, "cancel button");
		fnAsserNotEager(oItem._oProgressBox, "progress box");
		fnAsserNotEager(oItem._oProgressIndicator, "progress indicator");
		fnAsserNotEager(oItem._oStateLabel, "state label");
		fnAsserNotEager(oItem._oProgressLabel, "progress label");

		this.oUploadSet.insertItem(oItem);

		fnAssertLazy(oItem._getListItem(), "list item");
		fnAssertLazy(oItem._getIcon(), "icon");
		fnAssertLazy(oItem._getFileNameLink(), "hyperlink");
		fnAssertLazy(oItem._getFileNameEdit(), "file name edit");
		fnAssertLazy(oItem._getDynamicContent(), "dynamic content");
		fnAssertLazy(oItem._getRestartButton(), "restart button");
		fnAssertLazy(oItem._getEditButton(), "edit button");
		fnAssertLazy(oItem._getDeleteButton(), "delete button");
		fnAssertLazy(oItem._getTerminateButton(), "terminate button");
		fnAssertLazy(oItem._getConfirmRenameButton(), "confirm button");
		fnAssertLazy(oItem._getCancelRenameButton(), "cancel button");
		fnAssertLazy(oItem._getProgressBox(), "progress box");
		fnAssertLazy(oItem._getProgressIndicator(), "progress indicator");
		fnAssertLazy(oItem._getStateLabel(), "state label");
		fnAssertLazy(oItem._getProgressLabel(), "progress label");
	});

	QUnit.test("Pre-parent manipulation of Edit/Remove button flags doesn't crash the control.", function (assert) {
		assert.expect(5);

		var oItem = new UploadSetItem({
			fileName: "fileName.txt",
			enabledRemove: false,
			visibleRemove: false,
			enabledEdit: false,
			visibleEdit: false
		});
		assert.ok(true, "Control manipulation shouldn't have crashed so far.");

		this.oUploadSet.insertItem(oItem);
		assert.notOk(oItem._getDeleteButton().getVisible(), "Delete button should be invisible after parent is set.");
		assert.notOk(oItem._getDeleteButton().getEnabled(), "Delete button should be disabled after parent is set.");
		assert.notOk(oItem._getEditButton().getVisible(), "Edit button should be invisible after parent is set.");
		assert.notOk(oItem._getEditButton().getEnabled(), "Edit button should be disabled after parent is set.");
	});

	QUnit.test("Link is not clickable if url is not set", function (assert) {
		assert.expect(2);

		var oItemUrlUndefined = new UploadSetItem({
			fileName: "fileName.txt",
			url: undefined
		});

		var oItemUrlDefined = new UploadSetItem({
			fileName: "fileName.txt",
			url: "testingUrl"
		});

		this.oUploadSet.insertItem(oItemUrlUndefined);
		this.oUploadSet.insertItem(oItemUrlDefined);

		assert.notOk(oItemUrlUndefined._getFileNameLink().getEnabled(), "Link is not clickable");
		assert.ok(oItemUrlDefined._getFileNameLink().getEnabled(), "Link is clicklable");
	});

	QUnit.test("Test for setThumbnailUrl API", function(assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setThumbnailUrl("./image/test.jpg");
		var sActualSrc = oItem._oListItem.getContent()[0].getSrc();
		assert.equal(sActualSrc, "./image/test.jpg", "setThumbnailUrl api gets called and creates new icon");

	});

	QUnit.test("Icon for UploadSetItem is set based on mimeType, if mimeType is present", function (assert) {

		//Arrange
		var oItem = new UploadSetItem({
			fileName: "fileName.xlsx",
			mediaType: "application/msexcel"
		});

		//Act
		this.oUploadSet.insertItem(oItem);
		oCore.applyChanges();
		var oIcon = this.oUploadSet.getItems()[0]._oIcon.getSrc();

		//Assert
		assert.equal(IconPool.getIconForMimeType(oItem.getMediaType()), oIcon, "Icon is set based on mimeType");

	});

	QUnit.test("Check header fields in UploadSet", function (assert) {
		//Setup
		var oItem = new UploadSetItem({
			fileName: "fileName.xlsx",
			mediaType: "application/msexcel"
		});
		oItem.setUploadState("Ready");
		var oUploaderSpy = this.spy(Uploader.prototype, "uploadItem");

		// add headers to item
		var oUSHeaderField = new Item({
			key: "key",
			text: "value1"
		});
		this.oUploadSet.insertHeaderField(oUSHeaderField);

		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		this.oUploadSet._uploadItemIfGoodToGo(oItem);

		//Assert
		assert.equal(oUploaderSpy.args[0].length, 2, "Header is present");
		assert.equal(oUploaderSpy.args[0][1][0].getText(), "value1", "Header is selected from UploadSet");
	});

	QUnit.test("Check header fields in UploadSetItem", function (assert) {
		//Setup
		var oItem = new UploadSetItem({
			fileName: "fileName.xlsx",
			mediaType: "application/msexcel"
		});
		oItem.setUploadState("Ready");
		var oUploaderSpy = this.spy(Uploader.prototype, "uploadItem");

		// add headers to item
		var oUSHeaderField = new Item({
			key: "key",
			text: "value1"
		});
		this.oUploadSet.insertHeaderField(oUSHeaderField);

		var oUSIHeaderField = new Item({
			key: "key",
			text: "value2"
		});
		oItem.insertHeaderField(oUSIHeaderField);

		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		this.oUploadSet._uploadItemIfGoodToGo(oItem);

		//Assert
		assert.equal(oUploaderSpy.args[0].length, 2, "Header is present");
		assert.equal(oUploaderSpy.args[0][1][0].getText(), "value2", "Header is selected from UploadSetItem");
	});

	QUnit.test("Test for uploadUrl property", function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		var oUploader = new Uploader();
		var oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		oItem.setUploadUrl("testingURL");
		this.oUploadSet.setAggregation("uploader", oUploader);

		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith("POST", "testingURL"), "XML Http request is made with UploadSet item's URL");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test for thumnail url undefined", function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		var oIconPoolSpy = this.spy(IconPool, "createControlByURI");
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Assert
		oItem.setThumbnailUrl();
		assert.notOk(oIconPoolSpy.called, "XML Http request is made with UploadSet item's URL");

		oItem.setThumbnailUrl("./image/test.jpg");
		assert.ok(oIconPoolSpy.called, "XML Http request is made with UploadSet item's URL");
	});

	QUnit.test("Test for thumnail url when mediaType not defined", function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Assert
		oItem.setFileName("sample");
		oItem.setThumbnailUrl();
		oItem.setMediaType();

		oCore.applyChanges();

		assert.equal(oItem._getIcon().getSrc(), 'sap-icon://document', "Default document icon is set as list item icon");
	});

	QUnit.test("Test for accessing edit state of the item", function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Assert
		oItem.setFileName("sample");
		oItem.setThumbnailUrl();
		oItem.setMediaType();

		oCore.applyChanges();

		assert.equal(oItem.getEditState(), false, "Initial edit state of the item returned sucessfully.");

		oItem._setInEditMode(true);

		assert.equal(oItem.getEditState(), true, "New edit state of the item returned sucessfully.");
	});

});