/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card"
],
	function (
		Core,
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
						"date": 1567317600000,
						"maxItems": 7,
						"maxLegendItems": 3,
						"noItemsText": "You have nothing planned for that day",
						"appointment": [
							{
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": 1575010800000,
								"end": 1575014400000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": 1575050400000,
								"end": 1575054000000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						],
						"blocker": [
							{
								"start": 1567314000000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": 1567314000000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"start": 1567314000000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"start": 1567314000000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							}
						],
						"specialDate": [
							{
								"start": 1567317600000,
								"end": 1567321200000,
								"type": "Type13"
							},
							{
								"start": 1567404000000,
								"end": 1567407600000,
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
					"blocker": {
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
						"path": "/blocker"
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
						"date": 1567317600000,
						"maxItems": 7,
						"maxLegendItems": 3,
						"noItemsText": "You have nothing planned for that day",
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567314000000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							}
						],
						"specialDate": [
							{
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_3OutOf5Blocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_3OutOf3Blocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_2OutOf2Blocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_3OutOf5AppsBlocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_3OutOf3AppsBlocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{blocker}",
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

		var oManifest_2OutOf2AppsBlocks = {
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
						"date": 1567317600000,
						"maxItems": 3,
						"item": [
							{
								"visualization": "appointment",
								"start": 1567317600000,
								"end": 1567321200000,
								"title": "Appointment from JSON",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": 1567317600000,
								"end": 1567321200000,
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
							"visualization": "{visualization}",
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

		var oManifest_NoAppsNoBlockers = {
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
						"date": 1567317600000,
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
								"visualization": "appointment",
								"start": "2019-12-15/08:30",
								"end": "2019-12-16/08:30",
								"title": "from yesterday",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type05"
							},
							{
								"visualization": "blocker",
								"start": "2019-12-16/08:30",
								"end": "2019-12-17/08:30",
								"title": "until tomorrow",
								"text": "working",
								"icon": "sap-icon://desktop-mobile",
								"type": "Type06"
							},
							{
								"visualization": "blocker",
								"start": "2019-12-15/08:30",
								"end": "2019-12-17/08:30",
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
							"visualization": "{visualization}",
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
					oCalendar = this.oCard.getAggregation("_content").getAggregation("_content"),
					aAppointments = oCalendar.getRows()[0].getAppointments(),
					aBlockers = oCalendar.getRows()[0].getIntervalHeaders(),
					aSpecialDates = oCalendar.getSpecialDates(),
					aCalLegItems = oCalendar._getLegend().getItems(),
					aAppLegItems = oCalendar._getLegend().getAppointmentItems();

				Core.applyChanges();

				// Assert
				// Start date
				assert.equal(oCalendar.getStartDate().getTime(), oManifestData.date, "Should have start date.");

				// maxItems
				assert.equal(oCalendar.getRows()[0].getVisibleAppointmentsCount(), oManifestData.maxItems, "Should have visibleAppointmentsCount.");

				// maxLegendItems
				assert.equal(oCalendar._getLegend().getVisibleLegendItemsCount(), oManifestData.maxLegendItems, "Should have visibleLegendItemsCount.");

				// noItemsText
				assert.equal(oCalendar.getRows()[0].getNoAppointmentsText(), oManifestData.noItemsText, "Should have noAppointmentsText.");

				// Appointment
				assert.equal(aAppointments.length, 1, "Should have 1 appointment.");
				assert.equal(aAppointments[0].getStartDate().getTime(), oManifestData.item[0].start, "Should have appointment startDate");
				assert.equal(aAppointments[0].getEndDate().getTime(), oManifestData.item[0].end, "Should have appointment endDate");
				assert.equal(aAppointments[0].getTitle(), oManifestData.item[0].title, "Should have appointment title");
				assert.equal(aAppointments[0].getText(), oManifestData.item[0].text, "Should have appointment text");
				assert.equal(aAppointments[0].getType(), oManifestData.item[0].type, "Should have appointment type");
				assert.equal(aAppointments[0].getIcon(), oManifestData.item[0].icon, "Should have appointment icon");

				// Blocker
				assert.equal(aBlockers.length, 1, "Should have 1 blocker.");
				assert.equal(aBlockers[0].getStartDate().getTime(), oManifestData.item[1].start, "Should have blocker startDate");
				assert.equal(aBlockers[0].getEndDate().getTime(), oManifestData.item[1].end, "Should have blocker endDate");
				assert.equal(aBlockers[0].getTitle(), oManifestData.item[1].title, "Should have blocker title");
				assert.equal(aBlockers[0].getText(), oManifestData.item[1].text, "Should have blocker text");
				assert.equal(aBlockers[0].getType(), oManifestData.item[1].type, "Should have blocker type");
				assert.equal(aBlockers[0].getIcon(), oManifestData.item[1].icon, "Should have blocker icon");

				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments and blockers.");

				// Special date
				assert.equal(aSpecialDates.length, 1, "Should have 1 special date.");
				assert.equal(aSpecialDates[0].getStartDate().getTime(), oManifestData.specialDate[0].start, "Should have special date startDate");
				assert.equal(aSpecialDates[0].getEndDate().getTime(), oManifestData.specialDate[0].end, "Should have special date endDate");
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
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 2 appointments and blockers.");

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
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments and blockers.");

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
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Only blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5Blocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 2 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Only blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf3Blocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Only blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_2OutOf2Blocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments and blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf5AppsBlocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 5, "Should have total of 2 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments and blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_3OutOf3AppsBlocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("Appointments and blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_2OutOf2AppsBlocks);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 2, "Should have 2 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 2, "Should have total of 2 appointments and blockers.");

				done();
			}.bind(this));
		});

		QUnit.test("No appointments, no blockers", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.setManifest(oManifest_NoAppsNoBlockers);

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 0, "Should have 0 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 0, "Should have total of 0 appointments and blockers.");

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
				assert.equal(this.oCard.getModel("parameters").getData().visibleItems, 3, "Should have 3 visible appointments and blockers.");
				assert.equal(this.oCard.getModel("parameters").getData().allItems, 3, "Should have total of 3 appointments and blockers.");

				done();
			}.bind(this));
		});

	}
);
