/*global QUnit */

sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Lib"], function(oCore, Lib) {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", function(assert) {
		var done = assert.async();
		var oPromise = Lib.load("sap.ui.table");
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
});