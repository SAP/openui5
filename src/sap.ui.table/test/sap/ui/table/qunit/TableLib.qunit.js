/*global QUnit */

sap.ui.require([], function() {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", function(assert) {
		try {
			sap.ui.getCore().loadLibrary("sap.ui.table");
		} catch (e) {
			assert.ok(false, "Fail on load");
		}
		assert.ok(!!sap.ui.table, "Table Lib loaded");
	});

	QUnit.test("TableHelper", function(assert) {
		var oHelper = sap.ui.table.TableHelper;

		assert.ok(!!oHelper, "TableHelper exists");
		assert.ok(!oHelper.bFinal, "TableHelper is not final");
		assert.equal(oHelper.addTableClass(), "", "TableHelper.addTableClass");
		try {
			oHelper.createLabel();
		} catch (e) {
			assert.ok(true, "TableHelper.createLabel");
		}
		try {
			oHelper.createTextView();
		} catch (e) {
			assert.ok(true, "TableHelper.createTextView");
		}
	});
});