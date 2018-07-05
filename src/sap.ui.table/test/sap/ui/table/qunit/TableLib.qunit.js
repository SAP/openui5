/*global QUnit */

sap.ui.define([], function() {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", function(assert) {
		var done = assert.async();
		var oPromise = sap.ui.getCore().loadLibrary("sap.ui.table", {async: true});
		oPromise.then(function() {
			assert.ok(!!sap.ui.table, "Table Lib loaded");
			done();
		});
		oPromise["catch"](function() {
			assert.ok(false, "Fail on load");
			done();
		});
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