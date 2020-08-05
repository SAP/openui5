/*!
* ${copyright}
*/

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (
	mLibrary,
	Control,
	Core
) {
	"use strict";

	// Lazy dependencies, loaded on the first attempt to create Microchart.
	var BulletMicroChart, BulletMicroChartData, StackedBarMicroChart, StackedBarMicroChartBar;

	var ValueColor = mLibrary.ValueColor;

	/**
	 * Constructor for a new Microchart.
	 * This is helper item which can visualize Microcharts.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.Microchart
	 */
	var Microchart = Control.extend("sap.ui.integration.controls.Microchart", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * The value of the chart. Displayed next to the chart graphic.
				 */
				displayValue: { type: "string" },
				/**
				 * The value color of the chart. Applicable only for Bullet microchart.
				 */
				valueColor: { type: "sap.m.ValueColor", defaultValue: ValueColor.Neutral }
			},
			aggregations: {
				/**
				 * Chart from the <code>sap.suite.ui.microchart</code> library.
				 */
				chart: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oMicrochart) {
				var sValueClass = "sapUiIntegrationMicrochartValue" + oMicrochart.getValueColor();

				oRm.openStart("div", oMicrochart)
					.class("sapUiIntegrationMicrochartChartWrapper")
					.openEnd();

				// chart
				oRm.openStart("div")
					.class("sapUiIntegrationMicrochartChart")
					.openEnd()
					.renderControl(oMicrochart.getChart())
					.close("div");

				// value
				oRm.openStart("div")
					.class("sapMSLIInfo")
					.class(sValueClass)
					.openEnd()
					.text(oMicrochart.getDisplayValue())
					.close("div");

				oRm.close("div");
			}
		}
	});

	Microchart.loadDependencies = function () {
		return new Promise(function (resolve, reject) {
			Core.loadLibrary("sap.suite.ui.microchart", { async: true })
				.then(function () {
					sap.ui.require([
						"sap/suite/ui/microchart/BulletMicroChart",
						"sap/suite/ui/microchart/BulletMicroChartData",
						"sap/suite/ui/microchart/StackedBarMicroChart",
						"sap/suite/ui/microchart/StackedBarMicroChartBar"
					], function (_BulletMicroChart, _BulletMicroChartData, _StackedBarMicroChart, _StackedBarMicroChartBar) {
						BulletMicroChart = _BulletMicroChart;
						BulletMicroChartData = _BulletMicroChartData;
						StackedBarMicroChart = _StackedBarMicroChart;
						StackedBarMicroChartBar = _StackedBarMicroChartBar;
						resolve();
					}, function (sErr) {
						reject(sErr);
					});
				})
				.catch(function () {
					reject("The usage of Microcharts is not available with this distribution.");
				});
		});
	};

	/**
	 * Creates new Microchart.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.ui.integration.controls.Microchart} New Microchart.
	 */
	Microchart.create = function (oChartSettings) {
		var oMicrochart,
			oChart;

		if (oChartSettings.type === "Bullet") {
			var aThresholds = [];

			if (oChartSettings.thresholds) {
				aThresholds = oChartSettings.thresholds.map(function (oThreshold) {
					return new BulletMicroChartData({
						value: oThreshold.value,
						color: oThreshold.color
					});
				});
			}

			oChart = new BulletMicroChart({
				size: "Responsive",
				minValue: oChartSettings.minValue,
				maxValue: oChartSettings.maxValue,
				targetValue: oChartSettings.target,
				showTargetValue: !!oChartSettings.target,
				scaleColor: "Light",
				scale: oChartSettings.scale,
				actual: new BulletMicroChartData({
					value: oChartSettings.value,
					color: oChartSettings.color
				}),
				thresholds: aThresholds
			});

			oMicrochart = new Microchart({
				valueColor: oChartSettings.color,
				displayValue: oChartSettings.displayValue,
				chart: oChart
			});
		}

		if (oChartSettings.type === "StackedBar") {
			var aBars = oChartSettings.bars.map(function (oBar) {
				return new StackedBarMicroChartBar({
					value: oBar.value,
					displayValue: oBar.displayValue,
					valueColor: oBar.color
				});
			});

			oChart = new StackedBarMicroChart({
				size: "Responsive",
				bars: aBars,
				maxValue: oChartSettings.maxValue
			});

			oMicrochart = new Microchart({
				displayValue: oChartSettings.displayValue,
				chart: oChart
			});
		}

		return oMicrochart;
	};

	return Microchart;
});