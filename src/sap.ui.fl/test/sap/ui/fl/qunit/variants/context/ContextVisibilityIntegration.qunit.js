/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/variants/context/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/Layer",
	"sap/base/util/restricted/_merge",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	ContextVisibilityController,
	ContextVisibilityComponent,
	ComponentContainer,
	WriteStorage,
	JSONModel,
	Layer,
	_merge,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var sCompName = "test---ContextVisibility--";
	var oCore = sap.ui.getCore();

	function renderComponent(aSelectedRoles) {
		this.oComp = new ContextVisibilityComponent("test");
		this.oComp.setSelectedContexts({role: aSelectedRoles});
		this.oCompCont = new ComponentContainer({ component: this.oComp, id: "comp"});
		this.oCompCont.placeAt("qunit-fixture");
		oCore.applyChanges();
		this.oRootControl = this.oCompCont.getComponentInstance().getRootControl();
		return this.oRootControl.loaded();
	}

	function setInitialControls() {
		this.oVisibilityPanel = oCore.byId(sCompName + "visibilityPanel");
		this.oPublicRadioButton = oCore.byId(sCompName + "publicRadioButton");
		this.oRestrictedRadioButton = oCore.byId(sCompName + "restrictedRadioButton");
		this.oSelectedRolesList = oCore.byId(sCompName + "selectedContextsList");
		this.oAddBtn = oCore.byId(sCompName + "addContextsButton");
		this.oRemoveAllBtn = oCore.byId(sCompName + "removeAllButton");
	}

	function setTableSelectDialogControls() {
		this.oSelectDialog = oCore.byId(sCompName + "selectContexts");
		this.oDialog = oCore.byId(sCompName + "selectContexts-dialog");
		this.oSearchField = oCore.byId(sCompName + "selectContexts-searchField");
		this.oList = oCore.byId(sCompName + "selectContexts-list");
		this.oConfirmBtn = oCore.byId(sCompName + "selectContexts-ok");
		this.oMoreListItem = oCore.byId(sCompName + "selectContexts-list-trigger");
	}

	function hookAsyncEventHandler(oStub, fnCallback) {
		oStub.callsFake(function(oEvent) {
			oStub.wrappedMethod.call(this, oEvent).then(fnCallback);
		});
	}

	function duplicateRoles(iNumberOfIterations, oDuplicatedRoles) {
		var oRolesResponseDuplicate = _merge({}, oRolesResponse);
		for (var i = 0; i <= iNumberOfIterations; i++) {
			oRolesResponseDuplicate.values = oRolesResponseDuplicate.values.concat(oDuplicatedRoles);
		}
		return oRolesResponseDuplicate;
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


	QUnit.module("Given ContextVisibility Component without selected contexts", {
		before: function () {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
		},
		after: function () {
			QUnit.config.fixture = "";
		},

		beforeEach: function () {
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts").resolves(this.oMockResponse);
			sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescriptionResponse);
			return renderComponent.call(this, []).then(setInitialControls.bind(this));
		},
		afterEach: function() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when rendering the component, only 1 panel and 2 radio buttons are visible", function (assert) {
			assert.equal(this.oVisibilityPanel.getVisible(), true, "panel is visible");
			assert.equal(this.oPublicRadioButton.getVisible(), true, "public radio button is visible");
			assert.equal(this.oRestrictedRadioButton.getVisible(), true, "restricted radio button is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), false, "selected roles list is not visible yet");
		});

		QUnit.test("when selecting restricted visibility radio button, selected role panel appears", function (assert) {
			this.oRestrictedRadioButton.fireSelect();
			oCore.applyChanges();
			assert.equal(this.oSelectedRolesList.getVisible(), true, "selected roles list is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "selected roles list contains entries");
			assert.equal(this.oAddBtn.getVisible(), true, "add context button is visible");
			assert.equal(this.oRemoveAllBtn.getVisible(), true, "remove all context button is visible");
		});

		QUnit.test("when checking for errors in component state before saving variant", function (assert) {
			this.oRestrictedRadioButton.fireSelect();
			oCore.applyChanges();
			assert.equal(this.oSelectedRolesList.getVisible(), true, "selected roles list is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "selected roles list contains entries");
			assert.equal(oCore.byId(sCompName + "noSelectedRolesError"), undefined, "error message is not visible");

			// restricted visibility without selected roles => ERROR
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), true, "component has errors");
			assert.equal(oCore.byId(sCompName + "noSelectedRolesError").getVisible(), true, "error message is visible");

			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), true, "component has errors still errors");
			assert.equal(oCore.byId(sCompName + "noSelectedRolesError").getVisible(), true, "error message is visible, no duplicate id error");

			// public visibility without selected roles => PASS
			this.oComp.setSelectedContexts({role: []});
			assert.equal(oCore.byId(sCompName + "noSelectedRolesError"), undefined, "error message is not visible");

			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), false, "component has no errors");
			assert.equal(oCore.byId(sCompName + "noSelectedRolesError"), undefined, "error message is not visible");
		});

		QUnit.test("when pressing add contexts button, select roles dialog is opened, no items are pre-selected", function (assert) {
			var fnDone = assert.async();

			this.oRestrictedRadioButton.fireSelect();
			oCore.applyChanges();

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
		before: function () {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
			this.oMockSearchResponse = duplicateRoles(51, [{ id: "KPI", description: "KPI Framework"}]);
		},
		after: function () {
			QUnit.config.fixture = "";
		},

		beforeEach: function () {
			this.fnLoadContextDescriptionStub = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescriptionResponse);
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts");
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role"}).resolves(this.oMockResponse);
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role", $filter: "KPI"}).resolves(this.oMockSearchResponse);
			var oMockDoubledResponse = { values: this.oMockResponse.values.concat(oDuplicates), lastHitReached: true};
			this.fnGetContextsStub.withArgs({layer: Layer.CUSTOMER, type: "role", $skip: 106}).resolves(oMockDoubledResponse);

			return renderComponent.call(this, ["Random Test ID", "REMOTE"]).then(function() {
				setInitialControls.call(this);
				this.oRestrictedRadioButton.fireSelect();
				oCore.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when initiating component with selected roles, then tooltips are rendered correctly", function (assert) {
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "selected roles list contains entries");
			var oFirstItem = this.oSelectedRolesList.getItems()[0];
			var oSecondItem = this.oSelectedRolesList.getItems()[1];
			assert.equal(this.fnLoadContextDescriptionStub.callCount, 1, "back end is called once to retrieve description");
			var mExpectedProperties = {layer: "CUSTOMER", flexObjects: {role: ["Random Test ID", "REMOTE"]}};
			assert.ok(this.fnLoadContextDescriptionStub.calledWith(mExpectedProperties), "back end is called with correct input");
			assert.equal(oFirstItem.getTooltip(), "Test Description", "tooltip is taken from backend");
			assert.equal(oSecondItem.getTooltip(), "No description available", "tooltip is not available so fallback i18n description is used");
		});

		QUnit.test("when searching for a value, back end request is fired and list entries are adjusted", function (assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");
			var oSearchStub = sandbox.stub(ContextVisibilityController.prototype, "onSearch");

			var fnAsyncFireSearch = function() {
				assert.equal(this.fnGetContextsStub.callCount, 1, "write storage was called once");
				setTableSelectDialogControls.call(this);
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries");
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oSearchField.isActive(), true, "search field is active");
				this.oSearchField.setValue("KPI");
				this.oSearchField.fireSearch();
			};

			var fnAsyncAssertions = function() {
				assert.equal(this.fnGetContextsStub.callCount, 2, "write storage was called twice");
				oCore.applyChanges();
				assert.equal(this.oList.getItems().length, 50, "list contains searched entries");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireSearch.bind(this));
			hookAsyncEventHandler(oSearchStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'More' button, back end request is fired and list entries are extended", function (assert) {
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
				oCore.applyChanges();
				assert.equal(this.oList.getItems().length, 100, "list contains next entries");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncScroll.bind(this));
			hookAsyncEventHandler(oAppendDataStub, fnAsyncAssertions.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'Cancel' button, then nothing is taken over to SelectedContexts list", function (assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncFireSelectAll = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries (growinThreshold=50)");

				assert.equal(this.oList.getSelectedItems().length, 2, "two items are selected");

				this.oSelectDialog.fireCancel();
				oCore.applyChanges();
				assert.equal(this.oSelectedRolesList.getItems().length, 2, "number of selected items did not change");
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireSelectAll.bind(this));
			this.oAddBtn.firePress();
		});

		QUnit.test("when pressing 'Confirm' button, then selected contexts are taken over to SelectedContexts list", function (assert) {
			var fnDone = assert.async();

			var oAddContextStub = sandbox.stub(ContextVisibilityController.prototype, "_addContexts");

			var fnAsyncFireConfirm = function() {
				setTableSelectDialogControls.call(this);
				assert.equal(this.oDialog.isOpen(), true, "dialog is opened");
				assert.equal(this.oList.getItems().length, 50, "list contains mocked entries");

				assert.equal(this.oList.getSelectedItems().length, 2, "two items are selected");
				this.oConfirmBtn.firePress();
				oCore.applyChanges();
				fnDone();
			};

			hookAsyncEventHandler(oAddContextStub, fnAsyncFireConfirm.bind(this));
			this.oAddBtn.firePress();
		});
	});

	QUnit.module("Given ContextVisibility Component with selected contexts", {
		before: function () {
			QUnit.config.fixture = null;
			this.oMockResponse = duplicateRoles(51, oDuplicates);
		},
		after: function () {
			QUnit.config.fixture = "";
		},

		beforeEach: function () {
			this.fnGetContextsStub = sandbox.stub(WriteStorage, "getContexts").resolves(this.oMockResponse);
			sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescriptionResponse);
			return renderComponent.call(this, ["Random Test ID", "REMOTE"]).then(setInitialControls.bind(this));
		},
		afterEach: function() {
			this.oCompCont.destroy();
			sandbox.restore();
		}

	}, function() {
		QUnit.test("when rendering, 1 panel, 2 radio buttons and selected contexts list are visible", function (assert) {
			assert.equal(this.oVisibilityPanel.getVisible(), true, "panel is visible");
			assert.equal(this.oPublicRadioButton.getVisible(), true, "public radio button is visible");
			assert.equal(this.oRestrictedRadioButton.getVisible(), true, "restricted radio button is visible");
			assert.equal(this.oSelectedRolesList.getVisible(), true, "selected roles panel is visible");
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "list contains 2 entries");
		});

		QUnit.test("when pressing remove first row button, first context is removed", function (assert) {
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "list contains 2 entries");
			var oRmvFirstRowBtn = this.oSelectedRolesList.getItems()[0].getDeleteControl();
			assert.equal(oRmvFirstRowBtn.getVisible(), true, "remove first row button is visible");
			oRmvFirstRowBtn.firePress();
			oCore.applyChanges();
			assert.equal(this.oSelectedRolesList.getItems().length, 1, "table contains 1 entry");
			assert.equal(this.oRestrictedRadioButton.getSelected(), true, "restricted radio button is still selected");
		});

		QUnit.test("when pressing remove all button, all contexts are removed", function (assert) {
			assert.equal(this.oSelectedRolesList.getItems().length, 2, "table contains 2 entries");
			assert.equal(this.oRemoveAllBtn.getVisible(), true, "remove all rows button is visible");
			this.oRemoveAllBtn.firePress();
			assert.equal(this.oSelectedRolesList.getItems().length, 0, "table contains no entries");
			assert.equal(this.oPublicRadioButton.getSelected(), true, "public radio button is selected");
		});

		QUnit.test("when pressing add contexts button, select roles dialog is opened, and items are pre-selected", function (assert) {
			var fnDone = assert.async();

			this.oRestrictedRadioButton.fireSelect();
			oCore.applyChanges();

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
		jQuery("#qunit-fixture").hide();
	});
});