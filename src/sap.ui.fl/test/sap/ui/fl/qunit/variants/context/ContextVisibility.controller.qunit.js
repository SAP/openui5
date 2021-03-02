/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/model/json/JSONModel",
	"sap/m/StandardListItem",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	ContextVisibility,
	WriteStorage,
	JSONModel,
	StandardListItem,
	RadioButton,
	RadioButtonGroup,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
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
		beforeEach: function () {
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
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controller is initialized", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);
			sandbox.stub(oController, "getView").returns({
				getModel: function(sId) {
					if (sId === "i18n") {
						return {
							getResourceBundle: function() {}
						};
					}
					return new JSONModel();
				}
			});

			oController.onInit();
			assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
		});

		QUnit.test("when rendering component with one pre-selected role, restricted radio button is selected", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);

			var oRadioButtonGroup = new RadioButtonGroup();
			sandbox.stub(oController, "byId").returns(oRadioButtonGroup);
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedContexts: function() {
					return {role: ["TEST"]};
				}
			});
			oController.oSelectedContextsModel = new JSONModel({selected: ["TEST"]});

			return oController.onBeforeRendering().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
			});
		});

		QUnit.test("when rendering component without pre-selected roles, public radio button is selected", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);

			var oRadioButtonGroup = new RadioButtonGroup();
			sandbox.stub(oController, "byId").returns(oRadioButtonGroup);
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedContexts: function() {
					return {role: []};
				}
			});
			oController.oSelectedContextsModel = new JSONModel({selected: []});

			return oController.onBeforeRendering().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
				assert.strictEqual(oRadioButtonGroup.getSelectedIndex(), 0, "then public radio button is selected");
			});
		});

		QUnit.test("when the 'Add Contexts' button is pressed ", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({});
			sandbox.stub(oController, "getView").returns({
				addDependent: function() {},
				getId: function() {}
			});

			return oController.onAddContextsHandler().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				var oSelectedRolesDialog = sap.ui.getCore().byId("selectContexts-dialog");
				assert.strictEqual(oSelectedRolesDialog.isOpen(), true, "then the dialog is opened");
				oSelectedRolesDialog.destroy();
			});
		});

		QUnit.test("when 'More' button is pressed and more data can be fetched from the back end", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: false});

			var oEvent = {
				getParameter: function () {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function () {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				assert.strictEqual(oController.oContextsModel.getData().values.length, 4, "then the model was extended correctly");
			});
		});

		QUnit.test("when 'More' button is pressed but there is no more data that can be fetched from the back end", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: true});

			var oEvent = {
				getParameter: function () {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function () {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
				assert.strictEqual(oController.oContextsModel.getData().values.length, 1, "then the model was not extended");
			});
		});

		QUnit.test("when searching for new contexts", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(this.oRoles);
			oController.oContextsModel = new JSONModel({});

			var oEvent = {
				getParameter: function () {
					return "KPI";
				}
			};

			return oController.onSearch(oEvent).then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
			});
		});

		QUnit.test("when deleting one context from selected contexts list", function (assert) {
			oController.oSelectedContextsModel = new JSONModel({selected: this.oRoles.values});
			var oEvent = {
				getParameter: function () {
					return new StandardListItem({title: "ADMIN"});
				}
			};

			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 3, "then there are three items");
			oController.onDeleteContext(oEvent);
			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 2, "then one item was deleted from model");
		});

		QUnit.test("when deciding whether items should be selected", function (assert) {
			var oItem1 = {id: "ADMIN"};
			var oItem2 = {id: "RANDOM"};
			var aSelectedItems = [{id: "ADMIN"}, {id: "TEST"}];
			assert.equal(oController.isSelected(oItem1, aSelectedItems), true, "then item is selected");
			assert.equal(oController.isSelected(oItem2, aSelectedItems), false, "then item is not selected");
		});

		QUnit.test("when restricted radio button is selected", function (assert) {
			var oEvent = {
				getSource: function() {
					return new RadioButton();
				},
				getParameters: function() {
					return {selected: true};
				}
			};
			var fnSetVisibleStub = sandbox.stub(oController, "byId").returns({
				setVisible: function(bFlag) {
					return bFlag;
				}
			});
			oController.onSelectRestrictedRadioButton(oEvent);
			assert.equal(fnSetVisibleStub.callCount, 1, "then the visibility of hidden panel is set to 'true'");
		});

		QUnit.test("when clicking confirm on select roles list", function (assert) {
			oController.oSelectedContextsModel = new JSONModel({selected: []});
			var oEvent = {
				getParameter: function() {
					return [oListItem];
				}
			};
			var oListItem = {
				getObject: function() {
					return { id: "REMOTE", description: "Role for accessing remote system"};
				}
			};

			sandbox.stub(oController, "getView").returns({
				getId: function() {}
			});

			oController.onSelectContexts(oEvent);
			assert.equal(oController.oSelectedContextsModel.getProperty("/selected").length, 1, "then one roles is selected");
		});
	});
	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});