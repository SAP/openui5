/*global QUnit */

sap.ui.define(["sap/ui/core/Core"], function(oCore) {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", function(assert) {
		var done = assert.async();
		var oPromise = oCore.loadLibrary("sap.ui.table", {async: true});
		oPromise.then(function() {
			var tableNamespace = sap.ui.require("sap/ui/table/library");
			assert.ok(!!tableNamespace, "Table Lib loaded");
			done();
		});
		oPromise["catch"](function() {
			assert.ok(false, "Fail on load");
			done();
		});
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.test("TableHelper", function(assert) {
		assert.expect(5);

		var tableNamespace = sap.ui.require("sap/ui/table/library");
		var oHelper = tableNamespace.TableHelper;

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