/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	ContextVisibility,
	WriteStorage,
	JSONModel,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oController;


	var oRoles = {
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

	var oDescription = {
		role : [
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
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controller is initialized with selected roles", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);
			sandbox.stub(oController, "getView").returns({
				getModel: function() {
					return new JSONModel();
				}
			});
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedRoles: function() {
					return ["TEST"];
				}
			});

			return oController.onInit().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				assert.strictEqual(oController.oSelectedContextsModel.getProperty("/selected").length, 2, "then model was updated");
			});
		});

		QUnit.test("when the controller is initialized without selected roles", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "loadContextDescriptions").resolves(oDescription);
			sandbox.stub(oController, "getView").returns({
				getModel: function() {
					return new JSONModel();
				}
			});
			sandbox.stub(oController, "getOwnerComponent").returns({
				getSelectedRoles: function() {
					return [];
				}
			});

			return oController.onInit().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
			});
		});

		QUnit.test("when the 'Add Contexts' button is pressed ", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(oRoles);
			oController.oContextsModel = new JSONModel({});
			sandbox.stub(oController, "getView").returns({
				addDependent: function() {}
			});

			return oController.onAddContextsHandler().then(function() {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				var oSelectedRolesDialog = sap.ui.getCore().byId("selectContexts-dialog");
				assert.strictEqual(oSelectedRolesDialog.isOpen(), true, "then the dialog is opened");
				oSelectedRolesDialog.destroy();
			});
		});

		QUnit.test("when 'More' button is pressed and more data can be fetched from the back end", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: false});

			var oEvent = {
				getParameter: function () {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function (oRoles) {
				assert.strictEqual(oConnectorCall.callCount, 1, "then the back end request was sent once");
				assert.strictEqual(oRoles.length, 4, "then the model was extended correctly");
			});
		});

		QUnit.test("when 'More' button is pressed but there is no more data that can be fetched from the back end", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(oRoles);
			oController.oContextsModel = new JSONModel({ values: [{id: "1", description: "test"}], lastHitReached: true});

			var oEvent = {
				getParameter: function () {
					return "Growing";
				}
			};

			return oController._updateStartedHandler(oEvent).then(function (oRoles) {
				assert.strictEqual(oConnectorCall.callCount, 0, "then the back end request was not sent");
				assert.strictEqual(oRoles.length, 1, "then the model was not extended");
			});
		});

		QUnit.test("when searching for new contexts", function (assert) {
			var oConnectorCall = sandbox.stub(WriteStorage, "getContexts").resolves(oRoles);
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
	});
	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});