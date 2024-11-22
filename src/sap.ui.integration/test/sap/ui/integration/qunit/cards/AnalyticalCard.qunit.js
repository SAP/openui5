/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/cards/AnalyticalContent",
	"sap/ui/integration/cards/actions/NavigationAction",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"../services/SampleServices"
], function (
	Library,
	AnalyticalContent,
	NavigationAction,
	Card,
	CardActions,
	nextUIUpdate,
	nextCardReadyEvent,
	SampleServices
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_AnalyticalCard = {
		"sap.app": {
			"id": "test.cards.analytical.card1"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "Card Header"
			},
			"content": {
				"chartType": "StackedBar",
				"legend": {
					"visible": "{legendVisible}",
					"position": "Bottom",
					"alignment": "Center"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"showTotal": false
					},
					"categoryAxisText": {
						"visible": false
					},
					"valueAxisText": {
						"visible": true
					}
				},
				"title": {
					"text": "Stacked Bar chart",
					"visible": true,
					"alignment": "Center"
				},
				"measureAxis": "valueAxis",
				"dimensionAxis": "categoryAxis",
				"data": {
					"json": {
						"measures": {
							"revenueLabel": "Revenue",
							"costLabel": "Costs"
						},
						"legendVisible": true,
						"list": [{
								"Week": "CW14",
								"WeekDisplay": "Week 14",
								"Revenue": 431000.22,
								"Cost": 230000.00
							}
						]
					}
				},
				"dimensions": [{
					"label": "Weeks",
					"value": "{Week}",
					"displayValue": "{WeekDisplay}"
				}],
				"measures": [{
						"label": "{measures/revenueLabel}",
						"value": "{Revenue}"
					},
					{
						"label": "{measures/costLabel}",
						"value": "{Cost}"
					}
				]
			}
		}
	};

	var oManifest_Analytical_WithFeeds = {
		"sap.app": {
			"id": "test.cards.analytical.card3",
			"type": "card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "Bubble"
			},
			"content": {
				"chartType": "bubble",
				"data": {
					"json": [
						{
							"Week": "CW14",
							"Revenue": 431000.22,
							"Cost": 230000.00,
							"Target": 500000.00,
							"Budget": 210000.00
						},
						{
							"Week": "CW15",
							"Revenue": 494000.30,
							"Cost": 238000.00,
							"Target": 500000.00,
							"Budget": 224000.00
						}
					]
				},
				"dimensions": [
					{
						"name": "Weeks",
						"value": "{Week}"
					}
				],
				"measures": [
					{
						"name": "Revenue",
						"value": "{Revenue}"
					},
					{
						"name": "Cost",
						"value": "{Cost}"
					},
					{
						"name": "Budget",
						"value": "{Budget}"
					}
				],
				"feeds": [
					{
						"uid": "valueAxis",
						"type": "Measure",
						"values": [
							"Revenue"
						]
					},
					{
						"uid": "valueAxis2",
						"type": "Measure",
						"values": [
							"Cost"
						]
					},
					{
						"uid": "bubbleWidth",
						"type": "Measure",
						"values": [
							"Budget"
						]
					},
					{
						"uid": "color",
						"type": "Dimension",
						"values": [
							"Weeks"
						]
					}
				]
			}
		}
	};

	var oManifest_Analytical_Service = {
		"_version": "1.8.0",
		"sap.app": {
			"id": "test.cards.analytical.card5",
			"type": "card"
		},
		"sap.ui5": {
			"services": {
				"Navigation4": {
					"factoryName": "test.service.SampleNavigationFactory"
				}
			}
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"title": "Content with Navigation Action (Service)"
			},
			"content": {
				"chartType": "Donut",
				"legend": {
					"visible": true,
					"position": "Top",
					"alignment": "Center"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"showTotal": true
					}
				},
				"title": {
					"text": "Donut chart",
					"visible": true,
					"alignment": "Bottom"
				},
				"measureAxis": "size",
				"dimensionAxis": "color",
				"data": {
					"request": {
						"url": "./cost.json"
					},
					"path": "/milk"
				},
				"dimensions": [{
					"label": "Store Name",
					"value": "{Store Name}"
				}],
				"measures": [{
					"label": "Revenue",
					"value": "{Revenue}"
				}],
				"actions": [{
					"type": "Navigation",
					"service": {
						"name": "Navigation4"
					},
					"parameters": {
						"url": "https://www.sap.com"
					}
				}]
			}
		}
	};

	var oManifest_Analytical_Url = {
		"_version": "1.8.0",
		"sap.app": {
			"id": "test.cards.analytical.card6",
			"type": "card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"title": "Content with Navigation Action (URL)",
				"actions": [{
					"type": "Navigation",
					"url": "https://www.sap.com"
				}]
			},
			"content": {
				"chartType": "Donut",
				"legend": {
					"visible": true,
					"position": "Top",
					"alignment": "Center"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"showTotal": true
					}
				},
				"title": {
					"text": "Donut chart",
					"visible": true,
					"alignment": "Bottom"
				},
				"measureAxis": "size",
				"dimensionAxis": "color",
				"data": {
					"request": {
						"url": "cost.json"
					},
					"path": "/milk"
				},
				"dimensions": [{
					"label": "Store Name",
					"value": "{Store Name}"
				}],
				"measures": [{
					"label": "Revenue",
					"value": "{Revenue}"
				}],
				"actions": [{
					"type": "Navigation",
					"url": "https://www.sap.com"
				}]
			}
		}
	};

	var oManifest_Analytical_ChartActions = {
		"sap.app": {
			"id": "test.cards.analytical.card7"
		},
		"sap.card": {
			"type": "Analytical",
			"content": {
				"chartType": "Donut",
				"measureAxis": "size",
				"dimensionAxis": "color",
				"dimensions": [
					{
						"label": "Store Name",
						"value": "{Store Name}"
					}
				],
				"measures": [
					{
						"label": "Revenue",
						"value": "{Revenue}"
					}
				],
				"actionableArea": "Chart",
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "https://sap.com?revenue={Revenue}&storeName={Store Name}"
						}
					}
				],
				"data": {
					"json": [
						{
							"Store Name": "24-Seven",
							"Revenue": 345292.06
						},
						{
							"Store Name": "A&A",
							"Revenue": 1564235.29
						}
					]
				}
			}
		}
	};

	var oManifest_Analytical_Popover = {
		"sap.app": {
			"id": "test.cards.analytical.card8"
		},
		"sap.card": {
			"type": "Analytical",
			"content": {
				"chartType": "Donut",
				"measureAxis": "size",
				"dimensionAxis": "color",
				"dimensions": [
					{
						"label": "Store Name",
						"value": "{Store Name}"
					}
				],
				"measures": [
					{
						"label": "Revenue",
						"value": "{Revenue}"
					}
				],
				"popover": {
					"active": true,
					"actionsStrip": [{
						"text": "Action for {Store Name}",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com/{Store Name}"
							}
						}]
					}]
				},
				"data": {
					"json": [
						{
							"Store Name": "24-Seven",
							"Revenue": 345292.06
						},
						{
							"Store Name": "A&A",
							"Revenue": 1564235.29
						}
					]
				}
			}
		}
	};

	var oManifest_Analytical_ChartNavigation = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "test.cards.analytical.card9",
			"type": "card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "Project Cloud Transformation",
				"subTitle": "Revenue"
			},
			"content": {
				"chartType": "Line",
				"data": {
					"json": [
							{
								"Week": "CW14",
								"Revenue": 431000.22,
								"Cost": 230000.00
							},
							{
								"Week": "CW15",
								"Revenue": 494000.30,
								"Cost": 238000.00
							},
							{
								"Week": "CW16",
								"Revenue": 491000.17,
								"Cost": 221000.00
							}
					],
					"path": "/"
				},
				"actionableArea": "Chart",
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com/revenue?week={Week}"
						}
					}
				],
				"dimensions": [
					{
						"name": "Weeks",
						"value": "{Week}"
					}
				],
				"measures": [
					{
						"name": "Revenue",
						"value": "{Revenue}"
					},
					{
						"name": "Costs",
						"value": "{Cost}"
					}
				],
				"feeds": [
					{
						"uid": "valueAxis",
						"type": "Measure",
						"values": [
							"Revenue",
							"Costs"
						]
					},
					{
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": [
							"Weeks"
						]
					}
				]
			}
		}
	};

	var oManifest_Analytical_TimeAxis = {
		"sap.app": {"id": "sap.fe", "type": "card"},
		"sap.ui": {"technology": "UI5"},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "Column Series with Time Axis"
			},
			"content": {
				"data": {
					"json": {
						"milk": [
							{
								"Date": "12/9/2012",
								"Revenue": 1884613.732,
								"Cost": 318748.33
							},
							{
								"Date": "12/10/2012",
								"Revenue": 4682139.01563249,
								"Cost": 724396.2295
							},
							{
								"Date": "12/11/2012",
								"Revenue": 3487569.9375,
								"Cost": 172863.976
							},
							{
								"Date": "12/12/2012",
								"Revenue": 1046946.00408699,
								"Cost": 544135.4995
							},
							{
								"Date": "12/13/2012",
								"Revenue": 1230392.932,
								"Cost": 467009.594
							},
							{
								"Date": "12/14/2012",
								"Revenue": 1633524.08,
								"Cost": 214320.01
							},
							{
								"Date": "12/15/2012",
								"Revenue": 1235093.22603004,
								"Cost": 345418.05
							}
						]
					},
					"path": "/milk"
				},
				"chartType": "timeseries_column",
				"chartProperties": {
					"plotArea": {
						"dataLabel": {
							"visible": true
						}
					},
					"timeAxis": {
						"title": {
							"visible": false
						}
					},
					"valueAxis": {
						"title": {
							"visible": false
						}
					},
					"title": {
						"visible": false
					}
				},
				"dimensions": [
					{
						"name": "Date",
						"value": "{Date}",
						"dataType":"date"
					}
				],
				"measures": [
					{
						"name": "Cost",
						"value": "{Cost}"
					}
				],
				"feeds": [
					{
						"uid": "valueAxis",
						"type": "Measure",
						"values": [
							"Cost"
						]
					},
					{
						"uid": "timeAxis",
						"type": "Dimension",
						"values": [
							"Date"
						]
					}
				]
			}
		}
	};

	async function testStackedBarChartCreation(oCard, oManifest, assert) {
		// Arrange
		var window = {
				"start": "firstDataPoint",
				"end": "lastDataPoint"
			};

		// Act
		oCard.setManifest(oManifest);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		var oContent = oCard.getAggregation("_content"),
			oChart = oContent.getAggregation("_content"),
			oVizProperites = oChart.getVizProperties(),
			oDataset = oChart.getDataset();

		assert.ok(oContent, "Analytical Card content form manifest should be set");
		assert.ok(oChart.getDomRef(), "Analytical Card content - chart should be rendered");
		assert.equal(oChart.getVizType(), "stacked_bar", "Chart should have a vizType set");
		assert.equal(oVizProperites.legend.visible, true, "Chart should have a legend visible property set to true using binding");
		assert.equal(oVizProperites.legendGroup.layout.position, "bottom", "Chart should have a legend position property set to bottom");
		assert.equal(oVizProperites.legendGroup.layout.alignment, "center", "Chart should have a legend alignment property set to center");
		assert.equal(oVizProperites.plotArea.window.end, window.end, "Chart should have a plotAreas window property set to this window object");
		assert.equal(oVizProperites.plotArea.window.start, window.start, "Chart should have a plotAreas window property set to this window object");
		assert.equal(oVizProperites.plotArea.dataLabel.visible, true, "Chart should have a plotArea.datalabel.visible set to true");
		assert.equal(oVizProperites.plotArea.dataLabel.showTotal, false, "Chart should have a plotArea.datalabel.showTotal set to false");
		assert.equal(oVizProperites.categoryAxis.title.visible, false, "Chart should have a categoryAxis.title.visible set to false");
		assert.equal(oVizProperites.valueAxis.title.visible, true, "Chart should have a valueAxis.title.visible set to false");
		assert.equal(oVizProperites.title.visible, true, "Chart should have a title.visible set to true");
		assert.equal(oVizProperites.title.text, "Stacked Bar chart", "Chart should have a title.text set to true");
		assert.equal(oVizProperites.title.alignment, "center", "Chart should have a title.alignment set to center");
		assert.equal(oChart.getFeeds()[0].getProperty("uid"), "valueAxis", "Chart should have a feed item with property 'uid'");
		assert.equal(oChart.getFeeds()[0].getProperty("type"), "Measure", "Chart should have a feed item with property 'Measure'");
		assert.equal(oChart.getFeeds()[1].getProperty("uid"), "categoryAxis", "Chart should have a feed item with property 'uid'");
		assert.equal(oChart.getFeeds()[1].getProperty("type"), "Dimension", "Chart should have a feed item with property 'Measure'");
		assert.deepEqual(oChart.getFeeds()[0].getProperty("values"), ["Revenue", "Costs"], "Measures values should be set using binding");
		assert.deepEqual(oChart.getFeeds()[1].getProperty("values"), ["Weeks"], "Dimensions values should be set using binding");
		assert.ok(oChart.getFeeds()[0].getProperty("values").indexOf("Costs") > 0, "Chart should have a feed item with value Costs of it seeds labels");

		// test dataset
		assert.strictEqual(oDataset.getDimensions()[0].getBindingInfo("value").binding.getPath(), "Week", "Dimension has expected value.");
		assert.strictEqual(oDataset.getDimensions()[0].getBindingInfo("displayValue").binding.getPath(), "WeekDisplay", "Dimension has expected displayValue.");
	}

	return Library.load("sap.viz").then(function () {
		QUnit.module("Init");

		QUnit.test("Initialization - AnalyticalContent", async function (assert) {
			// Arrange
			const oCard = new Card({
				manifest: oManifest_AnalyticalCard,
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextUIUpdate();

			// Assert
			assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
			assert.ok(oCard.getDomRef(), "Card should be rendered.");
			assert.equal(oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
			assert.equal(oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
			assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");
			assert.ok(oCard.getAggregation("_content").isA("sap.ui.integration.cards.AnalyticalContent"), "Chart is rendered");

			// Cleanup
			oCard.destroy();
		});

		QUnit.module("Chart creation", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Using manifest", async function (assert) {
			await testStackedBarChartCreation(this.oCard, oManifest_AnalyticalCard, assert);
		});

		QUnit.test("Using manifest with data on card level", async function (assert) {
			const oManifest = {
				"sap.app": {
					"id": "test.cards.analytical.card2"
				},
				"sap.card": {
					"type": "Analytical",
					"data": {
						"json": {
							"measures": {
								"revenueLabel": "Revenue",
								"costLabel": "Costs"
							},
							"legendVisible": true,
							"list": [{
									"Week": "CW14",
									"WeekDisplay": "Week 14",
									"Revenue": 431000.22,
									"Cost": 230000.00
								}
							]
						},
						"path": "/list"
					},
					"header": {
						"title": "Card Header"
					},
					"content": {
						"chartType": "StackedBar",
						"legend": {
							"visible": "{legendVisible}",
							"position": "Bottom",
							"alignment": "Center"
						},
						"plotArea": {
							"dataLabel": {
								"visible": true,
								"showTotal": false
							},
							"categoryAxisText": {
								"visible": false
							},
							"valueAxisText": {
								"visible": true
							}
						},
						"title": {
							"text": "Stacked Bar chart",
							"visible": true,
							"alignment": "Center"
						},
						"measureAxis": "valueAxis",
						"dimensionAxis": "categoryAxis",
						"dimensions": [{
							"label": "Weeks",
							"value": "{Week}",
							"displayValue": "{WeekDisplay}"
						}],
						"measures": [{
								"label": "{measures/revenueLabel}",
								"value": "{Revenue}"
							},
							{
								"label": "{measures/costLabel}",
								"value": "{Cost}"
							}
						]
					}
				}
			};

			await testStackedBarChartCreation(this.oCard, oManifest, assert);
		});

		QUnit.test("Creating chart with 'feeds'", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_Analytical_WithFeeds);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent(),
				oChart = oContent.getAggregation("_content");

			assert.ok(oChart.getDomRef(), "Chart should be rendered");
			assert.strictEqual(oChart.getVizType(), oManifest_Analytical_WithFeeds["sap.card"].content.chartType, "Chart should have correct 'vizType' set");
			assert.strictEqual(oChart.getFeeds()[0].getUid(), "valueAxis", "Feed with correct 'uid' should be created");
			assert.strictEqual(oChart.getFeeds()[0].getType(), "Measure", "Feed type should be 'Measure'");
			assert.deepEqual(oChart.getFeeds()[0].getValues(), ["Revenue"], "Binding of feed values should be resolved");
			assert.strictEqual(oChart.getFeeds()[1].getUid(), "valueAxis2", "Feed with correct 'uid' should be created");
			assert.strictEqual(oChart.getFeeds()[1].getType(), "Measure", "Feed type should be 'Measure'");
			assert.deepEqual(oChart.getFeeds()[1].getValues(), ["Cost"], "Binding of feed values should be resolved");
			assert.strictEqual(oChart.getFeeds()[2].getUid(), "bubbleWidth", "Feed with correct 'uid' should be created");
			assert.strictEqual(oChart.getFeeds()[2].getType(), "Measure", "Feed type should be 'Measure'");
			assert.deepEqual(oChart.getFeeds()[2].getValues(), ["Budget"], "Binding of feed values should be resolved");
			assert.strictEqual(oChart.getFeeds()[3].getUid(), "color", "Feed with correct 'uid' should be created");
			assert.strictEqual(oChart.getFeeds()[3].getType(), "Dimension", "Feed type should be 'Dimension'");
			assert.deepEqual(oChart.getFeeds()[3].getValues(), ["Weeks"], "Binding of feed values should be resolved");
		});

		QUnit.test("Creating chart with time axis", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_Analytical_TimeAxis);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent(),
				oChart = oContent.getAggregation("_content");

			assert.strictEqual(oChart.getDataset().getDimensions()[0].getDataType(), "date", "dataType is correctly set");
		});

		QUnit.module("vizProperties");

		QUnit.test("There are default 'vizProperties'", function (assert) {
			assert.ok(AnalyticalContent.prototype._getVizProperties.call(null, {}), "There should be default vizProperties");
		});

		QUnit.test("'chartProperties' are correctly merged into the 'vizProperties'", function (assert) {
			// Arrange
			var oConfiguration = {
				legend: {
					visible: true
				},
				chartProperties: {
					title: {
						text: "Bubble chart",
						visible: true,
						alignment: "left"
					},
					legend: {
						visible: false
					}
				}
			};

			// Act
			var oVizProperties = AnalyticalContent.prototype._getVizProperties.call(null, oConfiguration);

			// Assert
			assert.strictEqual(oVizProperties.title.text, oConfiguration.chartProperties.title.text, "Text should be taken from the 'chartProperties'");
			assert.notStrictEqual(oVizProperties.legend.visible, oConfiguration.legend.visible, "Deprecated 'legend' property has lower precedence than 'chartProperties'");
			assert.strictEqual(oVizProperties.legend.visible, oConfiguration.chartProperties.legend.visible, "Value from 'chartProperties' should be used");
		});

		QUnit.module("Actions - Analytical Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Analytical content should be actionable - service ", async function (assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			this.oCard.setManifest(oManifest_Analytical_Service);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oCardLContent = this.oCard.getCardContent();

			this.oCard.attachAction(function (oEvent) {
				oEvent.preventDefault();
				// Assert
				assert.ok(oCardLContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 1, "Card Content is clicked and action event is fired");

				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();
				done();
			});

			// Act
			oCardLContent.firePress();
		});

		QUnit.test("Analytical Card should be actionable - url", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(oManifest_Analytical_Url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardLContent = this.oCard.getCardContent(),
				oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.ok(oCardLContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header is clickable");
			//Act
			oCardLContent.firePress();
			oCardHeader.firePress();

			await nextUIUpdate();

			//Assert
			assert.strictEqual(oActionSpy.callCount, 2, "Card Content and header are clicked and action event is fired twice");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("Analytical Card should not be actionable", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			this.oCard.setManifest(oManifest_AnalyticalCard);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardContent = this.oCard.getCardContent(),
				oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oCardContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oCardContent._getVizProperties(oCardContent.getConfiguration()).interaction.noninteractiveMode, "Chart itself also shouldn't be interactive");

			//Act
			oCardContent.firePress();
			oCardHeader.firePress();
			await nextUIUpdate();

			//Assert
			assert.strictEqual(oActionSpy.callCount, 0, "Card Content and header are clicked and action event is fired twice");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("Navigation from chart parts only", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_Analytical_ChartActions);

			await nextCardReadyEvent(this.oCard);

			var oCardContent = this.oCard.getCardContent();

			// Assert
			assert.notOk(oCardContent.$().hasClass("sapFCardSectionClickable"), "Content area shouldn't have class 'sapFCardSectionClickable'");
			assert.notOk(oCardContent._getVizProperties(oCardContent.getConfiguration()).interaction.noninteractiveMode, "Chart itself should be interactive");
		});

		QUnit.test("Navigation path is correctly resolved", async function (assert) {
			// Arrange
			this.oCard.setManifest(oManifest_Analytical_ChartNavigation);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent(),
				oChart = oContent.getAggregation("_content");
			const oStubOpenUrl = sinon.stub(window, "open").callsFake(function () {});

			// Act
			oChart.fireSelectData({
				data: [
					{
						target: {
							__data__: {
								"measureNames": "Revenue",
								"_context_row_number": 1,
								"Weeks": "CW15",
								"Revenue": 494000.3
							}
						},
						data: {
							"measureNames": "Revenue",
							"_context_row_number": 1,
							"Weeks": "CW15",
							"Revenue": 494000.3
						}
					}
				]
			});
			await nextUIUpdate();

			// Assert
			assert.ok(oStubOpenUrl.calledOnce, "Window.open is called exactly once to initiate navigation");

			// Arrange
			const  aExecuteArgs = oStubOpenUrl.getCall(0).args,
				sResolvedUrl = aExecuteArgs[0],
				sExpectedUrl = "https://www.sap.com/revenue?week=CW15";

			// Assert
			assert.strictEqual(sResolvedUrl, sExpectedUrl, "Url is resolved with correct path");

			// Cleanup
			oStubOpenUrl.restore();
		});

		QUnit.module("Popover", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Chart parts are interactive when popover is attached", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_Analytical_Popover);

			await nextCardReadyEvent(this.oCard);

			var oCardContent = this.oCard.getCardContent();
			// Assert
			assert.notOk(oCardContent._getVizProperties(oCardContent.getConfiguration()).interaction.noninteractiveMode, "Chart itself should be interactive");
		});

		QUnit.test("Chart popover actions", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_Analytical_Popover);

			await nextCardReadyEvent(this.oCard);
			const oCardContent = this.oCard.getCardContent();

			await new Promise((resolve) => {
				oCardContent.getAggregation("_content").attachEventOnce("renderComplete", resolve);
			});

			// Arrange
			const oSetActionItemSpy = sinon.spy(oCardContent._oPopover, "setActionItems");
			const sActionText = "Action for A&A";
			const oStubOpenUrl = sinon.stub(window, "open").callsFake(function () {});

			oCardContent.getAggregation("_content").fireSelectData({
				data: [{
					target: {
						__data__: {
							"Store Name": "A&A",
							"Revenue": 1564235.29,
							"_context_row_number": 1
						}
					},
					data: {
						"Store Name": "A&A",
						"Revenue": 1564235.29,
						"_context_row_number": 1
					}
				}]
			});

			// Assert
			assert.ok(oSetActionItemSpy.calledOnce, "'setActions' on the popover is called" );
			assert.strictEqual(oCardContent._oPopover.getActionItems()[0].text, sActionText, "Action is properly set and resolved");

			oCardContent._oPopover.getActionItems()[0].press();

			assert.ok(oStubOpenUrl.calledOnce, "Window.open is called exactly once to initiate navigation");
			assert.ok(oStubOpenUrl.calledWith("https://www.sap.com/A&A"), "Url is resolved with correct path");

			oStubOpenUrl.restore();
		});

	}).catch(function () {
		QUnit.test("Analytical not supported", function (assert) {
			assert.ok(true, "Analytical content type is not available with this distribution.");
		});
	});

});