/* global QUnit, sinon */
sap.ui.define([
	"../../QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/Text"
], function(
	MDCQUnitUtils,
	Core,
	Table,
	Column,
	Text
) {
	"use strict";

	QUnit.module("sap.ui.mdc.Table", {
		beforeEach: function() {
			this.oTable = new Table({
				delegate: {
					name: "sap/ui/mdc/odata/v4/TableDelegate",
					payload: {
						collectionName: "ProductList"
					}
				}
			});
			this.oTable.addColumn(new Column({
				template: new Text(),
				dataProperty: "Name"
			}));
			this.oTable.addColumn(new Column({
				template: new Text(),
				dataProperty: "Country"
			}));
			this.oTable.addColumn(new Column({
				template: new Text(),
				dataProperty: "name_country"
			}));

			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			this.aPropertyInfo = [
				{
					name: "Name",
					label: "Name",
					path: "Name",
					groupable: true
				},
				{
					name: "Country",
					label: "Country",
					path: "Country",
					groupable: true
				},
				{
					name: "name_country",
					label: "Complex Title & Description",
					propertyInfos: ["Name", "Country"]
				}
			];

			MDCQUnitUtils.stubPropertyInfos(this.oTable, this.aPropertyInfo);
			MDCQUnitUtils.stubPropertyExtension(this.oTable, {
				Name: {
					defaultAggregate: {}
				}
			});
		},
		afterEach: function() {
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
			MDCQUnitUtils.restorePropertyExtension(this.oTable);
			this.oTable.destroy();
		}
	});

	QUnit.test("Allowed analytics in the columns", function(assert) {
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oFirstInnerColumn = oTable._oTable.getColumns()[0];

			oTable._oTable.fireEvent("columnSelect", {
				column: oFirstInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			return oTable._fullyInitialized();
		}).then(function() {
			var oThirdInnerColumn = oTable._oTable.getColumns()[2];

			assert.strictEqual(oTable._oPopover.getItems()[0].getLabel(), oResourceBundle.getText("table.SETTINGS_GROUP"),
				"The first column has group menu item");
			assert.strictEqual(oTable._oPopover.getItems()[1].getLabel(), oResourceBundle.getText("table.SETTINGS_AGGREGATE"),
				"The first column has aggregate menu item");

			oTable._oTable.fireEvent("columnSelect", {
				column: oThirdInnerColumn
			});

			return oTable._fullyInitialized();
		}).then(function() {
			assert.strictEqual(fColumnPressSpy.callCount, 2, "Third Column pressed");
			assert.strictEqual(oTable._oPopover.getItems()[0].getItems().length,2, "The last column has complex property with list of two items");
		});
	});

	QUnit.test("Grouping enabled on column press", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];
			var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First column pressed");
			fColumnPressSpy.restore();

			return oTable._fullyInitialized();
		}).then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			var oDelegate = oTable.getControlDelegate();

			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: ["Name"],
				grandTotal: [],
				subtotals: []
			}), "Plugin#setAggregationInfo call");

			fSetAggregationSpy.restore();
		});
	});

	QUnit.test("Aggregation enabled on column press", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];
			var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");
			fColumnPressSpy.restore();

			return oTable._fullyInitialized();
		}).then(function() {
			var oDelegate = oTable.getControlDelegate();
			var oPlugin = oTable._oTable.getDependents()[0];
			var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");

			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[1].firePress();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: [],
				grandTotal: ["Name"],
				subtotals: ["Name"]
			}), "Plugin#setAggregationInfo call");
			fSetAggregationSpy.restore();
		});
	});

	QUnit.test("Grouping and Aggregation on two columns", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		return oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];

			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			return oTable._fullyInitialized();
		}).then(function() {
			var oDelegate = oTable.getControlDelegate();
			var oPlugin = oTable._oTable.getDependents()[0];
			var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			var oInnerSecondColumn = oTable._oTable.getColumns()[1];

			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: ["Name"],
				grandTotal: [],
				subtotals: []
			}), "Plugin#setAggregationInfo call");

			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerSecondColumn
			});
			fSetAggregationSpy.restore();
			return oTable._fullyInitialized();
		}).then(function() {
			var oDelegate = oTable.getControlDelegate();
			var oPlugin = oTable._oTable.getDependents()[0];
			var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");

			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: ["Name","Country"],
				grandTotal: [],
				subtotals: []
			}), "Plugin#setAggregationInfo call");
			fColumnPressSpy.restore();
			fSetAggregationSpy.restore();
		});
	});

	QUnit.test("Grouping and forced aggregation", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		return oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];

			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			return oTable._fullyInitialized();
		}).then(function() {
			var oDelegate = oTable.getControlDelegate();
			var oPlugin = oTable._oTable.getDependents()[0];
			var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");

			sinon.stub(sap.m.MessageBox, "warning");
			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: ["Name"],
				grandTotal: [],
				subtotals: []
			}), "Plugin#setAggregationInfo call");

			fSetAggregationSpy.reset();
			oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[1].firePress();
			oDelegate._forceAnalytics("Aggregate", oTable, "Name");
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: oDelegate._getVisibleProperties(oTable),
				groupLevels: [],
				grandTotal: ["Name"],
				subtotals: ["Name"]
			}), "Plugin#setAggregationInfo call");

			fColumnPressSpy.restore();
			fSetAggregationSpy.restore();
		});
	});

});