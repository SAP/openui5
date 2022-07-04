/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/appContexts/controller/ManageContexts.controller",
	"sap/ui/rta/appContexts/controller/RestAPIConnector",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/library",
	"sap/m/ColumnListItem",
	"sap/base/util/restricted/_merge",
	"sap/ui/thirdparty/sinon-4"
], function (
	ManageContexts,
	RestAPIConnector,
	JSONModel,
	Table,
	Column,
	Label,
	Text,
	mobileLibrary,
	ColumnListItem,
	_merge,
	sinon
) {
	"use strict";

	var ListMode = mobileLibrary.ListMode;

	var sandbox = sinon.sandbox.create();
	var oController;


	var oAppContexts = {
		appContexts: [
			{
				id: "id-1591275572834-1",
				types: {
					role: ["SAP_ACH_ADMIN", "MW_ADMIN"],
					country: ["DE"]
				},
				title: "German Admin",
				description: "ACH Admin for Germany",
				rank: 1
			},
			{
				id: "id-1591275572834-2",
				types: {
					role: ["DLM_FIORI_COPILOT"],
					country: ["DE", "BE", "DK", "FR", "IT", "ES", "AT", "NL", "HU", "FI", "SE"]
				},
				title: "DLM Copilot",
				description: "DLM copilot contexts for Europe",
				rank: 2
			}
		]
	};

	function fillTable() {
		var oTable = new Table("table1", {
			mode: ListMode.SingleSelectMaster,
			columns: [new Column(), new Column()]
		});

		oTable.setModel(new JSONModel(oAppContexts), "appContexts");

		oTable.bindItems({
			path: "appContexts>/appContexts",
			template: new ColumnListItem({
				cells: [
					new Text({text: "{appContexts>title}"}),
					new Text({text: "{appContexts>description}"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		return oTable;
	}


	QUnit.module("Given a ManageContexts Controller", {
		beforeEach: function () {
			oController = new ManageContexts();
			var oData = _merge({}, oAppContexts);
			oController.oAppContextsModel = new JSONModel(oData);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controller is initialized", function (assert) {
			var oConnectorCall = sandbox.stub(RestAPIConnector, "getAppContextData").resolves(oAppContexts);
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
			sandbox.stub(oController, "getOwnerComponent").returns({
				getLayer: function() {
					return "CUSTOMER";
				}
			});
			sandbox.stub(oController, "byId").returns(new Table());
			oController.onInit();
			assert.strictEqual(oConnectorCall.callCount, 1, " back end request was sent");
		});

		QUnit.test("when trying to move first position up, nothing happens", function (assert) {
			var oTable = fillTable();
			oTable.setSelectedItem(oTable.getItems()[0]);
			sap.ui.getCore().applyChanges();
			sandbox.stub(oController, "byId").returns(oTable);
			oController.moveSelectedItem("Up");

			assert.equal(oController.oAppContextsModel.getData().appContexts[0].title, "German Admin", "first item did not move");
			assert.equal(oController.oAppContextsModel.getData().appContexts[1].title, "DLM Copilot", "second item did not move");
			oTable.destroy();
		});

		QUnit.test("when trying to move second position up, positions are switched", function (assert) {
			var oTable = fillTable();
			oTable.setSelectedItem(oTable.getItems()[1]);
			sap.ui.getCore().applyChanges();
			sandbox.stub(oController, "byId").returns(oTable);
			oController.moveSelectedItem("Up");

			assert.equal(oController.oAppContextsModel.getData().appContexts[0].title, "DLM Copilot", "second item did not move");
			assert.equal(oController.oAppContextsModel.getData().appContexts[1].title, "German Admin", "first item did not move");
			oTable.destroy();
		});

		QUnit.test("when trying to move first position down, positions are switched", function (assert) {
			var oTable = fillTable();
			oTable.setSelectedItem(oTable.getItems()[0]);
			sap.ui.getCore().applyChanges();
			sandbox.stub(oController, "byId").returns(oTable);
			oController.moveSelectedItem("Down");

			assert.equal(oController.oAppContextsModel.getData().appContexts[0].title, "DLM Copilot", "second item did not move");
			assert.equal(oController.oAppContextsModel.getData().appContexts[1].title, "German Admin", "first item did not move");
			oTable.destroy();
		});

		QUnit.test("when trying to move second position down, nothing happens", function (assert) {
			var oTable = fillTable();
			oTable.setSelectedItem(oTable.getItems()[1]);
			sap.ui.getCore().applyChanges();
			sandbox.stub(oController, "byId").returns(oTable);
			oController.moveSelectedItem("Down");

			assert.equal(oController.oAppContextsModel.getData().appContexts[0].title, "German Admin", "first item did not move");
			assert.equal(oController.oAppContextsModel.getData().appContexts[1].title, "DLM Copilot", "second item did not move");
			oTable.destroy();
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});