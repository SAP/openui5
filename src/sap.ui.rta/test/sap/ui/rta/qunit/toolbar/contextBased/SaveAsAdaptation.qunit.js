/* global QUnit */

sap.ui.define([
	"../../RtaQunitUtils",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Control,
	Element,
	Fragment,
	Lib,
	coreLibrary,
	ManifestUtils,
	Version,
	ContextBasedAdaptationsAPI,
	Layer,
	JSONModel,
	nextUIUpdate,
	Adaptation,
	SaveAsAdaptation,
	sinon
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;

	const sandbox = sinon.createSandbox();

	function getToolbarRelatedControl(oToolbar, sControlID) {
		return oToolbar.getControl(`addAdaptationDialog--${sControlID}`);
	}

	function getControl(sId) {
		return Element.getElementById(sId);
	}

	async function initializeToolbar() {
		const aVersions = [{
			version: "1",
			title: "Version Title",
			type: Version.Type.Active,
			isPublished: true,
			importedAt: "2022-05-09 15:00:00.000"
		}, {
			version: "2",
			type: Version.Type.Inactive,
			isPublished: false,
			activatedAt: "2022-05-10 15:00:00.000"
		}];
		const oVersionsModel = new JSONModel({
			versioningEnabled: true,
			versions: aVersions,
			draftAvailable: true,
			displayedVersion: Version.Number.Draft
		});

		const oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
		const oToolbar = new Adaptation({
			textResources: Lib.getResourceBundleFor("sap.ui.rta"),
			rtaInformation: {
				flexSettings: {
					layer: Layer.CUSTOMER
				},
				rootControl: new Control()
			}
		});
		oToolbar.setModel(oVersionsModel, "versions");
		oToolbar.setModel(oToolbarControlsModel, "controls");

		oToolbar.animation = false;
		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate.runSync(); // await is only kept to indicate later call w/o ".runSync"
		return oToolbar;
	}

	const DEFAULT_ADAPTATION = { id: "DEFAULT", type: "DEFAULT" };
	QUnit.module("Given a Toolbar with enabled context-based adaptations feature", {
		async beforeEach() {
			this.oGetAppComponentStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.test.app");
			this.oModel = ContextBasedAdaptationsAPI.createModel([DEFAULT_ADAPTATION], DEFAULT_ADAPTATION, true);
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(this.oModel);
			this.oToolbar = await initializeToolbar();
			this.oSaveAsAdaptation = new SaveAsAdaptation({ toolbar: this.oToolbar });
			this.oEvent = {
				getSource: function() {
					return this.oToolbar.getControl("manageAdaptations");
				}.bind(this)
			};
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			this.oSaveAsAdaptation.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.module("the save as adaptation dialog is created with empty data", {
			beforeEach() {
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				return this.oSaveAsAdaptation.openAddAdaptationDialog().then(function(oDialog) {
					this.oDialog = oDialog;
					return this.oToolbar._pFragmentLoaded;
				}.bind(this));
			}
		}, function() {
			QUnit.test("and save as adaptation dialog is visible", function(assert) {
				assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.ok(this.oDialog.isOpen(), "the dialog is opened");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				assert.ok(oContextsList.getHeaderToolbar().getContent()[0].getRequired(), "the label for context roles has an asterisk");
				const oEmptyRolesText = this.oSaveAsAdaptation._oContextComponentInstance.getRootControl()
				.getController().oI18n.getText("NO_SELECTED_ROLES_WITH_ADVICE");
				assert.strictEqual(
					oContextsList.getNoDataText(),
					oEmptyRolesText,
					"the correct text for no roles selected will be displayed"
				);
			});

			QUnit.test("and opened a second time", function(assert) {
				// simulate user selection
				this.oDialog.close();
				return this.oSaveAsAdaptation.openAddAdaptationDialog()
				.then(function(oDialog) {
					assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded not again");
					assert.ok(oDialog.isOpen(), "the dialog is opened");
					assert.deepEqual(oDialog.getModel("dialogModel").getProperty("/priority"),
						[{ key: "0", title: "Insert before all (Priority '1')" }], "only one priority entry is visibile data was reset");
				}.bind(this));
			});
		});

		QUnit.module("the save as adaptation dialog is opened and two context-based adaptations already exist", {
			beforeEach() {
				this.clock = sinon.useFakeTimers();
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
				this.aPriorityList = [
					{ key: "0", title: "Insert before all (Priority '1')" },
					{ key: "1", title: "Insert after 'German Admin' (Priority '2')" },
					{ key: "2", title: "Insert after 'DLM Copilot' (Priority '3')" }
				];
				this.oModel.updateAdaptations(this.oContextBasedAdaptations.adaptations);
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				return this.oSaveAsAdaptation.openAddAdaptationDialog().then(function(oDialog) {
					this.oDialog = oDialog;
					return this.oToolbar._pFragmentLoaded;
				}.bind(this))
				.then(function() {
					return this.oSaveAsAdaptation._oContextComponentInstance.rootControlLoaded();
				}.bind(this));
			},
			afterEach() {
				this.clock.restore();
			}
		}, function() {
			QUnit.test("and the save as adaptations dialog is visible and correctly formatted", function(assert) {
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.ok(this.oDialog.isOpen(), "the dialog is opened");
				assert.ok(oContextsList.getHeaderToolbar().getContent()[0].getRequired(), "the label for context roles has an asterisk");
				assert.deepEqual(
					this.oDialog.getModel("dialogModel").getProperty("/priority"),
					this.aPriorityList,
					"the correct priority list is shown"
				);
			});

			QUnit.test("and the mandatory data is entered", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				const oContextVisibility = getControl("contextSharingContainer");
				const oPrioritySelect = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-rank-select");
				const contextVisibilityComponent = getControl("contextSharingContainer");
				assert.ok(oContextVisibility.getVisible(), "context visibility container is visible");
				oTitleInput.setValue("first context-based adaptation");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "first context-based adaptation", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
				oPrioritySelect.setSelectedItem(oPrioritySelect.getItemAt(2));
				oPrioritySelect.fireChange({selectedItem: oPrioritySelect.getItemAt(2)});
				assert.strictEqual(
					oPrioritySelect.getSelectedItem().getText(),
					this.aPriorityList[2].title,
					"the correct priority is selected"
				);
				contextVisibilityComponent.getComponentInstance().setSelectedContexts({role: ["Role 1", "Role 2"]});
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");
			});

			QUnit.test("and an empty title or title with spaces only is entered", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");

				oTitleInput.setValue("");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue("German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and an already existing context-based adaptation title is entered", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");

				oTitleInput.setValue("German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " German Admin", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue("German Admin ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" German Admin ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " German Admin ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and mandatory information is entered except contexts", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				const oContextVisibility = getControl("contextSharingContainer");
				const oPrioritySelect = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-rank-select");
				const contextVisibilityComponent = getControl("contextSharingContainer");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				const aRemoveRoles = getControl("contextSharing---ContextVisibility--removeAllButton");
				assert.ok(oContextVisibility.getVisible(), "context visibility container is visible");
				oTitleInput.setValue("first context-based adaptation");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "first context-based adaptation", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
				oPrioritySelect.setSelectedItem(oPrioritySelect.getItemAt(2));
				oPrioritySelect.fireChange({selectedItem: oPrioritySelect.getItemAt(2)});
				assert.strictEqual(
					oPrioritySelect.getSelectedItem().getText(),
					this.aPriorityList[2].title,
					"the correct priority is selected"
				);
				contextVisibilityComponent.getComponentInstance().setSelectedContexts({role: ["Role 1", "Role 2"]});
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");

				aRemoveRoles.firePress();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and mandatory information is entered except title", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				const oContextVisibility = getControl("contextSharingContainer");
				const oPrioritySelect = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-rank-select");
				const contextVisibilityComponent = getControl("contextSharingContainer");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				assert.ok(oContextVisibility.getVisible(), "context visibility container is visible");
				oPrioritySelect.setSelectedItem(oPrioritySelect.getItemAt(2));
				oPrioritySelect.fireChange({selectedItem: oPrioritySelect.getItemAt(2)});
				assert.strictEqual(
					oPrioritySelect.getSelectedItem().getText(),
					this.aPriorityList[2].title,
					"the correct priority is selected"
				);
				contextVisibilityComponent.getComponentInstance().setSelectedContexts({role: ["Role 1", "Role 2"]});
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.strictEqual(oTitleInput.getValueState(), ValueState.None, "the value state is initially none");
				assert.strictEqual(oTitleInput.getValue(), "", "correct value is written");
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				// set the missing title
				oTitleInput.setValue("first context-based adaptation");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValueState(), ValueState.None, "the value state is still none");
				assert.strictEqual(oTitleInput.getValue(), "first context-based adaptation", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");

				// delete the title again
				oTitleInput.setValue("");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValueState(), ValueState.Error, "the value state is set to error");
				assert.strictEqual(oTitleInput.getValue(), "", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled anymore");
			});
		});

		QUnit.module("the save as adaptation dialog is opened for edit mode (edit adaptation dialog)", {
			beforeEach() {
				this.clock = sinon.useFakeTimers();
				this.sManageAdaptationsDialog = "manageAdaptationDialog";
				this.oContextBasedAdaptations = {
					adaptations: [{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						rank: 1,
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
						rank: 2,
						createdBy: "Test User 2",
						createdAt: "2022-05-17T09:30:32Z",
						changedBy: "Test User 2",
						changedAt: "2022-09-07T10:30:32Z"
					},
					{
						id: "id-1591275572836-1",
						contexts: {
							role: ["KEY_USER"]
						},
						title: "Key User's Favorite",
						description: "only for key users",
						rank: 3,
						createdBy: "Key User 5",
						createdAt: "2022-05-17T09:30:32Z",
						changedBy: "Key User 5",
						changedAt: "2022-09-07T10:30:32Z"
					}]
				};
				this.aPriorityList = [
					{ key: "0", title: "Insert before all (Priority '1')" },
					{ key: "1", title: "Insert after 'DLM Copilot' (Priority '2')" },
					{ key: "2", title: "Insert after 'Key User's Favorite' (Priority '3')" }
				];
				const sLayer = "CUSTOMER";
				this.oModel.updateAdaptations(this.oContextBasedAdaptations.adaptations);
				this.oModel.switchDisplayedAdaptation(this.oContextBasedAdaptations.adaptations[0]);
				this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				return this.oSaveAsAdaptation.openAddAdaptationDialog(sLayer, true).then(function(oDialog) {
					this.oDialog = oDialog;
					return this.oToolbar._pFragmentLoaded;
				}.bind(this))
				.then(function() {
					return this.oSaveAsAdaptation._oContextComponentInstance.rootControlLoaded();
				}.bind(this));
			},
			afterEach() {
				this.clock.restore();
			}
		}, function() {
			QUnit.test("and the edit adaptation dialog is visible, correctly formatted and filled with data", function(assert) {
				assert.strictEqual(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.ok(this.oDialog.isOpen(), "the dialog is opened");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				assert.ok(oContextsList.getHeaderToolbar().getContent()[0].getRequired(), "the label for context roles has an asterisk");
				const oEmptyRolesText = this.oSaveAsAdaptation._oContextComponentInstance.getRootControl()
				.getController().oI18n.getText("NO_SELECTED_ROLES_WITH_ADVICE");
				assert.strictEqual(
					oContextsList.getNoDataText(),
					oEmptyRolesText,
					"the correct text for no roles selected will be displayed"
				);
				assert.deepEqual(
					this.oDialog.getModel("dialogModel").getProperty("/priority"),
					this.aPriorityList,
					"the correct priority list is shown"
				);
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				assert.strictEqual(oTitleInput.getValue(), "German Admin", "correct value is displayed");
				const oPrioritySelect = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-rank-select");
				assert.strictEqual(
					oPrioritySelect.getSelectedItem().getText(),
					this.aPriorityList[0].title,
					"the correct priority is selected"
				);
				const contextVisibilityComponent = getControl("contextSharingContainer");
				const oSelectedRoles = contextVisibilityComponent.getComponentInstance().getSelectedContexts();
				assert.deepEqual(
					oSelectedRoles,
					this.oContextBasedAdaptations.adaptations[0].contexts,
					"the correct context roles are selected"
				);
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				this.clock.tick(100); // wait for events
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and title is changed", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				oTitleInput.setValue("first context-based adaptation");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "first context-based adaptation", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");
			});

			QUnit.test("and priority is changed", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oPrioritySelect = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-rank-select");
				oPrioritySelect.setSelectedItem(oPrioritySelect.getItemAt(2));
				oPrioritySelect.fireChange({selectedItem: oPrioritySelect.getItemAt(2)});
				this.clock.tick(100); // wait for event onPriorityChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");
			});

			QUnit.test("and context roles are changed", function(assert) {
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const contextVisibilityComponent = getControl("contextSharingContainer");
				contextVisibilityComponent.getComponentInstance().setSelectedContexts({role: ["Role 1", "Role 2"]});
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");
			});

			QUnit.test("and an empty title or title with spaces only is entered", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");

				oTitleInput.setValue("");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue("German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and an already existing context-based adaptation title is entered", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");

				oTitleInput.setValue("German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" German Admin");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " German Admin", "correct value is written");
				oTitleInput.fireChangeEvent();
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue("German Admin ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "German Admin ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue(" German Admin ");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), " German Admin ", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});

			QUnit.test("and mandatory information is entered except contexts", function(assert) {
				const oSaveButton = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-saveButton");
				const oTitleInput = getToolbarRelatedControl(this.oToolbar, "saveAdaptation-title-input");
				const oContextVisibility = getControl("contextSharingContainer");
				const contextVisibilityComponent = getControl("contextSharingContainer");
				const oContextsList = Element.getElementById("contextSharing---ContextVisibility--selectedContextsList");
				const aRemoveRoles = getControl("contextSharing---ContextVisibility--removeAllButton");
				assert.ok(oContextVisibility.getVisible(), "context visibility container is visible");

				aRemoveRoles.firePress();
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				oTitleInput.setValue("first context-based adaptation");
				oTitleInput.fireLiveChange();
				assert.strictEqual(oTitleInput.getValue(), "first context-based adaptation", "correct value is written");
				this.clock.tick(100); // wait for event onAdaptationTitleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");

				contextVisibilityComponent.getComponentInstance().setSelectedContexts({role: ["Role 1", "Role 2"]});
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.ok(oSaveButton.getEnabled(), "save button is enabled");

				aRemoveRoles.firePress();
				oContextsList.fireUpdateFinished();
				this.clock.tick(100); // wait for event onContextRoleChange
				assert.notOk(oSaveButton.getEnabled(), "save button is not enabled");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});