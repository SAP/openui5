/* global QUnit, sinon */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/theming/Parameters",
	"sap/ui/integration/controls/MicrochartLegend",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	mLibrary,
	Core,
	Control,
	Parameters,
	MicrochartLegend,
	waitForThemeApplied
) {
	"use strict";

	var ValueColor = mLibrary.ValueColor;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Colors", {
		beforeEach: function () {
			this.COLOR_FROM_CHART_PALETTE = "COLOR_FROM_CHART_PALETTE";
			this.COLOR_FROM_VALUE_COLOR = ValueColor.Good;
			this.COLOR_CSS = "aquamarine";

			this.oChartStub = new Control();
			this.oChartStub._calculateChartData = function () {
				return [
					{ color: this.COLOR_FROM_CHART_PALETTE },
					{ color: this.COLOR_FROM_VALUE_COLOR },
					{ color: this.COLOR_CSS }
				];
			}.bind(this);

			this.oMicrochartLegend = new MicrochartLegend({
				chart: this.oChartStub
			});

			this.oMicrochartLegend.initItemsTitles([
				{ legendTitle: "Bar1" },
				{ legendTitle: "Bar2" },
				{ legendTitle: "Bar3" }
			], "");
		},
		afterEach: function () {
			this.oMicrochartLegend.destroy();
			this.oMicrochartLegend = null;
			this.oChartStub.destroy();
			this.oChartStub = null;
		}
	});

	QUnit.test("Legend item color from chart palette", function (assert) {
		// arrange
		var sExpectedBackground = "rgb(1, 1, 1)";
		sinon.stub(Parameters, "get").withArgs(this.COLOR_FROM_CHART_PALETTE).returns(sExpectedBackground);

		this.oMicrochartLegend.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oFirstBarBackground = this.oMicrochartLegend.$().find(".sapUiIntMicrochartLegendItem :first-child")[0].style.background;

		// assert
		assert.strictEqual(oFirstBarBackground, sExpectedBackground, "The item should have expected background from chart color palette.");

		// clean up
		Parameters.get.restore();
	});

	QUnit.test("Legend item color from ValueColor enumeration", function (assert) {
		this.oMicrochartLegend.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var oSecondBar = this.oMicrochartLegend.$().find(".sapUiIntMicrochartLegendItem > :first-child")[1];

		// assert
		assert.ok(oSecondBar.classList.contains("sapUiIntMicrochartLegendItemGood"), "The item should have correct background class set.");
	});

	QUnit.test("Legend item color as CSS value", function (assert) {
		this.oMicrochartLegend.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var oThirdBarBackground = this.oMicrochartLegend.$().find(".sapUiIntMicrochartLegendItem > :first-child")[2].style.background;

		// assert
		assert.strictEqual(oThirdBarBackground, this.COLOR_CSS, "The item should have background set as CSS value.");
	});

	QUnit.module("Layout", {
		beforeEach: function () {
			this.oChartStub = new Control();
			this.oChartStub._calculateChartData = function () {
				return [
					{ color: "red" },
					{ color: "red" },
					{ color: "red" }
				];
			};
		},
		afterEach: function () {
			this.oChartStub.destroy();
			this.oChartStub = null;
		}
	});

	QUnit.test("Legend items width when there is an item with long title", function (assert) {
		// arrange
		var oMicrochartLegend = new MicrochartLegend({
			chart: this.oChartStub
		});
		oMicrochartLegend.initItemsTitles([
			{ legendTitle: "Bar1" },
			{ legendTitle: "Bar2 With Very Long Long Long Title" },
			{ legendTitle: "Bar3" }
		], "");
		oMicrochartLegend.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var aMinWidths = oMicrochartLegend.$().children(".sapUiIntMicrochartLegendItem").map(function () {
			return this.style.minWidth;
		}).toArray();

		var bAllEqual = aMinWidths.every(function (sWidth) {
			return sWidth === aMinWidths[0];
		});

		// assert
		assert.ok(aMinWidths[0], "There is a 'min-width' style set.");
		assert.ok(bAllEqual, "All items in the legend should be as wide as the widest item.");

		// clean up
		oMicrochartLegend.destroy();
	});

	return waitForThemeApplied();
});
