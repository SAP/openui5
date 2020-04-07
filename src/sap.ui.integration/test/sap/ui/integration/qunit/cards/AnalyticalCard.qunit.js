/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/integration/util/CardActions",
	"../services/SampleServices"
	],
	function (
		Card,
		Core,
		ContentFactory,
		CardActions,
		SampleServices
	) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_AnalyticalCard = {
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "L3 Request list content Card",
				"subTitle": "Card subtitle",
				"icon": {
					"src": "sap-icon://accept"
				},
				"status": {
					"text": "100 of 200"
				}
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
								"Revenue": 431000.22,
								"Cost": 230000.00,
								"Cost1": 24800.63,
								"Cost2": 205199.37,
								"Cost3": 199999.37,
								"Target": 500000.00,
								"Budget": 210000.00
							},
							{
								"Week": "CW15",
								"Revenue": 494000.30,
								"Cost": 238000.00,
								"Cost1": 99200.39,
								"Cost2": 138799.61,
								"Cost3": 200199.37,
								"Target": 500000.00,
								"Budget": 224000.00
							},
							{
								"Week": "CW16",
								"Revenue": 491000.17,
								"Cost": 221000.00,
								"Cost1": 70200.54,
								"Cost2": 150799.46,
								"Cost3": 80799.46,
								"Target": 500000.00,
								"Budget": 238000.00
							},
							{
								"Week": "CW17",
								"Revenue": 536000.34,
								"Cost": 280000.00,
								"Cost1": 158800.73,
								"Cost2": 121199.27,
								"Cost3": 108800.46,
								"Target": 500000.00,
								"Budget": 252000.00
							},
							{
								"Week": "CW18",
								"Revenue": 675000.00,
								"Cost": 230000.00,
								"Cost1": 140000.91,
								"Cost2": 89999.09,
								"Cost3": 100099.09,
								"Target": 600000.00,
								"Budget": 266000.00
							},
							{
								"Week": "CW19",
								"Revenue": 680000.00,
								"Cost": 250000.00,
								"Cost1": 172800.15,
								"Cost2": 77199.85,
								"Cost3": 57199.85,
								"Target": 600000.00,
								"Budget": 280000.00
							},
							{
								"Week": "CW20",
								"Revenue": 659000.14,
								"Cost": 325000.00,
								"Cost1": 237200.74,
								"Cost2": 87799.26,
								"Cost3": 187799.26,
								"Target": 600000.00,
								"Budget": 294000.00
							}
						]
					}
				},
				"dimensions": [{
					"label": "Weeks",
					"value": "{Week}"
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

	var oManifest_Analytical_No_Actions = {
		"_version": "1.8.0",
		"sap.app": {
			"type": "card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"title": "Content with Navigation Service",
				"data": {
					"json": {
						"n": 6547394.45496,
						"u": "М $",
						"trend": "Down",
						"valueColor": "Critical"
					}
				},
				"subTitle": "Success Rate",
				"mainIndicator": {
					"number": "{n}",
					"unit": "{u}",
					"trend": "{trend}",
					"state": "{valueColor}"
				},
				"sideIndicators": [{
					"title": "Decrease",
					"number": "24",
					"unit": "weeks"
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
						"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
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
				}]
			}
		}
	};

	var oManifest_Analytical_Service = {
		"_version": "1.8.0",
		"sap.app": {
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
				"title": "Content with Navigation Service",
				"data": {
					"json": {
						"n": 6547394.45496,
						"u": "М $",
						"trend": "Down",
						"valueColor": "Critical"
					}
				},
				"subTitle": "Success Rate",
				"mainIndicator": {
					"number": "{n}",
					"unit": "{u}",
					"trend": "{trend}",
					"state": "{valueColor}"
				},
				"sideIndicators": [{
					"title": "Decrease",
					"number": "24",
					"unit": "weeks"
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
						"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
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
			"type": "card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"title": "Content with Navigation Service",
				"data": {
					"json": {
						"n": 6547394.45496,
						"u": "М $",
						"trend": "Down",
						"valueColor": "Critical"
					}
				},
				"subTitle": "Success Rate",
				"mainIndicator": {
					"number": "{n}",
					"unit": "{u}",
					"trend": "{trend}",
					"state": "{valueColor}"
				},
				"sideIndicators": [{
					"title": "Decrease",
					"number": "24",
					"unit": "weeks"
				}],
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
						"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
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

	function testContentInitialization(oManifest, assert) {

		// Arrange
		var done = assert.async();
		var oCard = new Card("somecard", {
			manifest: oManifest,
			width: "400px",
			height: "600px"
		});
		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		// Assert
		assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
		assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
		assert.ok(oCard.getDomRef(), "Card should be rendered.");
		assert.equal(oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
		assert.equal(oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");
		oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			// Assert
			assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
			assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");
			// Cleanup
			oCard.destroy();
			done();
		});
	}

	function testActionOnContentService(oManifest, assert) {
		// Arrange
		var done = assert.async(),
			oActionSpy = sinon.spy(CardActions, "fireAction"),
			oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {}),
			oCard = new Card({
				width: "400px",
				height: "600px",
				manifest: oManifest
			});
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oCardLContent = oCard.getCardContent();
			oCard.attachAction(function (oEvent) {
				oEvent.preventDefault();
				// Assert
				assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 1, "Card Content is clicked and action event is fired");
				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();
				oCard.destroy();
				done();
			});
			//Act
			oCardLContent.firePress();
			Core.applyChanges();
		});
	}

	function testActionOnContentUrl(oManifest, assert) {
		// Arrange
		var done = assert.async(),
			oActionSpy = sinon.spy(CardActions, "fireAction"),
			oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {}),
			oCard = new Card({
				width: "400px",
				height: "600px",
				manifest: oManifest
			});
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oCardLContent = oCard.getCardContent(),
				oCardHeader = oCard.getCardHeader();
			// Assert
			assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
			assert.ok(oCardHeader.$().hasClass("sapFCardClickable"), "Card Header is clickable");
			//Act
			oCardLContent.firePress();
			oCardHeader.firePress();
			Core.applyChanges();
			//Assert
			assert.strictEqual(oActionSpy.callCount, 2, "Card Content and header are clicked and action event is fired twice");
			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
			oCard.destroy();
			done();
		});
	}

	var oContentFactory = new ContentFactory();
	return oContentFactory.create({
		cardType: "Analytical"
	}).then(function () {

		QUnit.module("Init");
		QUnit.test("Initialization - AnalyticalContent", function (assert) {
			testContentInitialization(oManifest_AnalyticalCard, assert);
		});
		QUnit.module("Analytical Card", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});
		QUnit.test("Using manifest", function (assert) {
			// Arrange
			var done = assert.async(),
				window = {
					"start": "firstDataPoint",
					"end": "lastDataPoint"
				};
			this.oCard.attachEvent("_ready", function () {
				var oContent = this.oCard.getAggregation("_content"),
					oChart = oContent.getAggregation("_content");
				var oVizProperites = oChart.getVizProperties();
				Core.applyChanges();
				// Assert aggregation sideIndicators
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
				done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_AnalyticalCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
		QUnit.module("Navigation Action - Analytical Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});
		QUnit.test("Analytical content should be actionable - service ", function (assert) {
			testActionOnContentService(oManifest_Analytical_Service, assert);
		});
		QUnit.test("Analytical Card should be actionable - url", function (assert) {
			testActionOnContentUrl(oManifest_Analytical_Url, assert);
		});
		QUnit.test("Analytical Card should be not actionable", function (assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {});
			this.oCard.setManifest(oManifest_Analytical_No_Actions);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = this.oCard.getCardContent(),
					oCardHeader = this.oCard.getCardHeader();
				// Assert
				assert.notOk(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.notOk(oCardHeader.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				//Act
				oCardLContent.firePress();
				oCardHeader.firePress();
				Core.applyChanges();
				//Assert
				assert.strictEqual(oActionSpy.callCount, 0, "Card Content and header are clicked and action event is fired twice");
				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();
				done();
			}.bind(this));
		});

		}).catch(function (sError) {
			QUnit.test("Analytical not supported", function (assert) {
				assert.strictEqual(sError, "Analytical content type is not available with this distribution.");
			});
		});
	}
);