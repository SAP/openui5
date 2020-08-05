/*global QUnit, jQuery */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TablePersoController",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Label",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Page",
	"sap/m/App"
], function(createAndAppendDiv, TablePersoController, JSONModel, Table, Label, Toolbar, ToolbarSpacer, Button, Column, ColumnListItem, Page, App) {
	"use strict";


	// prepare DOM
	createAndAppendDiv("content");


	var oList;

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var oPersoService = {
		getPersData : function() {
			var oDeferred = new jQuery.Deferred();
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function(oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

	resetPersData : function() {
			var oDeferred = new jQuery.Deferred();

			var oInitialData = {
				_persoSchemaVersion : "1.0",
				aColumns : [{
					id : "QUnitTest-idRandomDataTable-idColor",
					order : 0,
					text : "Color",
					visible : false
				}, {
					id : "QUnitTest-idRandomDataTable-idNumber",
					order : 1,
					text : "Number",
					visible : true
				}, {
					id : "QUnitTest-idRandomDataTable-idName",
					order : 2,
					text : "Name",
					visible : true
				}]
			};

			this._oBundle = oInitialData;
			oDeferred.resolve();
			return oDeferred.promise();
		}
	};

	/**
	 * Set up a test data environment. Need a table for the perso dialog
	 */
	var oData = {
		items : [{
			name : "Michelle",
			color : "orange",
			number : 3.14
		}, {
			name : "Joseph",
			color : "blue",
			number : 1.618
		}, {
			name : "David",
			color : "green",
			number : 0
		}],
		cols : ["Name", "Color", "Number"]
	};

	var oTable = new Table("idRandomDataTable", {
		inset : true,
		headerText : "Random Data",
		headerToolbar : new Toolbar({
			content : [new Label({
				text : "Random Data"
			}), new ToolbarSpacer({}), new Button("idPersonalizationResetButton", {
				icon : "sap-icon://refresh"
			}), new Button("idPersonalizationButton", {
				icon : "sap-icon://person-placeholder"
			})]
		}),
		columns : oData.cols.map(function(colname) {
			return new Column("id" + colname, {
				header : new Label({
					text : colname
				})
			});
		})
	});

	oTable.setModel(new JSONModel(oData));
	oTable.bindAggregation("items", "/items", new ColumnListItem({
		cells : oData.cols.map(function(colname) {
			return new Label({
				text : "{" + colname.toLowerCase() + "}"
			});
		})
	}));

	var oTPC = new TablePersoController({
		table : oTable,
		componentName: "QUnitTest",
		persoService : oPersoService
	}).activate();

	var sPersoDoneMsg = "Personalization Done!";
	var fnPersoDone = function() {
		throw sPersoDoneMsg;
	};

	oTPC.attachPersonalizationsDone(fnPersoDone);

	sap.ui.getCore().byId("idPersonalizationButton").attachPress(function(oEvent) {
		oTPC.openDialog();
	});

	sap.ui.getCore().byId("idPersonalizationResetButton").attachPress(function() {
		//		jQuery.sap.log.debug("TablePersoController resetRadioButton");
		oPersoService.resetPersData();
		oTPC.refresh();
	});

	var page = new Page("myFirstPage", {
		title : "TablePersoController Test",
		content : oTable
	});

	var app = new App("myApp", {
		initialPage : "myFirstPage"
	});

	app.addPage(page).placeAt("content");

	QUnit.module("Change & Reset");

	QUnit.test("Original order and all visible", function(assert) {

		// Open dialog
		sap.ui.getCore().byId("idPersonalizationButton").firePress();

		// Get the privately aggregated TPD
		var oTPD = oTPC.getAggregation("_tablePersoDialog");

		// Status at this point should be initial, i.e.:
		// Name   ON
		// Color  ON
		// Number ON

		var oPersData = oTPD.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns[0].id, "QUnitTest-idRandomDataTable-idName", "0 Name");
		assert.strictEqual(oPersData.aColumns[1].id, "QUnitTest-idRandomDataTable-idColor", "1 Color");
		assert.strictEqual(oPersData.aColumns[2].id, "QUnitTest-idRandomDataTable-idNumber", "2 Number");

		assert.strictEqual(oPersData.aColumns[0].visible, true, "0 Name ON");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "1 Color ON");
		assert.strictEqual(oPersData.aColumns[2].visible, true, "2 Number ON");

		// Close dialog with "Cancel"
		sap.ui.getCore().byId(oTPD._oDialog.getRightButton()).firePress();

	});

	QUnit.test("Make personalizations (1 invisible, 1 order change)", function(assert) {

		// Open dialog
		sap.ui.getCore().byId("idPersonalizationButton").firePress();

		// Get the privately aggregated TPD and the inner dialog
		var oTPD = oTPC.getAggregation("_tablePersoDialog"),
			oDialog = oTPD._oDialog;
			oList = oDialog.getContent()[0];

		// Move "Color" column up by one:
		// - select item
		// - press the "move up" button
		oList.getItems()[1].setSelected(true);
		oTPD._oSelectedItem = oList.getItems()[1];
		oTPD._oButtonUp.firePress();

		// Set visibility of "Number" to false
		oList.getItems()[2].setSelected(false);

		// Close dialog with "OK"
		var bPersonalizationDoneTriggered = false;
		try {
			sap.ui.getCore().byId(oDialog.getLeftButton()).firePress();
		} catch (e) {
			assert.equal(e, sPersoDoneMsg, "'PersonalizationDone' event triggered the correct function");
			oTPC.detachPersonalizationsDone(fnPersoDone);
			bPersonalizationDoneTriggered = true;
		} finally {
			assert.ok(bPersonalizationDoneTriggered, "'PersonalizationDone' event has been triggered");
		}

		// Status at this point should be:
		// Color  ON
		// Name   ON
		// Number OFF

		var oPersData = oTPD.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns[0].id, "QUnitTest-idRandomDataTable-idColor", "0 Color");
		assert.strictEqual(oPersData.aColumns[1].id, "QUnitTest-idRandomDataTable-idName", "1 Name");
		assert.strictEqual(oPersData.aColumns[2].id, "QUnitTest-idRandomDataTable-idNumber", "2 Number");

		assert.strictEqual(oPersData.aColumns[0].visible, true, "0 Color ON");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "1 Name ON");
		assert.strictEqual(oPersData.aColumns[2].visible, false, "2 Number OFF");

	});

	QUnit.test("More personalizations then reset (1 invisible, 1 order change)", function(assert) {

		// Open dialog
		sap.ui.getCore().byId("idPersonalizationButton").firePress();

		// Get the privately aggregated TPD and the inner dialog
		var oTPD = oTPC.getAggregation("_tablePersoDialog"),
			oDialog = oTPD._oDialog;
			oList = oDialog.getContent()[0];

		// Move "Name" column up by one:
		// - select item
		// - press the "move up" button
		oList.getItems()[1].setSelected(true);
		oTPD._oSelectedItem = oList.getItems()[1];
		oTPD._oButtonUp.firePress();

		// Set visibility of "Name" to false
		oList.getItems()[0].setSelected(false);

		// Status at this point should be:
		// Name   OFF
		// Color  ON
		// Number OFF

		var oPersData = oTPD.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns[0].id, "QUnitTest-idRandomDataTable-idName", "0 Name");
		assert.strictEqual(oPersData.aColumns[1].id, "QUnitTest-idRandomDataTable-idColor", "1 Color");
		assert.strictEqual(oPersData.aColumns[2].id, "QUnitTest-idRandomDataTable-idNumber", "2 Number");

		assert.strictEqual(oPersData.aColumns[0].visible, false, "0 Name OFF (before 1st reset)");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "1 Color ON (before 1st reset)");
		assert.strictEqual(oPersData.aColumns[2].visible, false, "2 Number OFF (before 1st reset)");

		// Hit "Reset" button

		oTPD._resetAllButton.firePress();

		// Close dialog with "OK"
		sap.ui.getCore().byId(oDialog.getLeftButton()).firePress();

		// Status at this point should be:
		// Color  ON
		// Name   ON
		// Number OFF

		var oPersData = oTPD.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns[1].id, "QUnitTest-idRandomDataTable-idColor", "0 Color");
		assert.strictEqual(oPersData.aColumns[2].id, "QUnitTest-idRandomDataTable-idNumber", "1 Number");
		assert.strictEqual(oPersData.aColumns[0].id, "QUnitTest-idRandomDataTable-idName", "2 Name");

		assert.strictEqual(oPersData.aColumns[0].visible, true, "0 Color ON (after 1st reset)");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "1 Number ON (after 1st reset)");
		assert.strictEqual(oPersData.aColumns[2].visible, true, "2 Name OFF (after 1st reset)");
	});

	QUnit.test("More personalizations for real (1 invisible, 1 order change)", function(assert) {

		// Open dialog
		sap.ui.getCore().byId("idPersonalizationButton").firePress();

		// Get the privately aggregated TPD and the inner dialog
		var oTPD = oTPC.getAggregation("_tablePersoDialog");
		var oDialog = oTPD._oDialog;

		// Move "Name" (1st item) column down by one:
		// - select item
		// - press the "move down" button
		oList.getItems()[1].setSelected(true);
		oTPD._oSelectedItem = oList.getItems()[1];
		oTPD._oButtonDown.firePress();

		// Set visibility of "Color" to false
		oList.getItems()[0].setSelected(false);

		// Close dialog with "OK"
		sap.ui.getCore().byId(oDialog.getLeftButton()).firePress();

		// Status at this point should be:
		// Color  OFF
		// Number OFF
		// Name   ON

		var oPersData = oTPD.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns[2].id, "QUnitTest-idRandomDataTable-idColor", "3rd col ID is correct");
		assert.strictEqual(oPersData.aColumns[1].id, "QUnitTest-idRandomDataTable-idNumber", "2nd col ID is correct");
		assert.strictEqual(oPersData.aColumns[0].id, "QUnitTest-idRandomDataTable-idName", "1st col ID is correct");

		assert.strictEqual(oPersData.aColumns[0].visible, false, "0th col visibility is correct");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "1st col visibility is correct");
		assert.strictEqual(oPersData.aColumns[2].visible, true, "2nd col visibility is correct");

	});

	QUnit.test("Reset to the initial Column order", function(assert) {

		//reset personalization
		sap.ui.getCore().byId("idPersonalizationResetButton").firePress();
		sap.ui.getCore().applyChanges();
		var oColumns = oTable.getColumns();
		oColumns.forEach(function(oColumn) {
			switch (oColumn.getId()){
				case "idName":
					assert.ok(oColumn.getVisible(), "Column Name visibility OK!");
					assert.equal(oColumn.getOrder(), 2, "Column 2 (Name) order is correct");
					break;
				case "idColor":
					assert.ok(!oColumn.getVisible(), "Column Color visibility OK!");
					assert.equal(oColumn.getOrder(), 0, "Column 0 (Color) order is correct");
					break;
				case "idNumber":
					assert.ok(oColumn.getVisible(), "Column Number visibility OK!");
					assert.equal(oColumn.getOrder(), 1, "Column 1 (Number) order is correct");
					break;
			}
		});
	});

	QUnit.test("Destroy TablePersoController", function(assert) {
		var iDelegatesCount = oTable.aDelegates.length;
		oTPC.destroy();

		assert.ok(!oTPC._mDelegateMap, null, "Delegate map is destroyed");
		assert.ok(!oTPC._oPersService, null, "Perso service is cleaned up");
		assert.ok(!oTPC._mTablePersMap, null, "Resource bundle is cleaned up");
		assert.ok(!oTPC._mInitialTableStateMap, null, "Model bundle is cleaned up");
		assert.ok(!oTPC.getTablePersoDialog(), null, "Dialog is cleaned up");
		assert.ok(oTable.aDelegates.length == (iDelegatesCount - 1), null, "Table delegate has been removed");
	});

	QUnit.test("Duplicate TablePersoController", function(assert) {

		var oTPC1 = new TablePersoController("TPC");
		var oTPC2;
		var oException;

		try {
			oTPC2 = new TablePersoController("TPC");
		} catch (oError) {
			oException = oError;
		}

		assert.ok(oException, "Exception fired");
		assert.equal(oException.message, "Error: adding TablePersoController with duplicate id 'TPC'");
		assert.notOk(oTPC2, "No duplicate created");

		oTPC1.destroy();

	});

});