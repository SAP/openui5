/*!
 * ${copyright}
 */

 /* global QUnit, sinon */

 sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/chart/ChartSettings",
	"sap/ui/mdc/chart/DrillStackHandler",
	"sap/ui/mdc/chart/DimensionItem",
	"sap/ui/qunit/QUnitUtils"
], function(
	Core,
	Chart,
	ChartSettings,
	DrillStackHandler,
	DimensionItem,
	QUnitUtils
) {
	"use strict";

	QUnit.module("", {
		beforeEach: function() {
			this.oChart = new Chart({
				p13nMode: ["Item"],
				delegate: {
					name: "sap/ui/mdc/qunit/chart/Helper"
				}
			});

			this.oChart.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oChart.destroy();
			this.oChart = null;
		}
	});

	QUnit.test("it should create and open the drill-down popover, then it should press an item and add a flex change", function(assert) {
		var done = assert.async();

		// arrange + act
		this.oChart.oChartPromise.then(function onInitialized() {
			Core.applyChanges(); // enforces a sync rendering of some inner controls, e.g. the drill-down button
			return this.oChart._showDrillDown();
		}.bind(this))
		.then(function onAfterDrillDownPopoverOpen(oDrillDownPopover) {

			var oFirstListItem = oDrillDownPopover.getContent()[1].getItems()[0],
				oEngine = this.oChart.getEngine();

			var oDrillDownPopoverCloseSpy = this.spy(oDrillDownPopover, "close"),
				oCreateFlexItemChangesSpy = this.spy(oEngine, "createChanges");

			// act (simulate a press the first list item on the drill down list)
			QUnitUtils.triggerTouchEvent("tap", oFirstListItem.getDomRef(), {
				srcControl: oFirstListItem
			});

			// assert
			assert.ok(oDrillDownPopover.isA("sap.m.ResponsivePopover"), "it should create and open a drill-down popover control instance");
			assert.strictEqual(oDrillDownPopoverCloseSpy.callCount, 1, "it should invoke the drill-down popover's close method after pressing/activating the first item in the list");

			var aFlexChanges = [{
				name: "Country",
				position: 0
			}];

			sinon.assert.calledWith(oCreateFlexItemChangesSpy, {
				control: this.oChart,
				key: "Item",
				state: aFlexChanges
			});
			done();
		}.bind(this));
	});

	QUnit.test("it should create a crumb and add a flex change", function(assert) {
		var done = assert.async();

		// arrange
		this.oChart.oChartPromise.then(function() {
			return this.oChart._createDrillBreadcrumbs();
		}.bind(this))

		.then(function() {

			var oCrumbSettings1 = {
				dimensionKey: "language_code",
				dimensionText: "Languages"
			};

			var oCrumbSettings2 = {
				dimensionKey: "language_code",
				dimensionText: "Languages"
			};

			var oDrillBreadcrumbs = this.oChart.getAggregation("_breadcrumbs"),
				oDrillBreadcrumb1 = DrillStackHandler.createCrumb(this.oChart, oCrumbSettings1),
				oDrillBreadcrumb2 = DrillStackHandler.createCrumb(this.oChart, oCrumbSettings2),
				oInnerChart = this.oChart.getAggregation("_chart"),
				oEngine = this.oChart.getEngine();

			var oFireDeselectDataEventSpy = this.spy(oInnerChart, "fireDeselectData"),
				oCreateFlexItemChangesSpy = this.spy(oEngine, "createChanges");

			this.stub(oInnerChart, "getDrillStack").callsFake(function() {
				return [{
					dimension: ["language_code"],
					filter: undefined,
					hierarchylevel: {},
					measure: ["averagemetricsWords"]
				}, {
					dimension: ["language_code", "classification_code"],
					filter: undefined,
					hierarchylevel: {},
					measure: ["averagemetricsWords"]
				}];
			});

			this.stub(this.oChart, "getItemsByKeys").callsFake(function() {
				return [
					new DimensionItem({
						key: "classification_code"
					})
				];
			});

			oDrillBreadcrumbs.addLink(oDrillBreadcrumb1);
			oDrillBreadcrumbs.addLink(oDrillBreadcrumb2);

			// act (simulate a press the first list item on the drill down list)
			oDrillBreadcrumb1.firePress();

			var aFlexChanges = [{
				name: "classification_code",
				visible: false
			}];

			// assert
			assert.strictEqual(oFireDeselectDataEventSpy.callCount, 1, 'it should fire the "deselectData" event on the inner Chart');
			sinon.assert.calledWith(oCreateFlexItemChangesSpy, {
				control: this.oChart,
				key: "Item",
				state: aFlexChanges
			});
			done();
		}.bind(this));

	});
});
