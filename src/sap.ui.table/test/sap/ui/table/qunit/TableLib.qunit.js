/*global QUnit */

sap.ui.define(["sap/ui/core/Lib"], function(Library) {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", function(assert) {
		const done = assert.async();
		const oPromise = Library.load("sap.ui.table");
		oPromise.then(function() {
			const tableNamespace = sap.ui.require("sap/ui/table/library");
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

		const tableNamespace = sap.ui.require("sap/ui/table/library");
		const oHelper = tableNamespace.TableHelper;

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