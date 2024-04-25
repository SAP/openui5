/*!
* ${copyright}
*/

sap.ui.define([
	"./MicrochartRenderer",
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/base/DataType",
	"sap/base/Log",
	"sap/ui/integration/util/BindingHelper"
], function (
	MicrochartRenderer,
	mLibrary,
	Control,
	Lib,
	DataType,
	Log,
	BindingHelper
) {
	"use strict";

	// Lazy dependencies, loaded on the first attempt to create Microchart.
	var BulletMicroChart,
		BulletMicroChartData,
		StackedBarMicroChart,
		StackedBarMicroChartBar,
		HarveyBallMicroChart,
		HarveyBallMicroChartItem,
		LineMicroChart,
		LineMicroChartLine,
		LineMicroChartPoint,
		RadialMicroChart,
		ColumnMicroChart,
		ColumnMicroChartData,
		ColumnMicroChartLabel;

	var ValueColor = mLibrary.ValueColor;
	var Size = mLibrary.Size;

	/**
	 * Validates the given bar valueColor against the sap.m.ValueColor type.
	 * Normally sap.suite.ui.microchart.StackedBarMicroChartBar allows CSS colors, but for cards we limit this to sap.m.ValueColor.
	 * That ensures that theming and the mobile rendering can work.
	 * @param {string} sColor The color to validate.
	 * @returns {string} The validated color.
	 */
	function validateBarValueColor(sColor) {
		if (!sColor || typeof sColor !== "string") {
			return sColor;
		}

		var bIsValid = DataType.getType("sap.m.ValueColor").isValid(sColor);

		if (!bIsValid) {
			Log.error("The value for stacked bar color must be a valid 'sap.m.ValueColor'. Given '" + sColor + "'.", "sap.ui.integration.controls.Microchart");
			return null;
		}

		return sColor;
	}
	/**
	 * Prepares and validates the size for chart. Only size <code>S</code> and <code>Responsive</code> are allowed.
	 * If size is invalid - method fallbacks to size <code>Responsive</code>.
	 * @param {string} sSize The size.
	 * @returns {string} The validated size.
	 */
	function prepareSize(sSize) {
		if (!sSize) {
			return Size.Responsive;
		}

		if (typeof sSize !== "string") {
			return BindingHelper.reuse(sSize);
		}

		const bIsValid = sSize === Size.S || sSize === Size.Responsive;

		if (!bIsValid) {
			Log.error("The value for size is not correct. Only size 'S' and 'Responsive' are supported. Given '" + sSize + "'.", "sap.ui.integration.controls.Microchart");
			return Size.Responsive;
		}

		return sSize;
	}

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
				valueColor: { type: "sap.m.ValueColor", defaultValue: ValueColor.Neutral },
				/**
				 * The minimal height of the chart.
				 */
				height: { type: "sap.ui.core.CSSSize", defaultValue: "1rem" },
				/**
				 * The size of the underlying chart.
				 */
				size: { type: "sap.m.Size", defaultValue: Size.Responsive }
			},
			aggregations: {
				/**
				 * Chart from the <code>sap.suite.ui.microchart</code> library.
				 */
				chart: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: MicrochartRenderer
	});

	Microchart.loadDependencies = function () {
		return new Promise(function (resolve, reject) {
			Lib.load({ name: "sap.suite.ui.microchart" })
				.then(function () {
					sap.ui.require([
						"sap/suite/ui/microchart/BulletMicroChart",
						"sap/suite/ui/microchart/BulletMicroChartData",
						"sap/suite/ui/microchart/StackedBarMicroChart",
						"sap/suite/ui/microchart/StackedBarMicroChartBar",
						"sap/suite/ui/microchart/HarveyBallMicroChart",
						"sap/suite/ui/microchart/HarveyBallMicroChartItem",
						"sap/suite/ui/microchart/LineMicroChart",
						"sap/suite/ui/microchart/LineMicroChartLine",
						"sap/suite/ui/microchart/LineMicroChartPoint",
						"sap/suite/ui/microchart/RadialMicroChart",
						"sap/suite/ui/microchart/ColumnMicroChart",
						"sap/suite/ui/microchart/ColumnMicroChartData",
						"sap/suite/ui/microchart/ColumnMicroChartLabel"
					], function () {
						BulletMicroChart = arguments[0];
						BulletMicroChartData = arguments[1];
						StackedBarMicroChart = arguments[2];
						StackedBarMicroChartBar = arguments[3];
						HarveyBallMicroChart = arguments[4];
						HarveyBallMicroChartItem = arguments[5];
						LineMicroChart = arguments[6];
						LineMicroChartLine = arguments[7];
						LineMicroChartPoint = arguments[8];
						RadialMicroChart = arguments[9];
						ColumnMicroChart = arguments[10];
						ColumnMicroChartData = arguments[11];
						ColumnMicroChartLabel = arguments[12];
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
	 * @param {boolean} bIsForHeader The chart will be used in a card header.
	 * @returns {sap.ui.integration.controls.Microchart} New Microchart.
	 */
	Microchart.create = function (oChartSettings, bIsForHeader) {
		var oChart,
			sForceHeight = "1rem";

		if (oChartSettings.type === "Bullet") {
			oChart = Microchart._createBulletChart(oChartSettings);
		} else if (oChartSettings.type === "StackedBar") {
			oChart = Microchart._createStackedBarChart(oChartSettings);
		} else if (oChartSettings.type === "HarveyBall") {
			oChart = Microchart._createHarveyBallChart(oChartSettings);
			sForceHeight = "3rem";
		} else if (oChartSettings.type === "Line") {
			oChart = Microchart._createLineChart(oChartSettings);
			sForceHeight = "3rem";
		} else if (oChartSettings.type === "Radial") {
			oChart = Microchart._createRadialChart(oChartSettings);
			sForceHeight = "2rem";
		} else if (oChartSettings.type === "Column") {
			oChart = Microchart._createColumnChart(oChartSettings);
			sForceHeight = "3rem";
		}

		const oMicrochart = new Microchart({
			valueColor: BindingHelper.reuse(oChartSettings.color),
			size: prepareSize(oChartSettings.size),
			displayValue: oChartSettings.displayValue,
			chart: oChart,
			height: sForceHeight,
			visible: oChartSettings.visible
		});

		if (bIsForHeader) {
			oMicrochart.addStyleClass("sapUiIntMicrochartInHeader");
		}

		return oMicrochart;
	};

	/**
	 * Creates new BulletChart based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.BulletMicroChart} new BulletMicroChart.
	 */
	Microchart._createBulletChart = function (oChartSettings) {
		var aThresholds = [];
		if (oChartSettings.thresholds) {
			aThresholds = oChartSettings.thresholds.map(function (oThreshold) {
				return new BulletMicroChartData({
					value: oThreshold.value,
					color: oThreshold.color
				});
			});
		}

		return new BulletMicroChart({
			size: prepareSize(oChartSettings.size),
			minValue: oChartSettings.minValue,
			maxValue: oChartSettings.maxValue,
			targetValue: oChartSettings.target,
			showTargetValue: !!oChartSettings.target,
			scaleColor: "Light",
			scale: oChartSettings.scale,
			actual: new BulletMicroChartData({
				value: oChartSettings.value,
				color: BindingHelper.reuse(oChartSettings.color)
			}),
			thresholds: aThresholds
		});
	};

	/**
	 * Creates new StackedBarChart  based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.StackedBarChart } new StackedBarChart.
	 */
	Microchart._createStackedBarChart = function (oChartSettings) {
		var aBars = oChartSettings.bars.map(function (oBar) {
			var vColor = validateBarValueColor(oBar.color);
			return new StackedBarMicroChartBar({
				value: oBar.value,
				displayValue: oBar.displayValue,
				valueColor: vColor
			});
		});

		return new StackedBarMicroChart({
			size: prepareSize(oChartSettings.size),
			bars: aBars,
			maxValue: oChartSettings.maxValue
		});
	};

	/**
	 * Creates new HarveyBallChart based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.HarveyBallChart} new HarveyBallChart.
	 */
	Microchart._createHarveyBallChart = function (oChartSettings) {
		var vColor = validateBarValueColor(oChartSettings.color);
		return new HarveyBallMicroChart({
				size: prepareSize(oChartSettings.size),
				total: oChartSettings.total,
				totalScale: oChartSettings.totalScale,
				alignContent: "Right",
				items: [
					new HarveyBallMicroChartItem({
						fraction: oChartSettings.fraction,
						fractionScale: oChartSettings.fractionScale,
						color: BindingHelper.reuse(vColor),
						fractionLabel: oChartSettings.fractionLabel,
						formattedLabel: false
					})
				]
			});
	};

	/**
	 * Creates new LineChart based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.LineChart} new LineChart.
	 */
	Microchart._createLineChart = function (oChartSettings) {
		var vColor = validateBarValueColor(oChartSettings.color);
		var oChart = new LineMicroChart({
			size: prepareSize(oChartSettings.size),
			color: BindingHelper.reuse(vColor),
			maxXValue: oChartSettings.maxXValue,
			minXValue: oChartSettings.minXValue,
			maxYValue: oChartSettings.maxYValue,
			minYValue: oChartSettings.minYValue,
			threshold: oChartSettings.threshold,
			leftTopLabel: oChartSettings.leftTopLabel,
			leftBottomLabel: oChartSettings.leftBottomLabel,
			rightTopLabel:oChartSettings.rightTopLabel,
			rightBottomLabel:oChartSettings.rightBottomLabel
		});

		if (Array.isArray(oChartSettings.points)) {
			// static points
			oChartSettings.points.forEach(function (oPoint) {
				oChart.addPoint(
					new LineMicroChartPoint({
						x: oPoint.x,
						y: oPoint.y
					})
				);
			});
		} else if (oChartSettings.points?.path && oChartSettings.points?.template) {
			oChart.bindAggregation("points", {
				path: oChartSettings.points.path,
				template: new LineMicroChartPoint(oChartSettings.points.template),
				templateShareable: true
			});
		}

		if (Array.isArray(oChartSettings.lines)) {
			// static columns with static points
			oChartSettings.lines.forEach(function (oLine) {
				var vColor = validateBarValueColor(oLine.color);
				oChart.addLine(
					new LineMicroChartLine({
						color: vColor,
						showPoints: oLine.showPoints,
						type: oLine.lineType,
						points: oLine.points.map(function (oPoint) {
							return new LineMicroChartPoint({
								x: oPoint.x,
								y: oPoint.y
							});
						})
					})
				);
			});
		} else if (oChartSettings.lines?.path && oChartSettings.lines?.template) {
			// dynamic lines with points
			var oTemplateSettings = oChartSettings.lines.template;
			var oLineTemplate = new LineMicroChartLine({
				color: oTemplateSettings.color,
				showPoints:oTemplateSettings.showPoints,
				type: oTemplateSettings.lineType
			});
			if (oTemplateSettings.points?.path && oTemplateSettings.points?.template) {
				oLineTemplate.bindAggregation("points", {
					path: oTemplateSettings.points.path,
					template: new LineMicroChartPoint(oTemplateSettings.points.template),
					templateShareable: true
				});
			}

			oChart.bindAggregation("lines", {
				path: oChartSettings.lines.path,
				template: oLineTemplate,
				templateShareable: true
			});

		} else {
			Log.info("lines or points property is not properly configured for the LineMicroChart", "sap.ui.integration.controls.Microchart");
		}
		return oChart;
	};

	/**
	 * Creates new RadialChart based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.RadialChart} new RadialChart.
	 */
	Microchart._createRadialChart = function (oChartSettings) {
		var vColor = validateBarValueColor(oChartSettings.color);
		return new RadialMicroChart({
			size: prepareSize(oChartSettings.size),
			valueColor: BindingHelper.reuse(vColor),
			total: oChartSettings.total,
			showPercentageSymbol: oChartSettings.showPercentageSymbol,
			percentage: oChartSettings.percentage,
			fraction: oChartSettings.fraction,
			alignContent: "Right"
		});
	};

	/**
	 * Creates new ColumnChart based on the chart settings.
	 * @param {object} oChartSettings Chart configuration from the manifest.
	 * @returns {sap.suite.ui.microcharts.ColumnChart} new ColumnChart.
	 */
	Microchart._createColumnChart = function (oChartSettings){
		var mSettings = {
			size: prepareSize(oChartSettings.size),
			allowColumnLabels: oChartSettings.allowColumnLabels,
			leftTopLabel: new ColumnMicroChartLabel({ label: oChartSettings.leftTopLabel }),
			leftBottomLabel: new ColumnMicroChartLabel({ label: oChartSettings.leftBottomLabel }),
			rightTopLabel: new ColumnMicroChartLabel({ label: oChartSettings.rightTopLabel }),
			rightBottomLabel: new ColumnMicroChartLabel({ label: oChartSettings.rightBottomLabel })
		};

		var oChart = new ColumnMicroChart(mSettings);
		if (Array.isArray(oChartSettings.columns)) {
			// static columns
			oChartSettings.columns.forEach(function (oColumn) {
				var vColor = validateBarValueColor(oColumn.color);
				oChart.addColumn(
					new ColumnMicroChartData({
						color: vColor,
						label: oColumn.label,
						displayValue: oColumn.displayValue,
						value: oColumn.value
					}
				));
			});
		} else if (oChartSettings.columns?.path && oChartSettings.columns?.template) {
			// dynamic columns
			oChart.bindAggregation("columns", {
				path: oChartSettings.columns.path,
				template: new ColumnMicroChartData(oChartSettings.columns.template),
				templateShareable: true
			});
		} else {
			Log.info("Columns property is not properly configured for the ColumnMicroChart", "sap.ui.integration.controls.Microchart");
		}
		return oChart;
	};

	return Microchart;
});