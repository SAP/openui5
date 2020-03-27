/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/TablePersoController",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/model/json/JSONModel"
], function(TableQUnitUtils, TablePersoController, qutils, Table, Column, JSONModel) {
	"use strict";

	var oController = null, oTable = null;

	function createController(mControllerSettings, mTableSettings) {
		// init settings
		mControllerSettings = mControllerSettings || {};
		mTableSettings = mTableSettings || {};

		// table data
		var oData = {
			items: [
				{name: "Michelle", color: "orange", number: 3.14},
				{name: "Joseph", color: "blue", number: 1.618},
				{name: "David", color: "green", number: 0}
			],
			cols: ["Name", "Color", "Number"]
		};

		// Table settings
		mTableSettings.showColumnVisibilityMenu = true;
		mTableSettings.columns = jQuery.map(oData.cols, function(colname) {
			var oAggregations = {
				label: new TableQUnitUtils.TestControl({text: colname}),
				visible: colname === "Color" ? false : true, // Color column should be invisible by default
				template: new TableQUnitUtils.TestControl({
					text: {
						path: colname.toLowerCase()
					}
				})
			};
			if (colname !== "Number") {
				oAggregations.multiLabels = [
					new TableQUnitUtils.TestControl({text: "First level header"}),
					new TableQUnitUtils.TestControl({text: colname + " - Second level header"})
				];
			}
			return new Column(colname, oAggregations);
		});

		// Controller settings
		oTable = new Table("table", mTableSettings);
		oTable.setModel(new JSONModel(oData));
		oTable.bindRows("/items");
		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		mControllerSettings.table = oTable;

		oController = new TablePersoController(mControllerSettings);
	}

	function destroyController() {
		if (oTable) {
			oTable.destroy();
			oTable = null;
		}
		if (oController) {
			oController.destroy();
			oController = null;
		}
	}

	QUnit.module("Basic checks", {
		afterEach: function() {
			destroyController();
		}
	});

	QUnit.test("autoSave", function(assert) {
		assert.expect(5);
		var getPersDataCalls = 0;
		var setPersDataCalls = 0;

		createController({
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				setPersData: function() {
					setPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				delPersData: function() {
					assert.ok(false, "delPersData should not get called.");
				}
			}
		});

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");
		assert.equal(setPersDataCalls, 0, "setPersData of service should be called 0 times.");
		assert.equal(oController.getAutoSave(), true, "autoSave is true by default.");

		oController.setAutoSave(false);
		oController.setAutoSave(true);

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");
		assert.equal(setPersDataCalls, 1, "setPersData of service should be called 1 time.");
	});

	QUnit.test("persoService unsupported value", function(assert) {
		assert.expect(3);
		createController();

		try {
			oController.setPersoService(123);
		} catch (ex) {
			assert.equal(ex.message,
				"Value of property \"persoService\" needs to be null/undefined or an object that has the methods " +
				"\"getPersData\", \"setPersData\" and \"delPersData\".",
				"setPersoService with string should throw an error");
		}

		try {
			oController.setPersoService("abc");
		} catch (ex) {
			assert.equal(ex.message,
				"Value of property \"persoService\" needs to be null/undefined or an object that has the methods " +
				"\"getPersData\", \"setPersData\" and \"delPersData\".",
				"setPersoService with string should throw an error");
		}

		try {
			oController.setPersoService({
				setPersData: function() {
				}
			});
		} catch (ex) {
			assert.equal(ex.message,
				"Value of property \"persoService\" needs to be null/undefined or an object that has the methods "
				+ "\"getPersData\", \"setPersData\" and \"delPersData\".",
				"setPersoService: object should contain all required methods");
		}
	});

	QUnit.test("persoService / table", function(assert) {
		assert.expect(1);
		var getPersDataCalls = 0;

		createController({
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				setPersData: function() {
					assert.ok(false, "setPersData should not get called.");
				},
				delPersData: function() {
					assert.ok(false, "delPersData should not get called.");
				}
			}
		});

		var oService = oController.getPersoService();

		oController.setPersoService(null);
		oController.setTable(null);

		oController.setTable(oTable);
		oController.setPersoService(oService);

		oController.setTable(null);
		oController.setPersoService(null);

		assert.equal(getPersDataCalls, 2, "getPersData of service should be called 2 times.");
	});

	QUnit.module("Personalization integration", {
		afterEach: function() {
			destroyController();
		}
	});

	QUnit.test("Column visibility (autoSave)", function(assert) {
		assert.expect(16);
		var done = assert.async();
		var getPersDataCalls = 0;

		createController({
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve(this.oBundle);
					return oDeferred.promise();
				},
				setPersData: function(oBundle) {
					assert.deepEqual(oBundle, {
						_persoSchemaVersion: "1.0",
						aColumns: [
							{
								id: oTable.getId() + "-Name",
								order: 0,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Color",
								order: 1,
								visible: false,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Number",
								order: 2,
								visible: false,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							}
						]
					}, "setPersData should receive the correct data");

					this.oBundle = oBundle;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				delPersData: function() {
					delete this.oBundle;
				}
			}
		});

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");

		var oNumberColumn = sap.ui.getCore().byId("Number");
		var oColorColumn = sap.ui.getCore().byId("Color");
		var oNameColumn = sap.ui.getCore().byId("Name");
		var oNameMenu = oNameColumn.getMenu();
		var sVisibilityMenuItemId = oNameMenu.getId() + "-column-visibilty";

		assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
		assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
		assert.equal(oNumberColumn.getVisible(), true, "Number column should be invisible.");

		// set "Number" column to invisible
		oNameMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(sVisibilityMenuItemId + "-menu-item-2", "click");

		// delay execution to wait for visibility change
		setTimeout(function() {

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), false, "Number column should be invisible.");

			// refreshing the data should lead to the same visiblility states
			oController.refresh();

			assert.equal(getPersDataCalls, 2, "getPersData of service should be called 2 times.");

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), false, "Number column should be invisible.");

			// clearing and refreshing the data should put the columns in the initial state (time when the table was set as association)
			oController.getPersoService().delPersData();
			oController.refresh();

			assert.equal(getPersDataCalls, 3, "getPersData of service should be called 3 times.");

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), true, "Number column should be invisible.");

			done();
		}, 0);
	});

	QUnit.test("Column visibility (no autoSave)", function(assert) {
		assert.expect(19);
		var done = assert.async();
		var getPersDataCalls = 0;

		createController({
			autoSave: false,
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve(this.oBundle);
					return oDeferred.promise();
				},
				setPersData: function(oBundle) {
					assert.deepEqual(oBundle, {
						_persoSchemaVersion: "1.0",
						aColumns: [
							{
								id: oTable.getId() + "-Name",
								order: 0,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Color",
								order: 1,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Number",
								order: 2,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							}
						]
					}, "setPersData should receive the correct data");

					this.oBundle = oBundle;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				delPersData: function() {
					delete this.oBundle;
				}
			}
		});

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");

		var oNumberColumn = sap.ui.getCore().byId("Number");
		var oColorColumn = sap.ui.getCore().byId("Color");
		var oNameColumn = sap.ui.getCore().byId("Name");
		var oNameMenu = oNameColumn.getMenu();
		var sVisibilityMenuItemId = oNameMenu.getId() + "-column-visibilty";

		assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
		assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
		assert.equal(oNumberColumn.getVisible(), true, "Number column should be invisible.");

		// set "Number" column to invisible
		oNameMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(sVisibilityMenuItemId + "-menu-item-2", "click");

		// delay execution to wait for visibility change
		setTimeout(function() {

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), false, "Number column should be invisible.");

			// refreshing the data should bring back the old state as nothing has been saved
			oController.refresh();

			assert.equal(getPersDataCalls, 2, "getPersData of service should be called 2 times.");

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), true, "Number column should be visible again.");

			// modifications via API should also work when manually triggering save
			oColorColumn.setVisible(true);
			oController.savePersonalizations();

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), true, "Color column should be visible again.");
			assert.equal(oNumberColumn.getVisible(), true, "Number column should be visible.");

			// clearing and refreshing the data should put the columns in the initial state (time when the table was set as association)
			oController.getPersoService().delPersData();
			oController.refresh();

			assert.equal(getPersDataCalls, 3, "getPersData of service should be called 3 times.");

			assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
			assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
			assert.equal(oNumberColumn.getVisible(), true, "Number column should be visible.");

			done();
		}, 0);
	});

	QUnit.test("Manual table changes via API", function(assert) {
		assert.expect(11);
		var getPersDataCalls = 0;

		createController({
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve(this.oBundle);
					return oDeferred.promise();
				},
				setPersData: function(oBundle) {
					assert.deepEqual(oBundle, {
						_persoSchemaVersion: "1.0",
						aColumns: [
							{
								id: oTable.getId() + "-Number",
								order: 0,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Name",
								order: 1,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: oTable.getId() + "-Color",
								order: 2,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							}

						]
					}, "setPersData should receive the correct data");

					this.oBundle = oBundle;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				delPersData: function() {
					delete this.oBundle;
				}
			}
		});

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");

		var oNumberColumn = sap.ui.getCore().byId("Number"),
			oColorColumn = sap.ui.getCore().byId("Color"),
			oNameColumn = sap.ui.getCore().byId("Name");

		assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
		assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
		assert.equal(oNumberColumn.getVisible(), true, "Number column should be invisible.");

		oTable.removeColumn(oNumberColumn);
		oTable.insertColumn(oNumberColumn, 0);

		oTable.removeColumn(oNameColumn);
		oTable.insertColumn(oNameColumn, 1);

		oTable.removeColumn(oColorColumn);
		oTable.insertColumn(oColorColumn, 2);

		oColorColumn.setVisible(true);

		// manual save is needed (even with autoSave turned on)
		oController.savePersonalizations();

		assert.equal(oTable.indexOfColumn(oNumberColumn), 0, "Number column should be on index 0.");
		assert.equal(oTable.indexOfColumn(oNameColumn), 1, "Name column should be on index 1.");
		assert.equal(oTable.indexOfColumn(oColorColumn), 2, "Color column should be on index 2.");

		oController.refresh();

		assert.equal(oTable.indexOfColumn(oNumberColumn), 0, "Number column should be on index 0.");
		assert.equal(oTable.indexOfColumn(oNameColumn), 1, "Name column should be on index 1.");
		assert.equal(oTable.indexOfColumn(oColorColumn), 2, "Color column should be on index 2.");
	});

	QUnit.test("Column multiLabels", function(assert) {
		createController();

		var oTablePersoData = oController._getCurrentTablePersoData(true);
		assert.equal(oTablePersoData.aColumns[0].text, "Name - Second level header", "Name column has the correct label in TablePersoDialog");
		assert.equal(oTablePersoData.aColumns[1].text, "Color - Second level header", "Color column has the correct label in TablePersoDialog");
		assert.equal(oTablePersoData.aColumns[2].text, "Number", "Number column has the correct label in TablePersoDialog");
	});

	QUnit.module("Personalization via CustomDataKey", {
		afterEach: function() {
			destroyController();
		}
	});

	QUnit.test("CustomDataKey", function(assert) {
		assert.expect(11);
		var getPersDataCalls = 0;

		createController({
			persoService: {
				getPersData: function() {
					getPersDataCalls++;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve(this.oBundle);
					return oDeferred.promise();
				},
				setPersData: function(oBundle) {
					assert.deepEqual(oBundle, {
						_persoSchemaVersion: "1.0",
						aColumns: [
							{
								id: "P13N_" + oTable.getId() + "-P13N_Number",
								order: 0,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: "P13N_" + oTable.getId() + "-P13N_Name",
								order: 1,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							},
							{
								id: "P13N_" + oTable.getId() + "-P13N_Color",
								order: 2,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending", /*filtered: false, filterValue: "",*/
								grouped: false
							}

						]
					}, "setPersData should receive the correct data");

					this.oBundle = oBundle;
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				},
				delPersData: function() {
					delete this.oBundle;
				}
			}
		});

		// set the persoKey custom data property
		oTable.data("persoKey", "P13N_" + oTable.getId());
		var aColumns = oTable.getColumns();
		for (var i = 0, l = aColumns.length; i < l; i++) {
			aColumns[i].data("persoKey", "P13N_" + aColumns[i].getId());
		}

		assert.equal(getPersDataCalls, 1, "getPersData of service should be called 1 time.");

		var oNumberColumn = sap.ui.getCore().byId("Number");
		var oColorColumn = sap.ui.getCore().byId("Color");
		var oNameColumn = sap.ui.getCore().byId("Name");

		assert.equal(oNameColumn.getVisible(), true, "Name column should be visible.");
		assert.equal(oColorColumn.getVisible(), false, "Color column should be invisible.");
		assert.equal(oNumberColumn.getVisible(), true, "Number column should be invisible.");

		oTable.removeColumn(oNumberColumn);
		oTable.insertColumn(oNumberColumn, 0);

		oTable.removeColumn(oNameColumn);
		oTable.insertColumn(oNameColumn, 1);

		oTable.removeColumn(oColorColumn);
		oTable.insertColumn(oColorColumn, 2);

		oColorColumn.setVisible(true);

		// manual save is needed (even with autoSave turned on)
		oController.savePersonalizations();

		assert.equal(oTable.indexOfColumn(oNumberColumn), 0, "Number column should be on index 0.");
		assert.equal(oTable.indexOfColumn(oNameColumn), 1, "Name column should be on index 1.");
		assert.equal(oTable.indexOfColumn(oColorColumn), 2, "Color column should be on index 2.");

		oController.refresh();

		assert.equal(oTable.indexOfColumn(oNumberColumn), 0, "Number column should be on index 0.");
		assert.equal(oTable.indexOfColumn(oNameColumn), 1, "Name column should be on index 1.");
		assert.equal(oTable.indexOfColumn(oColorColumn), 2, "Color column should be on index 2.");
	});
});