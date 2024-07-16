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
});