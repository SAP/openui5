/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/f/cards/ListContent",
	"sap/f/cards/AnalyticalContent",
	"sap/ui/core/Core",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/f/cards/Header"
],
function (
	Card,
	ListContent,
	AnalyticalContent,
	Core,
	NumericHeader,
	NumericSideIndicator,
	Header
) {
	"use strict";

	var iTimeout = 1000;
	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_Header = {
		"sap.card": {
			"type": "List",
			"header": {
				"title": "L3 Request list content Card",
				"subtitle": "Card subtitle",
				"icon": {
					"src": "sap-icon://accept"
				},
				"status": {
					"text": "100 of 200"
				}
			}
		}
	};

	var oManifest_ListCard = {
		"sap.card": {
			"type": "List",
			"header": {
				"title": "L3 Request list content Card",
				"subtitle": "Card subtitle",
				"icon": {
					"src": "sap-icon://accept"
				},
				"status": {
					"text": "100 of 200"
				}
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15",
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1000",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Information",
							"info": "27.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Basic 17",
							"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1001",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Success",
							"info": "27.45 EUR",
							"infoState": "Success"

						},
						{
							"Name": "Notebook Basic 18",
							"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1002",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Warning",
							"info": "9.45 EUR",
							"infoState": "Error"
						},
						{
							"Name": "Notebook Basic 19",
							"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1003",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Error",
							"info": "9.45 EUR",
							"infoState": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Id": "HT-1007",
							"SubCategoryId": "PDAs & Organizers",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Success",
							"info": "29.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Id": "HT-1010",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Success",
							"info": "29.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Professional 26",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Id": "HT-1022",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Success",
							"info": "29.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Professional 27",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Id": "HT-1024",
							"SubCategoryId": "Notebooks",
							"icon": "../images/Woman_avatar_01.png",
							"state": "Success",
							"info": "29.45 EUR",
							"infoState": "Success"
						}
					]
				},
				"item": {
					"icon": {
						"label": "{{icon_label}}",
						"value": "{icon}"
					},
					"title": {
						"label": "{{title_label}}",
						"value": "{Name}"
					},
					"description": {
						"label": "{{description_label}}",
						"value": "{Description}"
					},
					"highlight": "{state}",
					"info": {
						"value": "{info}",
						"state": "{infoState}"
					}
				}
			}
		}
	};

	var oManifest_AnalyticalCard = {
		"sap.card": {
			"type": "Analytical",
			"header": {
				"title": "L3 Request list content Card",
				"subtitle": "Card subtitle",
				"icon": {
					"src": "sap-icon://accept"
				},
				"status": {
					"text": "100 of 200"
				}
			},
			"content": {
				"chart": {
					"chartType": "stacked_bar",
					"legend": {
						"visible": true,
						"position": "bottom",
						"alignment": "center"
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
						"alignment": "bottom"
					},
					"measureAxis": "valueAxis",
					"dimensionAxis": "categoryAxis",
					"data": {
						"json": [
							{
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
					},
					"dimensions": [
						{
							"label": "Weeks",
							"value": "{Week}"
						}
					],
					"measures": [
						{
							"label": "Revenue",
							"value": "{Revenue}"
						}
					]
				}
			}
		}
	};

	var oManifest_AvatarHeader = {
		"sap.card": {
			"type": "List",
			"header": {
				"title": "L3 Request list content Card",
				"subtitle": "Card subtitle",
				"icon": {
					"text": "AJ",
					"shape": "Circle",
					"alt": "Some alternative text", // Will be ignored as its not present in the Avatar control atm.
					"backgroundColor": "#000000", // Will be ignored as its not present in the Avatar control atm.
					"color": "#FF0000" // Will be ignored as its not present in the Avatar control atm.
				},
				"status": {
					"text": "100 of 200"
				}
			}
		}
	};

	var oManifest_NumericHeader = {
		"sap.card": {
			"type": "List",
			"header": {
				"type": "numeric",
				"data": {
					"json": {
						"n": "56",
						"u": "%",
						"trend": "Up",
						"valueColor": "Good"
					}
				},
				"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
				"subtitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{n}",
					"unit": "{u}",
					"trend": "{trend}",
					"state": "{valueColor}"
				},
				"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
				"sideIndicators": [
					{
						"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
						"number": "3252.234",
						"unit": "K"
					},
					{
						"title": "Long Deviation Long Deviation",
						"number": "22.43",
						"unit": "%"
					}
				]
			}
		}
	};

	var oManifest_NumericHeader2 = {
		"sap.card": {
			"type": "List",
			"header": {
				"type": "numeric",
				"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
				"subtitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "56",
					"unit": "%",
					"trend": "Up",
					"state": "Good"
				},
				"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
				"sideIndicators": [
					{
						"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
						"number": "3252.234",
						"unit": "K"
					},
					{
						"title": "Long Deviation Long Deviation",
						"number": "22.43",
						"unit": "%"
					}
				]
			}
		}
	};

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		var done = assert.async();

		var oCard = new Card("somecard", {
			manifest: oManifest_ListCard,
			width: "400px",
			height: "600px"
		});
		var oAnalyticalCard = new Card("analyticalCard", {
			manifest: oManifest_AnalyticalCard,
			width: "400px",
			height: "600px"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		oAnalyticalCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
		assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
		assert.notOk(oAnalyticalCard.getAggregation("_content"), "Analytical Card content should be empty.");
		assert.ok(oCard.getDomRef(), "Card should be rendered.");
		assert.ok(oAnalyticalCard.getDomRef(), "Analytical Card should be rendered.");
		assert.equal(oCard.getDomRef().clientWidth, 400, "Card should have width set to 400px.");
		assert.equal(oCard.getDomRef().clientHeight, 600, "Card should have height set to 600px.");
		assert.equal(oAnalyticalCard.getDomRef().clientWidth, 400, "Analytical Card should have width set to 400px.");
		assert.equal(oAnalyticalCard.getDomRef().clientHeight, 600, "Analytical Card should have height set to 600px.");

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			// Assert
			assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
			assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");
			assert.ok(oAnalyticalCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");

			// Cleanup
			oCard.destroy();

			done();
		}, iTimeout);
	});

	QUnit.module("Card headers", {
		beforeEach: function () {
			this.oCard = new Card("somecard", {
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

	QUnit.test("Card - Default Header initialization", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_Header);
		Core.applyChanges();

		// Assert
		assert.notOk(this.oCard.getAggregation("_header"), "Card header should be empty.");
		assert.notOk(this.oCard.getAggregation("_content"), "Card content should be empty.");

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			// Assert
			var oHeader = this.oCard.getAggregation("_header");
			assert.ok(oHeader, "Card should have header.");
			assert.ok(oHeader.getDomRef(), "Card header should be created and rendered.");
			assert.ok(oHeader.getAggregation("_title") && oHeader.getAggregation("_title").getDomRef(), "Card header title should be created and rendered.");
			assert.ok(oHeader.getAggregation("_subtitle") && oHeader.getAggregation("_subtitle").getDomRef(), "Card header subtitle should be created and rendered.");
			assert.ok(oHeader.getAggregation("_avatar") && oHeader.getAggregation("_avatar").getDomRef(), "Card header avatar should be created and rendered.");

			assert.equal(oHeader.getAggregation("_title").getText(), oManifest_Header["sap.card"].header.title, "Card header title should be correct.");
			assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_Header["sap.card"].header.subtitle, "Card header subtitle should be correct.");
			assert.equal(oHeader.getAggregation("_avatar").getSrc(), oManifest_Header["sap.card"].header.icon.src, "Card header icon src should be correct.");
			assert.equal(oHeader.getStatusText(), oManifest_Header["sap.card"].header.status.text, "Card header status should be correct.");

			done();
		}.bind(this), iTimeout);
	});

	QUnit.test("Card - Default Header Avatar", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_AvatarHeader);
		Core.applyChanges();

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			// Assert
			var oHeader = this.oCard.getAggregation("_header");
			assert.notOk(oHeader.getAggregation("_avatar").getSrc(), "Card header icon src should be empty.");
			assert.equal(oHeader.getAggregation("_avatar").getDisplayShape(), "Circle", "Card header icon shape should be 'Circle'.");
			assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be 'AJ'.");

			done();
		}.bind(this), iTimeout);
	});

	QUnit.test("Card - Numeric Header generic", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_NumericHeader);
		Core.applyChanges();

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			// Assert
			var oHeader = this.oCard.getAggregation("_header");
			assert.ok(oHeader.getDomRef(), "Card Numeric header should be rendered.");

			// Assert properties
			assert.equal(oHeader.getAggregation("_title").getText(), oManifest_NumericHeader["sap.card"].header.title, "Card header title should be correct.");
			assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_NumericHeader["sap.card"].header.subtitle, "Card header subtitle should be correct.");
			assert.equal(oHeader.getAggregation("_unitOfMeasurement").getText(), oManifest_NumericHeader["sap.card"].header.unitOfMeasurement, "Card header unitOfMeasurement should be correct.");
			assert.equal(oHeader.getAggregation("_details").getText(), oManifest_NumericHeader["sap.card"].header.details, "Card header details should be correct.");

			done();
		}.bind(this), iTimeout);
	});

	QUnit.test("Card - Numeric Header main indicator with json data", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_NumericHeader);
		Core.applyChanges();

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			var oHeader = this.oCard.getAggregation("_header");

			// Assert aggregation _mainIndicator
			assert.ok(oHeader.getAggregation("_mainIndicator").getDomRef(), "Card header main indicator aggregation should be set and rendered");
			assert.equal(oHeader.getAggregation("_mainIndicator").getValue(), oManifest_NumericHeader["sap.card"].header.data.json["n"], "Card header main indicator value should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getScale(), oManifest_NumericHeader["sap.card"].header.data.json["u"], "Card header main indicator scale should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getIndicator(), oManifest_NumericHeader["sap.card"].header.data.json["trend"], "Card header main indicator indicator should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getValueColor(), oManifest_NumericHeader["sap.card"].header.data.json["valueColor"], "Card header main indicator valueColor should be correct.");

			done();
		}.bind(this), iTimeout);
	});

	QUnit.test("Card - Numeric Header main indicator without 'data'", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_NumericHeader2);
		Core.applyChanges();

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			var oHeader = this.oCard.getAggregation("_header");

			// Assert aggregation _mainIndicator
			assert.ok(oHeader.getAggregation("_mainIndicator").getDomRef(), "Card header main indicator aggregation should be set and rendered");
			assert.equal(oHeader.getAggregation("_mainIndicator").getValue(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.number, "Card header main indicator value should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getScale(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.unit, "Card header main indicator scale should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getIndicator(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.trend, "Card header main indicator indicator should be correct.");
			assert.equal(oHeader.getAggregation("_mainIndicator").getValueColor(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.state, "Card header main indicator valueColor should be correct.");

			done();
		}.bind(this), iTimeout);
	});

	QUnit.test("Card - Numeric Header side indicators", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest(oManifest_NumericHeader);
		Core.applyChanges();

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			var oHeader = this.oCard.getAggregation("_header");

			// Assert aggregation sideIndicators
			assert.ok(oHeader.getAggregation("sideIndicators"), "Card header side indicators should be set.");
			assert.equal(oHeader.getAggregation("sideIndicators").length, oManifest_NumericHeader["sap.card"].header.sideIndicators.length, "Card header should have two side indicators.");

			oHeader.getAggregation("sideIndicators").forEach(function (oIndicator, iIndex) {
				var oSideIndicator = oManifest_NumericHeader["sap.card"].header.sideIndicators[iIndex];
				assert.ok(oIndicator.getDomRef(), "Card header sideIndicators one should be rendered.");
				assert.equal(oIndicator.getTitle(), oSideIndicator.title, "Card header side indicator " + iIndex + " title should be correct.");
				assert.equal(oIndicator.getNumber(), oSideIndicator.number, "Card header side indicator " + iIndex + " number should be correct.");
				assert.equal(oIndicator.getUnit(), oSideIndicator.unit, "Card header side indicator " + iIndex + " unit should be correct.");
			});

			done();
		}.bind(this), iTimeout);
	});

	QUnit.module("Analytical Card", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: oManifest_AnalyticalCard,
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

	QUnit.test("Analytical Card - using manifest", function (assert) {

		// Arrange
		var done = assert.async(),
			window = {
			"start": "firstDataPoint",
			"end": "lastDataPoint"
		};

		// setTimeout until there are proper events to attach to.
		setTimeout(function () {

			var oContent = this.oCard.getAggregation("_content"),
				oChart = oContent.getAggregation("_content"),
				oVizProperites = oChart.getVizProperties();

			// Assert aggregation sideIndicators
			assert.ok(oContent, "Analytical Card content form manifest should be set");
			assert.ok(oChart.getDomRef(), "Analytical Card content - chart should be rendered");
			assert.equal(oChart.getVizType(), "stacked_bar", "Chart should have a vizType set");
			assert.equal(oVizProperites.legend.visible, true, "Chart should have a legend visible property set to true");
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
			assert.equal(oVizProperites.title.alignment, "bottom", "Chart should have a title.alignment set to true");
			assert.equal(oChart.getFeeds()[0].getProperty("uid"), "valueAxis", "Chart should have a feed item whit property 'uid'");
			assert.equal(oChart.getFeeds()[0].getProperty("type"), "Measure", "Chart should have a feed item whit property 'Measure'");
			assert.equal(oChart.getFeeds()[1].getProperty("uid"), "categoryAxis", "Chart should have a feed item whit property 'uid'");
			assert.equal(oChart.getFeeds()[1].getProperty("type"), "Dimension", "Chart should have a feed item whit property 'Measure'");

			done();
		}.bind(this), iTimeout);
	});

});