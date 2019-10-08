/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/AnalyticalColumn",
	"sap/m/Label",
	"sap/ui/Device"
],
function (
	DesignTime,
	OverlayRegistry,
	Table,
	Column,
	AnalyticalTable,
	AnalyticalColumn,
	Label,
	Device
) {
	"use strict";

	QUnit.module("Given that design time is created for a sap.ui.table.Table", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oTable = new Table({
				title: "Table Example",
				visibleRowCount: 5,
				width : "200px"
			});

			this.oTable.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oColumn = new Column({
				label: new Label({text: "Last Name"}),
				width: "200px",
				template: "dummy"
			});

			this.oTable.addColumn(this.oColumn);
			this.oTable.addColumn(new Column({
				label: new Label({text: "First Name"}),
				width: "100px",
				template: "dummy"
			}));
			this.oTable.addColumn(new Column({
				label: new Label({text: "Checked"}),
				width: "75px",
				template: "dummy"
			}));
			this.oTable.addColumn(new Column({
				label: new Label({text: "Web Site"}),
				template: "dummy"
			}));
			this.oTable.addColumn(new Column({
				label: new Label({text: "Image"}),
				width: "75px",
				template: "dummy"
			}));

			this.oDesignTime = new DesignTime({
				rootElements : [this.oTable]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();

				// TODO: Temporal solution. Remove when synced in DesignTime event wait for all async processes to be done.
				if (Device.browser.internet_explorer || Device.browser.edge) {
					setTimeout(done, 16);
				} else {
					done();
				}
			});
		},
		afterEach : function() {
			this.oTable.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when Table is scrolled horizontally via aggregationOverlay hScroll...", function(assert) {
			var done = assert.async();

			var oTableOverlay = OverlayRegistry.getOverlay(this.oTable);
			var oInitialColumnOffset = this.oColumn.$().offset();

			var oColumnsOverlay = oTableOverlay.getAggregationOverlay("columns");

			var oScrollOverlay = oTableOverlay.getAggregationOverlay("hScroll");

			var fnCallback = function() {
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "then columns are also scrolled");
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "if this test fails, check Table.designtime.js : hScroll and vScroll domRefs!");

				oColumnsOverlay.$().off("scroll", fnCallback);
				done();
			}.bind(this);
			oColumnsOverlay.$().scroll(fnCallback);

			oScrollOverlay.$().scrollLeft(20);
		});
	});

	QUnit.module("Given that design time is created for a sap.ui.table.AnalyticalTable", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oTable = new AnalyticalTable({
				title: "Table Example",
				visibleRowCount: 5,
				width : "200px"
			});

			this.oTable.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oColumn = new AnalyticalColumn({
				label: new Label({text: "Last Name"}),
				width: "200px",
				template: "dummy"
			});

			this.oTable.addColumn(this.oColumn);
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "First Name"}),
				width: "100px",
				template: "dummy"
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Checked"}),
				width: "75px",
				template: "dummy"
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Web Site"}),
				template: "dummy"
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Image"}),
				width: "75px",
				template: "dummy"
			}));

			this.oDesignTime = new DesignTime({
				rootElements : [this.oTable]
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				sap.ui.getCore().applyChanges();

				// TODO: Temporal solution. Remove when the synced event in DesignTime waits for all async processes to be completed.
				setTimeout(done, 16);
			});
		},
		afterEach : function() {
			this.oTable.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when AnalyticalTable is scrolled horizontally via aggregationOverlay hScroll...", function(assert) {
			var done = assert.async();

			var oTableOverlay = OverlayRegistry.getOverlay(this.oTable);
			var oInitialColumnOffset = this.oColumn.$().offset();

			var oColumnsOverlay = oTableOverlay.getAggregationOverlay("columns");

			var oScrollOverlay = oTableOverlay.getAggregationOverlay("hScroll");

			var fnCallback = function() {
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "then columns are also scrolled");
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "if this test fails, check AnalyticalTable.designtime.js : hScroll and vScroll domRefs!");

				oColumnsOverlay.$().off("scroll", fnCallback);
				done();
			}.bind(this);

			oColumnsOverlay.$().scroll(fnCallback);

			oScrollOverlay.$().scrollLeft(20);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
