/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionItem",
	"sap/m/UploadCollectionParameter",
	"sap/m/UploadState",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/UploadCollectionRenderer",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/ListSeparators",
	"sap/m/ListMode",
	"sap/m/MessageBox",
	"sap/ui/base/Event",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/uploadCollection/UploadCollectionTestUtils"
], function (jQuery, UploadCollection, UploadCollectionItem, UploadCollectionParameter, UploadState, Toolbar, Label,
			 UploadCollectionRenderer, ListItemBaseRenderer, Dialog, Device, ListSeparators, ListMode, MessageBox,
			 Event, JSONModel, TestUtils) {
	"use strict";

	var ACTIVATE_ICON = "sap-icon://activate",
		DUPLICIT_FILE_NAME = "BrandNewDuplicitFileName";

	function getData() {
		return {
			items: [
				{
					ariaLabelForPicture: "This is aria label for picture.",
					contributor: "Susan Baker",
					documentId: "08a7af88-abfc-4a09-abec-c2359a985895",
					enableDelete: false,
					enableEdit: false,
					fileName: "Screenshot.jpg",
					fileSize: 20,
					mimeType: "image/jpg",
					selected: false,
					thumbnailUrl: "",
					tooltip: "Susan Baker",
					uploadedDate: "Date: 2014-07-30",
					uploadState: "Ready",
					url: "/pathToTheFile/Woman_04.png",
					visibleEdit: false,
					visibleDelete: false,
					markers: [
						{
							"type": "Locked",
							"visibility": "IconAndText"
						}
					]
				},
				{
					fileName: "AnotherFile.xls",
					thumbnailUrl: ACTIVATE_ICON
				},
				{
					fileName: DUPLICIT_FILE_NAME + ".xls"
				}
			]
		};
	}

	QUnit.module("UploadCollection general functionality", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	/* ===== */
	/* Flags */
	/* ===== */

	QUnit.test("File name editing, 'SameFilenameAllowed' flag and empty value", function (assert) {
		var oItem0 = this.oUploadCollection.getItems()[0],
			sNewName = DUPLICIT_FILE_NAME,
			oItem1 = this.oUploadCollection.getItems()[1];

		// First goes the smooth edit
		assert.equal(this.oUploadCollection._oEditModeItem, null, "No item should be edited at the start.");
		this.oUploadCollection._handleEdit({}, oItem0);
		assert.equal(this.oUploadCollection._oEditModeItem, oItem0, "Item that was clicked should be marked as the edited one.");
		oItem0._getFileNameEdit().setValue(sNewName);
		this.oUploadCollection._handleOk({}, oItem0);
		assert.equal(this.oUploadCollection._oEditModeItem, null, "No item should be marked as the edited one after succesful confirmation.");
		assert.equal(oItem0.getFileName(), sNewName + ".jpg", "Item that was edited and confirmed should have its name changed.");

		// Then try edit with empty value and confirm by clicking the 'Confirm' button
		this.oUploadCollection._handleEdit({}, oItem1);
		oItem1._getFileNameEdit().setValue("");
		this.oUploadCollection._handleOk({}, oItem1);
		assert.equal(this.oUploadCollection._oEditModeItem, oItem1, "Item should stay in edit mode after failed confirmation by 'Confirm' button.");
		assert.ok(oItem1._getContainsError(), "Item should be marked as erroneous after failed confirmation by 'Confirm' button.");

		// The try duplicit name and confirm by clicking the other list item
		oItem1._getFileNameEdit().setValue(sNewName);
		this.oUploadCollection._handleClick({target: oItem0._getListItem().getDomRef()}, oItem0);
		assert.equal(this.oUploadCollection._oEditModeItem, oItem1, "Item should stay in edit mode after failed confirmation by escape click.");
		assert.ok(oItem1._getContainsError(), "Item should be marked as erroneous after failed confirmation by escape click.");

		// Finally allow duplicit name and repeat the confirmation
		this.oUploadCollection.setSameFilenameAllowed(true);
		this.oUploadCollection._handleOk({}, oItem1);
		assert.equal(this.oUploadCollection._oEditModeItem, null, "There should be no item in edit mode after allowing duplicit names.");
		assert.notOk(oItem1._getContainsError(), "Item should be without errors after allowing duplicit names.");
	});

	QUnit.test("Thumbnails, icons and 'ShowIcons' flag", function (assert) {
		var oItem0 = this.oUploadCollection.getItems()[0],
			oItem1 = this.oUploadCollection.getItems()[1];

		assert.equal(oItem0._getIcon().getSrc(), UploadCollectionItem.CARD_ICON, "Standard icon for the file typoe should be used when there is no thumbnail specified.");
		assert.equal(oItem1._getIcon().getSrc(), ACTIVATE_ICON, "Specified thumbnail should be used with icon when specified.");
		assert.ok(oItem0._getIcon().getVisible() && oItem1._getIcon().getVisible(), "Both icons should be visible for default settings.");

		this.oUploadCollection.setShowIcons(false);
		assert.notOk(oItem0._getIcon().getVisible() || oItem1._getIcon().getVisible(), "Neither icon should be visible when 'ShowIcons' set to false.");
		this.oUploadCollection.setShowIcons(true);
		assert.ok(oItem0._getIcon().getVisible() && oItem1._getIcon().getVisible(), "Both icons should be visible again when 'ShowIcons' set to true.");
	});

	QUnit.test("'ShowSeparators' flag", function (assert) {
		var oList = this.oUploadCollection.getAggregation("_list");

		assert.equal(oList.getShowSeparators(), ListSeparators.All, "List should be set to show 'All' separators at the start.");
		this.oUploadCollection.setShowSeparators(ListSeparators.Inner);
		assert.equal(oList.getShowSeparators(), ListSeparators.Inner, "List should be set to the same separators as the parent upload collection.");
	});

	QUnit.test("'TerminationEnabled' flag", function (assert) {
		var oTermBtn0 = this.oUploadCollection.getItems()[0]._getTerminateButton(),
			oTermBtn1 = this.oUploadCollection.getItems()[1]._getTerminateButton();

		assert.ok(oTermBtn0.getVisible() && oTermBtn1.getVisible(), "All termination buttons should be visible at the start.");
		this.oUploadCollection.setTerminationEnabled(false);
		assert.notOk(oTermBtn0.getVisible() || oTermBtn1.getVisible(), "No termination button should be visible when set for parent upload collection.");
	});

	QUnit.skip("'UploadButtonInvisible' flag", function (assert) {
	});

	QUnit.test("'UploadEnabled' flag", function (assert) {
		assert.ok(this.oUploadCollection._getFileUploader().getEnabled(), "File uploader should be enabled at the start.");
		this.oUploadCollection.setUploadEnabled(false);
		assert.notOk(this.oUploadCollection._getFileUploader().getEnabled(), "File uploader should be disabled after 'UploadEnabled' is set to false.");
	});

	/* ====== */
	/* Events */
	/* ====== */

	QUnit.test("Function _handleSelectionChange triggers the selection change", function (assert) {
		//Arrange
		var sListItem = "listItem", sListItems = "listItems", sSelected = "selected",
			aUploadCollectionListItems = ["dummy"],
			oUploadCollectionItem = new UploadCollectionItem(),
			bSelected = true,
			oListItem = {
				getSelected: function () {
					return true;
				}
			},
			oEvent = {
				getParameter: function (name) {
					if (name === sListItem) {
						return oListItem;
					} else if (name === sListItems) {
						return aUploadCollectionListItems;
					} else if (name === sSelected) {
						return bSelected;
					}
				}
			},
			oGetUploadCollectionItemsByListItems = sinon.stub(this.oUploadCollection, "_getUploadCollectionItemsByListItems")
				.returns(aUploadCollectionListItems),
			oGetUploadCollectionItemByListItem = sinon.stub(this.oUploadCollection, "_getUploadCollectionItemByListItem")
				.returns(oUploadCollectionItem),
			oFireSelectionChangeStub = sinon.stub(this.oUploadCollection, "fireSelectionChange"),
			oSetSelectedStub = sinon.stub(oUploadCollectionItem, "setSelected");
		//Act
		this.oUploadCollection._handleSelectionChange(oEvent);
		//Assert
		assert.strictEqual(oGetUploadCollectionItemByListItem.getCall(0).args[0], oListItem, "The function _getUploadCollectionItemByListItem has been called with correct argument");
		assert.strictEqual(oGetUploadCollectionItemsByListItems.getCall(0).args[0], aUploadCollectionListItems, "The function _getUploadCollectionItemsByListItems has been called with correct argument");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selectedItem"], oUploadCollectionItem, "The selectionChange event has correct selectedItem parameter");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selectedItems"], aUploadCollectionListItems, "The selectionChange event has correct selectedItems parameter");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selected"], bSelected, "The selectionChange event has correct selected parameter");
		assert.strictEqual(oSetSelectedStub.getCall(0).args[0], oListItem.getSelected(), "The setSelected method has been called with correct argument");
	});
});