/* global QUnit, sinon */

(function(QUnit, sinon) {
	"use strict";

	jQuery.sap.require("sap.ui.fl.variants.VariantManagement");
	jQuery.sap.require("sap.ui.layout.Grid");

	var fCreateItem = function(oPartItem, sKey, sText) {
		var oItem = {
			key: sKey,
			text: sText,
			readOnly: false,
			executeOnSelection: false,
			global: false,
			lifecyclePackage: "",
			lifecycleTransportId: "",
			namespace: "",
			accessOptions: "",
			labelReadOnly: false,
			author: "TEST"
		};

		jQuery.extend(oItem, oPartItem);

		return oItem;
	};

	var fGetGrid = function(oDialog) {
		var oGrid = null, aContent = oDialog.getContent();
		aContent.some(function(oContent) {
			if (oContent instanceof sap.ui.layout.Grid) {
				oGrid = oContent;
			}

			return (oGrid != null);
		});

		return oGrid;
	};

	QUnit.module("sap.ui.fl.variants.VariantManagement", {
		beforeEach: function() {
			this.oVariantManagement = new sap.ui.fl.variants.VariantManagement();
		},
		afterEach: function() {
		}
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(this.oVariantManagement);
		assert.equal(this.oVariantManagement.getSelectedVariantKey(), this.oVariantManagement.getStandardVariantKey());
	});

	QUnit.test("Shall be destroyable", function(assert) {
		assert.ok(this.oVariantManagement._oRb);
		assert.ok(this.oVariantManagement.oModel);

		this.oVariantManagement.destroy();

		assert.ok(!this.oVariantManagement._oRb);
		assert.ok(!this.oVariantManagement.oModel);
	});

	QUnit.test("Check addItem", function(assert) {

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 1);

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);
		assert.equal(aItems[0].key, this.oVariantManagement.getStandardVariantKey());
		assert.equal(aItems[1].key, "k1");
		assert.equal(aItems[1].deleted, false);
		assert.equal(aItems[1].initialText, aItems[1].text);
		assert.equal(aItems[1].initialExecuteOnSelection, aItems[1].executeOnSelection);

	});

	QUnit.test("Check replaceKey", function(assert) {

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 1);

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);
		assert.equal(aItems[0].key, this.oVariantManagement.getStandardVariantKey());
		assert.equal(aItems[1].key, "k1");

		this.oVariantManagement.replaceKey("k1", "newK1");

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);
		assert.equal(aItems[0].key, this.oVariantManagement.getStandardVariantKey());
		assert.equal(aItems[1].key, "newK1");

	});

	QUnit.test("Create Variants List", function(assert) {

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		assert.ok(!this.oVariantManagement.oVariantPopOver);
		this.oVariantManagement._createVariantList();

		assert.ok(this.oVariantManagement.oVariantPopOver);
		sinon.stub(this.oVariantManagement.oVariantPopOver, "openBy");

		assert.equal(this.oVariantManagement.getSelectedVariantKey(), this.oVariantManagement.getStandardVariantKey());

		this.oVariantManagement._openVariantList();

		assert.ok(!this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

		this.oVariantManagement.setStandardVariantKey("k1");
		this.oVariantManagement._openVariantList();

		assert.ok(!this.oVariantManagement.getModified());
		assert.ok(!this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

		this.oVariantManagement.setModified(true);
		assert.ok(this.oVariantManagement.getModified());
		assert.ok(this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

	});

	QUnit.test("Create SaveAs Dialog", function(assert) {

		assert.ok(!this.oVariantManagement.oSaveAsDialog);
		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();

		assert.ok(this.oVariantManagement.oInputName.getVisible());
		assert.ok(!this.oVariantManagement.oLabelKey.getVisible());
		assert.ok(!this.oVariantManagement.oInputManualKey.getVisible());

		var oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
		var oGridContent = oGrid.getContent();
		assert.ok(oGridContent);
		assert.equal(oGridContent.length, 1);

		this.oVariantManagement.oSaveAsDialog.destroy();
		this.oVariantManagement.oSaveAsDialog = undefined;
		this.oVariantManagement.oShare.destroy();
		this.oVariantManagement.oExecuteOnSelect.destroy();

		this.oVariantManagement.setShowExecuteOnSelection(true);
		this.oVariantManagement.setShowShare(true);
		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();
		oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
		oGridContent = oGrid.getContent();
		assert.ok(oGridContent);
		assert.equal(oGridContent.length, 3);

	});

	QUnit.test("Checking _handleVariantSaveAs", function(assert) {

		var bCalled = false;
		this.oVariantManagement.attachSave(function(oEvent) {
			bCalled = true;
		});

		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 1);

		this.oVariantManagement._handleVariantSaveAs("k1");
		assert.ok(bCalled);

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);
	});

	QUnit.test("Checking _handleVariantSave", function(assert) {

		var bCalled = false;
		this.oVariantManagement.attachSave(function(oEvent) {
			bCalled = true;
		});

		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);
		this.oVariantManagement.setSelectedVariantKey("k1");

		this.oVariantManagement._openSaveAsDialog();

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);

		this.oVariantManagement._handleVariantSave("k1");
		assert.ok(bCalled);

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 2);
	});

	QUnit.test("Create Management Dialog", function(assert) {

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		this.oVariantManagement._openManagementDialog();
		assert.ok(this.oVariantManagement.oManagementTable);
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 2);

	});

	QUnit.test("Checking _handleManageDefaultVariantChange", function(assert) {

		var bEnabled = false;
		sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(false);

		this.oVariantManagement.oManagementSave = {
			setEnabled: function(bFlag) {
				bEnabled = true;
			}
		};

		this.oVariantManagement._handleManageDefaultVariantChange("1");
		assert.ok(bEnabled);

		this.oVariantManagement._anyInErrorState.restore();
		sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(true);
		bEnabled = false;
		this.oVariantManagement._handleManageDefaultVariantChange("1");
		assert.ok(!bEnabled);

		this.oVariantManagement.oManagementSave = undefined;
	});

	QUnit.test("Checking _handleManageCancelPressed", function(assert) {

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k2", "text2");
		oItem.deleted = true;
		this.oVariantManagement.addItem(oItem);

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 3);

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		this.oVariantManagement._openManagementDialog();
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 2);

		this.oVariantManagement._handleManageCancelPressed();

		this.oVariantManagement._openManagementDialog();
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 3);

	});

// QUnit.test("Checking _handleManageDeletePressed", function(assert) {
//
// var oItem = fCreateItem({}, "k1", "text1");
// this.oVariantManagement.addItem(oItem);
//
// oItem = fCreateItem({}, "k2", "text2");
// this.oVariantManagement.addItem(oItem);
//
// this.oVariantManagement._createManagementDialog();
// assert.ok(this.oVariantManagement.oManagementDialog);
// sinon.stub(this.oVariantManagement.oManagementDialog, "open");
//
// this.oVariantManagement._openManagementDialog();
// var aRows = this.oVariantManagement.oManagementTable.getItems();
// assert.ok(aRows);
// assert.equal(aRows.length, 3);
//
// this.oVariantManagement._handleManageDeletePressed(oItem);
//
// this.oVariantManagement._deleteOccured = true;
//
// this.oVariantManagement._openManagementDialog();
// var aRows = this.oVariantManagement.oManagementTable.getItems();
// assert.ok(aRows);
// assert.equal(aRows.length, 2);
//
// });

	QUnit.test("Checking _handleManageSavePressed; deleted item is NOT selected", function(assert) {

		this.oVariantManagement.attachManage(function(oEvent) {
			var aDelItems = oEvent.getParameters().deleted;
			assert.ok(aDelItems);
			assert.equal(aDelItems.length, 2);
			assert.equal(aDelItems[0], "k1");
			assert.equal(aDelItems[1], "k4");

			var aRenamedItems = oEvent.getParameters().renamed;
			assert.ok(aRenamedItems);
			assert.equal(aRenamedItems.length, 1);
			assert.equal(aRenamedItems[0].key, "k2");
			assert.equal(aRenamedItems[0].name, "New k2");
		});

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k2", "text2");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k3", "text3");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k4", "text4");
		this.oVariantManagement.addItem(oItem);

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		var oItemRen = this.oVariantManagement._getItemByKey("k2");
		assert.ok(oItemRen);
		oItemRen.text = "New k2";
		this.oVariantManagement._handleManageItemNameChange(oItemRen);

		var oItemDel = this.oVariantManagement._getItemByKey("k1");
		assert.ok(oItemDel);

		oItemDel.text = "New k1";
		this.oVariantManagement._handleManageItemNameChange(oItemDel);

		this.oVariantManagement._handleManageDeletePressed(oItemDel);
		this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("k4"));

		this.oVariantManagement._handleManageSavePressed(oItem);

		assert.ok(!this.oVariantManagement.bFireSelect);

	});

	QUnit.test("Checking _handleManageSavePressed; deleted item is selected", function(assert) {

		this.oVariantManagement.attachManage(function(oEvent) {
			var aDelItems = oEvent.getParameters().deleted;
			assert.ok(aDelItems);
			assert.equal(aDelItems.length, 2);
			assert.equal(aDelItems[0], "k1");
			assert.equal(aDelItems[1], "k4");

			var aRenamedItems = oEvent.getParameters().renamed;
			assert.ok(aRenamedItems);
			assert.equal(aRenamedItems.length, 1);
			assert.equal(aRenamedItems[0].key, "k2");
			assert.equal(aRenamedItems[0].name, "New k2");
		});

		var oItem = fCreateItem({}, "k1", "text1");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k2", "text2");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k3", "text3");
		this.oVariantManagement.addItem(oItem);

		oItem = fCreateItem({}, "k4", "text4");
		this.oVariantManagement.addItem(oItem);

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		var oItemRen = this.oVariantManagement._getItemByKey("k2");
		assert.ok(oItemRen);
		oItemRen.text = "New k2";
		this.oVariantManagement._handleManageItemNameChange(oItemRen);

		var oItemDel = this.oVariantManagement._getItemByKey("k1");
		assert.ok(oItemDel);

		oItemDel.text = "New k1";
		this.oVariantManagement._handleManageItemNameChange(oItemDel);

		this.oVariantManagement._handleManageDeletePressed(oItemDel);
		this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("k4"));

		this.oVariantManagement.setSelectedVariantKey("k1");

		this.oVariantManagement._handleManageSavePressed(oItem);

		assert.ok(this.oVariantManagement.bFireSelect);

		assert.equal(this.oVariantManagement.getSelectedVariantKey(), this.oVariantManagement.getStandardVariantKey());

	});

}(QUnit, sinon));
