/* global QUnit */

sap.ui.define([
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/Log",
	"sap/base/util/deepClone"
], function(
	Microchart,
	nextUIUpdate,
	Log,
	deepClone
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const aSamples = [
		{
			"type": "Bullet",
			"minValue": 0,
			"maxValue": 100,
			"target": 150,
			"value": 120,
			"scale": "€",
			"displayValue": "120 EUR",
			"color": "Critical"
		},
		{
			"type": "Column",
			"leftTopLabel": "0M",
			"rightTopLabel": "80M",
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"columns": {
				"path": "chart/columns",
				"template": {
					"color": "Critical",
					"value": 44
				}
			}
		},
		{
			"type": "Column",
			"allowColumnLabels": true,
			"leftTopLabel": "0M",
			"rightTopLabel": "80M",
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"columns": [
				{
					"color": "Error",
					"value": 10,
					"displayValue": "10M",
					"label": "2022"
				},
				{
					"color": "Critical",
					"value": 20,
					"displayValue": "20M",
					"label": "2023"
				},
				{
					"color": "Good",
					"value": 30,
					"displayValue": "30M",
					"label": "2024"
				}
			]
		},
		{
			"type": "HarveyBall",
			"color": "Critical",
			"total": 100,
			"totalScale": "K",
			"showTotal": true,
			"percentage": 25,
			"fraction": 25,
			"fractionScale": "K"
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"lines": {
				"path": "Lines",
				"template": {
					"color": "Critical",
					"lineType": "Dotted",
					"showPoints": true,
					"points": {
						"path": "Points",
						"template": {
							"x": "{X}",
							"y": "{Y}"
						}
					}
				}
			}
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"lines": [
				{
					"color": "Critical",
					"lineType": "Dotted",
					"showPoints": true,
					"points": [
						{
							"x": 10,
							"y": 100
						},
						{
							"x": 20,
							"y": 400
						},
						{
							"x": 30,
							"y": 50
						}
					]
				},
				{
					"color": "Good",
					"lineType": "Dashed",
					"showPoints": true,
					"points": [
						{
							"x": 10,
							"y": 400
						},
						{
							"x": 20,
							"y": 100
						},
						{
							"x": 30,
							"y": 50
						}
					]
				}
			]
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"points": [
				{
					"x": 10,
					"y": 100
				},
				{
					"x": 20,
					"y": 400
				},
				{
					"x": 30,
					"y": 50
				}
			]
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"points": {
				"path": "Lines/0/Points",
				"template": {
					"x": "{X}",
					"y": "{Y}"
				}
			}
		},
		{
			"type": "Radial",
			"color": "Critical",
			"total": 100,
			"showPercentageSymbol": true,
			"percentage": 25,
			"fraction": 25
		},
		{
			"type": "StackedBar",
			"displayValue": "150K",
			"maxValue": 170,
			"bars": [
				{
					"value": 120,
					"displayValue": "Notebook 13 120K",
					"legendTitle": "Notebook 13"
				},
				{
					"value": 150,
					"displayValue": "Notebook 17 150K",
					"legendTitle": "Notebook 17"
				}
			]
		}
	];

	const pIfMicroChartsAvailable = Microchart.loadDependencies();

	function testWithMicrochart(assert, fnTest) {
		const done = assert.async();

		return pIfMicroChartsAvailable
			.then(async () => {
				await fnTest();
				done();
			}, () => {
				assert.ok(true, "Usage of Microcharts is not available with this distribution.");
				done();
			});
	}

	QUnit.module("Rendering");

	QUnit.test("Value of the chart has same color as the chart", async function (assert) {
		// arrange
		const oMicrochart = new Microchart({
			valueColor: "Good",
			displayValue: "123"
		});

		oMicrochart.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oMicrochart.$().find(".sapUiIntMicrochartValue" + oMicrochart.getValueColor()).length, "The value div should have 'Good' class.");

		// clean up
		oMicrochart.destroy();
	});

	QUnit.module("Creating");

	QUnit.test("Create different types", async function (assert) {
		// Add also with size S
		const aFullSamples = aSamples.concat(aSamples.map((oSample) => {
			oSample = deepClone(oSample);
			oSample.size = "S";
			return oSample;
		}));

		await testWithMicrochart(assert, async () => {
			for (const oSettings of aFullSamples) {
				// Arrange
				const fnLogErrorSpy = this.spy(Log, "error");
				const oChartWrapper = Microchart.create(oSettings);
				const oChart = oChartWrapper.getChart();
				const sClassName = oChart.getMetadata().getName();
				const sExpectedClassName = `sap.suite.ui.microchart.${oSettings.type}MicroChart`;

				oChartWrapper.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();

				// Assert
				assert.strictEqual(sClassName, sExpectedClassName, `${oSettings.type} was created with correct class.`);
				assert.ok(fnLogErrorSpy.notCalled, `${oSettings.type} was created without errors.`);
				assert.ok(oChartWrapper.$(), `${oSettings.type} was rendered.`);

				// Clean up
				oChartWrapper.destroy();
				fnLogErrorSpy.restore();
			}
		});

	});
});
