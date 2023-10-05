/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/model/json/JSONModel",
	"sap/m/StandardListItem",
	"sap/m/List",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core",
	"sap/ui/core/Element"
], function(
	ContextVisibility,
	WriteStorage,
	JSONModel,
	StandardListItem,
	List,
	RadioButton,
	RadioButtonGroup,
	sinon,
	oCore,
	Element
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oController;

	var oDescription = {
		role: [
			{
				id: "REMOTE",
				description: "remote system"
			},
			{
				id: "ADMIN",
				description: "Administrator"
			}
		]
	};

	QUnit.module("Given a ContextVisiblility Controller", {
		beforeEach() {
			oController = new ContextVisibility();
			this.oRoles = {
				values: [
					{
						id: "REMOTE",
						description: "Role for accessing remote system"
					},
					{
						id: "ADMIN",
						description: "Administrator"
					},
					{
						id: "KPI",
						description: "KPI Framework"
					}
				],
				lastHitReached: true
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controller is initialized", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);
			sandbox.stub(oController, "getView").returns({
				getModel(sId) {
					if (sId === "i18n") {
						return {
							getResourceBundle() {
								return {
									getText() {
										return "No roles selected.";
									}
								};
							}
						};
					}
					return new JSONModel();
				}
			});

			oController.onInit();
			assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
			assert.strictEqual(oController.oSelectedContextsModel.getProperty("/noDataText"), undefined, "then noDataText in oSelectedContextsModel is not set");
		});

		QUnit.test("when rendering component with one pre-selected role, restricted radio button is selected", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);

			var oRadioButtonGroup = new RadioButtonGroup();
			sandbox.stub(oController, "byId").returns(oRadioButtonGroup);
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedContexts() {
					return {role: ["TEST"]};
				}
			});
			var sText = "No roles selected.";
			oController.oI18n = {
				getText() {
					return sText;
				}
			};
			oController.oSelectedContextsModel = new JSONModel({
				selected: ["TEST"],
				noDataText: undefined
			});

			return oController.onBeforeRendering().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				assert.strictEqual(oController.oSelectedContextsModel.getProperty("/noDataText"), sText, "then oSelectedContextsModel has a text");
			});
		});

		QUnit.test("when rendering component without pre-selected roles, public radio button is selected", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);

			var oRadioButtonGroup = new RadioButtonGroup();
			sandbox.stub(oController, "byId").returns(oRadioButtonGroup);
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedContexts() {
					return {role: []};
				}
			});
			var sText = "No roles selected.";
			oController.oI18n = {
				getText() {
					return sText;
				}
			};
			oController.oSelectedContextsModel = new JSONModel({
				selected: [],
				noDataText: undefined
			});

			return oController.onBeforeRendering().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
				assert.strictEqual(oRadioButtonGroup.getSelectedIndex(), 0, "then public radio button is selected");
				assert.strictEqual(oController.oSelectedContextsModel.getProperty("/noDataText"), sText, "then oSelectedContextsModel has a text");
			});
		});

		QUnit.test("when the 'Add Contexts' button is pressed ", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({});
			oController.oSelectedContextsModel = new JSONModel({selected: []});
			sandbox.stub(oController, "getView").returns({
				addDependent() {},
				getId() {}
			});

			return oController.onAddContextsHandler().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				var oSelectedRolesDialog = Element.registry.get("selectContexts-dialog");
				assert.strictEqual(oSelectedRolesDialog.isOpen(), true, "then the dialog is opened");
				oSelectedRolesDialog.destroy();
			});
		});

		QUnit.test("when 'More' button is pressed and more data can be fetched from the back end", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: false});

			var oEvent = {
				getParameter() {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				assert.strictEqual(oController.oContextsModel.getData().values.length, 4, "then the model was extended correctly");
			});
		});

		QUnit.test("when 'More' button is pressed but there is no more data that can be fetched from the back end", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: true});

			var oEvent = {
				getParameter() {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function() {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
				assert.strictEqual(oController.oContextsModel.getData().values.length, 1, "then the model was not extended");
			});
		});

		QUnit.test("when searching for new contexts", function(assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({});

			var oEvent = {
				getParameter() {
					return "KPI";
				},
				getSource() {
					return {
						clearSelection() {}
					};
				}
			};

			return oController.onSearch(oEvent).then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
			});
		});

		QUnit.test("when deleting one context from selected contexts list", function(assert) {
			oController.oSelectedContextsModel = new JSONModel({selected: this.oRoles.values});
			var oEvent = {
				getParameter() {
					return new StandardListItem({title: "ADMIN"});
				},
				getSource() {
					return new List();
				}
			};

			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 3, "then there are three items");
			oController.onDeleteContext(oEvent);
			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 2, "then one item was deleted from model");
		});

		QUnit.test("when deciding whether items should be selected", function(assert) {
			var oItem1 = {id: "ADMIN"};
			var oItem2 = {id: "RANDOM"};
			var aSelectedItems = [{id: "ADMIN"}, {id: "TEST"}];
			assert.equal(oController.isSelected(oItem1, aSelectedItems), true, "then item is selected");
			assert.equal(oController.isSelected(oItem2, aSelectedItems), false, "then item is not selected");
		});

		QUnit.test("when clicking confirm on select roles list", function(assert) {
			oController.oSelectedContextsModel = new JSONModel({selected: []});
			oController.oCurrentSelection = [{ id: "REMOTE", description: "Role for accessing remote system"}];

			sandbox.stub(oController, "getView").returns({
				getId() {}
			});

			oController.onSelectContexts();
			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 1, "then one roles is selected");
		});

		QUnit.test("when adding a new selection in add roles dialog", function(assert) {
			oController.oCurrentSelection = [];

			var oEvent = {
				getParameter(sId) {
					return sId === "selected" ? true : new StandardListItem({title: "REMOTE", description: "TEST"});
				}
			};

			oController._onSelectionChange(oEvent);
			assert.equal(oController.oCurrentSelection.length, 1, "one selection was added to current selection closure");
			assert.equal(oController.oCurrentSelection[0].id, "REMOTE", "selection is as expected");
		});

		QUnit.test("when removing a new selection in add roles dialog", function(assert) {
			oController.oCurrentSelection = [{id: "REMOTE", description: "TEST"}, {id: "TEST", description: "TEST"}];

			var oEvent = {
				getParameter(sId) {
					return sId === "selected" ? false : new StandardListItem({title: "REMOTE", description: "TEST"});
				}
			};

			oController._onSelectionChange(oEvent);
			assert.equal(oController.oCurrentSelection.length, 1, "one selection was removed to current selection closure");
			assert.equal(oController.oCurrentSelection[0].id, "TEST", "selection is as excpected");
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});