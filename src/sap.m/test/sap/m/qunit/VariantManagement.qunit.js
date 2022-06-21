/*global QUnit, sinon */
sap.ui.define([
	"sap/m/VariantItem",
	"sap/m/VariantManagement",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/m/Page",
	"sap/m/App",
	'sap/ui/qunit/QUnitUtils',
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(VariantItem, VariantManagement, FeaturesAPI, ContextSharingAPI, Page, App, QUnitUtils, createAndAppendDiv) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");

	var page = new Page("myFirstPage", {
		title : "VariantManagement testing"
	});

	var app = new App("myApp", {
		initialPage: "myPage"
	});
	app.addPage(page).placeAt("content");

	var fChangeApplyAutomatic = function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oExec = aCells[4].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oExec, {
			srcControl: null
		});
		sap.ui.getCore().applyChanges();
	};

	var fChangeDefault = function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDefault = aCells[3].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDefault, {
			srcControl: null
		});
		sap.ui.getCore().applyChanges();
	};

	var fChangeDelete = function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDelete = aCells[7].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDelete, {
			srcControl: null
		});
		sap.ui.getCore().applyChanges();
	};

	var fChangeFavorite = function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oFavorite = aCells[0].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("click", oFavorite, {
			srcControl: null
		});
		sap.ui.getCore().applyChanges();
	};

	var fChangeTitle = function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oInput = aCells[1].$("inner");
		oInput.focus();
		oInput.val(vValue);
		QUnitUtils.triggerEvent("input", oInput);
		sap.ui.getCore().applyChanges();
	};


	QUnit.module("VariantManagement tests", {
		beforeEach: function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			page.addContent(this.oVM);
		},
		afterEach: function() {
			page.removeContent(this.oVM);
			this.oVM.destroy();
		}
	});

	QUnit.test("Instantiate VariantManagement", function(assert) {
		assert.ok(this.oVM, "could be instantiated");
	});

	QUnit.test("VariantManagement with two VariantItems", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		assert.equal(this.oVM.getItems().length, 2, "with two items");
	});

	QUnit.test("VariantManagement with selected key", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		sap.ui.getCore().applyChanges();

		var oTitle = sap.ui.getCore().byId(this.oVM.getId() + "-text");
		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "", "expected no text");

		this.oVM.setSelectedKey("2");
		sap.ui.getCore().applyChanges();

		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "Two", "expected text");

		assert.equal(this.oVM.getSelectedKey(), "2", "expected selected key");
	});


	QUnit.module("VariantManagement variantlist", {
		beforeEach: function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			page.addContent(this.oVM);
		},
		afterEach: function() {
			page.removeContent(this.oVM);
			this.oVM.destroy();
		}
	});
	QUnit.test("check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check items with some favorite = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: false}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false}));
		this.oVM.setSelectedKey("2");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.equal(this.oVM.getItems().length, 4, "four items expected");

			assert.ok(this.oVM.oVariantList, "list should exists");
			assert.equal(this.oVM.oVariantList.getItems().length, 2, "two items expected");
			assert.equal(this.oVM.oVariantList.getSelectedItem().getKey(), "2", "selected item expected");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check event 'select'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		this.oVM.attachSelect(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oItem =  this.oVM.oVariantList.getItems()[0];
			var oTarget = this.oVM.oVariantList.getDomRef();

			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: oItem,
				changedTouches: {
					0: {
						pageX: 1,
						pageY: 1,
						identifier: 0,
						target: oItem.getDomRef()
					},

					length: 1
				},

				touches: {
					length: 0
				}
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check event 'save'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "should be visible");

			var oTarget = this.oVM.oVariantSaveBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});


	QUnit.test("check title", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.equal(this.oVM.getItems().length, 2, "two items expected");

			assert.ok(this.oVM.oVariantPopOver, "popover should exists");
			assert.equal(this.oVM.oVariantPopOver.getTitle(), "My List", "title expected");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check with showFooter = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowFooter(false);

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(!this.oVM.getShowFooter(), "expect to see the footer");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check buttons with modified=false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check buttons with modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "Save button should be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check buttons with showSaveAs=true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowSaveAs(false);
		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check buttons with creation not allowed", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);
		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check buttons with  creation not allowed and modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);
		this.oVM.setModified(true);

		this.oVM.setPopoverTitle("My List");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.module("VariantManagement SaveAs dialog", {
		beforeEach: function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			page.addContent(this.oVM);

			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			page.removeContent(this.oVM);
			this.oVM.destroy();
			this.clock.restore();
		}
	});
	QUnit.test("check opens", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);
			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

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
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens with supportPublic & supportDefault & supportApplyAutomatically set to false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setSupportPublic(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportDefault(false);

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);
			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

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
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens with show Tile", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");
		this.oVM._setShowCreateTile(true);

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);
			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

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
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check event 'save'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(mParameters.def, "default flag expected");
			assert.ok(mParameters.execute, "execute flag expected");
			assert.ok(mParameters.public, "public flag expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog);

		this.oVM.oSaveAsDialog.attachAfterClose(function(oEvent) {
			done();
		});

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);
			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

			assert.ok(this.oVM.oInputName, "should exists");
			this.oVM.oInputName.setValue("New");

			assert.ok(this.oVM.oDefault, "should exists");
			this.oVM.oDefault.setSelected(true);

			assert.ok(this.oVM.oPublic, "should exists");
			this.oVM.oPublic.setSelected(true);

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			this.oVM.oExecuteOnSelect.setSelected(true);

			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oSaveSave, "should exists");
			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});


	QUnit.module("VariantManagement Manage dialog", {
		beforeEach: function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			page.addContent(this.oVM);
		},
		afterEach: function() {
			page.removeContent(this.oVM);
			this.oVM.destroy();
		}
	});
	QUnit.test("check opens", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens with supportDefault & supportApplyAutomatic & supportPublic & supportFavorites set to false", function(assert) {
		this.oVM.setSupportDefault(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportPublic(false);
		this.oVM.setSupportFavorites(false);

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			sap.ui.getCore().applyChanges();

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");


			for (var i = 0; i < aItems.length; i++) {
				var aCells = aItems[i].getCells();

				assert.ok(true, "item-" + i);
				if (i === 0) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive");

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"),  "expected controltype found");
					assert.equal(aCells[1].getTitle(), "One", "expected sharing info found");

					assert.equal(aCells[2].getText(), "Public", "expected sharing info found");
					assert.ok(!aCells[3].getSelected(), "expected default info found");
					assert.ok(aCells[4].getSelected(), "expected apply automatically info found");

					assert.equal(aCells[6].getText(), "A", "expected author found");
					assert.ok(!aCells[7].getVisible(), "expected delete info found");

				} else if (i === 1) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavColor"), "should be active");

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
					assert.equal(aCells[1].getValue(), "Two", "expected sharing info found");

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found");
					assert.ok(!aCells[3].getSelected(),  "expected default info found");
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found");

					assert.equal(aCells[6].getText(), "B", "expected author found");
					assert.ok(aCells[7].getVisible(), "expected delete info found");
				} else if (i === 2) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be active");

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
					assert.equal(aCells[1].getValue(), "Three", "expected sharing info found");

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found");
					assert.ok(aCells[3].getSelected(),  "expected default info found");
					assert.ok(aCells[4].getSelected(),  "expected apply automatically info found");

					assert.equal(aCells[6].getText(), "A", "expected author found");
					assert.ok(aCells[7].getVisible(), "expected delete info found");
				} else {
					assert.equal(aCells[0].getSrc(), "sap-icon://unfavorite", "expected favorite icon found");

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"), "expected controltype found");
					assert.equal(aCells[1].getTitle(), "Four", "expected sharing info found");

					assert.equal(aCells[2].getText(),  "Public", "expected sharing info found");
					assert.ok(!aCells[3].getSelected(),  "expected default info found");
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found");

					assert.equal(aCells[6].getText(), "B", "expected author found");
					assert.ok(!aCells[7].getVisible(), "expected delete info found");
				}
			}

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens check event 'cancel'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", originalTitle: "One", rename: false, sharing: "public", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", originalTitle: "Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", originalTitle: "Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", originalTitle: "Four", favorite: false, originalFavorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		sap.ui.getCore().applyChanges();

		var done = assert.async();


		this.oVM.attachManageCancel(function(oEvent) {

			assert.equal(this.oVM.getDefaultKey(), "3", "default reverted correctly");

			var aItems = this.oVM.getItems();
			assert.ok(aItems, "items exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {

				if (i === 0) {
					assert.equal(aItems[i].getTitle(), "One", "expected title. Row=0");
					assert.equal(aItems[i].getTitle(), aItems[i].getOriginalTitle(), "expected title. Row=0");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=0");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i].getOriginalExecuteOnSelect(), "expected execute on select. Row=0");
				} else if (i === 1) {
					assert.equal(aItems[i].getTitle(), "Two", "expected title. Row=1");
					assert.equal(aItems[i].getTitle(), aItems[i].getOriginalTitle(), "expected title. Row=1");

				} else if (i === 2) {
					assert.equal(aItems[i].getTitle(), "Three", "expected title. Row=2");
					assert.equal(aItems[i].getTitle(), aItems[i].getOriginalTitle(), "expected title. Row=2");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=2");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i].getOriginalExecuteOnSelect(), "expected execute on select. Row=2");

					assert.equal(aItems[i].getVisible(), true, "item is active. Row=3");
				} else {
					assert.equal(aItems[i].getTitle(), "Four", "expected title. Row=3");
					assert.equal(aItems[i].getTitle(), aItems[i].getOriginalTitle(), "expected title. Row=3");

					assert.equal(aItems[i].getFavorite(), false, "expected favorite. Row=3");
					assert.equal(aItems[i].getFavorite(), aItems[i].getOriginalFavorite(), "expected favorite. Row=3");
				}
			}
		}.bind(this));


		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			// 1st row
			fChangeApplyAutomatic(this.oVM.oManagementTable, 0);
			this.clock.tick(100);

			// 2nd row
			fChangeTitle(this.oVM.oManagementTable, 1, "newName");
			this.clock.tick(100);

			fChangeDefault(this.oVM.oManagementTable, 1);
			this.clock.tick(100);

			// 4th row
			fChangeFavorite(this.oVM.oManagementTable, 3);
			this.clock.tick(100);

			// 3nd row
			fChangeTitle(this.oVM.oManagementTable, 2, "newName2");
			this.clock.tick(100);

			fChangeDelete(this.oVM.oManagementTable, 2);
			this.clock.tick(100);

			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 3,  "expected count of items in the management table exists");


			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");

			var oOrigItem;
			for (var i = 0; i < aItems.length; i++) {
				oOrigItem = this.oVM._getItemByKey(aItems[i].getKey());
				assert.ok(oOrigItem, "expected aggregation item found");

				if (oOrigItem.getKey() === "1") {
					assert.equal(oOrigItem.getTitle(), "One", "expected title. Key=1");
					assert.equal(oOrigItem.getTitle(), aItems[i].getOriginalTitle(), "expected title. Key=1");

					assert.equal(oOrigItem.getExecuteOnSelect(), false, "expected execute on select. Key=1");
					assert.ok(oOrigItem.getExecuteOnSelect() !== oOrigItem.getOriginalExecuteOnSelect(), "expected execute on select. Key=1");
				} else if (oOrigItem.getKey() === "2") {
					assert.equal(oOrigItem.getTitle(), "newName", "expected title. Key=2");
					assert.ok(oOrigItem.getTitle() !== oOrigItem.getOriginalTitle(), "expected title. Key=2");

				} else if (oOrigItem.getKey() === "3") {
					assert.equal(oOrigItem.getTitle(), "Three", "expected title. Key=3");
					assert.equal(oOrigItem.getTitle(), oOrigItem.getOriginalTitle(), "expected title. Key=3");

					assert.equal(oOrigItem.getVisible(), false, "item is not active. Key=3");
				} else {
					assert.equal(oOrigItem.getTitle(), "Four", "expected title. Key=4");
					assert.equal(oOrigItem.getTitle(), oOrigItem.getOriginalTitle(), "expected title. Key=4");

					assert.equal(oOrigItem.getFavorite(), true, "expected favorite. Key=4");
					assert.ok(oOrigItem.getFavorite() !== oOrigItem.getOriginalFavorite(), "expected favorite. Key=4");
				}
			}


			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			sap.ui.getCore().applyChanges();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			this.clock.tick(600);


			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 3,  "expected count of items in the management table exists");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check opens check event 'manage'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", originalTitle: "One", rename: false, sharing: "public", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", originalTitle: "Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", originalTitle: "Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", originalTitle: "Four", favorite: false, originalFavorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		sap.ui.getCore().applyChanges();

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


			var aItems = this.oVM.getItems();
			assert.ok(aItems, "items exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {

				if (i === 0) {
					assert.equal(aItems[i].getTitle(), "One", "expected title. Row=0");
					assert.equal(aItems[i].getOriginalTitle(), "One", "expected original title. Row=0");

					assert.equal(aItems[i].getExecuteOnSelect(), false, "expected execute on select. Row=0");
					assert.equal(aItems[i].getOriginalExecuteOnSelect(), true, "expected original execute on select. Row=0");
				} else if (i === 1) {
					assert.equal(aItems[i].getTitle(), "newName", "expected title. Row=1");
					assert.equal(aItems[i].getOriginalTitle(), "Two", "expected original title. Row=1");
				} else if (i === 2) {
					assert.equal(aItems[i].getTitle(), "Three", "expected title. Row=2");
					assert.equal(aItems[i].getOriginalTitle(), "Three", "expected original title. Row=2");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=2");
					assert.equal(aItems[i].getOriginalExecuteOnSelect(), true, "expected original execute on select. Row=2");

					assert.equal(aItems[i].getVisible(), false, "item is not active. Row=2");
				} else {
					assert.equal(aItems[i].getTitle(), "Four", "expected title. Row=3");
					assert.equal(aItems[i].getOriginalTitle(), "Four", "expected original title. Row=3");

					assert.equal(aItems[i].getFavorite(), true, "expected favorite. Row=3");
					assert.equal(aItems[i].getOriginalFavorite(), false, "expected original favorite. Row=3");
				}
			}
		}.bind(this));


		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			// 1st row
			fChangeApplyAutomatic(this.oVM.oManagementTable, 0);
			this.clock.tick(100);

			// 2nd row
			fChangeTitle(this.oVM.oManagementTable, 1, "newName");
			this.clock.tick(100);

			fChangeDefault(this.oVM.oManagementTable, 1);
			this.clock.tick(100);
			sap.ui.getCore().applyChanges();
			this.clock.tick(100);


			// 4th row
			fChangeFavorite(this.oVM.oManagementTable, 3);
			this.clock.tick(100);

			// 3nd row
			fChangeTitle(this.oVM.oManagementTable, 2, "newName2");
			this.clock.tick(100);

			fChangeDelete(this.oVM.oManagementTable, 2);
			this.clock.tick(100);

			sap.ui.getCore().applyChanges();
			this.clock.tick(600);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 3,  "expected count of items in the management table exists");


			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			sap.ui.getCore().applyChanges();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			this.clock.tick(600);


			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 3,  "expected count of items in the management table exists");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("check omanage dialog with dublicate entries", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", originalTitle: "One", rename: false, sharing: "public", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", originalTitle: "Two", remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", originalTitle: "Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", originalTitle: "Four", favorite: false, originalFavorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		sap.ui.getCore().applyChanges();

		var done = assert.async();


		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		var fOriginalSaveHandler = this.oVM._handleManageSavePressed.bind(this.oVM);
		sinon.stub(this.oVM, "_handleManageSavePressed").callsFake(function (oEvent) {
			fOriginalSaveHandler();

			assert.ok(true, "expected handler called");

			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			sap.ui.getCore().applyChanges();
			this.clock.tick(100);
		}.bind(this));

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(function() {

			// 2nd row
			fChangeTitle(this.oVM.oManagementTable, 1, "One");
			this.clock.tick(100);


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			sap.ui.getCore().applyChanges();
			this.clock.tick(100);

		}.bind(this));

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			this.clock.tick(600);

			assert.ok(this.oVM.oManagementTable, "management table exists");
			var aItems = this.oVM.oManagementTable.getItems();
			var aCells = aItems[1].getCells();

			var oInput = aCells[1];
			assert.ok(oInput, "expected input field");

			assert.equal(oInput.getValueState(), "Error", "expected error state");
		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);
			sap.ui.getCore().applyChanges();

			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM.onclick();

		sap.ui.getCore().applyChanges();
	});


	QUnit.module("VariantManagement Roles handling", {
		beforeEach: function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			page.addContent(this.oVM);

			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			page.removeContent(this.oVM);

			if (this.oCompContainer) {
				var oComponent = this.oCompContainer.getComponentInstance();
				oComponent.destroy();

				this.oCompContainer.destroy();
				this.oCompContainer = undefined;
			}

			this.oVM.destroy();

			this.clock.restore();
		}
	});

	QUnit.test("check roles inside managed views", function (assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", originalTitle: "One", rename: false, sharing: "public", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", originalTitle: "Two", contexts: {role: ["test"]}, originalContexts: {role: ["test"]}, remove: true, sharing: "private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", originalTitle: "Three", favorite: true, remove: true, sharing: "private", executeOnSelect: true, originalExecuteOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", originalTitle: "Four", contexts: {role: []}, originalContexts: {role: []}, favorite: false, originalFavorite: false, rename: false, sharing: "public", author: "B"}));

		this.oVM.setDefaultKey("3");

		sap.ui.getCore().applyChanges();

		var done = assert.async();

		this.oVM.attachManage(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters);

			FeaturesAPI.isContextSharingEnabled.restore();

			assert.ok(this.oCompContainer, "context sharing component exists");

			done();
		}.bind(this));


		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			var oIcon = null;
			var oRb = this.oVM._oRb;

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
			sap.ui.getCore().applyChanges();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function () {

			fOriginalManageCall();
			this.clock.tick(600);

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
			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oVM._oRolesDialog.attachAfterOpen(function() {

			var oCancelButton = sap.ui.getCore().byId(this.oVM.getId() + "-rolecancel");
			assert.ok(oCancelButton, "cancel button of roles dialog existst");

			var oTarget = oCancelButton.getFocusDomRef();
			assert.ok(oTarget, "dom ref of cancel button of roles dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
			sap.ui.getCore().applyChanges();

		}.bind(this));

		var fOriginalRolesCall = this.oVM._openRolesDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openRolesDialog").callsFake(function (oItem, oTextControl) {

			fOriginalRolesCall(oItem, oTextControl);
			this.clock.tick(600);

		}.bind(this));

		sinon.stub(FeaturesAPI, "isContextSharingEnabled").returns(Promise.resolve(true));

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
			FeaturesAPI.isContextSharingEnabled.restore();

			assert.ok(this.oCompContainer, "context sharing component exists");
			done();
		}.bind(this));

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {

			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of the save button inside SaveAs dialog exists");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			sap.ui.getCore().applyChanges();
			this.clock.tick(600);
		}.bind(this));


		var fOpenCall = this.oVM.oSaveAsDialog.open.bind(this.oVM.oSaveAsDialog);
		sinon.stub(this.oVM.oSaveAsDialog, "open").callsFake(function (sClass, oContext) {

			assert.ok(this.oVM.oInputName, "input entry should exists");
			this.oVM.oInputName.setValue("New");

			fOpenCall(sClass, oContext);
			sap.ui.getCore().applyChanges();
			this.clock.tick(6000);
		}.bind(this));

		sinon.stub(FeaturesAPI, "isContextSharingEnabled").returns(Promise.resolve(true));

		var oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openSaveAsDialog("STYLECLASS", oContextSharing);
				sap.ui.getCore().applyChanges();
			//}.bind(this));
		}.bind(this));

	});

});