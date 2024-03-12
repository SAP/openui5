sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/widgets/Card",
	"sap/base/util/deepClone"
], function (Controller, Card, deepClone) {
	"use strict";

	const oManifest = {
		"sap.app": {
			"id": "card.explorer.bulletChart.list.card",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"type": "Numeric",
				"title": "Income from products",
				"subTitle": "Revenue",
				"status": {
					"text": "5 of 20"
				},
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": 225,
					"unit": "K",
					"trend": "Down",
					"state": "Critical"
				},
				"sideIndicators": [
					{
						"title": "Target",
						"number": 250,
						"unit": "K"
					},
					{
						"title": "Deviation",
						"number": 25,
						"unit": "K"
					}
				],
				"details": "{details}",
				"chart": { }
			},
			"content": {
			}
		}
	};

	const oData = {
		"color": "Critical",
		"columns": [
			{
				"color": "Error",
				"value": 100
			},
			{
				"color": "Critical",
				"value": 250
			},
			{
				"color": "Good",
				"value": 400
			},
			{
				"color": "Error",
				"value": 100
			}
		],
		"lines": [
			{
				"color": "Good",
				"lineType": "Dashed",
				"points": [
					{
						"X": 0,
						"Y": 100
					},
					{
						"X": 10,
						"Y": 110
					},
					{
						"X": 20,
						"Y": 80
					},
					{
						"X": 30,
						"Y": 120
					}
				]
			},
			{
				"color": "#1c74d1",
				"lineType": "Dotted",
				"points": [
					{
						"X": 0,
						"Y": 250
					},
					{
						"X": 10,
						"Y": 380
					},
					{
						"X": 20,
						"Y": 180
					},
					{
						"X": 30,
						"Y": 190
					}
				]
			}
		]
	};

	const aChartSamples = [
		{
			"type": "Bullet",
			"minValue": 0,
			"maxValue": 100,
			"target": 150,
			"value": 120,
			"scale": "€",
			"displayValue": "120 EUR",
			"color": "{color}"
		},
		{
			"type": "Column",
			"leftTopLabel": "0M",
			"rightTopLabel": "80M",
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"columns": {
				"path": "columns",
				"template": {
					"color": "{color}",
					"value": "{value}"
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
					"color": "{color}",
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
			"color": "{color}",
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
				"path": "lines",
				"template": {
					"color": "{color}",
					"lineType": "Dotted",
					"showPoints": true,
					"points": {
						"path": "points",
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
					"color": "{color}",
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
				"path": "lines/0/points",
				"template": {
					"x": "{X}",
					"y": "{Y}"
				}
			}
		},
		{
			"type": "Radial",
			"color": "{color}",
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

	return Controller.extend("sap.f.cardsdemo.controller.MicroChart", {
		onInit: function () {
			const oSamplesPanel = this.byId("samples");

			aChartSamples.forEach((oSample, iInd) => {
				const oSampleManifest = deepClone(oManifest);
				oSampleManifest["sap.card"].header.chart = oSample;
				oSampleManifest["sap.card"].header.data = {json: oData};

				const oCard = new Card("card" + iInd, {
					width: "500px",
					manifest: oSampleManifest
				});

				oCard.addStyleClass("sapUiTinyMargin");

				oSamplesPanel.addContent(oCard);
			});
		}
	});
});