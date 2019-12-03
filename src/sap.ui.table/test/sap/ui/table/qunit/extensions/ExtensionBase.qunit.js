/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/extensions/ExtensionBase",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/base/Object"
], function(TableQUnitUtils, qutils, ExtensionBase, Table, TreeTable, AnalyticalTable, BaseObject) {
	"use strict";

	//************************************************************************
	// Preparation Code
	//************************************************************************

	var TABLETYPES = ExtensionBase.TABLETYPES;
	var oStandardTable, oTreeTable, oAnalyticalTable;

	var MyExtension = ExtensionBase.extend("sap.ui.table.test.MyExtension", {
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

	QUnit.module("ExtensionBase", {
		beforeEach: function() {
			oStandardTable = new Table();
			oTreeTable = new TreeTable();
			oAnalyticalTable = new AnalyticalTable();
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
		var oExtension = ExtensionBase.enrich(oStandardTable, BaseObject, {name: "TEST"});
		assert.strictEqual(oExtension, null, "enrich does not accept other types than ExtensionBase");
		assert.ok(!oStandardTable._getTEST, "No getter for Extension created");
		assert.ok(oStandardTable._aExtensions.length == iNumberOfStandardExtensions, "Number of registered Extensions not changed");
	});

	QUnit.test("enrich - correct type", function(assert) {
		var iNumberOfStandardExtensions = oStandardTable._aExtensions.length;
		var oExtension = ExtensionBase.enrich(oStandardTable, MyExtension, {name: "TEST2"});
		assert.ok(oExtension instanceof MyExtension, "enrich does not accept other types than ExtensionBase");
		assert.ok(typeof oStandardTable._getTEST2 == "function", "Getter for Extension created");

		var aExtensions = oStandardTable._aExtensions;
		assert.ok(aExtensions.length == iNumberOfStandardExtensions + 1, "Number of registered Extensions");
		assert.ok(aExtensions[aExtensions.length - 1] === oExtension, "Extension registered");
	});

	QUnit.test("init parameters - Table", function(assert) {
		assert.expect(4);
		ExtensionBase.enrich(oStandardTable, MyExtension, {
			name: "TEST",
			assert: assert
		});
	});

	QUnit.test("init parameters - AnalyticalTable", function(assert) {
		assert.expect(4);
		ExtensionBase.enrich(oAnalyticalTable, MyExtension, {
			name: "TEST",
			assert: assert
		});
	});

	QUnit.test("init parameters - TreeTable", function(assert) {
		assert.expect(4);
		ExtensionBase.enrich(oTreeTable, MyExtension, {name: "TEST", assert: assert});
	});

	QUnit.test("Cleanup", function(assert) {
		assert.expect(3);
		var oExtension = ExtensionBase.enrich(oStandardTable, MyExtension, {name: "TEST"});
		oExtension.destroy = function() {
			assert.ok(true, "Destroy called");
		};
		oStandardTable._detachExtensions();
		assert.ok(!oStandardTable._aExtensions, "No extension registered");
		assert.ok(!oStandardTable._bExtensionsInitialized, "Extensions cleaned up");
		oStandardTable._detachExtensions(); // Double detach should not lead to errors
	});

	QUnit.test("Generated Getter", function(assert) {
		var oExtension = ExtensionBase.enrich(oStandardTable, MyExtension, {name: "TEST"});
		assert.ok(typeof oStandardTable._getTEST == "function", "Getter for Extension created");
		assert.strictEqual(oStandardTable._getTEST(), oExtension, "Getter returns extension instance");

		// Extension without name and getter possible -> no error should occur
		ExtensionBase.enrich(oStandardTable, MyExtension, {});
	});

	QUnit.test("Functions", function(assert) {
		var oExtension = ExtensionBase.enrich(oStandardTable, MyExtension, {name: "TEST"});
		assert.ok(oExtension.getTable() === oStandardTable, "getTable");
		assert.ok(oExtension.getInterface() === oExtension, "getInterface");
	});

	QUnit.test("Eventing", function(assert) {
		assert.expect(10);

		var iCounter = 0;
		var iCount = 0;
		var bActive = true;
		var oExtension = ExtensionBase.enrich(oStandardTable, MyExtension, {name: "TEST"});
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

		ExtensionBase.detachEvents(oStandardTable);
		assert.ok(iCount == -1, "detach called");
		ExtensionBase.attachEvents(oStandardTable);
		assert.ok(iCount == 0, "attach called");

		oStandardTable._detachExtensions();
		iCounter = 0;
		ExtensionBase.attachEvents(oStandardTable);
		assert.ok(iCounter == 0, "Attach not called");
		ExtensionBase.detachEvents(oStandardTable);
		assert.ok(iCounter == 0, "Detach not called");

		bActive = false;
	});

	QUnit.test("isEnrichedWith", function(assert) {
		assert.strictEqual(ExtensionBase.isEnrichedWith(), false, "Returned false: No table passed");
		assert.strictEqual(ExtensionBase.isEnrichedWith(oStandardTable), false, "Returned false: No extension name passed");
		assert.strictEqual(ExtensionBase.isEnrichedWith(oStandardTable, "wrong name"), false, "Returned false: No Extension with this name exists");
		assert.strictEqual(ExtensionBase.isEnrichedWith(oStandardTable, "sap.ui.table.extensions.Scrolling"), true, "Enriched with the scroll extension");
	});
});