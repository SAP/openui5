/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/AnalyticalColumn",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function (
	DesignTime,
	OverlayRegistry,
	Table,
	Column,
	AnalyticalTable,
	AnalyticalColumn,
	Label,
	Button,
	JSONModel,
	Device,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function _createJSONModel() {
		return new JSONModel([
			{text: "item1-bound"},
			{text: "item2-bound"}
		]);
	}

	function _createTable(oModel) {
		var oTable = new Table({
			title: "Table Example",
			visibleRowCount: 5,
			width : "200px",
			rows: "{/}"
		});
		if (oModel) {
			oTable.setModel(oModel);
		}

		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oTable.addColumn(new Column({
			label: new Label({text: "Last Name"}),
			width: "200px",
			template: new Label({id: "text-1", text: "{text}"})
		}));
		oTable.addColumn(new Column({
			label: new Label({text: "First Name"}),
			width: "100px",
			template: new Label({id: "text-2", text: "{text}"})
		}));
		oTable.addColumn(new Column({
			label: new Label({text: "Checked"}),
			width: "75px",
			template: new Button({id: "button-1", text: "{text}"})
		}));
		oTable.addColumn(new Column({
			label: new Label({text: "Web Site"}),
			template: new Button({id: "button-2", text: "{text}"})
		}));
		oTable.addColumn(new Column({
			label: new Label({text: "Image"}),
			width: "75px",
			template: "dummy"
		}));
		return oTable;
	}

	if (Device.browser.edge) {
		QUnit.module("dummy test module", function() {
			QUnit.test("dummy test", function(assert) {
				assert.ok(true, "this test does not work reliable in Edge in build environments");
			});
		});
	} else {
		QUnit.module("Given the sap.ui.table.Table is created", {
			beforeEach: function () {
				this.oModel = _createJSONModel();
				this.oTable = _createTable(this.oModel);
			},
			afterEach: function () {
				this.oTable.destroy();
				sandbox.restore();
			}
		}, function () {
			QUnit.test("when design time is started with sap.ui.table.Table as root element", function(assert) {
				var done = assert.async();
				var oOnErrorSpy = sandbox.spy(Log, "error");
				var oDesignTime = new DesignTime({
					rootElements: [this.oTable]
				});
				oDesignTime.attachEventOnce("syncFailed", function() {
					assert.notOk(true, "then syncFailed event should not be thrown");
				});
				oDesignTime.attachEventOnce("synced", function() {
					assert.ok(true, "then sync event should be thrown");
					var oTableOverlay = OverlayRegistry.getOverlay(this.oTable);
					var oColumnsOverlay = oTableOverlay.getAggregationOverlay("columns");
					assert.strictEqual(oColumnsOverlay.getChildren().length, 5, "then there should be 5 children overlays for column available");
					assert.notOk(oOnErrorSpy.called, "then design time should not throw errors in console on start");
					done();
				}.bind(this));
			});
		});

		QUnit.module("Given that design time is created for a sap.ui.table.Table", {
			beforeEach : function(assert) {
				var done = assert.async();

				this.oTable = _createTable();
				this.oColumn = this.oTable.getColumns()[0];
				sap.ui.getCore().applyChanges();

				this.oDesignTime = new DesignTime({
					rootElements : [this.oTable]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					done();
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
	}

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
