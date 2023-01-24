/*global QUnit */
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
	"sap/m/App",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(createAndAppendDiv, TablePersoController, JSONModel, Table, Label, Toolbar, ToolbarSpacer, Button, Column, ColumnListItem, Page, App, jQuery, oCore) {
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
		persoService : oPersoService,
		saveColumnWidth : true
	}).activate();

	var sPersoDoneMsg = "Personalization Done!";
	var fnPersoDone = function() {
		throw sPersoDoneMsg;
	};

	oTPC.attachPersonalizationsDone(fnPersoDone);

	oCore.byId("idPersonalizationButton").attachPress(function(oEvent) {
		oTPC.openDialog();
	});

	oCore.byId("idPersonalizationResetButton").attachPress(function() {
		//		Log.debug("TablePersoController resetRadioButton");
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

		//Change width of first column
		oTable.getColumns()[0].setWidth("20em");

		// Open dialog
		oCore.byId("idPersonalizationButton").firePress();

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

		assert.strictEqual(oPersData.aColumns[0].width, "20em", "0 Width");

		// Close dialog with "Cancel"
		oCore.byId(oTPD._oDialog.getRightButton()).firePress();

	});

});