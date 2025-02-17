sap.ui.define([
	"sap/m/Page",
	"sap/m/App",
	"sap/m/HBox",
	"sap/m/GenericTile",
	"sap/m/ActionTile",
	"sap/m/TileContent",
	"sap/m/MessageToast",
	"sap/f/GridContainer",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/integration/widgets/Card"
], function (
	Page,
	App,
	HBox,
	GenericTile,
	ActionTile,
	TileContent,
	MessageToast,
	GridContainer,
	Title,
	Text,
	FormattedText,
	Card,
	CardHeader,
	GridContainerItemLayoutData,
	IntegrationCard
) {
	"use strict";

	function onPress() {
		MessageToast.show("Press event is fired");
	}

	function onCardAction(oEvent) {
		oEvent.preventDefault();

		MessageToast.show(`Action Type: ${oEvent.getParameters().type}

			Action Parameters: ${JSON.stringify(oEvent.getParameters().parameters, null, 4)}

			Action Source: ${oEvent.getParameters().actionSource.getMetadata().getName()}`);
	}

	var oGridContainer = new GridContainer("gridContainer", {
		items: [
			new GenericTile({
				header: "Sales Fulfillment Application Title",
				subheader: "Has Action",
				layoutData: new GridContainerItemLayoutData({
					columns: 2,
					minRows: 2
				}),
				press: onPress
			}),
			new GenericTile({
				header: "Sales Fulfillment Application Title",
				subheader: "https://www.sap.com/",
				url: "https://www.sap.com/",
				layoutData: new GridContainerItemLayoutData({
					columns: 2,
					minRows: 2
				})
			}),
			new Card("cardWithNestedCards", {
				press: onPress,
				height: "100%",
				layoutData: new GridContainerItemLayoutData({
					minRows: 3,
					columns: 2
				}),
				header: new CardHeader({
					title: "Parent Card"
				}),
				content: new HBox({
					width: "100%",
					items: [
						new Card({
							header: new CardHeader({
								title: "Child Card"
							})
						}),
						new Card({
							header: new CardHeader({
								title: "Child Card"
							})
						})
					]
				})
			}),
			new Card({
				layoutData: new GridContainerItemLayoutData({
					minRows: 3,
					columns: 3
				}),
				height: "100%",
				press: onPress,
				header: new CardHeader({
					title: "Card and Header Actions",
					press: onPress
				}),
				content: [
					new Text({
						text: "Card content text"
					})
				]
			}),
			new Text({
				text: "Text as an item",
				layoutData: new GridContainerItemLayoutData({
					minRows: 2,
					columns: 2
				})
			}),
			new IntegrationCard({
				layoutData: new GridContainerItemLayoutData({
					minRows: 3,
					columns: 3
				}),
				height: "100%",
				action: onCardAction,
				manifest: {
					"sap.app": {
						"id": "sap.card.test",
						"type": "card"
					},
					"sap.card": {
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "https://sap.com",
								"target": "_blank"
							}
						}],
						"type": "Object",
						"header": {
							"title": "Card with Action"
						},
						"content": {
							"groups": [
								{
									"title": "Group Title",
									"items": [
										{
											"label": "City",
											"value": "Sofia, Bulgaria"
										}
									]
								}
							]
						}
					}
				}
			}),
			new IntegrationCard({
				layoutData: new GridContainerItemLayoutData({
					columns: 3
				}),
				action: onCardAction,
				manifest: {
					"sap.app": {
						"id": "sap.card.test",
						"type": "card"
					},
					"sap.card": {
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "https://sap.com",
								"target": "_blank"
							}
						}],
						"type": "List",
						"data": {
							"json": {
								"items": [
									{"title": "Item 1"},
									{"title": "Item 2"},
									{"title": "Item 3"},
									{"title": "Item 4"}
								]
							}
						},
						"header": {
							"title": "Card and Header and List Item Actions",
							"subTitle": "sematicRole - listitem",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "https://sap.com",
										"target": "_blank"
									}
								}
							]
						},
						"content": {
							"data": {
								"path": "/items"
							},
							"item": {
								"title": "{title}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "https://sap.com",
											"target": "_blank"
										}
									}
								]
							},
							"maxItems": 4
						},
						"footer": {
							"actionsStrip": [
								{
									"type": "ToolbarSpacer"
								},
								{
									"type": "Link",
									"text": "Agenda",
									"icon": "sap-icon://action",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "{agendaUrl}"
											}
										}
									]
								},
								{
									"text": "Approve",
									"overflowPriority": "High",
									"actions": [
										{
											"type": "Custom",
											"parameters": {
												"method": "approve"
											}
										}
									]
								}
							]
						}
					}
				}
			}),
			new ActionTile({
				header: "Comparative Annual Totals",
				url: "https://www.sap.com/",
				headerImage: "sap-icon://alert",
				valueColor: "Critical",
				priority: "VeryHigh",
				priorityText: "Very High",
				tileContent: new TileContent({
					content: new FormattedText({
						htmlText: "<span>This would be a situation long text description. it would have 3 lines of space, as a maximum else get truncated</span><p>Supplier<br>Domestic US Supplier 1</p><p>Due On:<br>28.09.2022</p> <p>Created On: <br>01.09.2022</p>"
					})
				})
			})
		]
	});

	var oPage = new Page("page", {
		title: "Test Page for sap.f.GridContainer",
		content: [oGridContainer]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App({
		pages: [oPage]
	});

	oApp.placeAt("body");
});