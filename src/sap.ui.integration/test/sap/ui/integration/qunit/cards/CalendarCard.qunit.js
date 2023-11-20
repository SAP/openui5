/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/format/DateFormat",
	"sap/ui/integration/widgets/Card",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/integration/cards/CalendarContent",
	"sap/ui/core/date/UI5Date"
],
	function (
		Core,
		DateFormat,
		Card,
		CalendarDate,
		CalendarContent,
		UI5Date
	) {
		"use strict";

		var oFormatter = DateFormat.getDateTimeInstance({ pattern: "YYYY-MM-ddTHH:mm" });

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

		var oManifest_DateSelect = {
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
						"date": "2019-09-13T09:00",
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
							},
							{
								"start": "2019-12-01T23:00",
								"end": "2019-12-01T23:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": oFormatter.format(UI5Date.getInstance(2021, 10, 19), true),
								"end": oFormatter.format(UI5Date.getInstance(2021, 10, 22), true),
								"title": "3 whole days",
								"text": "sleeping",
								"icon": "sap-icon://bed",
								"type": "Type02"
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

		var oManifest_MonthChange = {
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
						"date": "2019-08-01T09:00",
						"maxItems": 3,
						"maxLegendItems": 3,
						"item": [
							{
								"start": "2019-08-01T09:00",
								"end": "2019-08-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-08-01T09:00",
								"end": "2019-08-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": "2019-08-01T09:00",
								"end": "2019-08-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-08-01T09:00",
								"end": "2019-08-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": "2019-08-01T09:00",
								"end": "2019-08-01T10:00",
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						],
						"specialDate": [
							{
								"start": "2019-08-13",
								"end": "2019-08-14",
								"type": "Type08"
							},
							{
								"start": "2019-08-24",
								"end": "2019-08-24",
								"type": "Type13"
							}
						],
						"legendItem": [
							{
								"category": "calendar",
								"text": "Team building",
								"type": "Type08"
							},
							{
								"category": "calendar",
								"text": "Public holiday",
								"type": "Type13"
							},
							{
								"category": "appointment",
								"text": "Reminder",
								"type": "Type06"
							},
							{
								"category": "appointment",
								"text": "Private appointment",
								"type": "Type07"
							},
							{
								"category": "appointment",
								"text": "Out of office",
								"type": "Type03"
							},
							{
								"category": "appointment",
								"text": "Collaboration with other team members",
								"type": "Type07"
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

		var oManifest_Appointments_Press = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "card.explorer.simple.calendar.card",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a Calendar with Highlight",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"shortTitle": "A short title for this Card",
				"info": "Additional information about this Card",
				"description": "A long description for this Card",
				"tags": {
					"keywords": [
						"Calendar",
						"Highlight",
						"Card",
						"Sample"
					]
				}
			},
			"sap.card": {
				"type": "Calendar",
				"designtime": "dt/Configuration",
				"data": {
					"json": {
						"item": [
							{
								"start": "2020-09-18T09:00",
								"end": "2020-09-18T10:00",
								"title": "Payment reminder",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06",
								"url": "http://sap.com"
							},
							{
								"start": "2020-09-16T08:30",
								"end": "2020-09-18T17:30",
								"title": "Workshop",
								"text": "Out of office",
								"icon": "sap-icon://sap-ui5",
								"type": "Type07"
							}
						]
					}
				},
				"header": {
					"title": "My calendar",
					"subTitle": "Team Balkan",
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
					"date": "2020-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}",
							"actions": [
								{
									"type": "Navigation",
									"enabled": "{= ${url}}",
									"parameters": {
										"url": "{url}"
									}
								}
							]
						},
						"path": "/item"
					},
					"moreItems": {
						"actions": [
							{
								"type": "Navigation",
								"enabled": true,
								"url": "http://sap.com"
							}
						]
					}
				}
			}
		};

		var oManifest_Change_Date = {
			"_version": "1.14.0",
			"sap.app": {
				"id": "cardsdemo.mobileSdk.calendarCardWithExtension",
				"type": "card",
				"title": "Sample of a List with Highlight",
				"subTitle": "Sample of a Calendar with Highlight",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"shortTitle": "A short title for this Card",
				"info": "Additional information about this Card",
				"description": "A long description for this Card",
				"tags": {
					"keywords": [
						"Calendar",
						"Highlight",
						"Card",
						"Sample",
						"Extension"
					]
				}
			},
			"sap.card": {
				"type": "Calendar",
				"data": {
					"json": {
						"item": [
							{
							  "start": "2019-09-18T09:00",
							  "end": "2019-09-18T10:00",
							  "title": "Payment reminder",
							  "icon": "sap-icon://desktop-mobile",
							  "type": "Type06",
							  "url": "http://sap.com"
							},
							{
							  "start": "2019-09-18T17:00",
							  "end": "2019-09-18T17:30",
							  "title": "Private appointment",
							  "icon": "sap-icon://desktop-mobile",
							  "type": "Type07"
							},
							{
							  "start": "2019-09-18T12:00",
							  "end": "2019-09-18T13:00",
							  "title": "Lunch",
							  "text": "working",
							  "icon": "sap-icon://desktop-mobile",
							  "type": "Type03",
							  "url": "http://sap.com"
							},
							{
							  "start": "2019-09-16T08:30",
							  "end": "2019-09-18T17:30",
							  "title": "Workshop",
							  "text": "Out of office",
							  "icon": "sap-icon://sap-ui5",
							  "type": "Type07"
							},
							{
							  "start": "2019-09-18T14:00",
							  "end": "2019-09-18T16:30",
							  "title": "Discussion with clients",
							  "text": "working",
							  "icon": "sap-icon://desktop-mobile",
							  "url": "http://sap.com"
							},
							{
							  "start": "2019-09-18T01:00",
							  "end": "2019-09-18T02:00",
							  "title": "Team meeting",
							  "text": "online meeting",
							  "icon": "sap-icon://sap-ui5",
							  "type": "Type04"
							},
							{
							  "start": "2019-04-14T04:00",
							  "end": "2019-04-15T06:30",
							  "title": "Discussion with clients",
							  "text": "working",
							  "icon": "sap-icon://desktop-mobile",
							  "url": "http://sap.com"
							},
							{
							  "start": "2019-09-18T01:00",
							  "end": "2019-09-18T02:00",
							  "title": "Team meeting",
							  "text": "online meeting",
							  "icon": "sap-icon://sap-ui5",
							  "type": "Type04"
							},
							{
								"start": "2019-09-12T01:00",
								"end": "2019-09-13T02:00",
								"title": "Team call",
								"text": "online call",
								"icon": "sap-icon://sap-ui5",
								"type": "Type04"
							  }
						  ],
						  "specialDate": [
							{
								"start": "2019-08-11",
								"end": "2019-08-12",
								"type": "Type08"
							},
							{
								"start": "2019-08-18",
								"end": "2019-08-18",
								"type": "Type13"
							},
							{
							  "start": "2019-09-13",
							  "end": "2019-09-14",
							  "type": "Type08"
							},
							{
							  "start": "2019-09-24",
							  "end": "2019-09-24",
							  "type": "Type13"
							},
							{
								"start": "2019-06-11",
								"end": "2019-06-11",
								"type": "Type08"
							}
						  ],
						  "legendItem": [
							{
							  "category": "calendar",
							  "text": "Team building",
							  "type": "Type08"
							},
							{
							  "category": "calendar",
							  "text": "Public holiday",
							  "type": "Type13"
							},
							{
							  "category": "appointment",
							  "text": "Reminder",
							  "type": "Type06"
							},
							{
							  "category": "appointment",
							  "text": "Private appointment",
							  "type": "Type07"
							},
							{
							  "category": "appointment",
							  "text": "Out of office",
							  "type": "Type03"
							},
							{
							  "category": "appointment",
							  "text": "Collaboration with other team members",
							  "type": "Type07"
							}
						]
					}
				},
				"header": {
					"title": "Calendar overview",
					"subTitle": "See activities",
					"icon": {
						"src": "sap-icon://calendar"
					}
				},
				"content": {
					"date": "2019-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day.",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}",
								"visible": true
							},
							"actions": [
								{
								  "type": "Navigation",
								  "enabled": "{= ${url}}",
								  "parameters": {
									"url": "{url}"
									}
								}
							]
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
					  },
					  "moreItems": {
						"actions": [
						  {
							"type": "Navigation",
							"enabled": true,
							"parameters": {
								"url": "http://sap.com"
							}
						  }
						]
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

		QUnit.test("Initialization - CalendarContent with no selected date", function (assert) {
			var oCalendarContent = new CalendarContent();

			oCalendarContent.onDataChanged();
			assert.ok(true, "There is no error when CalendarContent is created without a selected value");
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
			},
			selectDate: function(oDate) {
				var oCalendar = this.oCard.getAggregation("_content").getAggregation("_content").getAggregation("items")[0];

				oCalendar.getSelectedDates()[0].setStartDate(oDate);
				oCalendar.fireSelect({
					getSource: function () {
						return this.oCard;
					}.bind(this),
					startDate: oDate
				});
				Core.applyChanges();
			}
		});

		QUnit.test("3 out of 5 appointments shown", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 5 appointments.");

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("3 out of 3 appointments shown", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf3Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments.");

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("2 out of 2 appointments shown", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_2OutOf2Apps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments.");

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 2, "Should have 2 rendered appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("No appointments shown", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_NoApps);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 0, "Should have 0 visible appointments.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 0, "Should have total of 0 appointments.");

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 0, "Should have 0 rendered appointments.");

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

				var aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.equal(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("all day appointments display", function (assert) {
			// arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_DateSelect);

			this.oCard.attachEvent("_ready", function () {
				// act
				this.selectDate(UI5Date.getInstance(2021, 10, 19));

				// assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 1, "there is 1 visible appointment");

				// act
				this.selectDate(UI5Date.getInstance(2021, 10, 20));

				// assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 1, "there is 1 visible appointment");

				// act
				this.selectDate(UI5Date.getInstance(2021, 10, 21));

				// assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 1, "there is 1 visible appointment");

				done();
			}.bind(this));
		});

		QUnit.test("start of the day appointment is shown only in the 2nd day", function (assert) {
			// arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_DateSelect);

			this.oCard.attachEvent("_ready", function () {
				// act
				this.selectDate(UI5Date.getInstance(2019, 11, 2));
				var aVisibleItems20191202 = this.oCard.getAggregation("_content")._calculateVisibleAppointments(this.oCard.getAggregation("_content").getAggregation("appointments"), UI5Date.getInstance(2019, 11, 2));

				// assert
				assert.strictEqual(aVisibleItems20191202.length, 1, "there is 1 visible appointment");

				// act
				this.selectDate(UI5Date.getInstance(2019, 11, 1));
				var aVisibleItems20191201 = this.oCard.getAggregation("_content")._calculateVisibleAppointments(this.oCard.getAggregation("_content").getAggregation("appointments"), UI5Date.getInstance(2019, 11, 1));

				// assert
				assert.strictEqual(aVisibleItems20191201.length, 0, "there is 0 visible appointment");

				done();
			}.bind(this));
		});

		QUnit.module("Events", {
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

		QUnit.test("DateSelect", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_DateSelect);

			this.oCard.attachEvent("_ready", function () {
				var oCalendar = this.oCard.getAggregation("_content").getAggregation("_content").getAggregation("items")[0],
					bDateSelectFired,
					aAppointmentsRefs;

				Core.applyChanges();
				this.oCard.attachAction(function (oEvent) {
					if (oEvent.getParameter("type") === "DateChange") {
						bDateSelectFired = true;
					}
				});

				// Act
				oCalendar.getSelectedDates()[0].setStartDate(UI5Date.getInstance("2019-09-01"));
				oCalendar.fireSelect({
					getSource: function () {
						return this.oCard;
					}.bind(this),
					startDate: UI5Date.getInstance("2019-09-01")
				});
				Core.applyChanges();

				// Assert
				assert.strictEqual(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.strictEqual(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 5 appointments.");
				assert.ok(bDateSelectFired, "DateSelect is fired");

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.strictEqual(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				done();
			}.bind(this));
		});

		QUnit.test("MonthChange", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_MonthChange);

			this.oCard.attachEvent("_ready", function () {
				var oCalendar = this.oCard.getAggregation("_content").getAggregation("_content").getAggregation("items")[0],
					bMonthChangeFired,
					aAppointmentsRefs,
					aSpecialDatesRefs,
					aLegendItemsRefs;

				Core.applyChanges();
				this.oCard.attachAction(function (oEvent) {
					if (oEvent.getParameter("type") === "MonthChange") {
						bMonthChangeFired = true;
						assert.equal(oEvent.getParameter("parameters").firstDate.getTime(), UI5Date.getInstance(2019, 6, 28).getTime(), "parameter firstDate is correct");
					}
				});

				// Act
				oCalendar._setFocusedDate(CalendarDate.fromLocalJSDate(UI5Date.getInstance(2019, 7, 1)));
				oCalendar.displayDate(UI5Date.getInstance(2019, 7, 1));
				Core.applyChanges();
				oCalendar.fireStartDateChange({
					getSource: function () {
						return this.oCard;
					}.bind(this)
				});
				Core.applyChanges();

				// Assert
				assert.strictEqual(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments.");
				assert.strictEqual(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 5 appointments.");
				assert.ok(bMonthChangeFired, "DateSelect is fired");

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");

				// Assert
				assert.strictEqual(aAppointmentsRefs.length, 3, "Should have 3 rendered appointments.");

				aSpecialDatesRefs = this.oCard.$().find(".sapUiCalSpecialDate");

				// Assert
				assert.strictEqual(aSpecialDatesRefs.length, 3, "Should have 3 rendered special dates.");

				aLegendItemsRefs = this.oCard.$().find(".sapUiUnifiedLegendItem");

				// Assert
				assert.strictEqual(aLegendItemsRefs.length, 4, "Should have 3 rendered legend items and one 'More' indicator.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointment press", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_Appointments_Press);

			this.oCard.attachEvent("_ready", function () {
				var aAppointments = this.oCard.getAggregation("_content").getAppointments(),
					oFirstAppointment = aAppointments[0],
					oSecondAppointment = aAppointments[1];

				// Assert
				assert.notOk(oFirstAppointment.$().hasClass("sapUiCalendarAppDisabled"), "The first appointment is in active state.");
				assert.deepEqual(oFirstAppointment.$().attr("tabindex"), "0", "The first appointment is in the tab chain.");
				assert.ok(oSecondAppointment.$().hasClass("sapUiCalendarAppDisabled"), "Second appointment is in disabled state.");

				done();
			}.bind(this));
		});


		QUnit.test("ChangeMonth Method", function(assert) {
			// Arrange
			var done = assert.async();

			this.oCard.setManifest(oManifest_Change_Date);

			this.oCard.attachEvent("_ready", function () {
				var oCardContent = this.oCard.getCardContent(),
					iIndexOfJune = 5,
					aAppointmentsRefs,
					aSpecialDatesRefs,
					aLegendItemsRefs;

				Core.applyChanges();

				// Act
				oCardContent.changeMonth(iIndexOfJune);
				assert.strictEqual(oCardContent._oCalendar._getFocusedDate().getMonth(), iIndexOfJune, "The focused date is now in June.");
				Core.applyChanges();

				assert.strictEqual(this.oCard.getModel("parameters").getData().visibleItems, 5, "Should have 5 visible appointments.");
				assert.strictEqual(this.oCard.getModel("parameters").getData().allItems, 7, "Should have total of 7 appointments.");

				aSpecialDatesRefs = this.oCard.$().find(".sapUiCalSpecialDate");
				// Assert
				assert.strictEqual(aSpecialDatesRefs.length, 1, "Should have 1 rendered special dates.");

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");
				// Assert
				assert.strictEqual(aAppointmentsRefs.length, 5, "Should have 5 rendered appointments.");

				aLegendItemsRefs = this.oCard.$().find(".sapUiUnifiedLegendItem");
				// Assert
				assert.strictEqual(aLegendItemsRefs.length, 6, "Should have 5 rendered legend items and one 'More' indicator.");

				done();
			}.bind(this));

		});

		QUnit.test("ChangeDate Method", function(assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_Change_Date);

			this.oCard.attachEvent("_ready", function () {
				var oCardContent = this.oCard.getCardContent(),
					aAppointmentsRefs,
					aSpecialDatesRefs,
					aLegendItemsRefs;

				// Assert
				assert.strictEqual(oCardContent._oCalendar._getFocusedDate().getMonth(), 8, "The focused date is in September.");

				// Act
				oCardContent.changeDate(new Date(2019, 3, 14));
				Core.applyChanges();

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");
				// Assert
				assert.strictEqual(aAppointmentsRefs.length, 1, "Should have 1 rendered appointment.");

				aSpecialDatesRefs = this.oCard.$().find(".sapUiCalSpecialDate");
				// Assert
				assert.strictEqual(aSpecialDatesRefs.length, 0, "Should have 0 rendered special dates.");

				aLegendItemsRefs = this.oCard.$().find(".sapUiUnifiedLegendItem");
				// Assert
				assert.strictEqual(aLegendItemsRefs.length, 6, "Should have 5 rendered legend items and one 'More' indicator.");

				// Act
				oCardContent.changeDate(new Date(2019, 8, 18));
				Core.applyChanges();

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");
				assert.strictEqual(this.oCard.getModel("parameters").getData().visibleItems, 5, "Should have 5 visible appointments.");
				assert.strictEqual(this.oCard.getModel("parameters").getData().allItems, 7, "Should have total of 7 appointments.");

				aAppointmentsRefs = this.oCard.$().find(".sapUiCalendarAppContainer");
				// Assert
				assert.strictEqual(aAppointmentsRefs.length, 5, "Should have 5 rendered appointments.");

				aSpecialDatesRefs = this.oCard.$().find(".sapUiCalSpecialDate");
				// Assert
				assert.strictEqual(aSpecialDatesRefs.length, 3, "Should have 3 rendered special dates.");

				aLegendItemsRefs = this.oCard.$().find(".sapUiUnifiedLegendItem");
				// Assert
				assert.strictEqual(aLegendItemsRefs.length, 6, "Should have 5 rendered legend items and one 'More' indicator.");

				done();
			}.bind(this));
		});
	}
);
