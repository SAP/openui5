/*global QUnit, sinon */
sap.ui.define([
	"sap/m/VariantItem",
	"sap/m/VariantManagement",
	"sap/ui/core/Element",
	"sap/ui/fl/write/api/ContextSharingAPI",
	'sap/ui/qunit/QUnitUtils',
	"sap/ui/qunit/utils/nextUIUpdate"
], function(VariantItem, VariantManagement, Element, ContextSharingAPI, QUnitUtils, nextUIUpdate) {
	"use strict";

	var fChangeApplyAutomatic = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oExec = aCells[4].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oExec, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeDefault = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDefault = aCells[3].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDefault, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeDelete = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDelete = aCells[7].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDelete, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeFavorite = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oFavorite = aCells[0].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("click", oFavorite, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeTitle = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oInput = aCells[1];
		oInput.focus();
		oInput.setValue(vValue);
		QUnitUtils.triggerEvent("input", oInput.getFocusDomRef());
		await nextUIUpdate();
	};


	QUnit.module("VariantManagement tests", {
		beforeEach:  function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("Instantiate VariantManagement", function(assert) {
		assert.ok(this.oVM, "could be instantiated");
	});

	QUnit.test("Check properties", function(assert) {
		assert.equal(this.oVM.getLevel(), "Auto", "expected level");
		assert.equal(this.oVM.getTitleStyle(), "Auto", "expected title style");

		this.oVM.setLevel("H1");
		this.oVM.setTitleStyle("H2");

		assert.equal(this.oVM.getLevel(), "H1", "expected level");
		assert.equal(this.oVM.getTitleStyle(), "H2", "expected title style");
	});

	QUnit.test("VariantManagement with two VariantItems", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		assert.equal(this.oVM.getItems().length, 2, "with two items");
	});

	QUnit.test("VariantManagement with selected key", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		var oTitle = Element.getElementById(this.oVM.getId() + "-text");
		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "", "expected no text");

		this.oVM.setSelectedKey("2");

		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "Two", "expected text");

		assert.equal(this.oVM.getSelectedKey(), "2", "expected selected key");
	});

	QUnit.test("VariantManagement check title", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		assert.equal(this.oVM.getTitle().getText(), "Two", "expected text");

		var aItems = this.oVM.getItems();
		assert.equal(aItems.length, 2, "expected items found");

		aItems[1].setTitle("Hugo");

		assert.equal(this.oVM.getTitle().getText(), "Hugo", "expected text");
	});

	QUnit.test("VariantManagement check _showAsText", function(assert) {
		assert.equal(this.oVM.getShowAsText(), false, "expected default value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");

		this.oVM.setShowAsText(true);
		assert.equal(this.oVM.getShowAsText(), true, "expected assigned value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Text"), "expected type 'sap.m.Text'.");

		this.oVM.setShowAsText(false);
		assert.equal(this.oVM.getShowAsText(), false, "expected assigned value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");
	});

	QUnit.test("VariantManagement check _IsItemDeleted", function(assert) {
		var oVMI1 = new VariantItem({key: "1", title:"One"});
		var oVMI2 = new VariantItem({key: "2", title:"Two"});

		this.oVM._clearDeletedItems();
		this.oVM._addDeletedItem(oVMI1);

		assert.ok(this.oVM._isItemDeleted(oVMI1), "item is deleted.");
		assert.ok(!this.oVM._isItemDeleted(oVMI2), "item is not deleted.");
	});

	QUnit.module("VariantManagement variantlist", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM .placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 2, "two items expected");

			assert.ok(this.oVM.oVariantPopOver, "popover should exists");
			assert.equal(this.oVM.oVariantPopOver.getTitle(), "My List", "title expected");

			assert.ok(this.oVM.oVariantList, "list should exists");
			assert.equal(this.oVM.oVariantList.getItems().length, 2, "two items expected");
			assert.equal(this.oVM.oVariantList.getSelectedItem().getKey(), "2", "selected item expected");

			assert.ok(this.oVM.getShowFooter(), "expect to see the footer");

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check items with some favorite = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: false}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 4, "four items expected");

			assert.ok(this.oVM.oVariantList, "list should exists");
			assert.equal(this.oVM.oVariantList.getItems().length, 2, "two items expected");
			assert.equal(this.oVM.oVariantList.getSelectedItem().getKey(), "2", "selected item expected");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check setCurrentVariantKey", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		var bSelectCalled = false;

		this.oVM.attachSelect(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");
			bSelectCalled = true;
		}.bind(this));

		assert.ok(!bSelectCalled);
		this.oVM.setCurrentVariantKey("1");
		assert.ok(bSelectCalled);

		bSelectCalled = false;
		this.oVM.setCurrentVariantKey("XXX");
		assert.ok(!bSelectCalled);

	});

	QUnit.test("check event 'select'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		this.oVM.attachSelect(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");

			done();
		}.bind(this));

		this.oVM.setCurrentVariantKey("1");
	});

	QUnit.test("check event 'save'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));

		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		var done = assert.async();

		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "2", "key expected");
			assert.ok(mParameters.overwrite, "overwrite should be true");

			done();
		});

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "should be visible");

			var oTarget = this.oVM.oVariantSaveBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});


	QUnit.test("check title", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 2, "two items expected");

			assert.ok(this.oVM.oVariantPopOver, "popover should exists");
			assert.equal(this.oVM.oVariantPopOver.getTitle(), "My List", "title expected");

			done();

		}.bind(this));

		this.oVM.onclick();

	});

	QUnit.test("check with showFooter = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowFooter(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(!this.oVM.getShowFooter(), "expect to see the footer");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with modified=false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.getShowFooter(), "expect to see the footer");

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "Save button should be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with showSaveAs=true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowSaveAs(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with creation not allowed", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with  creation not allowed and modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);
		this.oVM.setModified(true);

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opening the varian list display in simulated designmode", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));

		sinon.stub(this.oVM, "_openVariantList");

		this.oVM.setDesignMode(true);
		this.oVM.onclick();
        assert.ok(!this.oVM._openVariantList.called);

		this.oVM.setDesignMode(false);
		this.oVM.onclick();
        assert.ok(this.oVM._openVariantList.called);
	});

	QUnit.test("check no data available", function(assert) {
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");

		this.oVM.addItem(new VariantItem({key: "1", title:"View1"}));

		this.oVM.onclick();
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		var sSearchText = "XXX";
		var oEvent = {
			getParameters: function() { return {newValue: sSearchText};}
		};

		this.oVM.addItem(new VariantItem({key: "2", title:"View2"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"View3"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"View4"}));
		this.oVM.addItem(new VariantItem({key: "5", title:"View5"}));
		this.oVM.addItem(new VariantItem({key: "6", title:"View6"}));
		this.oVM.addItem(new VariantItem({key: "7", title:"View7"}));
		this.oVM.addItem(new VariantItem({key: "8", title:"View8"}));
		this.oVM.addItem(new VariantItem({key: "9", title:"View9"}));
		this.oVM.addItem(new VariantItem({key: "10", title:"View10"}));

		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataFoundIllustratedMessage, "expected illustrated message found");

		sSearchText = "View";
		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		this.oVM.removeAllItems();
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");
	});

	QUnit.module("VariantManagement SaveAs dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check opens", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oInputName, "should exists");
			assert.ok(this.oVM.oInputName.getValue(), "Two", "default entry");

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(this.oVM.oDefault.getVisible(), "should be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(this.oVM.oPublic.getVisible(), "should be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(this.oVM.oExecuteOnSelect.getVisible(), "should be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(!this.oVM.oCreateTile.getVisible(), "should not be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with supportPublic & supportDefault & supportApplyAutomatically set to false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setSupportPublic(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportDefault(false);

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(!this.oVM.oDefault.getVisible(), "should not be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(!this.oVM.oPublic.getVisible(), "should not be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(!this.oVM.oExecuteOnSelect.getVisible(), "should not be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(!this.oVM.oCreateTile.getVisible(), "should not be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with show Tile", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");
		this.oVM._setShowCreateTile(true);

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(this.oVM.oDefault.getVisible(), "should be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(this.oVM.oPublic.getVisible(), "should be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(this.oVM.oExecuteOnSelect.getVisible(), "should be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(this.oVM.oCreateTile.getVisible(), "should be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check event 'save'", function(assert) {

		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		var done = assert.async();

		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(mParameters.def, "default flag expected");
			assert.ok(mParameters.execute, "execute flag expected");
			assert.ok(mParameters.public, "public flag expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");

			//done();
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog);

		this.oVM.oSaveAsDialog.attachAfterClose(function(oEvent) {
			done();
		});

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(async function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oInputName, "should exists");
			this.oVM.oInputName.setValue("New");

			assert.ok(this.oVM.oDefault, "should exists");
			this.oVM.oDefault.setSelected(true);

			assert.ok(this.oVM.oPublic, "should exists");
			this.oVM.oPublic.setSelected(true);

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			this.oVM.oExecuteOnSelect.setSelected(true);

			//await nextUIUpdate();

			assert.ok(this.oVM.oSaveSave, "should exists");
			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			await nextUIUpdate();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {
			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});


	QUnit.module("VariantManagement Manage dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});
	QUnit.test("check opens", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementDialog, "manage dialog exist");

			assert.ok(this.oVM.oManagementTable, "management table exists");
			var aColumns = this.oVM.oManagementTable.getColumns();
			assert.ok(aColumns, "columns in the management table exists");
			assert.equal(aColumns.length, 9, "columns in the management table exists");
			assert.ok(aColumns[0].getVisible(), "favorite column is visible");
			assert.ok(aColumns[1].getVisible(), "title column is visible");
			assert.ok(aColumns[2].getVisible(), "sharing column is visible");
			assert.ok(aColumns[3].getVisible(), "default column is visible");
			assert.ok(aColumns[4].getVisible(), "apply automatic  column is visible");
			assert.ok(!aColumns[5].getVisible(), "contexts column is not visible");
			assert.ok(aColumns[6].getVisible(), "author column is visible");
			assert.ok(aColumns[7].getVisible(), "delete column is visible");
			assert.ok(!aColumns[8].getVisible(), "last column is always not visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with supportDefault & supportApplyAutomatic & supportPublic & supportFavorites set to false", function(assert) {
		this.oVM.setSupportDefault(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportPublic(false);
		this.oVM.setSupportFavorites(false);

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aColumns = this.oVM.oManagementTable.getColumns();
			assert.ok(aColumns, "columns in the management table exists");
			assert.equal(aColumns.length, 9, "columns in the management table exists");
			assert.ok(!aColumns[0].getVisible(), "favorite column is visible");
			assert.ok(aColumns[1].getVisible(), "title column is visible");
			assert.ok(!aColumns[2].getVisible(), "sharing column is visible");
			assert.ok(!aColumns[3].getVisible(), "default column is visible");
			assert.ok(!aColumns[4].getVisible(), "apply automatic column is visible");
			assert.ok(!aColumns[5].getVisible(), "contexts column is not visible");
			assert.ok(aColumns[6].getVisible(), "author column is visible");
			assert.ok(aColumns[7].getVisible(), "delete column is visible");
			assert.ok(!aColumns[8].getVisible(), "last column is always not visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			var i, j, aCells, oControl, sTemp, bSkip;

			for (i = 0; i < this.oVM.oManagementTable.getItems().length; i++) {
				aCells = this.oVM.oManagementTable.getItems()[i].getCells();
				assert.ok(aCells, "expected cells found");

				if (i === 0) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getTitle(), "One", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(), "Public", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(), "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(aCells[4].getSelected(), "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "A", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(!aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');

				} else if (i === 1) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavColor"), "should be active" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getValue(), "Two", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "B", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				} else if (i === 2) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be active" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getValue(), "Three", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "A", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				} else {
					assert.equal(aCells[0].getSrc(), "sap-icon://unfavorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"), "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getTitle(), "Four", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Public", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "B", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(!aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				}

				var sIdPrefix = this.oVM.getId() + "-manage-";

				for (j = 0; j < aCells.length; j++) {
					oControl = aCells[j];
					bSkip = false;
					switch (j) {
						case 0: sTemp = "fav-"; break;
						case 1: sTemp = oControl.isA("sap.m.Input") ? "input-" : "text-"; break;
						case 2: sTemp = "type-"; break;
						case 3: sTemp = "def-"; break;
						case 4: sTemp = "exe-"; break;
						case 5: sTemp = "roles-"; bSkip = true; break;
						case 6: sTemp = "author-"; break;
						case 7: sTemp = "del-"; break;
						default: bSkip = true; break;
					}

					if (!bSkip) {
						assert.equal(oControl.getId(), sIdPrefix + sTemp + i, "expecting id '" + sTemp + "' for (" + i + ',' + j + ')');
					}
				}
			}

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'cancel'", async function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));
		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManageCancel(function(oEvent) {

			assert.equal(this.oVM.getDefaultKey(), "3", "default reverted correctly");

			var aItems = this.oVM.getItems();
			assert.ok(aItems, "items exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {

				if (i === 0) {
					assert.equal(aItems[i].getTitle(), "One", "expected title. Row=0");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=0");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=0");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i]._getOriginalExecuteOnSelect(), "expected execute on select. Row=0");
				} else if (i === 1) {
					assert.equal(aItems[i].getTitle(), "Two", "expected title. Row=1");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=1");

				} else if (i === 2) {
					assert.equal(aItems[i].getTitle(), "Three", "expected title. Row=2");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=2");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=2");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i]._getOriginalExecuteOnSelect(), "expected execute on select. Row=2");

					assert.equal(aItems[i].getVisible(), true, "item is active. Row=3");
				} else {
					assert.equal(aItems[i].getTitle(), "Four", "expected title. Row=3");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=3");

					assert.equal(aItems[i].getFavorite(), false, "expected favorite. Row=3");
					assert.equal(aItems[i].getFavorite(), aItems[i]._getOriginalFavorite(), "expected favorite. Row=3");
				}
			}
		}.bind(this));


		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), true,  "item 2 is visible");

			// 1st row
			await fChangeApplyAutomatic(this.oVM.oManagementTable, 0);

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "newName");
			await fChangeDefault(this.oVM.oManagementTable, 1);

			// 4th row
			await fChangeFavorite(this.oVM.oManagementTable, 3);

			// 3nd row
			await fChangeTitle(this.oVM.oManagementTable, 2, "newName2");
			await fChangeDelete(this.oVM.oManagementTable, 2);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), false,  "item 2 is not visible");

			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");

			var oOrigItem;
			for (var i = 0; i < aItems.length; i++) {
				oOrigItem = this.oVM._getItemByKey(aItems[i].getKey());
				assert.ok(oOrigItem, "expected aggregation item found");

				if (oOrigItem.getKey() === "1") {
					assert.equal(oOrigItem.getTitle(), "One", "expected title. Key=1");
					assert.equal(oOrigItem.getTitle(), aItems[i]._getOriginalTitle(), "expected title. Key=1");

					assert.equal(oOrigItem.getExecuteOnSelect(), false, "expected execute on select. Key=1");
					assert.ok(oOrigItem.getExecuteOnSelect() !== oOrigItem._getOriginalExecuteOnSelect(), "expected execute on select. Key=1");
				} else if (oOrigItem.getKey() === "2") {
					assert.equal(oOrigItem.getTitle(), "newName", "expected title. Key=2");
					assert.ok(oOrigItem.getTitle() !== oOrigItem._getOriginalTitle(), "expected title. Key=2");

				} else if (oOrigItem.getKey() === "3") {
					assert.equal(oOrigItem.getTitle(), "newName2", "expected title. Key=3");
					assert.ok(oOrigItem.getTitle() !== oOrigItem._getOriginalTitle(), "expected title. Key=3");

					assert.ok(oOrigItem.getVisible(), "item is active. Key=3");
				} else {
					assert.equal(oOrigItem.getTitle(), "Four", "expected title. Key=4");
					assert.equal(oOrigItem.getTitle(), oOrigItem._getOriginalTitle(), "expected title. Key=4");

					assert.equal(oOrigItem.getFavorite(), true, "expected favorite. Key=4");
					assert.ok(oOrigItem.getFavorite() !== oOrigItem._getOriginalFavorite(), "expected favorite. Key=4");
				}
			}

			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected items");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'manage'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		this.oVM.attachManage(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters);

			// unittest issue
//			assert.equal(mParameters.def, "2");
//			assert.equal(this.oVM.getDefaultKey(), "2", "expected default");

			assert.ok(mParameters.exe);
			assert.equal(mParameters.exe.length, 1, "expected event data about apply automatically.");
			assert.equal(mParameters.exe[0].key, "1", "expected event data about apply automatically key.");
			assert.equal(mParameters.exe[0].exe, false, "expected event data about apply automatically value");

			assert.ok(mParameters.fav);
			assert.equal(mParameters.fav.length, 1, "expected event data about favorite.");
			assert.equal(mParameters.fav[0].key, "4", "expected event data about favorite key.");
			assert.equal(mParameters.fav[0].visible, true, "expected event data about favorite value");

			assert.ok(mParameters.deleted);
			assert.equal(mParameters.deleted.length, 1, "expected event data about deleted.");
			assert.equal(mParameters.deleted[0], '3', "expected event data about deleted.");

		});

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), true,  "item 2 is visible");

			// 1st row
			await fChangeApplyAutomatic(this.oVM.oManagementTable, 0);

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "newName");

			await fChangeDefault(this.oVM.oManagementTable, 1);

			// 4th row
			await fChangeFavorite(this.oVM.oManagementTable, 3);

			// 3nd row
			await fChangeTitle(this.oVM.oManagementTable, 2, "newName2");

			await fChangeDelete(this.oVM.oManagementTable, 2);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), false,  "item 2 is not visible");


			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check manage dialog with dublicate entries", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		var fOriginalSaveHandler = this.oVM._handleManageSavePressed.bind(this.oVM);
		sinon.stub(this.oVM, "_handleManageSavePressed").callsFake(function (oEvent) {
			fOriginalSaveHandler();

			assert.ok(this.oVM.oManagementTable, "management table exists");
			var aItems = this.oVM.oManagementTable.getItems();
			var aCells = aItems[1].getCells();

			var oInput = aCells[1];
			assert.ok(oInput, "expected input field");

			assert.equal(oInput.getValueState(), "Error", "expected error state");

			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "One");


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(async function (oEvent) {

			await fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");
		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check manage dialog Save behavour", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		this.oVM._openManagementDialog();
		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");

		var oRow = this.oVM._getRowForKey("3");
		assert.ok(oRow, "expected row found");

		var oInput = oRow.getCells()[VariantManagement.COLUMN_NAME_IDX];
		assert.ok(oInput, "expected input found");
		oInput.setValueState("Error");
		assert.ok(!this.oVM._handleManageSavePressed(), "expected errors detected");

		var oView = this.oVM.getItemByKey("3");
		assert.ok(oView, "expected view found");
		this.oVM._handleManageDeletePressed(oView);
		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");
	});

	QUnit.module("VariantManagement Roles handling", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();

		},
		afterEach: function() {

			if (this.oCompContainer) {
				var oComponent = this.oCompContainer.getComponentInstance();
				oComponent.destroy();

				this.oCompContainer.destroy();
				this.oCompContainer = undefined;
			}

			this.oVM.destroy();
		}
	});

	QUnit.test("check roles inside managed views", function (assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", contexts: {role: ["test"]}, remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, oauthor: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", contexts: {role: []}, favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		this.oVM.attachManage(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters);
			assert.ok(this.oCompContainer, "context sharing component exists");

			done();
		}.bind(this));


		assert.ok(!this.oVM.getSupportContexts());
		this.oVM.setSupportContexts(true);

		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			var oIcon = null;
			var oRb = this.oVM._oRb;

			assert.ok(this.oVM.getSupportContexts());

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {
				var oRolesCell = aItems[i].getCells()[5];
				assert.ok(oRolesCell, "expected contexts element");

				if (i === 0) {
					 assert.ok(oRolesCell.isA("sap.m.Text"), "standard has no contexts");
				} else {
					 assert.ok(oRolesCell.isA("sap.m.HBox"), "item with contexts");

					 var oText = oRolesCell.getItems()[0];
					 if (i === 1) {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED"), "restricted expected");
						 oIcon = oRolesCell.getItems()[1];
					 } else {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"), "non restricted expected");
					 }
				}
			}

			assert.ok(oIcon, "restricted icon");
			var oTarget = oIcon.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("click", oTarget, {
				srcControl: null
			});

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function () {

			fOriginalManageCall();

			assert.ok(this.oVM.oManagementTable, "management table exists");

		}.bind(this));


		this.oVM._createRolesDialog();
		assert.ok(this.oVM._oRolesDialog, "roles dialog exisis");

		this.oVM._oRolesDialog.attachAfterClose(function() {

			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of save button of manage dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM._oRolesDialog.attachAfterOpen(function() {

			var oCancelButton = Element.getElementById(this.oVM.getId() + "-rolecancel");
			assert.ok(oCancelButton, "cancel button of roles dialog existst");

			var oTarget = oCancelButton.getFocusDomRef();
			assert.ok(oTarget, "dom ref of cancel button of roles dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		var fOriginalRolesCall = this.oVM._openRolesDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openRolesDialog").callsFake(function (oItem, oTextControl) {
			fOriginalRolesCall(oItem, oTextControl);
		});

		var oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openManagementDialog(false, "STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

	QUnit.test("check roles inside SaveAs dialog", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		var done = assert.async();


		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(!mParameters.def, "default flag not expected");
			assert.ok(!mParameters.execute, "execute flag not expected");
			assert.ok(!mParameters.public, "public flag not expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");
			assert.deepEqual(mParameters.contexts, {role: []}, "non restricted context expected");
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog, "saveas dialog exists");

		this.oVM.oSaveAsDialog.attachAfterClose(function() {
			assert.ok(this.oCompContainer, "context sharing component exists");
			done();
		}.bind(this));

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {

			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of the save button inside SaveAs dialog exists");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		var fOpenCall = this.oVM.oSaveAsDialog.open.bind(this.oVM.oSaveAsDialog);
		sinon.stub(this.oVM.oSaveAsDialog, "open").callsFake(function (sClass, oContext) {

			assert.ok(this.oVM.oInputName, "input entry should exists");
			this.oVM.oInputName.setValue("New");

			fOpenCall(sClass, oContext);
		}.bind(this));

		var oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openSaveAsDialog("STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

});