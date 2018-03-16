/*global QUnit */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TableExtension"
], function(qutils, TableExtension) {
	"use strict";

	//************************************************************************
	// Preparation Code
	//************************************************************************

	var TABLETYPES = TableExtension.TABLETYPES;
	var oStandardTable, oTreeTable, oAnalyticalTable;

	TableExtension.extend("sap.ui.table.test.MyExtension", {
		_init: function(oTable, sTableType, mSettings) {

			if (mSettings.assert) {
				mSettings.assert.ok(!!mSettings, "Init: Settings exists");
				mSettings.assert.ok(!!oTable, "Init: Table exists");
				mSettings.assert.ok(sTableType == TABLETYPES.ANALYTICAL || sTableType == TABLETYPES.TREE || sTableType == TABLETYPES.STANDARD,
					"Init: Type exists");

				switch (sTableType) {
					case TABLETYPES.ANALYTICAL:
						mSettings.assert.ok(oTable === oAnalyticalTable, "Init: Correct Table type (ANALYTICAL)");
						break;
					case TABLETYPES.TREE:
						mSettings.assert.ok(oTable === oTreeTable, "Init: Correct Table type (TREE)");
						break;
					default:
						mSettings.assert.ok(oTable === oStandardTable, "Init: Correct Table type (STANDARD)");
						break;
				}
			}

			return mSettings.name || null;
		}
	});

	//************************************************************************
	// Test Code
	//************************************************************************

	QUnit.module("TableExtension", {
		beforeEach: function() {
			oStandardTable = new sap.ui.table.Table();
			oTreeTable = new sap.ui.table.TreeTable();
			oAnalyticalTable = new sap.ui.table.AnalyticalTable();
		},
		afterEach: function() {
			if (oStandardTable) {
				oStandardTable.destroy();
				oStandardTable = null;
			}
			if (oTreeTable) {
				oTreeTable.destroy();
				oTreeTable = null;
			}
			if (oAnalyticalTable) {
				oAnalyticalTable.destroy();
				oAnalyticalTable = null;
			}
		}
	});

	QUnit.test("enrich - wrong type", function(assert) {
		var iNumberOfStandardExtensions = oStandardTable._aExtensions.length;
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.base.Object, {name: "TEST"});
		assert.strictEqual(oExtension, null, "enrich does not accept other types than TableExtension");
		assert.ok(!oStandardTable._getTEST, "No getter for Extension created");
		assert.ok(oStandardTable._aExtensions.length == iNumberOfStandardExtensions, "Number of registered Extensions not changed");
	});

	QUnit.test("enrich - correct type", function(assert) {
		var iNumberOfStandardExtensions = oStandardTable._aExtensions.length;
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {name: "TEST2"});
		assert.ok(oExtension instanceof sap.ui.table.test.MyExtension, "enrich does not accept other types than TableExtension");
		assert.ok(typeof oStandardTable._getTEST2 == "function", "Getter for Extension created");

		var aExtensions = oStandardTable._aExtensions;
		assert.ok(aExtensions.length == iNumberOfStandardExtensions + 1, "Number of registered Extensions");
		assert.ok(aExtensions[aExtensions.length - 1] === oExtension, "Extension registered");
	});

	QUnit.test("init parameters - Table", function(assert) {
		assert.expect(4);
		TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {
			name: "TEST",
			assert: assert
		});
	});

	QUnit.test("init parameters - AnalyticalTable", function(assert) {
		assert.expect(4);
		TableExtension.enrich(oAnalyticalTable, sap.ui.table.test.MyExtension, {
			name: "TEST",
			assert: assert
		});
	});

	QUnit.test("init parameters - TreeTable", function(assert) {
		assert.expect(4);
		TableExtension.enrich(oTreeTable, sap.ui.table.test.MyExtension, {name: "TEST", assert: assert});
	});

	QUnit.test("Cleanup", function(assert) {
		assert.expect(3);
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {name: "TEST"});
		oExtension.destroy = function() {
			assert.ok(true, "Destroy called");
		};
		oStandardTable._detachExtensions();
		assert.ok(!oStandardTable._aExtensions, "No extension registered");
		assert.ok(!oStandardTable._bExtensionsInitialized, "Extensions cleaned up");
		oStandardTable._detachExtensions(); // Double detach should not lead to errors
	});

	QUnit.test("Generated Getter", function(assert) {
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {name: "TEST"});
		assert.ok(typeof oStandardTable._getTEST == "function", "Getter for Extension created");
		assert.strictEqual(oStandardTable._getTEST(), oExtension, "Getter returns extension instance");

		// Extension without name and getter possible -> no error should occur
		TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {});
	});

	QUnit.test("Functions", function(assert) {
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {name: "TEST"});
		assert.ok(oExtension.getTable() === oStandardTable, "getTable");
		assert.ok(oExtension.getInterface() === oExtension, "getInterface");
	});

	QUnit.test("Eventing", function(assert) {
		assert.expect(10);

		var iCounter = 0;
		var iCount = 0;
		var bActive = true;
		var oExtension = TableExtension.enrich(oStandardTable, sap.ui.table.test.MyExtension, {name: "TEST"});
		oExtension._attachEvents = function() {
			if (bActive) {
				assert.ok(true, "_attachEvents called");
				iCount++;
				iCounter++;
			}
		};
		oExtension._detachEvents = function() {
			if (bActive) {
				assert.ok(true, "_detachEvents called");
				iCount--;
				iCounter++;
			}
		};

		oStandardTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		assert.ok(iCount == 0, "Balanced calls of attach and detach"); // beforeRendering calls _detachEvents, afterRendering _attachEvents
		assert.ok(iCounter == 2, "Attach and detach called");

		TableExtension.detachEvents(oStandardTable);
		assert.ok(iCount == -1, "detach called");
		TableExtension.attachEvents(oStandardTable);
		assert.ok(iCount == 0, "attach called");

		oStandardTable._detachExtensions();
		iCounter = 0;
		TableExtension.attachEvents(oStandardTable);
		assert.ok(iCounter == 0, "Attach not called");
		TableExtension.detachEvents(oStandardTable);
		assert.ok(iCounter == 0, "Detach not called");

		bActive = false;
	});
});