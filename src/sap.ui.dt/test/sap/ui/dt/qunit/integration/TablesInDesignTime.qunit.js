/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/AnalyticalColumn",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	DesignTime,
	OverlayRegistry,
	Table,
	Column,
	AnalyticalTable,
	AnalyticalColumn,
	Label,
	Title,
	Button,
	JSONModel,
	Log,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function _createJSONModel() {
		return new JSONModel([
			{text: "item1-bound"},
			{text: "item2-bound"}
		]);
	}

	function _createTable(oModel) {
		var oTable = new Table({
			extension: [
				new Title({text: "Example Table"})
			],
			visibleRowCount: 5,
			width: "200px",
			rows: "{/}"
		});
		if (oModel) {
			oTable.setModel(oModel);
		}

		oTable.placeAt("qunit-fixture");
		oCore.applyChanges();

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
			template: new Label({text: "{dummy}"})
		}));
		return oTable;
	}

	QUnit.module("Given the sap.ui.table.Table is created", {
		beforeEach() {
			this.oModel = _createJSONModel();
			this.oTable = _createTable(this.oModel);
		},
		afterEach() {
			this.oTable.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when design time is started with sap.ui.table.Table as root element", function(assert) {
			var done = assert.async();
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
				assert.strictEqual(oColumnsOverlay.getChildren().length, 5,
					"then there should be 5 children overlays for column available");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that design time is created for a sap.ui.table.Table", {
		beforeEach(assert) {
			var done = assert.async();

			this.oTable = _createTable();
			[this.oColumn] = this.oTable.getColumns();
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oTable]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				done();
			});
		},
		afterEach() {
			this.oTable.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when Table is scrolled horizontally via aggregationOverlay hScroll...", function(assert) {
			var done = assert.async();

			var oTableOverlay = OverlayRegistry.getOverlay(this.oTable);
			var oInitialColumnOffset = this.oColumn.$().offset();

			var oColumnsOverlay = oTableOverlay.getAggregationOverlay("columns");

			var oScrollOverlay = oTableOverlay.getAggregationOverlay("hScroll");

			var fnCallback = function() {
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "then columns are also scrolled");
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left,
					"if this test fails, check Table.designtime.js : hScroll and vScroll domRefs!");

				oColumnsOverlay.$().off("scroll", fnCallback);
				done();
			}.bind(this);
			oColumnsOverlay.$().on("scroll", fnCallback);

			oScrollOverlay.$().scrollLeft(20);
		});
	});

	QUnit.module("Given that design time is created for a sap.ui.table.AnalyticalTable", {
		beforeEach(assert) {
			var done = assert.async();

			this.oTable = new AnalyticalTable({
				extension: [
					new Title({text: "Example Table"})
				],
				visibleRowCount: 5,
				width: "200px"
			});

			this.oTable.placeAt("qunit-fixture");

			oCore.applyChanges();

			this.oColumn = new AnalyticalColumn({
				label: new Label({text: "Last Name"}),
				width: "200px",
				template: new Label({text: "{dummy}"})
			});

			this.oTable.addColumn(this.oColumn);
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "First Name"}),
				width: "100px",
				template: new Label({text: "{dummy}"})
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Checked"}),
				width: "75px",
				template: new Label({text: "{dummy}"})
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Web Site"}),
				template: new Label({text: "{dummy}"})
			}));
			this.oTable.addColumn(new AnalyticalColumn({
				label: new Label({text: "Image"}),
				width: "75px",
				template: new Label({text: "{dummy}"})
			}));

			this.oDesignTime = new DesignTime({
				rootElements: [this.oTable]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				oCore.applyChanges();
				done();
			});
		},
		afterEach() {
			this.oTable.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when AnalyticalTable is scrolled horizontally via aggregationOverlay hScroll...", function(assert) {
			var done = assert.async();

			var oTableOverlay = OverlayRegistry.getOverlay(this.oTable);
			var oInitialColumnOffset = this.oColumn.$().offset();

			var oColumnsOverlay = oTableOverlay.getAggregationOverlay("columns");

			var oScrollOverlay = oTableOverlay.getAggregationOverlay("hScroll");

			var fnCallback = function() {
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left, "then columns are also scrolled");
				assert.strictEqual(this.oColumn.$().offset().left + 20, oInitialColumnOffset.left,
					"if this test fails, check AnalyticalTable.designtime.js : hScroll and vScroll domRefs!");

				oColumnsOverlay.$().off("scroll", fnCallback);
				done();
			}.bind(this);

			oColumnsOverlay.$().on("scroll", fnCallback);

			oScrollOverlay.$().scrollLeft(20);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
