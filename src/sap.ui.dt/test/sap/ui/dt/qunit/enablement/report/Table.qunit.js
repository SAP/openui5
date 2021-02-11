/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/enablement/report/LibraryReport",
	"sap/ui/dt/enablement/report/Table",
	"sap/ui/qunit/QUnitUtils",
	// ensure the test library is loaded so it can be used in the library enablement test
	"sap/ui/testLibrary/library"
],
function (
	LibraryReport,
	Table,
	QUnitUtils
) {
	"use strict";

	QUnit.module("Given that a sap.m Library is tested", {
		beforeEach: function () {
			this.oLibraryReport = new LibraryReport({
				libraryName: "sap.ui.testLibrary"
			});
		},
		afterEach: function () {
			this.oLibraryReport.destroy();
		}
	}, function () {
		QUnit.test("when the result is returned and displayed with the Table report", function (assert) {
			var fnDone = assert.async();
			this.oLibraryReport.run()
			.then(function(oResult) {
				var oTable = new Table({
					data: oResult
				});
				oTable.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
				assert.ok(oTable, "then the table is rendered");
				var iBeforeFiltered = oTable._getTable().getModel().getData().length;
				oTable.filter("dt.control.SimpleScrollControl");
				assert.equal(oTable._getTable().getModel().getData().length, 1, "and the table can be filtered");
				oTable.filter("");
				assert.equal(oTable._getTable().getModel().getData().length, iBeforeFiltered, "and the filter can be reset");
				QUnitUtils.triggerTouchEvent("tap", oTable.$().find("#" + oTable.getId() + "--toolbar-expand-button"));
				sap.ui.getCore().applyChanges();
				window.setTimeout(function() {
					assert.ok(oTable._getTable().isExpanded(1), "and when the expand button is pressed then the table is expanded");

					QUnitUtils.triggerTouchEvent("tap", oTable.$().find("#" + oTable.getId() + "--toolbar-collapse-button"));
					sap.ui.getCore().applyChanges();
					window.setTimeout(function() {
						assert.ok(!oTable._getTable().isExpanded(0), "and when the collapse button is pressed then the table is collapsed again");
						oTable.destroy();
						fnDone();
					});
				});
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});