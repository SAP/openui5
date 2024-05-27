/*global QUnit */
sap.ui.define([
	"sap/ui/events/KeyCodes",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/ui/model/json/JSONModel",
	"./UploadSetTestUtils",
	"sap/ui/core/IconPool",
	"sap/m/upload/Uploader",
	"sap/ui/core/Item",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/m/ObjectStatus"
], function (KeyCodes, UploadSet, UploadSetItem, JSONModel, TestUtils, IconPool, Uploader, Item, nextUIUpdate, Element,ObjectStatus) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4",
					tooltip: "Alice"
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
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
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
		assert.equal(window.getComputedStyle(oItem0._getDeleteButton().getDomRef().parentElement).alignSelf.toLowerCase(), "center", "Button Container is Center Alligned");

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

	QUnit.test("Adding sapMUCFirstButton class to the cancel button", function (assert) {
		var oItem = new UploadSetItem({
				fileName: "fileName.txt"
			});
		this.oUploadSet.insertItem(oItem);
		assert.equal(
			oItem._getCancelRenameButton().aCustomStyleClasses[0] === "sapMUCCancelBtn", true, "sapMUCFirstButton class added to the cancel button");
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
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();
	});

	/* ======== */
	/* Keyboard */
	/* ======== */

	QUnit.test("Keyboard actions [Enter, Delete, Escape, F2] are handled properly.", async function (assert) {
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
		assert.equal(oPressedSpy.callCount, 0, "Upload set item handler for hitting a file name should be called.");

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
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		oItem._setInEditMode(true);
		await nextUIUpdate();
		oItem.$("fileNameEdit").addClass( "sapMInputFocused" );
		this.oUploadSet.onkeydown({
			target: oTarget,
			keyCode: KeyCodes.DELETE
		});
		assert.equal(oDeleteSpy.calledTwice, false, "When focus is on input element delete handler should not be called");
	});

	QUnit.test("Keyboard action [DELETE] is handled properly, if remove button is disabled", function(assert) {
		var oItem = this.oUploadSet.getItems()[0],
			oTarget = {id: oItem.getListItem().getId()},
			oDeleteSpy = this.spy(UploadSet.prototype, "_handleItemDelete");
		oItem.setEnabledRemove(false);
		assert.notOk(oItem.getEnabledRemove(), "Remove button is disabled");

		this.oUploadSet.onkeydown({ target: oTarget, keyCode: KeyCodes.DELETE });
		assert.ok(oDeleteSpy.notCalled, "Upload set item handler for removing a file isn't called.");
	});

	QUnit.test("Keyboard action [DELETE] is handled properly, if remove button is not visible", function(assert) {
		var oItem = this.oUploadSet.getItems()[0],
			oTarget = {id: oItem.getListItem().getId()},
			oDeleteSpy = this.spy(UploadSet.prototype, "_handleItemDelete");
		oItem.setVisibleRemove(false);
		assert.notOk(oItem.getVisibleRemove(), "Remove button is not visible");

		this.oUploadSet.onkeydown({ target: oTarget, keyCode: KeyCodes.DELETE });
		assert.ok(oDeleteSpy.notCalled, "Upload set item handler for removing a file isn't called.");
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

	QUnit.test("Wrapping should be set to true on the filenameLink", function (assert) {
		assert.expect(2);

		var oItemUrlUndefined = new UploadSetItem({
			fileName: "fileName.txt",
			url: undefined
		});

		var oItemUrlDefined = new UploadSetItem({
			fileName: "fileName.txt",
			url: "testingUrl"
		});

		assert.ok(oItemUrlUndefined._getFileNameLink().getWrapping(), "Wrapping has set to true on link");
		assert.ok(oItemUrlDefined._getFileNameLink().getWrapping(), "Wrapping has set to true on link");
	});

	QUnit.test("Test for setThumbnailUrl API", function(assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setThumbnailUrl("./image/test.jpg");
		var sActualSrc = oItem._oListItem.getContent()[0].getSrc();
		assert.equal(sActualSrc, "./image/test.jpg", "setThumbnailUrl api gets called and creates new icon");

	});

	QUnit.test("Icon for UploadSetItem is set based on mimeType, if mimeType is present", async function (assert) {

		//Arrange
		var oItem = new UploadSetItem({
			fileName: "fileName.xlsx",
			mediaType: "application/msexcel"
		});

		//Act
		this.oUploadSet.insertItem(oItem);
		await nextUIUpdate();
		var oIcon = this.oUploadSet.getItems()[0]._oIcon.getSrc();

		//Assert
		assert.equal(IconPool.getIconForMimeType(oItem.getMediaType()), oIcon, "Icon is set based on mimeType");

	});

	QUnit.test("Check header fields in UploadSet", async function (assert) {
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
		await nextUIUpdate();

		//Act
		this.oUploadSet._uploadItemIfGoodToGo(oItem);

		//Assert
		assert.equal(oUploaderSpy.args[0].length, 2, "Header is present");
		assert.equal(oUploaderSpy.args[0][1][0].getText(), "value1", "Header is selected from UploadSet");
	});

	QUnit.test("Check header fields in UploadSetItem", async function (assert) {
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
		await nextUIUpdate();

		//Act
		this.oUploadSet._uploadItemIfGoodToGo(oItem);

		//Assert
		assert.equal(oUploaderSpy.args[0].length, 2, "Header is present");
		assert.equal(oUploaderSpy.args[0][1][0].getText(), "value2", "Header is selected from UploadSetItem");
	});

	QUnit.test("Test for uploadUrl property", async function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		var oUploader = new Uploader();
		var oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		oItem.setUploadUrl("testingURL");
		this.oUploadSet.setAggregation("uploader", oUploader);

		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith("POST", "testingURL"), "XML Http request is made with UploadSet item's URL");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test for thumnail url undefined", async function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		var oIconPoolSpy = this.spy(IconPool, "createControlByURI");
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		oItem.setThumbnailUrl();
		assert.notOk(oIconPoolSpy.called, "XML Http request is made with UploadSet item's URL");

		oItem.setThumbnailUrl("./image/test.jpg");
		assert.ok(oIconPoolSpy.called, "XML Http request is made with UploadSet item's URL");
	});

	QUnit.test("Test for thumnail url when mediaType not defined", async function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		oItem.setFileName("sample");
		oItem.setThumbnailUrl();
		oItem.setMediaType();

		await nextUIUpdate();

		assert.equal(oItem._getIcon().getSrc(), 'sap-icon://document', "Default document icon is set as list item icon");
	});

	QUnit.test("Test for accessing edit state of the item", async function (assert) {
		//Setup
		var oItem = this.oUploadSet.getItems()[0];
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		oItem.setFileName("sample");
		oItem.setThumbnailUrl();
		oItem.setMediaType();

		await nextUIUpdate();

		assert.equal(oItem.getEditState(), false, "Initial edit state of the item returned sucessfully.");

		oItem._setInEditMode(true);

		assert.equal(oItem.getEditState(), true, "New edit state of the item returned sucessfully.");
	});

	QUnit.test("Test if UploadSet maxFileNameLength is set to null, file name with extension", function(assert) {
		// Setup
		this.oUploadSet.setMaxFileNameLength(null);
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setFileName("withExtension.pgn");
		oItem._setInEditMode(true);

		// Asserts
		assert.strictEqual(this.oUploadSet.getMaxFileNameLength(), 0, "UploadSet.getMaxFileNameLength() is set to 0");
		assert.strictEqual(oItem._getFileNameEdit().getProperty("maxLength"), 0, "Input field maxLength is 0");
	});

	QUnit.test("Test if edit item name don't have extension", function(assert) {
		// Setup
		this.oUploadSet.setMaxFileNameLength(50);
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setFileName("noExtension");
		oItem._setInEditMode(true);

		// Asserts
		assert.strictEqual(this.oUploadSet.getMaxFileNameLength(), 50, "UploadSet.getMaxFileNameLength() is set to 50");
		assert.strictEqual(oItem._getFileNameEdit().getProperty("maxLength"), 50, "Input field maxLength is 50");
	});

	QUnit.test("Test if edit item name have extension", function(assert) {
		// Setup
		this.oUploadSet.setMaxFileNameLength(50);
		var oItem = this.oUploadSet.getItems()[0],
			sExtension = ".png";
		oItem.setFileName("withExtension" + sExtension);
		oItem._setInEditMode(true);

		// Asserts
		assert.strictEqual(this.oUploadSet.getMaxFileNameLength(), 50, "UploadSet.getMaxFileNameLength() is set to 50");
		assert.strictEqual(oItem._getFileNameEdit().getProperty("maxLength"), 50 - sExtension.length, "Input field maxLength is 46");
	});

	QUnit.test("Test if edit item name extension length is bigger that getMaxFileNameLength()", function(assert) {
		// Setup
		this.oUploadSet.setMaxFileNameLength(2);
		var oItem = this.oUploadSet.getItems()[0],
			sExtension = ".png";
		oItem.setFileName("withExtension" + sExtension);
		oItem._setInEditMode(true);

		// Asserts
		assert.strictEqual(this.oUploadSet.getMaxFileNameLength(), 2, "UploadSet.getMaxFileNameLength() is set to 2");
		assert.strictEqual(oItem._getFileNameEdit().getProperty("maxLength"), 0, "Input field maxLength is 0");
	});

	QUnit.test("UploadSet Items contains href link", function (assert) {
		const aItems = this.oUploadSet.getItems();

		aItems.forEach((oItem) => {
			assert.equal(oItem._getFileNameLink().getHref(), oItem.getUrl(), "UploadSet Item conatins href link");
		});
	});

	QUnit.test("Call _getListItem method", function(assert) {
        // Test calling the _getListItem method
        var oListItem = this.oUploadSet.getItems()[0]._getListItem();
        assert.strictEqual(this.oUploadSet.getItems()[0]._oListItem, oListItem, "_oListItem should be set to the returned listItem");
    });

    QUnit.test("_getProgressBox is called with correct CSS", function(assert) {
        // Arrange
        var oProgressBox = this.oUploadSet.getItems()[0]._getProgressBox();

        // Assert
        assert.ok(oProgressBox.hasStyleClass("sapMUSProgressBox"), "sapMUSProgressBox CSS class is set");
    });

	QUnit.module("UploadSetItem Accessibility Tests", {
		beforeEach: async function () {
			this.fnSpy = this.spy(Element.prototype, "setTooltip");
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Test for uploadSetItem tooltip", function (assert) {
		//Assert
		assert.ok(this.fnSpy.called, "Method setTooltip called");
		assert.ok(this.fnSpy.calledWith("Alice"), "Method setTooltip called with the correct text");
	});

	QUnit.test("Upload set item description read out", function (assert) {
		//Assert
		var oItem = this.oUploadSet.getItems()[0];
		oItem._oListItem.focus();
		assert.ok(oItem._oListItem.getDomRef().getAttribute("aria-labelledby"), "The description is being read out");
	});

	QUnit.test("Uploadset items href link read out", function (assert) {
		//Assert
		var aItems = this.oUploadSet.getItems();
		aItems.forEach((oItem) => {
			oItem._oListItem.focus();
			assert.ok(oItem._getFileNameLink().getDomRef().getAttribute("href"), "The href link is being read out");
		});
	});

	QUnit.module("UploadSetItems now accespts markersAsStatus aggregation", {
		beforeEach: async function() {
			this.oUploadSet = new UploadSet("upload-set",{
				items: new UploadSetItem("upload-set-item", {
					markersAsStatus: new ObjectStatus("obj-status", {
						text: "Managed By Google Cloud",
						icon: "sap-icon://share-2"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("markersAsStatus aggregation is now getting rendered", function (assert) {
		var oUploadSetItem = this.oUploadSet.getItems()[0],
		oMarkersAsStatus = oUploadSetItem.getMarkersAsStatus()[0];
		assert.ok(oMarkersAsStatus.getDomRef(),"Object Status is getting rendered as expected on the first row of the uploadSetItem");
	});

	QUnit.module("UploadSetItem test attributes and statuses rendering", {
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	async function createUploadSetForProperties(data) {
		this.oUploadSet = new UploadSet("uploadSet", {
			items: {
				path: "/items",
				template: TestUtils.createItemTemplate(),
				templateShareable: false
			}
		}).setModel(new JSONModel(data));
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	function getDataForRendering(oParams) {
		return {
			items: [
				{
					fileName: "File01.txt",
					statuses: oParams && oParams.statuses ? oParams.statuses : undefined,
					attributes: oParams && oParams.attributes ? oParams.attributes : undefined
				}
			]
		};
	}

	function getElement(visible) {
		return {title: "T01", text: "text01", visible: visible};
	}

	function getStatusesDomRefs(assert) {
		return getDomRefs.call(this, assert, "getStatuses");
	}

	function getAttributesDomRefs(assert) {
		return getDomRefs.call(this, assert, "getAttributes");
	}

	function getDomRefs(assert, functionName) {
		assert.ok(this.oUploadSet.getItems().length, "Items are not empty");
		var oItem = this.oUploadSet.getItems()[0];

		var aEntries = oItem[functionName]();
		assert.ok(aEntries.length, "Item property is not empty");

		var oContainer;
		for (var index in aEntries) {
			if (aEntries[index].getDomRef()) {
				oContainer = aEntries[index].getDomRef().parentNode;
				break;
			}
		}
		assert.ok(oContainer, "Container is present");
		return oContainer.childNodes;
	}

	function assertClasses(assert, aChildren, aClasses) {
		assert.equal(aChildren.length, aClasses.length, "Container have correct child count");
		for (var i = 0; i < aChildren.length; i++) {
			assert.ok(aChildren[i].classList.contains(aClasses[i]), "(" + (i + 1) + ") entry object is correct one");
		}
	}

	[
		{
			message: "Upload set item statuses, delimiter is only rendered between items",
			statuses: [getElement(true), getElement(true), getElement(true)],
			expected: ["sapMObjStatus", "sapMUCSeparator", "sapMObjStatus", "sapMUCSeparator", "sapMObjStatus"]
		},
		{
			message: "Upload set item statuses, delimiter is only rendered between items, first element is not visible",
			statuses: [getElement(false), getElement(true), getElement(true)],
			expected: ["sapUiHiddenPlaceholder", "sapMObjStatus", "sapMUCSeparator", "sapMObjStatus"]
		},
		{
			message: "Upload set item statuses, delimiter is only rendered between items, last element is not visible",
			statuses: [getElement(true), getElement(true), getElement(false)],
			expected: ["sapMObjStatus", "sapMUCSeparator", "sapMObjStatus", "sapUiHiddenPlaceholder"]
		},
		{
			message: "Upload set item statuses, delimiter is only rendered between items, middle element is not visible",
			statuses: [getElement(true), getElement(false), getElement(true)],
			expected: ["sapMObjStatus", "sapUiHiddenPlaceholder", "sapMUCSeparator", "sapMObjStatus"]
		}
	].forEach(function(data) {
		QUnit.test(data.message, async function (assert) {
			// Arrange
			await createUploadSetForProperties.call(this, getDataForRendering({statuses: data.statuses}));

			// Assert
			assertClasses(assert, getStatusesDomRefs.call(this, assert), data.expected);
		});
	});

	[
		{
			message: "Upload set item attributes, delimiter is only rendered between items",
			attributes: [getElement(true), getElement(true), getElement(true)],
			expected: ["sapMUCAttr", "sapMUCSeparator", "sapMUCAttr", "sapMUCSeparator", "sapMUCAttr"]
		},
		{
			message: "Upload set item attributes, delimiter is only rendered between items, first element is not visible",
			attributes: [getElement(false), getElement(true), getElement(true)],
			expected: ["sapUiHiddenPlaceholder", "sapMUCAttr", "sapMUCSeparator", "sapMUCAttr"]
		},
		{
			message: "Upload set item attributes, delimiter is only rendered between items, last element is not visible",
			attributes: [getElement(true), getElement(true), getElement(false)],
			expected: ["sapMUCAttr", "sapMUCSeparator", "sapMUCAttr", "sapUiHiddenPlaceholder"]
		},
		{
			message: "Upload set item attributes, delimiter is only rendered between items, middle element is not visible",
			attributes: [getElement(true), getElement(false), getElement(true)],
			expected: ["sapMUCAttr", "sapUiHiddenPlaceholder", "sapMUCSeparator", "sapMUCAttr"]
		}
	].forEach(function(data) {
		QUnit.test(data.message, async function (assert) {
			// Arrange
			await createUploadSetForProperties.call(this, getDataForRendering({attributes: data.attributes}));

			// Assert
			assertClasses(assert, getAttributesDomRefs.call(this, assert), data.expected);
		});
	});

 });