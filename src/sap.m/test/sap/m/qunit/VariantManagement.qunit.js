/*global QUnit, sinon */
sap.ui.define([
	"sap/m/VariantItem",
	"sap/m/VariantManagement",
	"sap/ui/core/Element",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/BindingMode",
	"sap/base/Log"
], function(VariantItem, VariantManagement, Element, ContextSharingAPI, QUnitUtils, JSONModel, nextUIUpdate, mobileLibrary, KeyCodes, BindingMode, Log) {
	"use strict";

	// shortcut for sap.m.Sticky
	const Sticky = mobileLibrary.Sticky;

	const fChangeApplyAutomatic = async function(oManagementTable, iRow, vValue) {
		const aItems = oManagementTable.getItems();
		const aCells = aItems[iRow].getCells();

		const oExec = aCells[4].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oExec, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	const fChangeDefault = async function(oManagementTable, iRow, vValue) {
		const aItems = oManagementTable.getItems();
		const aCells = aItems[iRow].getCells();

		const oDefault = aCells[3].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDefault, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	const fChangeDelete = async function(oManagementTable, iRow, vValue) {
		const aItems = oManagementTable.getItems();
		const aCells = aItems[iRow].getCells();

		const oDelete = aCells[7].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDelete, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	const fChangeFavorite = async function(oManagementTable, iRow, vValue) {
		const aItems = oManagementTable.getItems();
		const aCells = aItems[iRow].getCells();

		const oFavorite = aCells[0].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("click", oFavorite, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	const fChangeTitle = async function(oManagementTable, iRow, vValue, bFocusOut) {
		const aItems = oManagementTable.getItems();
		const aCells = aItems[iRow].getCells();

		const oInput = aCells[1];
		oInput.focus();
		oInput.$("inner").val(vValue);
		if (bFocusOut) {
			aCells[7].focus(); // delete button
			await new Promise((resolve) => {setTimeout(resolve, 100);}); // wait for the async setting of title
		} else {
			QUnitUtils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		}
		await nextUIUpdate();
	};


	QUnit.module("VariantManagement tests", {
		beforeEach:  function() {
			this.oVM = new VariantManagement("VM1");
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		assert.equal(this.oVM.getItems().length, 2, "with two items");
	});

	QUnit.test("VariantManagement with selected key", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));

		const oTitle = Element.getElementById(this.oVM.getId() + "-text");
		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "", "expected no text");

		this.oVM.setSelectedKey("2");

		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "Two", "expected text");

		assert.equal(this.oVM.getSelectedKey(), "2", "expected selected key");
	});

	QUnit.test("VariantManagement check title", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		assert.equal(this.oVM.getTitle().getText(), "Two", "expected text");

		const aItems = this.oVM.getItems();
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
		const oVMI1 = new VariantItem("VMI1", {key: "1", title:"One"});
		const oVMI2 = new VariantItem("VMI2", {key: "2", title:"Two"});

		this.oVM._clearDeletedItems();
		this.oVM._addDeletedItem(oVMI1);

		assert.ok(this.oVM._isItemDeleted(oVMI1), "item is deleted.");
		assert.ok(!this.oVM._isItemDeleted(oVMI2), "item is not deleted.");
		oVMI1.destroy();
		oVMI2.destroy();
	});

	QUnit.test("VariantManagement check aria-expanded initial state", async function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.setSelectedKey("1");

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		const sAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sAriaExpanded, "false", "aria-expanded should be 'false' after initial rendering");
	});

	QUnit.test("VariantManagement check aria-expanded attribute", async function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("1");

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		// Assert initial state - should be false
		const sInitialAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sInitialAriaExpanded, "false", "aria-expanded should initially be 'false'");

		const done = assert.async();

		// Mock the variant list opening to test aria-expanded behavior
		const fOriginalOpenVariantList = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function() {
			fOriginalOpenVariantList();

			// Verify aria-expanded is set to true when opening
			const sExpandedValue = oTriggerButton.$().attr("aria-expanded");
			assert.equal(sExpandedValue, "true", "aria-expanded should be 'true' when variant list opens");

			// Test closing behavior
			if (this.oVariantPopOver && this.oVariantPopOver.isOpen()) {
				this.oVariantPopOver.attachAfterClose(function() {
					// Wait a bit for the timeout in afterClose to execute (longer than the 200ms timeout in the implementation)
					setTimeout(function() {
						const sCollapsedValue = oTriggerButton.$().attr("aria-expanded");
						assert.equal(sCollapsedValue, "false", "aria-expanded should be 'false' when variant list closes");
						done();
					}, 250);
				});
				this.oVariantPopOver.close();
			} else {
				done();
			}
		}.bind(this));

		// Act
		this.oVM.onclick();
	});

	QUnit.test("VariantManagement check aria-expanded attribute in error state", async function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.setSelectedKey("1");
		this.oVM.setInErrorState(true);

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		// Assert initial state - should be false
		const sInitialAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sInitialAriaExpanded, "false", "aria-expanded should initially be 'false'");

		const done = assert.async();

		// Mock the error state opening to test aria-expanded behavior
		const fOriginalOpenInErrorState = this.oVM._openInErrorState.bind(this.oVM);
		sinon.stub(this.oVM, "_openInErrorState").callsFake(function() {
			fOriginalOpenInErrorState();

			// In error state, aria-expanded should remain false since the variant list doesn't open
			const sExpandedValue = oTriggerButton.$().attr("aria-expanded");
			assert.equal(sExpandedValue, "false", "aria-expanded should remain 'false' in error state since variant list doesn't open");

			// Test closing behavior for error popover
			if (this.oErrorVariantPopOver && this.oErrorVariantPopOver.isOpen()) {
				this.oErrorVariantPopOver.attachAfterClose(function() {
					// Wait a bit for the timeout in afterClose to execute (longer than the 200ms timeout in the implementation)
					setTimeout(function() {
						const sCollapsedValue = oTriggerButton.$().attr("aria-expanded");
						assert.equal(sCollapsedValue, "false", "aria-expanded should remain 'false' after error popover closes");
						done();
					}, 250);
				});
				this.oErrorVariantPopOver.close();
			} else {
				done();
			}
		}.bind(this));

		// Act
		this.oVM.onclick();
	});

	QUnit.module("VariantManagement variantlist", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM .placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check items", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: false}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false}));
		this.oVM.setSelectedKey("2");

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		let bSelectCalled = false;

		this.oVM.attachSelect(function(oEvent) {
			const mParameters = oEvent.getParameters();

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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		const done = assert.async();

		this.oVM.attachSelect(function(oEvent) {
			const mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");

			done();
		}.bind(this));

		this.oVM.setCurrentVariantKey("1");
	});

	QUnit.test("check event 'save'", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", changeable: true}));

		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		const done = assert.async();

		this.oVM.attachSave(function(oEvent) {
			const mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "2", "key expected");
			assert.ok(mParameters.overwrite, "overwrite should be true");

			done();
		});

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "should be visible");

			const oTarget = this.oVM.oVariantSaveBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});


	QUnit.test("check title", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowFooter(false);

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(!this.oVM.getShowFooter(), "expect to see the footer");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with modified=false", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowSaveAs(false);

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);
		this.oVM.setModified(true);

		this.oVM.setPopoverTitle("My List");

		const done = assert.async();

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
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

	QUnit.test("check opening the variant list display in simulated designmode", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));

		sinon.stub(this.oVM, "_openVariantList");

		this.oVM.setDesignMode(true);
		this.oVM.onclick();
        assert.ok(!this.oVM._openVariantList.called);

		this.oVM.setDesignMode(false);
		this.oVM.onclick();
        assert.ok(this.oVM._openVariantList.called);
	});

	QUnit.test("check no data available", async function(assert) {
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"View1"}));

		this.oVM.onclick();
		await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until opened
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		let sSearchText = "XXX";
		const oEvent = {
			getParameters: function() { return {newValue: sSearchText};}
		};

		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"View2"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"View3"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"View4"}));
		this.oVM.addItem(new VariantItem("VMI5", {key: "5", title:"View5"}));
		this.oVM.addItem(new VariantItem("VMI6", {key: "6", title:"View6"}));
		this.oVM.addItem(new VariantItem("VMI7", {key: "7", title:"View7"}));
		this.oVM.addItem(new VariantItem("VMI8", {key: "8", title:"View8"}));
		this.oVM.addItem(new VariantItem("VMI9", {key: "9", title:"View9"}));
		this.oVM.addItem(new VariantItem("VMI10", {key: "10", title:"View10"}));

		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataFoundIllustratedMessage, "expected illustrated message found");

		sSearchText = "View";
		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		this.oVM.destroyItems();
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");
	});

	QUnit.module("VariantManagement SaveAs dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check opens", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		const done = assert.async();

		const fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with supportPublic & supportDefault & supportApplyAutomatically set to false", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setSupportPublic(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportDefault(false);

		const done = assert.async();

		const fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with show Tile", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");
		this.oVM._setShowCreateTile(true);

		const done = assert.async();

		const fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check text selection in save as dialog", function(assert) {

		_createSaveAsDialog.call(this, assert);
		const fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);

		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(async (oEvent) => {
			fOriginalSaveAsCall(oEvent);

			// Check if the whole text is selected
			assert.ok(this.oVM.oInputName.getSelectedText().length === this.oVM.oInputName.getValue().length, "text should be selected");

			// Close the dialog to finish the test
			this.oVM._cancelPressed();

			await nextUIUpdate();
		});

	});

	QUnit.test("check event 'save' on save button press", function(assert) {

		const triggerAction = (target) => {
			QUnitUtils.triggerTouchEvent("tap", target, {
				srcControl: null
			});
		};
		_checkSaveAction.call(this, assert, triggerAction);
	});

	QUnit.test("check event 'save' on enter key press", function(assert) {

		const triggerAction = (target) => {
			QUnitUtils.triggerKeydown(target, KeyCodes.ENTER);
		};

		_checkSaveAction.call(this, assert, triggerAction);

	});

	/**
	 * Creates the Save As dialog with mocked data
	 * @param {QUnit.Assert} assert - QUnit assert object
	 */
	function _createSaveAsDialog(assert) {
		// Add variant items
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));


		this.oVM.attachSave(function(oEvent) {
			const mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(mParameters.def, "default flag expected");
			assert.ok(mParameters.execute, "execute flag expected");
			assert.ok(mParameters.public, "public flag expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog);
	}

	/**
	 * Test function to check 'save' event
	 * @param {QUnit.Assert} assert - QUnit assert object
	 * @param {VoidFunction} triggerAction - function to trigger the save action (either click or keypress)
	 */
	function _checkSaveAction(assert, triggerAction) {
		_createSaveAsDialog.call(this, assert);
		const done = assert.async();

		this.oVM.oSaveAsDialog.attachAfterClose(function(oEvent) {
			done();
		});

		const fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);

		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(async (oEvent) => {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oInputName, "should exists");
			this.oVM.oInputName.setValue("New");

			assert.ok(this.oVM.oDefault, "should exists");
			this.oVM.oDefault.setSelected(true);

			assert.ok(this.oVM.oPublic, "should exists");
			this.oVM.oPublic.setSelected(true);

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			this.oVM.oExecuteOnSelect.setSelected(true);

			const oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget);
			// Use the provided triggerAction function to simulate user action
			triggerAction(oTarget);

			await nextUIUpdate();

		});

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async(oEvent) => {
			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		});

		this.oVM.onclick();
	}

	QUnit.module("VariantManagement Manage dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});
	QUnit.test("check opens", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementDialog, "manage dialog exist");

			assert.ok(this.oVM.oManagementTable, "management table exists");
			assert.equal(this.oVM.oManagementTable.getSticky().length, 1);
			assert.equal(this.oVM.oManagementTable.getSticky()[0], Sticky.ColumnHeaders, "management table has sticky column headers");
			const aColumns = this.oVM.oManagementTable.getColumns();
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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
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

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aColumns = this.oVM.oManagementTable.getColumns();
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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check items", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			let i, j, aCells, oControl, sTemp, bSkip;

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

				const sIdPrefix = this.oVM.getId() + "-manage-";

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

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'cancel'", async function(assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));
		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManageCancel(function(oEvent) {

			assert.equal(this.oVM.getDefaultKey(), "3", "default reverted correctly");

			const aItems = this.oVM.getItems();
			assert.ok(aItems, "items exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (let i = 0; i < aItems.length; i++) {

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

			let aItems = this.oVM.oManagementTable.getItems();
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
			await fChangeTitle(this.oVM.oManagementTable, 2, "newName2", true);
			await fChangeDelete(this.oVM.oManagementTable, 2);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), false,  "item 2 is not visible");

			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");

			let oOrigItem;
			for (let i = 0; i < aItems.length; i++) {
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

			const oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));


		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected items");

		}.bind(this));


		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'manage'", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		const done = assert.async();

		this.oVM.attachManage(function(oEvent) {
			const mParameters = oEvent.getParameters();
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

			let aItems = this.oVM.oManagementTable.getItems();
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


			const oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

		}.bind(this));


		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check manage dialog with dublicate entries", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		const done = assert.async();

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		const fOriginalSaveHandler = this.oVM._handleManageSavePressed.bind(this.oVM);
		sinon.stub(this.oVM, "_handleManageSavePressed").callsFake(function (oEvent) {
			fOriginalSaveHandler();

			assert.ok(this.oVM.oManagementTable, "management table exists");
			const aItems = this.oVM.oManagementTable.getItems();
			const aCells = aItems[1].getCells();

			const oInput = aCells[1];
			assert.ok(oInput, "expected input field");

			assert.equal(oInput.getValueState(), "Error", "expected error state");

			const oTarget = this.oVM.oManagementCancel.getFocusDomRef();
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


			const oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(async function (oEvent) {

			await fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");
		}.bind(this));


		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test('check manage dialog Save shortcut key', function(assert) {

		_createMockVariantManagementDialog.call(this);

		sinon.stub(this.oVM, "_openManagementDialog").callsFake(async function (oEvent) {

			// simulate Enter key press on Save button
			const oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerKeydown(oTarget, KeyCodes.ENTER, false, false, true);

			await nextUIUpdate();

		}).bind(this);

		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");

	});

	QUnit.test("check manage dialog Save behavour", function(assert) {
		_createMockVariantManagementDialog.call(this);

		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");

		const oRow = this.oVM._getRowForKey("3");
		assert.ok(oRow, "expected row found");

		const oInput = oRow.getCells()[VariantManagement.COLUMN_NAME_IDX];
		assert.ok(oInput, "expected input found");
		oInput.setValueState("Error");
		assert.ok(!this.oVM._handleManageSavePressed(), "expected errors detected");

		const oView = this.oVM.getItemByKey("3");
		assert.ok(oView, "expected view found");
		this.oVM._handleManageDeletePressed(oView);
		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");
	});

	function _createMockVariantManagementDialog() {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		this.oVM._openManagementDialog();
	}

	QUnit.module("VariantManagement Manage dialog with external items binding", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check binding on items is propagated into dialog", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", author: "A", favorite: true, visible: true, sharingMode: "Public"},
			{variantKey: "2", variantTitlePart1: "Two", variantTitlePart2: " and Two", favorite: false, visible: true, sharingMode: "Private"},
			{variantKey: "3", variantTitlePart1: "Three", variantTitlePart2: " and Three", favorite: false, visible: false, sharingMode: "Public"}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: {parts: [{path: 'variantTitlePart1'}, {path: 'variantTitlePart2'}], formatter: (part1, part2) => `Title: ${part1}${part2}`},
				author: "Constant Author",
				visible: "{visible}",
				sharing: "{sharingMode}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 2,  "expected count of items in the management table exists");

			let aCells = aItems[0].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
			assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive");
			let oBinding = aCells[0].getBinding("src");
			assert.ok(oBinding.getModel().isA("sap.ui.model.base.ManagedObjectModel"), "Icon bound to Managed Object Model");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
			assert.equal(aCells[1].getValue(), "Title: One and One", "expected title found");

			assert.equal(aCells[2].getText(), "Public", "expected sharing info resolved via 'sharingMode' path");
			assert.ok(aCells[3].getSelected(), "expected default info found");
			assert.ok(!aCells[4].getSelected(), "expected apply automatically info found");
			assert.equal(aCells[6].getText(), "Constant Author", "expected author found");
			assert.ok(aItems[0].getVisible(), "expected visibility found");

			oBinding = aCells[8].getBinding("text");
			assert.equal(oBinding.getPath(), "variantKey", "Text bound to outer model");
			assert.equal(oBinding.getModel(), oVariantsModel, "Text bound to outer model");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			aCells = aItems[1].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");

			assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
			assert.equal(aCells[1].getValue(), "Title: Two and Two", "expected title found");

			assert.equal(aCells[2].getText(), "Private", "expected sharing info resolved via 'sharingMode' path");
			assert.ok(!aCells[3].getSelected(), "expected default info found");
			assert.ok(!aCells[4].getSelected(), "expected apply automatically info found");
			assert.equal(aCells[6].getText(), "Constant Author", "expected author found");
			assert.ok(aItems[1].getVisible(), "expected visibility found");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("Fall back to 'text' binding when 'title' is not bound in the template", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", author: "A", visible: true},
			{variantKey: "2", variantName: "Custom View", author: "B", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				text: "{variantName}",
				author: "{author}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.equal(aItems.length, 2, "expected count of items in the management table exists");

			const aCells = aItems[0].getCells();
			assert.ok(aCells[1].isA("sap.m.Input"), "expected controltype found");
			assert.equal(aCells[1].getValue(), "Standard", "expected title found via 'text' fallback");

			const aCells2 = aItems[1].getCells();
			assert.equal(aCells2[1].getValue(), "Custom View", "expected title found via 'text' fallback");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("Fall back to Managed Object Model for favorite binding, in case it's given as constant", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", author: "A", favorite: true, visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: {parts: [{path: 'variantTitlePart1'}, {path: 'variantTitlePart2'}], formatter: (part1, part2) => `Title: ${part1}${part2}`},
				author: "Constant Author",
				favorite: true
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 1,  "expected count of items in the management table exists");

			const aCells = aItems[0].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
			assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive");

			const oBinding = aCells[0].getBinding("src");
			const favoriteModel = oBinding.getModel();
			assert.ok(favoriteModel.isA("sap.ui.model.base.ManagedObjectModel"), "expected Managed Object Model found");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("search filters by 'title' on the path resolved from the items template", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", createdBy: "A", visible: true},
			{variantKey: "2", variantName: "Custom View", createdBy: "B", visible: true},
			{variantKey: "3", variantName: "Other", createdBy: "C", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const oManagementTable = this.oVM.oManagementTable;
			assert.equal(oManagementTable.getItems().length, 3, "all three rows visible before search");

			this.oVM._triggerSearchInManageDialogByValue("Custom", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "search by title via 'variantName' path matches one row");
			assert.equal(oManagementTable.getItems()[0].getCells()[1].getValue(), "Custom View", "matched row shows the expected title");

			this.oVM._triggerSearchInManageDialogByValue("", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 3, "clearing the search restores all rows");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("search filters by 'title' via the 'text' fallback when only 'text' is bound", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", createdBy: "A", visible: true},
			{variantKey: "2", variantName: "Custom View", createdBy: "B", visible: true},
			{variantKey: "3", variantName: "Other", createdBy: "C", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				text: "{variantName}",
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const oManagementTable = this.oVM.oManagementTable;
			assert.equal(oManagementTable.getItems().length, 3, "all three rows visible before search");

			this.oVM._triggerSearchInManageDialogByValue("Custom", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "search by title falls back to the 'text' binding path");
			assert.equal(oManagementTable.getItems()[0].getCells()[1].getValue(), "Custom View", "matched row shows the expected title");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("VariantItem-specific properties not in template are read from MOM (named model)", async function(assert) {
		// Regression test for the bug introduced by 1968f0c: when the items aggregation is bound to a
		// named external model and the template omits VariantItem-specific properties (favorite, sharing,
		// executeOnSelect), those properties must be read from the ManagedObjectModel — not from the
		// external model (which doesn't have them and would trigger failing OData requests).
		const oExtModel = new JSONModel({
			variants: [
				{variantKey: "std",  variantTitle: "Standard"},
				{variantKey: "priv", variantTitle: "My View"}
			]
		});

		this.oVM.setModel(oExtModel, "ext");

		// Template deliberately omits favorite and sharing — simulates a real OData scenario.
		this.oVM.bindAggregation("items", {
			path: "ext>/variants",
			template: new VariantItem("VMI", {
				key: "{ext>variantKey}",
				title: "{ext>variantTitle}"
			})
		});

		this.oVM.setDefaultKey("std");

		await nextUIUpdate();

		// fl layer sets VariantItem-specific values after the binding resolves.
		const [oStd, oPriv] = this.oVM.getItems();
		oStd.setFavorite(true);
		oStd.setSharing("Public");
		oPriv.setFavorite(false);
		oPriv.setSharing("Private");

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			const aItems = this.oVM.oManagementTable.getItems();
			assert.equal(aItems.length, 2, "both rows shown");

			// Row 1 (Standard): favorite=true → filled star, sharing=Public
			const aCells0 = aItems[0].getCells();
			assert.equal(aCells0[0].getSrc(), "sap-icon://favorite", "row 1: favorite icon shows filled star");
			assert.ok(aCells0[0].getBinding("src").getModel().isA("sap.ui.model.base.ManagedObjectModel"),
				"row 1: favorite src is bound to MOM, not the external model");
			assert.equal(aCells0[2].getText(), "Public", "row 1: sharing text reads from MOM");

			// Row 2 (My View): favorite=false → unfilled star, sharing=Private
			const aCells1 = aItems[1].getCells();
			assert.equal(aCells1[0].getSrc(), "sap-icon://unfavorite", "row 2: favorite icon shows unfilled star");
			assert.equal(aCells1[2].getText(), "Private", "row 2: sharing text reads from MOM");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function(oEvent) {
			fOriginalCall(oEvent);
			await new Promise((resolve) => {setTimeout(resolve, 100);});
			QUnitUtils.triggerTouchEvent("tap", this.oVM.oVariantManageBtn.getFocusDomRef(), {srcControl: null});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("favorite bound to named external model is respected and not overridden by MOM", async function(assert) {
		// When the template explicitly binds favorite to the external model, fnCreateBinding must
		// use that template binding — not fall back to the MOM absolute path.
		const oExtModel = new JSONModel({
			variants: [
				{variantKey: "1", variantTitle: "Standard", isFav: false},
				{variantKey: "2", variantTitle: "My View",  isFav: true}
			]
		});

		this.oVM.setModel(oExtModel, "ext");

		this.oVM.bindAggregation("items", {
			path: "ext>/variants",
			template: new VariantItem("VMI", {
				key: "{ext>variantKey}",
				title: "{ext>variantTitle}",
				favorite: "{ext>isFav}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			const aItems = this.oVM.oManagementTable.getItems();
			const oSrcBinding = aItems[0].getCells()[0].getBinding("src");

			// The binding must point to the external model path, not the MOM absolute path.
			assert.equal(oSrcBinding.getModel(), oExtModel,
				"favorite src binding uses the external model, not the MOM");
			assert.equal(oSrcBinding.getPath(), "isFav",
				"favorite src binding path comes from the template (isFav), not the MOM path");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function(oEvent) {
			fOriginalCall(oEvent);
			await new Promise((resolve) => {setTimeout(resolve, 100);});
			QUnitUtils.triggerTouchEvent("tap", this.oVM.oVariantManageBtn.getFocusDomRef(), {srcControl: null});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("runtime MOM update is reflected when favorite is a constant in the template", async function(assert) {
		// Regression test for the !isPropertyInitial bug: a static constant in the template
		// (favorite: true) must not pin the binding to that value. The MOM reflects runtime
		// updates from the fl layer (setFavorite), so the dialog must read from the MOM.
		const oExtModel = new JSONModel({
			variants: [
				{variantKey: "1", variantTitle: "Standard"},
				{variantKey: "2", variantTitle: "My View"}
			]
		});

		this.oVM.setModel(oExtModel, "ext");

		this.oVM.bindAggregation("items", {
			path: "ext>/variants",
			template: new VariantItem("VMI", {
				key: "{ext>variantKey}",
				title: "{ext>variantTitle}",
				favorite: true   // static constant — fl layer overrides this at runtime
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		// fl layer overrides the constant — the dialog must reflect these values, not the constant.
		const [oStd, oCustom] = this.oVM.getItems();
		oStd.setFavorite(true);
		oCustom.setFavorite(false); // overrides the constant true → must show unfavorite

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			const aItems = this.oVM.oManagementTable.getItems();
			const aCells0 = aItems[0].getCells();
			const aCells1 = aItems[1].getCells();

			assert.ok(aCells0[0].getBinding("src").getModel().isA("sap.ui.model.base.ManagedObjectModel"),
				"favorite src binding uses MOM even though template had a constant");
			assert.equal(aCells0[0].getSrc(), "sap-icon://favorite",    "row 1: MOM value true shown");
			assert.equal(aCells1[0].getSrc(), "sap-icon://unfavorite",  "row 2: MOM value false shown, not the constant true");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function(oEvent) {
			fOriginalCall(oEvent);
			await new Promise((resolve) => {setTimeout(resolve, 100);});
			QUnitUtils.triggerTouchEvent("tap", this.oVM.oVariantManageBtn.getFocusDomRef(), {srcControl: null});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("search filters by 'author' on the path resolved from the items template", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", createdBy: "Alice", visible: true},
			{variantKey: "2", variantName: "Custom View", createdBy: "Bob", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const oManagementTable = this.oVM.oManagementTable;
			this.oVM._triggerSearchInManageDialogByValue("Bob", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "search by author via 'createdBy' path matches one row");
			assert.equal(oManagementTable.getItems()[0].getCells()[6].getText(), "Bob", "matched row shows the expected author");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("static 'visible: true' on the template shows all rows in the manage dialog", async function(assert) {
		// Model deliberately does not contain a 'visible' field — visibility is fixed via the template constant.
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", createdBy: "A"},
			{variantKey: "2", variantName: "Custom View", createdBy: "B"}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{createdBy}",
				visible: true
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const aItems = this.oVM.oManagementTable.getItems();
			assert.equal(aItems.length, 2, "both rows are shown when 'visible' is a constant true on the template");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("static 'visible: false' on the template results in an empty manage dialog table", async function(assert) {
		// Model has "visible: true" everywhere but the constant 'false' on the template wins and the table must be empty.
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Standard", createdBy: "A", visible: true},
			{variantKey: "2", variantName: "Custom View", createdBy: "B", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{createdBy}",
				visible: false
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.equal(this.oVM.oManagementTable.getItems().length, 0, "no rows are shown when 'visible' is a constant false on the template");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("complex (formatter) 'title' binding: search uses the formatted value", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", createdBy: "A", visible: true},
			{variantKey: "2", variantTitlePart1: "Two", variantTitlePart2: " and Two", createdBy: "B", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: {parts: [{path: "variantTitlePart1"}, {path: "variantTitlePart2"}], formatter: (a, b) => `Title: ${a}${b}`},
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const oManagementTable = this.oVM.oManagementTable;
			const oWarning = sinon.spy(Log, "warning");

			// "Title: Two" only appears in the *formatted* title of row 2 — neither raw part contains it.
			// This proves the search evaluates the formatter rather than filtering on a part path.
			this.oVM._triggerSearchInManageDialogByValue("Title: Two", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "complex title binding: formatter is evaluated for search");
			assert.equal(oManagementTable.getItems()[0].getCells()[1].getValue(), "Title: Two and Two", "matched row shows the expected formatted title");
			assert.notOk(oWarning.called, "no warning is logged for client-side complex bindings");

			oWarning.restore();
			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("complex (formatter) 'title' binding: consecutive searches see the full data set", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", createdBy: "A", visible: true},
			{variantKey: "2", variantTitlePart1: "Two", variantTitlePart2: " and Two", createdBy: "B", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: {parts: [{path: "variantTitlePart1"}, {path: "variantTitlePart2"}], formatter: (a, b) => `Title: ${a}${b}`},
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			const oManagementTable = this.oVM.oManagementTable;

			// First search narrows the table to row 1.
			this.oVM._triggerSearchInManageDialogByValue("Title: One", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "first search matches row 1 only");

			// Second search (replacing the query without clearing) must still see row 2,
			// even though the previous filter narrowed the binding to row 1.
			this.oVM._triggerSearchInManageDialogByValue("Title: Two", oManagementTable);
			assert.equal(oManagementTable.getItems().length, 1, "second search matches row 2 only");
			assert.equal(oManagementTable.getItems()[0].getCells()[1].getValue(), "Title: Two and Two", "second search returns the row that was filtered out by the first search");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("reopening the manage dialog resets search and filter", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", createdBy: "A", visible: true},
			{variantKey: "2", variantTitlePart1: "Two", variantTitlePart2: " and Two", createdBy: "B", visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: {parts: [{path: "variantTitlePart1"}, {path: "variantTitlePart2"}], formatter: (a, b) => `Title: ${a}${b}`},
				author: "{createdBy}",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();
		let nOpenCount = 0;

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);
			nOpenCount++;

			const oManagementTable = this.oVM.oManagementTable;

			if (nOpenCount === 1) {
				// First open: narrow the table via search, then close and reopen.
				this.oVM._triggerSearchInManageDialogByValue("Title: One", oManagementTable);
				assert.equal(oManagementTable.getItems().length, 1, "first open: search narrows the table");

				this.oVM.oManagementDialog.close();
				this.oVM._openManagementDialog();
			} else if (nOpenCount === 2) {
				assert.equal(this.oVM._oSearchFieldOnMgmtDialog.getValue(), "", "reopen: search field is empty");
				assert.equal(oManagementTable.getItems().length, 2, "reopen: table shows all rows");
				done();
			}

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("delete returns the next visible row when items binding renames key path", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "One",   author: "A", isShown: true,  remove: false},
			{variantKey: "2", variantName: "Two",   author: "B", isShown: true,  remove: true},
			{variantKey: "3", variantName: "Three", author: "C", isShown: true,  remove: true},
			{variantKey: "4", variantName: "Four",  author: "D", isShown: false, remove: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{author}",
				visible: "{isShown}",
				remove: "{remove}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			// Deleting "2" should focus on the next visible row, "3"
			const oVariantItem2 = this.oVM.getItemByKey("2");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "expected a result");
			assert.ok(oResult.isA?.("sap.m.ColumnListItem"), "expected a ColumnListItem (table row)");
			assert.ok(oResult !== this.oVM.oManagementCancel, "must not fall back to the cancel button");

			const oResolvedItem = this.oVM._findVariantItem(oResult.getBindingContext(this.oVM._sModelName));
			assert.strictEqual(oResolvedItem.getKey(), "3", "next visible row is the row for variant '3'");

			done();

		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("duplicate name in manage dialog flags ValueState.Error when items binding renames key/visible paths", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantName: "Alpha", author: "A", isShown: true},
			{variantKey: "2", variantName: "Beta",  author: "A", isShown: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem("VMI", {
				key: "{variantKey}",
				title: "{variantName}",
				author: "{author}",
				visible: "{isShown}",
				rename: true
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		this.oVM._createManagementDialog();
		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});
		this.oVM.oManagementDialog.attachAfterOpen(async function() {
			// Type the title of row 0 ("Alpha") into row 1's input — exercises the manage-table
			// duplicate detection (the saved-VariantItem check would still see "Beta" on row 1).
			await fChangeTitle(this.oVM.oManagementTable, 1, "Alpha");

			const oInput = this.oVM.oManagementTable.getItems()[1].getCells()[VariantManagement.COLUMN_NAME_IDX];
			assert.equal(oInput.getValueState(), "Error", "duplicate flagged via VariantItem accessors, not raw model field names");

			const oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.module("VariantManagement _findNextFocusTargetAfterDelete", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.addItem(new VariantItem("VMI1", {
				key: "1",
				title: "Standard",
				favorite: true,
				remove: false
			}));
			this.oVM.addItem(new VariantItem("VMI2", {
				key: "2",
				title: "Item 2",
				favorite: true,
				remove: true
			}));
			this.oVM.addItem(new VariantItem("VMI3", {
				key: "3",
				title: "Item 3",
				favorite: false,
				remove: true
			}));
			this.oVM.addItem(new VariantItem("VMI4", {
				key: "4",
				title: "Item 4",
				favorite: true,
				remove: true
			}));
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("no management table returns cancel button", function(assert) {
		// Test when no management table exists
		const oVariantItem = this.oVM.getItemByKey("2");
		const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem);

		assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when no management table exists");
	});

	QUnit.test("no variant item returns cancel button", function(assert) {
		const done = assert.async();

		// Open management dialog to create the table
		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test with null variant item
			let oResult = this.oVM._findNextFocusTargetAfterDelete(null);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is null");

			// Test with undefined variant item
			oResult = this.oVM._findNextFocusTargetAfterDelete(undefined);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is undefined");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("variant not found returns cancel button", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Create a mock variant item that doesn't exist in the table
			const oMockVariantItem = {
				getKey: function() { return "nonexistent"; }
			};

			const oResult = this.oVM._findNextFocusTargetAfterDelete(oMockVariantItem);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is not found in table");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns next visible row", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting item "2", should return the row for item "3"
			const oVariantItem2 = this.oVM.getItemByKey("2");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			// Verify it's the correct row by checking the binding context
			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "3", "Should return the row for item '3'");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns previous row when no next row", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting the last item "4", should return the previous row for item "3"
			const oVariantItem4 = this.oVM.getItemByKey("4");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem4);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "3", "Should return the previous row for item '3' when no next row available");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns previous row when next row is invisible", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide the last row (item 4) to simulate no next visible row
			const aTableItems = this.oVM.oManagementTable.getItems();
			let oRowToHide = null;

			for (let i = 0; i < aTableItems.length; i++) {
				const oRow = aTableItems[i];
				const oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					const oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "4") {
						oRowToHide = oRow;
						break;
					}
				}
			}

			if (oRowToHide) {
				oRowToHide.setVisible(false);
			}

			// Test deleting item "3", should return previous row for item "2" since next row is hidden
			const oVariantItem3 = this.oVM.getItemByKey("3");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem3);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "2", "Should return the previous row for item '2' when next row is hidden");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns cancel button when only one item", function(assert) {
		const done = assert.async();

		// Remove all items except one to test the edge case
		this.oVM.removeItem(this.oVM.getItemByKey("2")).destroy();
		this.oVM.removeItem(this.oVM.getItemByKey("3")).destroy();
		this.oVM.removeItem(this.oVM.getItemByKey("4")).destroy();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting the only remaining item "1", should return cancel button
			const oVariantItem1 = this.oVM.getItemByKey("1");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem1);

			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when deleting the only remaining item");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("skips invisible previous rows", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide both the next row (item 4) and immediate previous row (item 2)
			const aTableItems = this.oVM.oManagementTable.getItems();

			for (let i = 0; i < aTableItems.length; i++) {
				const oRow = aTableItems[i];
				const oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					const oRowItem = oBindingContext.getObject();
					if (oRowItem && (oRowItem.getKey() === "2" || oRowItem.getKey() === "4")) {
						oRow.setVisible(false);
					}
				}
			}

			// Test deleting item "3", should skip hidden item "2" and return item "1"
			const oVariantItem3 = this.oVM.getItemByKey("3");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem3);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "1", "Should skip invisible previous row and return the next available previous row for item '1'");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("handles invisible rows", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide the next row (item 3) to test skipping invisible rows
			const aTableItems = this.oVM.oManagementTable.getItems();
			let oRowToHide = null;

			for (let i = 0; i < aTableItems.length; i++) {
				const oRow = aTableItems[i];
				const oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					const oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "3") {
						oRowToHide = oRow;
						break;
					}
				}
			}

			if (oRowToHide) {
				oRowToHide.setVisible(false);
			}

			// Test deleting item "2", should skip invisible item "3" and return item "4"
			const oVariantItem2 = this.oVM.getItemByKey("2");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "4", "Should skip invisible row and return the row for item '4'");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("handles row without binding context", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Find the row for item "3" and stub its getBindingContext to return null
			const aTableItems = this.oVM.oManagementTable.getItems();
			let oRowToStub = null;

			for (let i = 0; i < aTableItems.length; i++) {
				const oRow = aTableItems[i];
				const oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					const oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "3") {
						oRowToStub = oRow;
						break;
					}
				}
			}

			if (oRowToStub) {
				sinon.stub(oRowToStub, "getBindingContext").returns(null);
			}

			// Test deleting item "2", should skip item "3" (no binding context) and return item "4"
			const oVariantItem2 = this.oVM.getItemByKey("2");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "4", "Should skip row without binding context and return the row for item '4'");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.module("VariantManagement Manage dialog busy state with dynamic variants callback", {
		beforeEach: async function() {
			let oPromiseResolve;
			this.oPromise = new Promise(function(resolve) {
				oPromiseResolve = resolve;
			});
			this.oPromiseResolve = oPromiseResolve;

			this.oVM = new VariantManagement("VM1");
			// Set the dynamic variants loaded callback to return the promise, simulating async loading of variants for the management dialog
			this.oVM.setDynamicVariantsLoadedCallback(() => {
				return this.oPromise;
			});

			this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
			this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check table busy state is set and cleared during management dialog opening with promise callback", function(assert) {
		const done = assert.async();

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		const oRebindVMTableSpy = sinon.spy(this.oVM, "_rebindVMTable");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// At this point, busy state should be true since promise is not resolved yet
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called");
			assert.ok(this.oVM.oManagementTable.getBusy(), "table should be busy while promise is pending");

			// Now resolve the promise
			this.oPromiseResolve();

			// Wait for promise to resolve and busy state to clear
			this.oPromise.then(function() {
				return new Promise(function(resolve) {setTimeout(resolve, 10);});
			}).then(function() {
				// Verify setBusy was called with false after promise resolved
				assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called");
				assert.ok(oRebindVMTableSpy.calledWith(true), "_rebindVMTable should have been called");

				// Verify the order: setBusy(true) should be called before setBusy(false)
				let bTrueCalledFirst = false;
				for (let i = 0; i < oSetBusySpy.callCount; i++) {
					if (oSetBusySpy.getCall(i).args[0] === true) {
						bTrueCalledFirst = true;
					}
					if (oSetBusySpy.getCall(i).args[0] === false && bTrueCalledFirst) {
						assert.ok(true, "setBusy(true) was called before setBusy(false)");
						break;
					}
				}

				// Verify final state is not busy
				assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after promise resolves");

				oSetBusySpy.restore();
				oRebindVMTableSpy.restore();
				this.oVM.oManagementDialog.close();
				done();
			}.bind(this));
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.module("VariantManagement Manage dialog busy state", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check table binding is suspended during dialog opening", function(assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSuspendSpy = sinon.spy(this.oVM, "_suspendManagementTableBinding");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify _suspendManagementTableBinding was called
			assert.ok(oSuspendSpy.calledOnce, "_suspendManagementTableBinding should have been called once");

			oSuspendSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state with rebind required", function(assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		// Force rebind to be required
		this.oVM._bRebindRequired = true;

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		const oRebindSpy = sinon.spy(this.oVM, "_rebindVMTable");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify setBusy was NOT called since there's no promise callback
			assert.ok(!oSetBusySpy.called, "setBusy should not have been called without promise callback");

			// Verify rebind was called
			assert.ok(oRebindSpy.called, "_rebindVMTable should have been called when _bRebindRequired is true");

			// Verify final state is not busy
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens");

			oSetBusySpy.restore();
			oRebindSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state clears correctly when no items exist", function(assert) {
		const done = assert.async();

		// No items added - empty table scenario

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		const oSetNoDataSpy = sinon.spy(this.oVM.oManagementTable, "setNoData");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify setBusy was NOT called since there's no promise callback
			assert.ok(!oSetBusySpy.called, "setBusy should not have been called without promise callback");

			// Verify setNoData was called since there are no items
			assert.ok(oSetNoDataSpy.called, "setNoData should have been called when no items exist");

			// Verify final state is not busy
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens");

			oSetBusySpy.restore();
			oSetNoDataSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state sequence with multiple dialog openings", function(assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		let nOpenCount = 0;

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			nOpenCount++;

			// Verify final state is not busy on each open
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens (open #" + nOpenCount + ")");

			if (nOpenCount === 1) {
				// Close and reopen the dialog
				this.oVM.oManagementDialog.attachEventOnce("afterClose", function() {
					this.oVM._openManagementDialog();
				}.bind(this));
				this.oVM.oManagementDialog.close();
			} else {
				// Second opening - test complete
				this.oVM.oManagementDialog.close();
				done();
			}
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check table is not busy before dialog is opened", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		// Before opening the dialog, table should not be busy
		assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy before dialog is opened");
	});

	QUnit.module("VariantManagement Roles handling", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();

		},
		afterEach: function() {

			if (this.oCompContainer) {
				const oComponent = this.oCompContainer.getComponentInstance();
				oComponent.destroy();

				this.oCompContainer.destroy();
				this.oCompContainer = undefined;
			}

			this.oVM.destroy();
		}
	});

	QUnit.test("check roles inside managed views", async function (assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two", contexts: {role: ["test"]}, remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem("VMI3", {key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem("VMI4", {key: "4", title:"Four", contexts: {role: []}, favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManage(function(oEvent) {
			const mParameters = oEvent.getParameters();
			assert.ok(mParameters);
			assert.ok(this.oCompContainer, "context sharing component exists");

			done();
		}.bind(this));


		assert.ok(!this.oVM.getSupportContexts());
		this.oVM.setSupportContexts(true);

		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(async function() {
			let oIcon = null;
			const oRb = this.oVM._oRb;

			assert.ok(this.oVM.getSupportContexts());

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (let i = 0; i < aItems.length; i++) {
				const oRolesCell = aItems[i].getCells()[5];
				assert.ok(oRolesCell, "expected contexts element");

				if (i === 0) {
					 assert.ok(oRolesCell.isA("sap.m.Text"), "standard has no contexts");
				} else {
					 assert.ok(oRolesCell.isA("sap.m.HBox"), "item with contexts");

					 const oText = oRolesCell.getItems()[0];
					 if (i === 1) {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED"), "restricted expected");
						 oIcon = oRolesCell.getItems()[1];
					 } else {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"), "non restricted expected");
					 }
				}
			}

			assert.ok(oIcon, "restricted icon");
			const oTarget = oIcon.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("click", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));


		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function () {

			fOriginalManageCall();

			assert.ok(this.oVM.oManagementTable, "management table exists");

		}.bind(this));


		this.oVM._createRolesDialog();
		assert.ok(this.oVM._oRolesDialog, "roles dialog exisis");

		this.oVM._oRolesDialog.attachAfterClose(async function() {

			const oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of save button of manage dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		this.oVM._oRolesDialog.attachAfterOpen(async function() {

			const oCancelButton = Element.getElementById(this.oVM.getId() + "-rolecancel");
			assert.ok(oCancelButton, "cancel button of roles dialog existst");

			const oTarget = oCancelButton.getFocusDomRef();
			assert.ok(oTarget, "dom ref of cancel button of roles dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		const fOriginalRolesCall = this.oVM._openRolesDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openRolesDialog").callsFake(function (oItem, oTextControl) {
			fOriginalRolesCall(oItem, oTextControl);
		});

		const oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openManagementDialog(false, "STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

	QUnit.test("check roles inside SaveAs dialog", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem("VMI2", {key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		const done = assert.async();


		this.oVM.attachSave(function(oEvent) {
			const mParameters = oEvent.getParameters();

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

			const oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of the save button inside SaveAs dialog exists");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		const fOpenCall = this.oVM.oSaveAsDialog.open.bind(this.oVM.oSaveAsDialog);
		sinon.stub(this.oVM.oSaveAsDialog, "open").callsFake(function (sClass, oContext) {

			assert.ok(this.oVM.oInputName, "input entry should exists");
			this.oVM.oInputName.setValue("New");

			fOpenCall(sClass, oContext);
		}.bind(this));

		const oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openSaveAsDialog("STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

	QUnit.test("check changing roles inside SaveAs dialog", async function(assert) {
		const oRb = this.oVM._oRb;
		const done = assert.async();

		const oModel = new JSONModel({
			items: [
				{ key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A", visible: true },
				{ key: "2", title:"Two", contexts: {role: ["test"]}, remove: true, sharing: "Private", author: "B", visible: true },
				{ key: "3", title:"Three", contexts: {role: []}, favorite: true, remove: true, sharing: "Private", executeOnSelect: true, oauthor: "A", visible: true },
				{ key: "4", title:"Four", contexts: {role: []}, favorite: false, rename: false, sharing: "Public", author: "B", visible: true }
			]
		});
		this.oVM.setModel(oModel);

		this.oVM.bindAggregation("items", {
			path: "/items",
			template: new VariantItem("VMI", {
				key: "{key}",
				title: "{title}",
				contexts: "{contexts}",
				rename: "{rename}",
				remove: "{remove}",
				favorite: "{favorite}",
				sharing: "{sharing}",
				executeOnSelect: "{executeOnSelect}"
			})
		});

		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManage((oEvent) => {
			const mParameters = oEvent.getParameters();
			assert.ok(mParameters);
			assert.ok(this.oCompContainer, "context sharing component exists");
			done();
		});

		assert.ok(!this.oVM.getSupportContexts());
		this.oVM.setSupportContexts(true);

		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(async () => {
			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			const oItem = aItems[2]; // 3rd item
			const oRolesCell = oItem.getCells()[5];
			assert.ok(oRolesCell, "expected contexts element");
			assert.ok(oRolesCell.isA("sap.m.HBox"), "item with contexts");

			const oText = oRolesCell.getItems()[0];
			assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"), "non restricted expected");
			const oIcon = oRolesCell.getItems()[1];

			QUnitUtils.triggerTouchEvent("click", oIcon.getFocusDomRef(), {
				srcControl: null
			});

			await nextUIUpdate();
		});

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(() => {
			fOriginalManageCall();
			assert.ok(this.oVM.oManagementTable, "management table exists");
		});

		sinon.stub(this.oVM, "_openRolesDialog").callsFake(async (oItem) => {
			const oBindingContext = oItem.getBindingContext();
			assert.equal(oBindingContext.getProperty("key"), "3", "expected item for key 3");

			oBindingContext.setProperty("contexts", { role: ["test"] });
			await nextUIUpdate();

			// Close Management Dialog
			const oSaveTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oSaveTarget, "dom ref of save button of manage dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oSaveTarget, {
				srcControl: null
			});

			await nextUIUpdate();
		});

		const oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then((oCompContainer) => {
			this.oCompContainer = oCompContainer;
			this.oVM.openManagementDialog(false, "STYLECLASS", oContextSharing);
		});
	});

	QUnit.test("afterClose clears key-user state", function(assert) {
		const done = assert.async();

		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.setSupportContexts(true);
		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._oRolesComponentContainer = {};

		this.oVM._createManagementDialog();
		this.oVM.oManagementDialog.attachAfterOpen(function() {
			this.oVM.oManagementDialog.attachAfterClose(function() {
				assert.notOk(this.oVM.getSupportContexts(), "supportContexts reset to false");
				assert.notOk(this.oVM._sStyleClass, "_sStyleClass cleared");
				assert.notOk(this.oVM._oRolesComponentContainer, "_oRolesComponentContainer cleared");
				done();
			}.bind(this));
			this.oVM.oManagementDialog.close();
		}.bind(this));
		this.oVM._openManagementDialog();
	});

	QUnit.test("destroyManageDialog clears key-user state", function(assert) {
		this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
		this.oVM.setSupportContexts(true);
		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._oRolesComponentContainer = {};

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog created");

		this.oVM.destroyManageDialog();

		assert.notOk(this.oVM.oManagementDialog, "manage dialog destroyed");
		assert.notOk(this.oVM.getSupportContexts(), "supportContexts reset to false");
		assert.notOk(this.oVM._sStyleClass, "_sStyleClass cleared");
		assert.notOk(this.oVM._oRolesComponentContainer, "_oRolesComponentContainer cleared");
	});

	QUnit.module("VariantManagement SaveAs dialog lazy loading with dynamicVariantsLoadedCallback", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
			this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));
			this.oVM.setSelectedKey("2");
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check SaveAs dialog busy state is set and cleared when callback returns a promise", function(assert) {
		const done = assert.async();

		let fnResolvePromise;
		const oPromise = new Promise(function(resolve) {
			fnResolvePromise = resolve;
		});

		this.oVM.setDynamicVariantsLoadedCallback(function() {
			return oPromise;
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog, "SaveAs dialog should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oSaveAsDialog, "setBusy");

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {
			// At this point, busy state should be true since promise is not resolved yet
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called on SaveAs dialog");
			assert.ok(this.oVM.oSaveAsDialog.getBusy(), "SaveAs dialog should be busy while promise is pending");

			// Now resolve the promise
			fnResolvePromise();

			// Wait for promise to resolve and busy state to clear
			oPromise.then(function() {
				return new Promise(function(resolve) { setTimeout(resolve, 10); });
			}).then(function() {
				assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called on SaveAs dialog");
				assert.ok(!this.oVM.oSaveAsDialog.getBusy(), "SaveAs dialog should not be busy after promise resolves");

				oSetBusySpy.restore();
				this.oVM.oSaveAsDialog.close();
				done();
			}.bind(this));
		}.bind(this));

		this.oVM._openSaveAsDialog();
	});

	QUnit.test("check SaveAs dialog is not set busy when callback does not return a promise", function(assert) {
		const done = assert.async();

		this.oVM.setDynamicVariantsLoadedCallback(function() {
			return undefined; // not a promise
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog, "SaveAs dialog should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oSaveAsDialog, "setBusy");

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {
			assert.ok(!oSetBusySpy.called, "setBusy should not have been called when callback does not return a promise");
			assert.ok(!this.oVM.oSaveAsDialog.getBusy(), "SaveAs dialog should not be busy");

			oSetBusySpy.restore();
			this.oVM.oSaveAsDialog.close();
			done();
		}.bind(this));

		this.oVM._openSaveAsDialog();
	});

	QUnit.test("check SaveAs dialog busy state is cleared when promise rejects", function(assert) {
		const done = assert.async();

		let fnRejectPromise;
		const oPromise = new Promise(function(resolve, reject) {
			fnRejectPromise = reject;
		});

		this.oVM.setDynamicVariantsLoadedCallback(function() {
			return oPromise;
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog, "SaveAs dialog should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oSaveAsDialog, "setBusy");

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called on SaveAs dialog");
			assert.ok(this.oVM.oSaveAsDialog.getBusy(), "SaveAs dialog should be busy while promise is pending");

			// Reject the promise
			fnRejectPromise("error");

			// Wait for promise to settle and busy state to clear (.finally is used in implementation)
			oPromise.catch(function() {}).then(function() {
				return new Promise(function(resolve) { setTimeout(resolve, 10); });
			}).then(function() {
				assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called after promise rejection");
				assert.ok(!this.oVM.oSaveAsDialog.getBusy(), "SaveAs dialog should not be busy after promise rejects");

				oSetBusySpy.restore();
				this.oVM.oSaveAsDialog.close();
				done();
			}.bind(this));
		}.bind(this));

		this.oVM._openSaveAsDialog();
	});

	QUnit.module("VariantManagement Manage dialog lazy loading - additional scenarios", {
		beforeEach: async function() {
			this.oVM = new VariantManagement("VM1");
			this.oVM.addItem(new VariantItem("VMI1", {key: "1", title: "One", author: "A"}));
			this.oVM.addItem(new VariantItem("VMI2", {key: "2", title: "Two", author: "B"}));
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("a variant lazily loaded after dialog open with runtime values applied is not reported as user-changed", function(assert) {
		const done = assert.async();

		// Reproduces the reported issue: a shared PUBLIC comp variant is loaded lazily after the manage
		// dialog was built. The item is created from the persisted file (favorite:false / a given name),
		// then a runtime value is applied on top (e.g. favorite re-applied from a USER-layer change). The
		// item's "original" snapshot latched to the file value before the overlay, so without _syncOriginalItemState
		// _collectManageData would wrongly report the untouched variant as changed.
		this.oVM.setDynamicVariantsLoadedCallback(function() {
			const oItem = new VariantItem("VMI_LAZY", {
				key: "lazy",
				title: "Lazy Loaded",
				author: "C",
				favorite: false
			});
			this.oVM.addItem(oItem);
			// runtime overlay applied AFTER the item exists (after its original snapshot latched):
			oItem.setFavorite(true);
			oItem.setExecuteOnSelect(true);
			return Promise.resolve();
		}.bind(this));

		this.oVM._createManagementDialog();

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			Promise.resolve().then(function() {
				return new Promise(function(resolve) { setTimeout(resolve, 20); });
			}).then(function() {
				const oItem = this.oVM.getItems().find((o) => o.getKey() === "lazy");
				assert.ok(oItem, "the lazily-loaded variant item exists");
				assert.strictEqual(oItem.getFavorite(), true, "runtime favorite is applied");
				assert.strictEqual(oItem._getOriginalFavorite(), true, "original favorite is re-synced to the post-load value");
				assert.strictEqual(oItem._getOriginalExecuteOnSelect(), true, "original executeOnSelect is re-synced to the post-load value");

				const oInfo = this.oVM._collectManageData();
				const bReported =
					(oInfo.fav || []).some((o) => o.key === "lazy")
					|| (oInfo.exe || []).some((o) => o.key === "lazy")
					|| (oInfo.renamed || []).some((o) => o.key === "lazy");
				assert.notOk(bReported, "the untouched lazily-loaded variant is NOT reported as changed");

				this.oVM.oManagementDialog.close();
				done();
			}.bind(this));
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check management table is not set busy when no callback is provided", function(assert) {
		const done = assert.async();

		// No dynamicVariantsLoadedCallback set
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			assert.ok(!oSetBusySpy.called, "setBusy should not have been called when no callback is provided");
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy");

			oSetBusySpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check management table is not set busy when callback does not return a promise", function(assert) {
		const done = assert.async();

		this.oVM.setDynamicVariantsLoadedCallback(function() {
			return undefined; // not a promise
		});

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			assert.ok(!oSetBusySpy.called, "setBusy should not have been called when callback does not return a promise");
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy");

			oSetBusySpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check management table busy state is cleared and table is rebound when promise rejects", function(assert) {
		const done = assert.async();

		let fnRejectPromise;
		const oPromise = new Promise(function(resolve, reject) {
			fnRejectPromise = reject;
		});

		this.oVM.setDynamicVariantsLoadedCallback(function() {
			return oPromise;
		});

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		const oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		const oRebindVMTableSpy = sinon.spy(this.oVM, "_rebindVMTable");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called");
			assert.ok(this.oVM.oManagementTable.getBusy(), "table should be busy while promise is pending");

			// Reject the promise
			fnRejectPromise("error");

			// Wait for promise to settle (.finally is used in implementation)
			oPromise.catch(function() {}).then(function() {
				return new Promise(function(resolve) { setTimeout(resolve, 10); });
			}).then(function() {
				assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called after promise rejection");
				assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after promise rejects");
				assert.ok(oRebindVMTableSpy.calledWith(true), "_rebindVMTable(true) should have been called after promise settles");

				oSetBusySpy.restore();
				oRebindVMTableSpy.restore();
				this.oVM.oManagementDialog.close();
				done();
			}.bind(this));
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check callback is invoked each time management dialog opens", function(assert) {
		const done = assert.async();

		let nCallbackCount = 0;
		this.oVM.setDynamicVariantsLoadedCallback(function() {
			nCallbackCount++;
			return Promise.resolve();
		});

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		let nOpenCount = 0;

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			nOpenCount++;

			if (nOpenCount === 1) {
				assert.equal(nCallbackCount, 1, "callback should have been called once after first open");

				// Close and reopen the dialog
				this.oVM.oManagementDialog.attachEventOnce("afterClose", function() {
					this.oVM._openManagementDialog();
				}.bind(this));
				this.oVM.oManagementDialog.close();
			} else {
				assert.equal(nCallbackCount, 2, "callback should have been called twice after second open");
				this.oVM.oManagementDialog.close();
				done();
			}
		}.bind(this));

		this.oVM._openManagementDialog();
	});

});
