/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/variants/context/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/base/util/restricted/_merge",
	"sap/ui/thirdparty/sinon-4"
], function(
	ContextVisibilityController,
	ContextVisibilityComponent,
	ComponentContainer,
	Core,
	Element,
	WriteStorage,
	Layer,
	_merge,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var sCompName = "test---ContextVisibility--";

	function renderComponent(aSelectedRoles) {
		this.oComp = new ContextVisibilityComponent("test");
		this.oComp.showMessageStrip(true);
		this.oComp.setSelectedContexts({role: aSelectedRoles});
		this.oCompCont = new ComponentContainer({ component: this.oComp, id: "comp"});
		this.oCompCont.placeAt("qunit-fixture");
		Core.applyChanges();
		this.oRootControl = this.oCompCont.getComponentInstance().getRootControl();
		return this.oRootControl.loaded();
	}

	function setInitialControls() {
		this.oVisibilityPanel = Element.getElementById(`${sCompName}visibilityPanel`);
		this.oVisibilityMessageStrip = Element.getElementById(`${sCompName}visibilityMessageStrip`);
		this.oSelectedRolesList = Element.getElementById(`${sCompName}selectedContextsList`);
		this.oAddBtn = Element.getElementById(`${sCompName}addContextsButton`);
		this.oRemoveAllBtn = Element.getElementById(`${sCompName}removeAllButton`);
	}

	function setTableSelectDialogControls() {
		this.oSelectDialog = Element.getElementById(`${sCompName}selectContexts`);
		this.oDialog = Element.getElementById(`${sCompName}selectContexts-dialog`);
		this.oSearchField = Element.getElementById(`${sCompName}selectContexts-searchField`);
		this.oList = Element.getElementById(`${sCompName}selectContexts-list`);
		this.oConfirmBtn = Element.getElementById(`${sCompName}selectContexts-ok`);
		this.oMoreListItem = Element.getElementById(`${sCompName}selectContexts-list-trigger`);
	}

	function hookAsyncEventHandler(oStub, fnCallback) {
		oStub.callsFake(function(oEvent) {
			oStub.wrappedMethod.call(this, oEvent).then(fnCallback);
		});
	}

	var oDuplicates = [
		{
			id: "ADMIN",
			description: "Administrator"
		},
		{
			id: "KPI",
			description: "KPI Framework"
		}
	];

	var oRolesResponse = {
		values: [
			{
				id: "Random Test ID",
				description: "Test Description"
			},
			{
				id: "REMOTE",
				description: ""
			}
		],
		lastHitReached: false
	};

	var oDescriptionResponse = {
		role: [
			{
				id: "Random Test ID",
				description: "Test Description"
			},
			{
				id: "REMOTE",
				description: ""
			}
		]
	};

	function duplicateRoles(iNumberOfIterations, oDuplicatedRoles) {
		var oRolesResponseDuplicate = _merge({}, oRolesResponse);
		for (var i = 0; i <= iNumberOfIterations; i++) {
			oRolesResponseDuplicate.values = oRolesResponseDuplicate.values.concat(oDuplicatedRoles);
		}
		return oRolesResponseDuplicate;
	}

	QUnit.module("Given ContextVisibility Component without selected contexts", {
		before() {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
		},
		after() {
			QUnit.config.fixture = "";
		},

		beforeEach() {
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts").resolves(this.oMockResponse);
			sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescriptionResponse);
			return renderComponent.call(this, []).then(setInitialControls.bind(this));
		},
		afterEach() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when rendering the component, empty selected roles panel with list with info message strip and two buttons is visible", function(assert) {
			assert.equal(this.oVisibilityPanel.getVisible(), true, "panel is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "selected roles list is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "selected roles list contains entries");
			assert.equal(this.oVisibilityMessageStrip.getVisible(), true, "message strip is visible");
			assert.equal(this.oAddBtn.getEnabled(), true, "add context button is enabled");
			assert.equal(this.oRemoveAllBtn.getEnabled(), false, "remove all context button is disabled");
		});

		QUnit.test("when showMessageStrip is called with false", function(assert) {
			this.oComp.showMessageStrip(false);
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
		});

		QUnit.test("when showMessageStrip is called with true", function(assert) {
			this.oComp.showMessageStrip(true);
			assert.equal(this.oVisibilityMessageStrip.getVisible(), true, "message strip is visible");
		});

		QUnit.test("when pressing add contexts button, select roles dialog is opened, no items are pre-selected", function(assert) {
			var fnDone = assert.async();
			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncAssertions = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.fnGetContextsStub.callCount, 1, "write storage was called once");
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oSearchField.isActive(), true, "search field is active");
				assert.equal(this.oList.isActive(), true, "list is active");
				assert.equal(this.oList.getSelectedItems().length, 0, "no items are selected");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});
	});

	QUnit.module("Given SelectContexts Dialog", {
		before() {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
			this.oMockSearchResponse = {values: [{ id: "KPI", description: "KPI Framework"}]};
		},
		after() {
			QUnit.config.fixture = "";
		},

		beforeEach() {
			this.fnLoadContextDescriptionStub = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescriptionResponse);
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts");
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role"}).resolves(this.oMockResponse);
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role", $filter: "KPI"}).resolves(this.oMockSearchResponse);
			var oMockDoubledResponse = { values: this.oMockResponse.values.concat(oDuplicates), lastHitReached: true};
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role", $skip: 106}).resolves(oMockDoubledResponse);

			return renderComponent.call(this, ["Random Test ID", "REMOTE"]).then(function() {
				setInitialControls.call(this);
				Core.applyChanges();
			}.bind(this));
		},
		afterEach() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when initiating component with selected roles, then tooltips are rendered correctly", function(assert) {
			assert.equal(this.oAddBtn.getEnabled(), true, "add context button is enabled");
			assert.equal(this.oRemoveAllBtn.getEnabled(), true, "remove all context button is enabled");
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "selected roles list contains entries");
			var oFirstItem = this.oSelectedRolesList.getItems()[0];
			var oSecondItem = this.oSelectedRolesList.getItems()[1];
			assert.equal(this.fnLoadContextDescriptionStub.callCount, 1, "back end is called once to retrieve description");
			var mExpectedProperties = {layer: "CUSTOMER", flexObjects: {role: ["Random Test ID", "REMOTE"]}};
			assert.ok(this.fnLoadContextDescriptionStub.calledWith(mExpectedProperties), "back end is called with correct input");
			assert.equal(oFirstItem.getTooltip(), "Test Description", "tooltip is taken from backend");
			assert.equal(oSecondItem.getTooltip(), "No description available", "tooltip is not available so fallback i18n description is used");
		});

		QUnit.test("when searching for a value, back end request is fired and list entries are adjusted", function(assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");
			var oSearchStub = sandbox.stub(ContextVisibilityController.prototype, "onSearch");

			var fnAsyncFireSearch = function() {
				assert.equal(this.fnGetContextsStub.callCount, 1, "write storage was called once");
				setTableSelectDialogControls.call(this);
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries");
				var aSelectedItems = this.oList.getSelectedItems();
				assert.equal(aSelectedItems.length, 2, "list contains mocked entries");

				// unselect first item
				aSelectedItems[0].setSelected(false);
				Core.applyChanges();

				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oSearchField.isActive(), true, "search field is active");
				this.oSearchField.setValue("KPI");
				this.oSearchField.fireSearch();
			};

			var fnAsyncAssertions = function() {
				Core.applyChanges();
				assert.equal(this.fnGetContextsStub.callCount, 2, "write storage was called twice");
				assert.equal(this.oList.getItems().length, 1, "list contains searched entries");
				this.oList.getItems()[0].setSelected(true);
				Core.applyChanges();
				this.oConfirmBtn.firePress();
				Core.applyChanges();
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireSearch.bind(this));
			hookAsyncEventHandler(oSearchStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'More' button, back end request is fired and list entries are extended", function(assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");
			var oAppendDataStub = sandbox.stub(ContextVisibilityController.prototype, "_appendDataFromBackend");

			var fnAsyncScroll = function() {
				assert.equal(this.fnGetContextsStub.callCount, 1, "write storage was called once");
				setTableSelectDialogControls.call(this);
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries");
				assert.equal(this.oMoreListItem.isActive(), true, "more button is active");
				this.oMoreListItem.firePress();
			};

			var fnAsyncAssertions = function() {
				assert.equal(this.fnGetContextsStub.callCount, 2, "write storage was called twice");
				Core.applyChanges();
				assert.equal(this.oList.getItems().length, 100, "list contains next entries");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncScroll.bind(this));
			hookAsyncEventHandler(oAppendDataStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'Cancel' button, then nothing is taken over to SelectedContexts list", function(assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncFireSelectAll = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries (growinThreshold=50)");

				assert.equal(this.oList.getSelectedItems().length, 2, "two items are selected");

				this.oSelectDialog.fireCancel();
				Core.applyChanges();
				assert.equal(this.oSelectedRolesList.getItems().length, 2, "number of selected items did not change");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireSelectAll.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'Confirm' button, then selected contexts are taken over to SelectedContexts list", function(assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncFireConfirm = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries");

				assert.equal(this.oList.getSelectedItems().length, 2, "two items are selected");
				this.oConfirmBtn.firePress();
				Core.applyChanges();
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireConfirm.bind(this));
			this.oAddBtn.firePress();
		});
	});

	QUnit.module("Given ContextVisibility Component with selected contexts", {
		before() {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
		},
		after() {
			QUnit.config.fixture = "";
		},

		beforeEach() {
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts").resolves(this.oMockResponse);
			this.fnLoadContextDescriptionStub = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves({role: []});
			return renderComponent.call(this, ["Random Test ID", "REMOTE"]).then(setInitialControls.bind(this));
		},
		afterEach() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when rendering, 1 panel and selected contexts list are visible", function(assert) {
			assert.equal(this.oVisibilityPanel.getVisible(), true, "panel is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "selected roles panel is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "list contains 2 entries");
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
			assert.equal(this.oAddBtn.getEnabled(), true, "add context button is enabled");
			assert.equal(this.oRemoveAllBtn.getEnabled(), true, "remove all context button is enabled");
		});

		QUnit.test("when rendering and back end returns empty list of tooltips", function(assert) {
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "selected roles still contains all entries");
			assert.equal(this.fnLoadContextDescriptionStub.callCount, 1, "back end is called once to retrieve description");
			var mExpectedProperties = {layer: "CUSTOMER", flexObjects: {role: ["Random Test ID", "REMOTE"]}};
			assert.ok(this.fnLoadContextDescriptionStub.calledWith(mExpectedProperties), "back end is called with correct input");
			assert.equal(this.oSelectedRolesList.getItems()[0].getTooltip(), "No description available", "fallback tooltip is used");
			assert.equal(this.oSelectedRolesList.getItems()[1].getTooltip(), "No description available", "fallback tooltip is used");
		});

		QUnit.test("when pressing remove first row button, first context is removed", function(assert) {
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "list contains 2 entries");
			var oRmvFirstRowBtn = this.oSelectedRolesList.getItems()[0].getDeleteControl();
			assert.equal(oRmvFirstRowBtn.getVisible(), true, "remove first row button is visible");
			oRmvFirstRowBtn.firePress();
			Core.applyChanges();
			assert.equal(this.oSelectedRolesList.getItems().length, 1, "table contains 1 entry");
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
		});

		QUnit.test("when pressing remove first row button until every role is removed, select roles list should be visible and empty", function(assert) {
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "list contains 2 entries");
			var oRmvFirstRowBtn = this.oSelectedRolesList.getItems()[0].getDeleteControl();
			assert.equal(oRmvFirstRowBtn.getVisible(), true, "remove first row button is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "select roles control is visible");
			oRmvFirstRowBtn.firePress();
			Core.applyChanges();
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 1, "table contains 1 entry");
			oRmvFirstRowBtn = this.oSelectedRolesList.getItems()[0].getDeleteControl();
			assert.equal(oRmvFirstRowBtn.getVisible(), true, "remove first row button is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "select roles control is visible");
			oRmvFirstRowBtn.firePress();
			Core.applyChanges();
			assert.equal(this.oVisibilityMessageStrip.getVisible(), true, "message strip is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "table contains no entries");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "select roles control is visible");
			assert.equal(this.oRemoveAllBtn.getEnabled(), false, "remove all context button is disabled");
		});

		QUnit.test("when pressing remove all button, all contexts are removed, select roles list should be visible and empty", function(assert) {
			assert.equal(this.oVisibilityMessageStrip.getVisible(), false, "message strip is not visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "table contains 2 entries");
			assert.equal(this.oRemoveAllBtn.getVisible(), true, "remove all rows button is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "select roles control is visible");
			this.oRemoveAllBtn.firePress();
			assert.equal(this.oVisibilityMessageStrip.getVisible(), true, "message strip is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "table contains no entries");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "select roles control is visible");
			assert.equal(this.oRemoveAllBtn.getEnabled(), false, "remove all context button is disabled");
		});

		QUnit.test("when pressing add contexts button, select roles dialog is opened, and items are pre-selected", function(assert) {
			var fnDone = assert.async();
			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncAssertions = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.fnGetContextsStub.callCount, 1, "write storage was called once");
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oSearchField.isActive(), true, "search field is active");
				assert.equal(this.oList.isActive(), true, "list is active");
				assert.equal(this.oList.getSelectedItems().length, 2, "two items are selected");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});