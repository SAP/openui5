/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/format/DateFormat",
	"sap/ui/integration/widgets/Card"
],
	function (
		Core,
		DateFormat,
		Card
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 7,
						"maxLegendItems": 3,
						"noItemsText": "You have nothing planned for that day",
						"appointment": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-11-29T09:00",
								"end": "2019-11-29T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-11-29T20:00",
								"end": "2019-11-29T21:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-09-01T08:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T08:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-09-01T08:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T08:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						],
						"specialDate": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"type": "Type13"
							},
							{
								"start": "2019-09-02T09:00",
								"end": "2019-09-02T10:00",
								"type": "Type20"
							}
						],
						"calendarLegendItem": [
							{
								"text": "Legend item from JSON",
								"type": "Type03"
							},
							{
								"text": "Legend item from JSON",
								"type": "Type04"
							}
						],
						"appointmentLegendItem": [
							{
								"text": "App. legend item from JSON",
								"type": "Type06"
							},
							{
								"text": "App. legend item from JSON",
								"type": "Type02"
							},
							{
								"text": "App. legend item from JSON",
								"type": "Type07"
							},
							{
								"text": "App. legend item from JSON",
								"type": "Type03"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"maxLegendItems": "{maxLegendItems}",
					"noItemsText": "{noItemsText}",
					"appointment": {
						"template": {
							"date": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/appointment"
					},
					"specialDate": {
						"template": {
							"date": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"calendarLegendItem": {
						"template": {
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/calendarLegendItem"
					},
					"appointmentLegendItem": {
						"template": {
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/appointmentLegendItem"
					}
				}
			}
		};

		var oManifest_Simple = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 7,
						"maxLegendItems": 3,
						"noItemsText": "You have nothing planned for that day",
						"item": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							}
						],
						"specialDate": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"type": "Type13"
							}
						],
						"legendItem": [
							{
								"category": "calendar",
								"text": "Legend item from JSON",
								"type": "Type03"
							},
							{
								"category": "appointment",
								"text": "App. legend item from JSON",
								"type": "Type06"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"maxLegendItems": "{maxLegendItems}",
					"noItemsText": "{noItemsText}",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/item"
					},
					"specialDate": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"legendItem": {
						"template": {
							"category": "{category}",
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/legendItem"
					}
				}
			}
		};

		var oManifest_3OutOf5Apps = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 3,
						"item": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/item"
					}
				}
			}
		};

		var oManifest_3OutOf3Apps = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 3,
						"item": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/item"
					}
				}
			}
		};

		var oManifest_2OutOf2Apps = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 3,
						"item": [
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-09-01T09:00",
								"end": "2019-09-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon":  {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/item"
					}
				}
			}
		};

		var oManifest_NoApps = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-09-01T09:00",
						"maxItems": 3
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}"
				}
			}
		};

		var oManifest_AppsOutOfTheCurrentDay = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.highlight.list.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a List with Highlight"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"date": "2019-12-16",
						"maxItems": 3,
						"item": [
							{
								"start": "2019-12-15T08:30",
								"end": "2019-12-16T08:30",
								"title": "from yesterday",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-12-16T08:30",
								"end": "2019-12-17T08:30",
								"title": "until tomorrow",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-12-15T08:30",
								"end": "2019-12-17T08:30",
								"title": "all day",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						]
					}
				},
				"header": {
					"title": "My Calendar",
					"subTitle": "For Today",
					"status": {
						"text":  {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"parameters>/allItems"
								]
							}
						}
					}
				},
				"content": {
					"date": "{date}",
					"maxItems": "{maxItems}",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}"
						},
						"path": "/item"
					}
				}
			}
		};

		QUnit.module("Initialization", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				}).placeAt(DOM_RENDER_LOCATION);

				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("Initialization - CalendarContent", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest);

			// Assert
			assert.notOk(this.oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(this.oCard.getAggregation("_content"), "Card content should be empty.");
			assert.ok(this.oCard.getDomRef(), "Card should be rendered.");
			assert.equal(this.oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
			assert.equal(this.oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.ok(this.oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
				assert.ok(this.oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");

				// Cleanup
				this.oCard.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("Using manifest", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_Simple);

			this.oCard.attachEvent("_ready", function () {
				var oManifestData = oManifest_Simple["sap.card"].data.json,
					oContent = this.oCard.getAggregation("_content"),
					oCalendar = oContent._oCalendar,
					oLegend = oContent._oLegend,
					aAppointments = oContent.getAppointments(),
					aSpecialDates = oCalendar.getSpecialDates(),
					aCalLegItems = oLegend.getItems(),
					aAppLegItems = oLegend.getAppointmentItems();

				Core.applyChanges();

				// Assert
				// Start date
				assert.equal(oCalendar.getSpecialDates()[0].getStartDate().getTime(), 1567328400000, "Should have start date.");

				// maxItems
				assert.equal(oContent.getVisibleAppointmentsCount(), oManifestData.maxItems, "Should have visibleAppointmentsCount.");

				// maxLegendItems
				assert.equal(oLegend.getVisibleLegendItemsCount(), oManifestData.maxLegendItems, "Should have visibleLegendItemsCount.");

				// noItemsText
				assert.equal(oContent.getNoAppointmentsText(), oManifestData.noItemsText, "Should have noAppointmentsText.");

				// Appointment
				assert.equal(aAppointments.length, 1, "Should have 1 appointment.");
				assert.equal(aAppointments[0].getStartDate().getTime(), 1567328400000, "Should have appointment startDate");
				assert.equal(aAppointments[0].getEndDate().getTime(), 1567332000000, "Should have appointment endDate");
				assert.equal(aAppointments[0].getTitle(), oManifestData.item[0].title, "Should have appointment title");
				assert.equal(aAppointments[0].getText(), oManifestData.item[0].text, "Should have appointment text");
				assert.equal(aAppointments[0].getType(), oManifestData.item[0].type, "Should have appointment type");
				assert.equal(aAppointments[0].getIcon(), oManifestData.item[0].icon, "Should have appointment icon");

				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 1, "Should have 1 visible appointment.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 1, "Should have total of 1 appointment.");

				// Special date
				assert.equal(aSpecialDates.length, 1, "Should have 1 special date.");
				assert.equal(aSpecialDates[0].getStartDate().getTime(), 1567328400000, "Should have special date startDate");
				assert.equal(aSpecialDates[0].getEndDate().getTime(), 1567332000000, "Should have special date endDate");
				assert.equal(aSpecialDates[0].getType(), oManifestData.specialDate[0].type, "Should have special date type");

				// Calendar legend item
				assert.equal(aCalLegItems.length, 1, "Should have 1 calendar legend item.");
				assert.equal(aCalLegItems[0].getText(), oManifestData.legendItem[0].text, "Should have calendar legend item text");
				assert.equal(aCalLegItems[0].getType(), oManifestData.legendItem[0].type, "Should have calendar legend item type");

				// Appointment legend item
				assert.equal(aAppLegItems.length, 1, "Should have 1 appointment legend item.");
				assert.equal(aAppLegItems[0].getText(), oManifestData.legendItem[1].text, "Should have appointment legend item text");
				assert.equal(aAppLegItems[0].getType(), oManifestData.legendItem[1].type, "Should have appointment legend item type");

				done();
			}.bind(this));
		});

		QUnit.module("Parameters", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				}).placeAt(DOM_RENDER_LOCATION);

				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("Only appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 2 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 2 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Only appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf3Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Only appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_2OutOf2Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 2 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 2 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf3Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_2OutOf2Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("No appointments", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_NoApps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 0, "Should have 0 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 0, "Should have total of 0 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments from yesterday, until tomorrow and all day", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_AppsOutOfTheCurrentDay);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("The correct number of appointments are rendered", function(assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5Apps);

			this.oCard.attachEvent("_ready", function() {
				Core.applyChanges();

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				done();
			}.bind(this));
		});

		// creates 3 apointments before, one at the current hour, and 3 more after
		function createAppointmentsForToday(oFormatter) {
			var oStart = new Date(),
				oEnd = new Date(),
				aResult = [];

			oStart.setHours(oStart.getHours() - 3, 0, 0, 0);
			oEnd.setHours(oEnd.getHours() - 2, 0, 0, 0);

			for (var i = 0; i < 7; i++) {
				aResult.push({
					"start": oFormatter.format(oStart),
					"end": oFormatter.format(oEnd),
					"title": "App" + i
				});

				oStart.setHours(oStart.getHours() + 1);
				oEnd.setHours(oEnd.getHours() + 1);
			}

			return aResult;
		}

		QUnit.test("The correct appointments are rendered for today", function(assert) {
			// Arrange
			var done = assert.async();
			var oManifest_3OutOf5Apps_New = JSON.parse(JSON.stringify(oManifest_3OutOf5Apps)),
				oFormatter = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-ddTHH:mm" });

			oManifest_3OutOf5Apps_New["sap.card"].data.json.item = createAppointmentsForToday(oFormatter);
			oManifest_3OutOf5Apps_New["sap.card"].data.json.date = oFormatter.format(new Date());

			this.oCard.setManifest(oManifest_3OutOf5Apps_New);

			this.oCard.attachEvent("_ready", function() {
				Core.applyChanges();

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments");
				assert.equal(aAppointmentsRefs.eq(0).find(".sapUiCalendarAppTitle").text(), "App3", "The first appointment is correct");
				assert.equal(aAppointmentsRefs.eq(2).find(".sapUiCalendarAppTitle").text(), "App5", "The last appointment is correct");

				done();
			}.bind(this));
		});
	}
);
