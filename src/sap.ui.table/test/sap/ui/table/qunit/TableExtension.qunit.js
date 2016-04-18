
//************************************************************************
// Preparation Code
//************************************************************************

jQuery.sap.require("sap.ui.table.TableExtension");

var TABLETYPES = sap.ui.table.TableExtension.TABLETYPES;

sap.ui.table.TableExtension.extend("MyExtension", {
	_init : function(oTable, sTableType, mSettings) {

		if (mSettings.assert) {
			mSettings.assert.ok(!!mSettings, "Init: Settings exists");
			mSettings.assert.ok(!!oTable, "Init: Table exists");
			mSettings.assert.ok(sTableType == TABLETYPES.ANALYTICAL || sTableType == TABLETYPES.TREE || sTableType == TABLETYPES.STANDARD, "Init: Type exists");

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

var oStandardTable, oTreeTable, oAnalyticalTable;

//************************************************************************
// Helper Functions
//************************************************************************

function recreateControls() {
	if (oStandardTable) {
		oStandardTable.destroy();
	}
	if (oTreeTable) {
		oTreeTable.destroy();
	}
	if (oAnalyticalTable) {
		oAnalyticalTable.destroy();
	}
	oStandardTable = new sap.ui.table.Table();
	oTreeTable = new sap.ui.table.TreeTable();
	oAnalyticalTable = new sap.ui.table.AnalyticalTable();
}

recreateControls();


//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);

QUnit.test("enrich - wrong type", function(assert) {
	var oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, sap.ui.base.Object, {name: "TEST"});
	assert.strictEqual(oExtension, null, "enrich does not accept other types than sap.ui.table.TableExtension");
	assert.ok(!oStandardTable._getTEST, "No getter for Extension created");
	recreateControls();
});

QUnit.test("enrich - correct type", function(assert) {
	var oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, MyExtension, {name: "TEST2"});
	assert.ok(oExtension instanceof MyExtension, "enrich does not accept other types than sap.ui.table.TableExtension");
	assert.ok(typeof oStandardTable._getTEST2 == "function", "Getter for Extension created");
	recreateControls();
});

QUnit.test("init parameters - Table", function(assert) {
	assert.expect(4);
	var oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, MyExtension, {name: "TEST", assert: assert});
	recreateControls();
});

QUnit.test("init parameters - AnalyticalTable", function(assert) {
	assert.expect(4);
	var oExtension = sap.ui.table.TableExtension.enrich(oAnalyticalTable, MyExtension, {name: "TEST", assert: assert});
	recreateControls();
});

QUnit.test("init parameters - TreeTable", function(assert) {
	assert.expect(4);
	var oExtension = sap.ui.table.TableExtension.enrich(oTreeTable, MyExtension, {name: "TEST", assert: assert});
	recreateControls();
});

QUnit.test("Generated Getter", function(assert) {
	var oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, MyExtension, {name: "TEST"});
	assert.ok(typeof oStandardTable._getTEST == "function", "Getter for Extension created");
	assert.strictEqual(oStandardTable._getTEST(), oExtension, "Getter returns extension instance");

	// Extension without name and getter possible -> no error should occur
	oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, MyExtension, {});

	recreateControls();
});

QUnit.test("Functions", function(assert) {
	var oExtension = sap.ui.table.TableExtension.enrich(oStandardTable, MyExtension, {name: "TEST"});
	assert.ok(oExtension.getTable() === oStandardTable, "getTable");
	assert.ok(oExtension.getInterface() === oExtension, "getInterface");
	recreateControls();
});
