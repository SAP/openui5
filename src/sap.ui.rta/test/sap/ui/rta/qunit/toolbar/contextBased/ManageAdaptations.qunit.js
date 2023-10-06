/* global QUnit */

sap.ui.define([
	"../../RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/Fragment",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	MessageBox,
	oCore,
	Control,
	Fragment,
	Layer,
	ManifestUtils,
	ContextBasedAdaptationsAPI,
	JSONModel,
	Adaptation,
	ManageAdaptations,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

	function getControl(oToolbar, sControlID) {
		return oToolbar.getControl(`manageAdaptationDialog--${sControlID}`);
	}

	function getAdaptationTitle(oTableListItem) {
		return oTableListItem.getCells()[1].getText();
	}

	function initializeToolbar() {
		var oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
		this.oRootControl = new Control();
		var oToolbar = new Adaptation({
			textResources: oRtaResourceBundle,
			rtaInformation: {
				flexSettings: {
					layer: Layer.CUSTOMER
				},
				rootControl: this.oRootControl
			}
		});
		oToolbar.setModel(oToolbarControlsModel, "controls");

		oToolbar.animation = false;
		oToolbar.placeAt("qunit-fixture");
		oCore.applyChanges();
		return oToolbar;
	}

	function getRanks(oAdaptationsModel) {
		return oAdaptationsModel.getProperty("/adaptations").map(function(oAdaptation) {
			return oAdaptation.rank;
		});
	}

	function getAdaptationIds(oAdaptationsModel) {
		return oAdaptationsModel.getProperty("/adaptations").map(function(oAdaptation) {
			return oAdaptation.id;
		});
	}

	var DEFAULT_ADAPTATION = { id: "DEFAULT", type: "DEFAULT" };
	QUnit.module("Given a Toolbar with enabled context-based adaptations feature", {
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.test.app");
			this.oModel = ContextBasedAdaptationsAPI.createModel([DEFAULT_ADAPTATION], DEFAULT_ADAPTATION, true);
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(this.oModel);
			this.oToolbar = initializeToolbar.call(this);
			this.oManageAdaptations = new ManageAdaptations({ toolbar: this.oToolbar });
			this.oEvent = {
				getSource: function() {
					return this.oToolbar.getControl("manageAdaptations");
				}.bind(this)
			};
			return this.oToolbar.onFragmentLoaded().then(function() {
				return this.oToolbar.show();
			}.bind(this));
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.module("the manage adaptations dialog is created with empty ", {
			beforeEach() {
				sandbox.stub(ContextBasedAdaptationsAPI, "load").resolves({adaptations: [DEFAULT_ADAPTATION]});
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				return this.oManageAdaptations.openManageAdaptationDialog()
				.then(function(oDialog) {
					this.oDialog = oDialog;
					return this.oToolbar._pFragmentLoaded;
				}.bind(this));
			}
		}, function() {
			QUnit.test("and context-based adaptations dialog is visible", function(assert) {
				assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.ok(this.oDialog.isOpen(), "the dialog is opened");
			});

			QUnit.test("and opend a second time", function(assert) {
				// simulate user selection
				this.oDialog.close();
				return this.oManageAdaptations.openManageAdaptationDialog().then(function(oDialog) {
					assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded not again");
					assert.ok(oDialog.isOpen(), "the dialog is opened");
					assert.deepEqual(oDialog.getModel("contextBased").getProperty("/adaptations"), [], "the data was reset");
				}.bind(this));
			});
		});

		QUnit.module("the manage adaptations dialog is opened containing two adaptations", {
			beforeEach() {
				this.sManageAdaptationsDialog = "manageAdaptationDialog";
				this.oContextBasedAdaptations = {
					adaptations: [{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "2022-05-25T07:30:32Z",
						changedBy: "Test User 1",
						changedAt: "2022-05-27T08:30:32Z"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "2022-05-17T09:30:32Z",
						changedBy: "Test User 2",
						changedAt: "2022-09-07T10:30:32Z"
					}]
				};
				sandbox.stub(ContextBasedAdaptationsAPI, "load").resolves(this.oContextBasedAdaptations);
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");

				this.oVersionsModel = new JSONModel({
					backendDraft: true,
					displayedVersion: "0"
				});
				this.oToolbar.setModel(this.oVersionsModel, "versions");
				this.oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox");

				return this.oManageAdaptations.openManageAdaptationDialog()
				.then(function(oDialog) {
					this.oDialog = oDialog;
					this.oMoveUpButton = getControl(this.oToolbar, "moveUpButton");
					this.oMoveDownButton = getControl(this.oToolbar, "moveDownButton");
					this.oAdaptationsTable = getControl(this.oToolbar, "manageAdaptationsTable");
					this.oSaveButton = getControl(this.oToolbar, "manageAdaptations-saveButton");
					this.oCloseButton = getControl(this.oToolbar, "manageAdaptations-closeButton");
					[this.oFirstTableItem] = this.oAdaptationsTable.getItems();
					return this.oToolbar._pFragmentLoaded;
				}.bind(this));
			}
		}, function() {
			QUnit.test("and context-based adaptations are visible and correctly formatted", function(assert) {
				assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.ok(this.oDialog.isOpen(), "the dialog is opened");
				assert.deepEqual(
					this.oDialog.getModel("contextBased").getProperty("/adaptations"),
					this.oContextBasedAdaptations.adaptations,
					"correct context-based adaptations are shown"
				);
			});

			QUnit.test("and the priority of the context-based adaptations is first moved down then up again using the up and down button", function(assert) {
				var sFirstAdaptationText = this.oFirstTableItem.getCells()[1].getProperty("text");
				this.oAdaptationsTable.getItems()[0].focus();
				this.oAdaptationsTable.setSelectedItem(this.oAdaptationsTable.getItems()[0], true, true);

				assert.notOk(this.oSaveButton.getEnabled(), "Save Button is disabled");
				assert.notOk(this.oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.ok(this.oMoveDownButton.getEnabled(), "oMoveDownButton is enabled");

				this.oMoveDownButton.firePress();
				var sNewFirstAdaptationText = this.oFirstTableItem.getCells()[1].getProperty("text");
				assert.notEqual(sFirstAdaptationText, sNewFirstAdaptationText, "priority of adaptations has changed");
				assert.ok(this.oSaveButton.getEnabled(), "Save Button is enabled");

				this.oMoveUpButton.firePress();
				sNewFirstAdaptationText = this.oFirstTableItem.getCells()[1].getProperty("text");
				assert.strictEqual(sFirstAdaptationText, sNewFirstAdaptationText, "original priority is visible");
				assert.notOk(this.oSaveButton.getEnabled(), "Save Button is disabled");
			});

			QUnit.test("and the priority of the context-based adaptations is moved down and then save button is clicked", function(assert) {
				this.oVersionsModel.setData({
					backendDraft: true,
					displayedVersion: "12345"
				});

				var oReorderStub = sandbox.stub(ContextBasedAdaptationsAPI, "reorder").resolves();
				var oFirstTableItem = this.oAdaptationsTable.getItems()[0];
				var sFirstAdaptationText = oFirstTableItem.getCells()[1].getProperty("text");
				this.oAdaptationsTable.getItems()[0].focus();
				this.oAdaptationsTable.setSelectedItem(this.oAdaptationsTable.getItems()[0], true, true);

				assert.notOk(this.oSaveButton.getEnabled(), "Save Button is disabled");
				assert.notOk(this.oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.ok(this.oMoveDownButton.getEnabled(), "oMoveDownButton is enabled");

				this.oMoveDownButton.firePress();
				var sNewFirstAdaptationText = oFirstTableItem.getCells()[1].getProperty("text");
				assert.notEqual(sFirstAdaptationText, sNewFirstAdaptationText, "priority of adaptations has changed");
				assert.ok(this.oSaveButton.getEnabled(), "Save Button is enabled");

				assert.strictEqual(oReorderStub.callCount, 0, "reorder stub is not called");

				this.oShowMessageBoxStub.returns(Promise.reject("cancel"));
				this.oSaveButton.firePress();

				return new Promise(function(resolve) {
					setTimeout(resolve, 0);
				}).then(function() {
					assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Warning is shown");
					assert.strictEqual(oReorderStub.callCount, 0, "reorder stub is not called");

					this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);
					this.oSaveButton.firePress();

					return new Promise(function(resolve) {
						setTimeout(resolve, 0);
					});
				}.bind(this)).then(function() {
					assert.strictEqual(this.oShowMessageBoxStub.callCount, 2, "Warning is shown again");
					assert.strictEqual(oReorderStub.callCount, 1, "reorder stub is called");
					var mCalledProps = oReorderStub.getCall(0).args[0];
					assert.strictEqual(mCalledProps.layer, "CUSTOMER", "reorder stub is called with correct layer");
					assert.strictEqual(mCalledProps.control, this.oRootControl, "reorder stub is called with correct rootControl");
					assert.deepEqual(mCalledProps.parameters, {priorities: ["id-1591275572835-1", "id-1591275572834-1"]}, "reorder stub is called with correct priorities");
					assert.deepEqual(getRanks(this.oManageAdaptations.oAdaptationsModel), [1, 2], "ranks are updated correctly");
				}.bind(this));
			});

			QUnit.test("and the priority of the context-based adaptations is moved down and then cancel button is clicked", function(assert) {
				this.oVersionsModel.setData({
					backendDraft: true,
					displayedVersion: "12345"
				});

				var aExpectedAdaptationIds = ["id-1591275572834-1", "id-1591275572835-1"];
				var oReorderStub = sandbox.stub(ContextBasedAdaptationsAPI, "reorder").resolves();
				var oFirstTableItem = this.oAdaptationsTable.getItems()[0];
				var sFirstAdaptationText = oFirstTableItem.getCells()[1].getProperty("text");
				this.oAdaptationsTable.getItems()[0].focus();
				this.oAdaptationsTable.setSelectedItem(this.oAdaptationsTable.getItems()[0], true, true);

				assert.notOk(this.oSaveButton.getEnabled(), "Save Button is disabled");
				assert.notOk(this.oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.ok(this.oMoveDownButton.getEnabled(), "oMoveDownButton is enabled");

				this.oMoveDownButton.firePress();
				var sNewFirstAdaptationText = oFirstTableItem.getCells()[1].getProperty("text");
				assert.notEqual(sFirstAdaptationText, sNewFirstAdaptationText, "priority of adaptations has changed");
				assert.ok(this.oSaveButton.getEnabled(), "Save Button is enabled");

				assert.strictEqual(oReorderStub.callCount, 0, "reorder stub is not called");

				this.oCloseButton.firePress();

				return new Promise(function(resolve) {
					setTimeout(resolve, 0);
				}).then(function() {
					assert.strictEqual(oReorderStub.callCount, 0, "reorder stub is not called");
					assert.deepEqual(getAdaptationIds(this.oManageAdaptations.oAdaptationsModel), aExpectedAdaptationIds, "ranks are not changed");
				}.bind(this));
			});

			QUnit.test("and the priority of the context-based adaptations is changed using drag and drop", function(assert) {
				assert.notOk(this.oSaveButton.getEnabled(), "Save Button is disabled");

				var oFirstTableItem = this.oAdaptationsTable.getItems()[0];
				var sFirstAdaptationText = getAdaptationTitle(oFirstTableItem);
				this.oAdaptationsTable.getItems()[0].focus();
				this.oAdaptationsTable.setSelectedItem(this.oAdaptationsTable.getItems()[0], true, true);
				var oFakeEvent = {
					getParameter: function(sProperty) {
						if (sProperty === "droppedControl") {
							return this.oAdaptationsTable.getItems()[1];
						} else if (sProperty === "draggedControl") {
							return oFirstTableItem;
						} else if (sProperty === "dropPosition") {
							return "After";
						}
						return "";
					}.bind(this),
					getBindingContext() {
						return oFirstTableItem.getBindingContext("contextBased");
					}
				};
				this.oAdaptationsTable.getDragDropConfig()[0].mEventRegistry.drop[0].fFunction(oFakeEvent);
				var sNewFirstAdaptationText = getAdaptationTitle(oFirstTableItem);
				assert.notEqual(sFirstAdaptationText, sNewFirstAdaptationText, "priority of adaptations has changed");
				assert.ok(this.oSaveButton.getEnabled(), "Save Button is enabled");
			});
		});

		QUnit.module("the manage adaptations dialog is opened containing four adaptations", {
			beforeEach() {
				this.sManageAdaptationsDialog = "manageAdaptationDialog";
				this.oContextBasedAdaptations = {
					adaptations: [{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "2022-05-25T07:30:32Z",
						changedBy: "Test User 1",
						changedAt: "2022-05-27T08:30:32Z"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "2022-05-17T09:30:32Z",
						changedBy: "Test User 2",
						changedAt: "2022-09-07T10:30:32Z"
					},
					{
						id: "id-1591275572839-1",
						contexts: {
							role: ["INVENTORY_MANAGER"]
						},
						title: "England Admin",
						description: "ACH Admin for England",
						createdBy: "Test User 1",
						createdAt: "2022-05-17T11:30:32Z",
						changedBy: "Test User 1",
						changedAt: "2022-05-28T12:30:32Z"
					},
					{
						id: "id-1591275572899-1",
						contexts: {
							role: ["INVENTORY_MANAGER"]
						},
						title: "Spain Admin",
						description: "ACH Admin for Spain",
						createdBy: "Test User 1",
						createdAt: "2022-05-17T13:30:32Z",
						changedBy: "Test User 1",
						changedAt: "2022-05-28T14:30:32Z"
					}]
				};
				sandbox.stub(ContextBasedAdaptationsAPI, "load").resolves(this.oContextBasedAdaptations);
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				return this.oManageAdaptations.openManageAdaptationDialog()
				.then(function(oDialog) {
					this.oDialog = oDialog;
					return this.oToolbar._pFragmentLoaded;
				}.bind(this));
			}
		}, function() {
			[{
				testName: "and the search field of the context-based adaptations is filtering for 'somethingWhichDoesNotExits'",
				input: "somethingWhichDoesNotExits",
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 0
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: false
					}
				}
			},
			{
				testName: "and the search field of the context-based adaptations is filtering for default context table 'DeFaUlT ApP'",
				input: oRtaResourceBundle.getText("TXT_DEFAULT_APP").toUpperCase(),
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 0
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: true
					}
				}
			},
			{
				testName: "and the search field of the context-based adaptations is filtering for title 'AdMiN'",
				input: "AdMiN",
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 3
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: false
					}
				}
			},
			{
				testName: "and the search field of the context-based adaptations is filtering for context id 'mAnAgER'",
				input: "mAnAgER",
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 3
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: false
					}
				}
			},
			{
				testName: "and the search field of the context-based adaptations is filtering for createdBy 'TeST UsEr 2'",
				input: "TeST UsEr 2",
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 1
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: false
					}
				}
			},
			{
				testName: "and the search field of the context-based adaptations is filtering for changedBy 'TeST USEr 2'",
				input: "TeST USEr 2",
				expectation: {
					amountOfAdaptations: {
						beforeSearch: 4,
						afterSearch: 1
					},
					visibilityOfDefaultContextTable: {
						beforeSearch: true,
						afterSearch: false
					}
				}
			}].forEach(function(mSetup) {
				QUnit.test(mSetup.testName, function(assert) {
					var oSearchField = getControl(this.oToolbar, "searchField");
					var oAdaptationsTable = getControl(this.oToolbar, "manageAdaptationsTable");
					var oMoveUpButton = getControl(this.oToolbar, "moveUpButton");
					var oMoveDownButton = getControl(this.oToolbar, "moveDownButton");
					var oDefaultContextTable = getControl(this.oToolbar, "defaultContext");
					assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
					assert.equal(oAdaptationsTable.getItems().length, mSetup.expectation.amountOfAdaptations.beforeSearch, "correct amount of adaptations");
					assert.ok(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is enabled");
					assert.notOk(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
					assert.notOk(oMoveDownButton.getEnabled(), "MoveDownButton is disabled");
					assert.strictEqual(oDefaultContextTable.getVisible(), mSetup.expectation.visibilityOfDefaultContextTable.beforeSearch, "default context table is visible");
					oSearchField.setValue(mSetup.input);
					oSearchField.fireLiveChange();
					assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
					assert.strictEqual(oAdaptationsTable.getItems().length, mSetup.expectation.amountOfAdaptations.afterSearch, "correct amount of adaptations");
					assert.notOk(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is disabled");
					assert.notOk(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
					assert.notOk(oMoveDownButton.getEnabled(), "MoveDownButton is disabled");
					assert.strictEqual(oDefaultContextTable.getVisible(), mSetup.expectation.visibilityOfDefaultContextTable.afterSearch, "default context table is visible");
				});
			});

			QUnit.test("and the search field of the context-based adaptations is filtering for 'something' while an item is selected", function(assert) {
				var oSearchField = getControl(this.oToolbar, "searchField");
				var oAdaptationsTable = getControl(this.oToolbar, "manageAdaptationsTable");
				var oMoveUpButton = getControl(this.oToolbar, "moveUpButton");
				var oMoveDownButton = getControl(this.oToolbar, "moveDownButton");
				var oDefaultContextTable = getControl(this.oToolbar, "defaultContext");
				assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
				assert.strictEqual(oAdaptationsTable.getItems().length, 4, "correct amount of adaptations");
				assert.ok(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is enabled");
				assert.notEqual(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.notEqual(oMoveDownButton.getEnabled(), "MoveDownButton is disabled");
				assert.ok(oDefaultContextTable.getVisible(), "default context table is visible");
				oAdaptationsTable.setSelectedItem(oAdaptationsTable.getItems()[0], true, true);
				assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
				assert.strictEqual(oAdaptationsTable.getItems().length, 4, "correct amount of adaptations");
				assert.ok(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is enabled");
				assert.notOk(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.ok(oMoveDownButton.getEnabled(), "MoveDownButton is enabled");
				assert.ok(oDefaultContextTable.getVisible(), "default context table is visible");
				oSearchField.setValue("something");
				oSearchField.fireLiveChange();
				assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
				assert.strictEqual(oAdaptationsTable.getItems().length, 0, "correct amount of adaptations");
				assert.notOk(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is disabled");
				assert.notOk(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.notOk(oMoveDownButton.getEnabled(), "MoveDownButton is disabled");
				assert.notOk(oDefaultContextTable.getVisible(), "default context table is visible");
				oSearchField.setValue("");
				oSearchField.fireLiveChange();
				assert.ok(oSearchField.getEnabled(), "search field is present and enabled");
				assert.ok(oAdaptationsTable.getItems().length, 4, "correct amount of adaptations");
				assert.ok(oAdaptationsTable.getDragDropConfig()[0].getEnabled(), "drag & drop is enabled");
				assert.notOk(oMoveUpButton.getEnabled(), "MoveUpButton is disabled");
				assert.ok(oMoveDownButton.getEnabled(), "MoveDownButton is enabled");
				assert.ok(oDefaultContextTable.getVisible(), "default context table is visible");
			});
		});
	});
});