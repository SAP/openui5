sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/List",
	"sap/m/MessageBox",
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/RatingIndicator",
	"sap/m/ScrollContainer",
	"sap/m/StandardListItem",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(App, Button, CheckBox, Column, ColumnListItem, IconTabBar, IconTabFilter, IconTabSeparator, Input, Label, mobileLibrary, Link, List, MessageBox, ObjectStatus, Page, Panel, RadioButton, RadioButtonGroup, RatingIndicator, ScrollContainer, StandardListItem, Table, Text, oCore, coreLibrary, NumberFormat, HorizontalLayout, VerticalLayout, SimpleForm, Filter, FilterOperator, JSONModel, jQuery) {
	"use strict";

	// shortcuts
	var BackgroundDesign = mobileLibrary.BackgroundDesign;
	var IconTabFilterDesign = mobileLibrary.IconTabFilterDesign;

	var IconColor = coreLibrary.IconColor;
	var VerticalAlign = coreLibrary.VerticalAlign;

	var oFloat = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

	// create model
	var model = new JSONModel({
		items: [
			{id: 5163, name:"Lorem Ipsum", amount: 1, price: 23.45, status: "Open"},
			{id: 6342, name:"Dolor Sit Amet", amount: 1, price: 233.22, status: "In Process"},
			{id: 1634, name:"Consectetur Adipisicing", amount: 1, price: 23.45, status: "Shipped"},
			{id: 7856, name:"Elit Sed Do", amount: 3, price: 23.45, status: "Shipped"},
			{id: 7245, name:"Eiusmod Tempor", amount: 1, price: 23.45, status: "Shipped"},
			{id: 8342, name:"Incididunt Ut", amount: 1, price: 23.45, status: "Open"},
			{id: 3462, name:"Labore Et Dolore", amount: 1, price: 23.45, status: "In Process"},
			{id: 4572, name:"Magna Aliqua", amount: 5, price: 23.45, status: "Open"}
		]
	});

	// create and add app
	var app = new App("myApp", {initialPage:"page1"}).setModel(model);
	app.placeAt("body");

	var label1 = new Label({
		text: "IconTabBar with one content on the IconTabBar which is filtered on the different Tabs. Tabs are not expandable. Semantic colors are used."
	});
	label1.addStyleClass("label");

	var label2 = new Label({
		text: "IconTabBar with different contents on the single Tabs (no labels). Tabs are expandable. Only default (brand) color is used."
	});
	label2.addStyleClass("label");

	var label2a = new Label({
		text: "Icon Only IconTabBar with semantic colours."
	});
	label2a.addStyleClass("label");

	var label3 = new Label({
		text: "IconTabBar with tabs which have labels. Tabs are expandable. Semantic colors are used. Some tabs are invisible."
	});
	label3.addStyleClass("label");

	var label4 = new Label({
		text: "IconTabBar with tabs which have no icons, only labels. Tabs are expandable. Only default (brand) color is used."
	});
	label4.addStyleClass("label");

	var label4a = new Label({
		text: "Without item keys (user cannot get the selected tab key) and with no padding of the content"
	});
	label4a.addStyleClass("label");

	var label5 = new Label({
		text: "IconTabBar with tabs which have no icons, only labels. Tabs are expandable. Semantic colors are used."
	});
	label5.addStyleClass("label");

	var label5a = new Label({
		text: "IconTabBar Standard mode"
	});
	label5a.addStyleClass("label");

	var label6 = new Label({
		text: "Initially collapsed IconTabBar with no active item."
	});
	label6.addStyleClass("label");

	var label7 = new Label({
		text: "Initially collapsed IconTabBar with no content and expandable set to false."
	});
	label7.addStyleClass("label");
	var label9 = new Label({
		text: "Process-like icon tab bar with horizontal layout, expandable and expanded set to true. No truncation of texts!"
	});
	label9.addStyleClass("label");
	var label10 = new Label({
		text: "IconTabBar with no parameters and no items."
	});
	label10.addStyleClass("label");
	var label11 = new Label({
		text: "IconTabBar with images as items and horizontal design"
	});
	label11.addStyleClass("label");
	var label12 = new Label({
		text: "IconTabBar with stretchContentHeight."
	});
	label12.addStyleClass("label");

	var label13 = new Label({
		text: "IconTabBar overflow select list."
	});
	label13.addStyleClass("label");

	var label14 = new Label({
		text: "IconTabBar with a simple form to control backgroundDesign and headerBackgroundDesign properties. " +
		"There is also a panel with dark color which wraps the tab bar."
	});
	label14.addStyleClass("label");

	var tabItems = [];
	for (var i = 1; i <= 30; i++) {
		tabItems.push(new IconTabFilter({
			text : "Tab " + i,
			id: "testId_" + i,
			content: new Text({
				text: "Content " + i
			})
		}));
	}

	var iconTabBarOverflowSelectList = new IconTabBar("overFlowTab", {
		items: tabItems
	});

	// backgroundDesign Panel
	var panelBackgroundDesign = new Panel();
	panelBackgroundDesign.addStyleClass("iconTabBarContainer");

	var iconTabBarBackgroundDesign = new IconTabBar("backgroundDesignIconTabBar", {
		expandable: false,
		items: [
			new IconTabFilter({
				showAll: true,
				count: "8",
				text: "Orders Productive",
				key: "All",
				iconColor: IconColor.Neutral
			}),
			new IconTabSeparator(),
			new IconTabFilter("backgroundDesignIconTabBar_filter3", {
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open"
			}),
			new IconTabFilter("itfBackgroundDesign", {
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process"
			}),
			new IconTabFilter({
				icon: "sap-icon://shipping-status",
				iconColor: IconColor.Positive,
				count: "3",
				text: "Shipped",
				key: "Shipped"
			})
		],
		select: function(oEvent) {
			var oBinding = this.getContent()[0].getBinding("items"),
					sKey = oEvent.getParameter("key"),
					oFilter;
			if (sKey == "All") {
				oBinding.filter([]);
			} else {
				oFilter = new Filter("status", FilterOperator.EQ, sKey);
				oBinding.filter([oFilter]);
			}
		},
		content: new Table("listBackgroundDesign", {
			growing: true,
			growingThreshold: 200,
			columns: [
				new Column({
					width: "2em",
					header: new Label({text: "ID"})
				}),
				new Column({
					width: "7em",
					header: new Label({text: "Name"})
				}),
				new Column({
					width: "3em",
					header: new Label({text: "Status"})
				}),
				new Column({
					width: "2em",
					minScreenWidth: "Tablet",
					hAlign: "Right",
					header: new Label({text: "Amount"})
				}),
				new Column({
					width: "3em",
					hAlign: "Right",
					minScreenWidth: "Tablet",
					header: new Label({text: "Price"})
				})
			],
			items: {
				path: "/items",
				template: new ColumnListItem({
					cells: [
						new Text({text: "{id}"}),
						new Text({text: "{name}"}),
						new ObjectStatus({
							text: "{status}",
							state: {
								path: "status",
								formatter: function(value) {
									switch (value) {
										case "Open": return "Warning";
										case "In Process": return "Error";
										case "Shipped": return "Success";
									}
								}
							}
						}),
						new Text({text: "{amount}"}),
						new Text({text: {
							path: "price",
							formatter: function(value) {
								if (value !== undefined) {
									return "$ " + oFloat.format(value);
								}
							}
						}})
					]
				})
			}
		})
	});

	// Radio button group background design
	var rbBackgroundDesign = new RadioButtonGroup("RBBackgroundDesign", {
		columns: 3,
		select: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			iconTabBarBackgroundDesign.setBackgroundDesign(sSelectedValue);
		}
	});
	var oLabelBackgroundDesign = new Label({
		text: "Background Design",
		labelFor: rbBackgroundDesign
	});
	var rb1 = new RadioButton("RB1-Solid", { text: "Solid" });
	var rb2 = new RadioButton("RB1-Transparent", { text: "Transparent" });
	var rb3 = new RadioButton("RB1-Translucent", { text: "Translucent" });
	rbBackgroundDesign.addButton(rb1);
	rbBackgroundDesign.addButton(rb2);
	rbBackgroundDesign.addButton(rb3);

	// Radio button group header background design
	var rbHeaderBackgroundDesign = new RadioButtonGroup("RBHeaderBackgroundDesign", {
		columns: 3,
		select: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			iconTabBarBackgroundDesign.setHeaderBackgroundDesign(sSelectedValue);
		}
	});
	var oLabelHeaderBackgroundDesign = new Label({
		text: "Header Background Design",
		labelFor: rbHeaderBackgroundDesign
	});
	var rb4 = new RadioButton("RB2-Solid", { text: "Solid" });
	var rb5 = new RadioButton("RB2-Transparent", { text: "Transparent" });
	var rb6 = new RadioButton("RB2-Translucent", { text: "Translucent" });
	rbHeaderBackgroundDesign.addButton(rb4);
	rbHeaderBackgroundDesign.addButton(rb5);
	rbHeaderBackgroundDesign.addButton(rb6);

	var appearanceFormBackgroundDesign = new SimpleForm({
		labelSpanL : 6,
		labelSpanM : 6,
		editable : true,
		layout : "ResponsiveGridLayout",
		content : [
			oLabelBackgroundDesign,
			rbBackgroundDesign,
			oLabelHeaderBackgroundDesign,
			rbHeaderBackgroundDesign
		]
	});

	panelBackgroundDesign.addContent(appearanceFormBackgroundDesign);
	panelBackgroundDesign.addContent(iconTabBarBackgroundDesign);

	// Radio button group for tabDensityMode property
	var rbgTabDensityMode  = new RadioButtonGroup("RBGTabDensityMode", {
		columns: 3,
		select: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			for (var i = 0; i < jQuery(".sapMITB").length; i++) {
				oCore.byId(jQuery(".sapMITB")[i].id).setTabDensityMode(sSelectedValue);
			}
		}
	});

	var rb7 = new RadioButton("RB7-Cozy", { text: "Cozy" });
	var rb8 = new RadioButton("RB8-Compact", { text: "Compact" });
	var rb9 = new RadioButton("RB9-Inherit", { text: "Inherit" });
	rbgTabDensityMode.addButton(rb7);
	rbgTabDensityMode.addButton(rb8);
	rbgTabDensityMode.addButton(rb9);

	var oLabelTabDensityMode  = new Label({
		text: "Change TabDensityMode for all IconTabBar-s:",
		labelFor: rbgTabDensityMode,
		vAlign: VerticalAlign.Middle
	});

	// Checkbox for Compact Content Density for the page
	var cbCompactContentDensity  = new CheckBox("densityModeBox", {
		selected: true,
		select: function (oEvent) {
			var bSelectedValue = oEvent.getSource().getSelected();
			jQuery("#body").toggleClass("sapUiSizeCompact", !bSelectedValue).toggleClass("sapUiSizeCozy", bSelectedValue);
			oCore.notifyContentDensityChanged();
		}
	});

	var oLabelCompactContentDensity  = new Label({
		text: "Cozy Content Density for the page:",
		labelFor: rbgTabDensityMode
	}).addStyleClass("cozyLabel");


	var contrastPlusIconTabBar = new IconTabBar('contrastPlusIconTabBar', {
		backgroundDesign: BackgroundDesign.Transparent,
		headerBackgroundDesign: BackgroundDesign.Transparent,
		items: [
			new IconTabFilter({
				text: "Info",
				content: new Text({
					text: "Info content goes here ..."
				})
			}),
			new IconTabFilter({
				text: "Attachments",
				content: new Text({
					text: "Attachments go here ..."
				})
			})
		]
	}).addStyleClass("sapContrast sapContrastPlus");

	var labelIconTabBarResponsivePadding = new Label({
		text: "IconTabBar with Responsive Padding (Fiori 3 themes only)"
	}).addStyleClass("label");

	var iconTabBarResponsivePadding = new IconTabBar("itb_rp", {
		items: (function() {
			var aTabFilters = [];
			for (var i = 1; i <= 50; i++) {
				aTabFilters.push(new IconTabFilter({
					text: "Tab " + i,
					content: new Text({
						text: "Lorem Ipsum " + i
					})
				}));
			}
			return aTabFilters;
		})()
	}).addStyleClass("sapUiResponsivePadding--header sapUiResponsivePadding--content");

	var page1 = new Page("page1", {
		title: "sap.m.IconTabBar",
		headerContent: new Button({text: "focus trap"}),
		content: [
			new VerticalLayout({
				width: "100%",
				content: [
					oLabelTabDensityMode,
					rbgTabDensityMode,
					new HorizontalLayout({
						content: [
							oLabelCompactContentDensity,
							cbCompactContentDensity
						]
					})
				]
			}),

			label1,
			new IconTabBar("itb1", {
				expandable: false,
				items: [
					new IconTabFilter({
						showAll: true,
						count: "8",
						text: "Orders Productive",
						key: "All",
						iconColor: IconColor.Neutral
					}),
					new IconTabSeparator(),
					new IconTabFilter({
						icon: "sap-icon://task",
						iconColor: IconColor.Critical,
						count: "3",
						text: "Open",
						key: "Open"
					}),
					new IconTabFilter("itf1", {
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process"
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped"
					})
				],
				select: function(oEvent) {
					var oBinding = this.getContent()[0].getBinding("items"),
							sKey = oEvent.getParameter("key"),
							oFilter;
					if (sKey == "All") {
						oBinding.filter([]);
					} else {
						oFilter = new Filter("status", FilterOperator.EQ, sKey);
						oBinding.filter([oFilter]);
					}
				},
				content: new Table("list", {
					growing: true,
					growingThreshold: 200,
					columns: [
						new Column({
							width: "2em",
							header: new Label({text: "ID"})
						}),
						new Column({
							width: "7em",
							header: new Label({text: "Name"})
						}),
						new Column({
							width: "3em",
							header: new Label({text: "Status"})
						}),
						new Column({
							width: "2em",
							minScreenWidth: "Tablet",
							hAlign: "Right",
							header: new Label({text: "Amount"})
						}),
						new Column({
							width: "3em",
							hAlign: "Right",
							minScreenWidth: "Tablet",
							header: new Label({text: "Price"})
						})
					],
					items: {
						path: "/items",
						template: new ColumnListItem({
							cells: [
								new Text({text: "{id}"}),
								new Text({text: "{name}"}),
								new ObjectStatus({
									text: "{status}",
									state: {
										path: "status",
										formatter: function(value) {
											switch (value) {
												case "Open": return "Warning";
												case "In Process": return "Error";
												case "Shipped": return "Success";
											}
										}
									}
								}),
								new Text({text: "{amount}"}),
								new Text({text: {
									path: "price",
									formatter: function(value) {
										if (value !== undefined) {
											return "$ " + oFloat.format(value);
										}
									}
								}})
							]
						})
					}
				})
			}),
			label2,
			new IconTabBar("itb2", {
				selectedKey: "key13",
				items: [
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Default,
						count: "3222",
						key: "key1",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Default,
						enabled:false,
						count: "322",
						key: "key2",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Default,
						key: "key3",
						content: [
							new Link({
								text:"message box",
								press: function () {
									MessageBox.alert("Link was clicked!");
								}
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						key: "key4",
						count: "537733",
						content: [
							new Link({
								text:"hallo",
								target: "_blank",
								href: "http://www.sap.com/"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						key: "key5",
						count: "193",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Default,
						count: "3333",
						key: "key6",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Default,
						count: "34",
						key: "key7",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Default,
						key: "key8",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						key: "key9",
						count: "5555",
						content: [
							new Text({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						key: "key10",
						count: "1955",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Default,
						count: "53",
						key: "key11",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Default,
						count: "355",
						key: "key12",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter("itf2", {
						icon: "sap-icon://attachment",
						iconColor: IconColor.Default,
						key: "key13",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						key: "key14",
						count: "577",
						content: [
							new Text({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						key: "key15",
						count: "1977",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					})
				]
			}),
			label2a,
			new IconTabBar("itb2a", {
				selectedKey: "key13",
				items: [
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Critical,
						count: "3222",
						key: "key1",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Negative,
						enabled:false,
						count: "322",
						key: "key2",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Neutral,
						key: "key3",
						content: [
							new Link({
								text:"message box",
								press: function () {
									MessageBox.alert("Link was clicked!");
								}
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						key: "key4",
						count: "537733",
						content: [
							new Link({
								text:"hallo",
								target: "_blank",
								href: "http://www.sap.com/"
							})
						]
					})
				]
			}),
			label3,
			new IconTabBar("itb3", {
				selectedKey: "key3",
				items: [
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "377",
						key: "key1",
						text: "Neutral with long text",
						tooltip: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						enabled: false,
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "388898",
						key: "key2",
						text: "Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Negative lorem long long",
						tooltip: "Negative lorem long long",
						key: "key3",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						text: "Positive lorem",
						key: "key4",
						count: "57",
						content: [
							new Text({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key5",
						count: "1988",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "39",
						key: "key6",
						text: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "300",
						key: "key7",
						text: "Invisible Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Invisible Negative lorem",
						key: "key8",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						text: "Invisible Positive lorem",
						key: "key9",
						count: "599",
						content: [
							new Text({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key10",
						count: "1900",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "30",
						key: "key11",
						text: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "34",
						key: "key12",
						text: "Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key13",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						text: "Positive lorem",
						key: "key14",
						count: "5",
						content: [
							new Text({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key15",
						count: "19",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					})
				]
			}),
			label4a,
			new IconTabBar("itb4a", {
				upperCase: true,
				applyContentPadding: false,
				items: [
					new IconTabFilter("itf4", {
						iconColor: IconColor.Default,
						text: "Lorem",
						count: "3",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Ipsum",
						count: "3",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						enabled: false,
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					})
				]
			}),
			label5,
			new IconTabBar("itb5", {
				upperCase: true,
				backgroundDesign: "Transparent",
				items: [
					new IconTabFilter("itf5", {
						iconColor: IconColor.Negative,
						text: "Lorem",
						count: "3",
						key: "k1",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "Ipsum",
						count: "3",
						key: "key2",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Positive,
						text: "Lorem Ipsum",
						key: "key3",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					})
				]
			}),
			label5a,
			new IconTabBar("itb6", {
				expanded: false,
				items: [
					new IconTabFilter("itf6", {
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "377",
						key: "key1",
						text: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "388898",
						key: "key2",
						text: "Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key3",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					})
				]
			}),
			label9,
			new IconTabBar("itb9", {
				expanded: true,
				expandable: true,
				selectedKey: "key3",
				items: [
					new IconTabFilter({
						showAll: true,
						design: IconTabFilterDesign.Horizontal,
						count: "30",
						text: "Honorificabilitudinitatibus"
					}),
					new IconTabSeparator(),
					new IconTabFilter("itf7", {
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "2 out of 10",
						design: IconTabFilterDesign.Horizontal,
						key: "key1",
						text: "Neutral with long long long text"

					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						design: IconTabFilterDesign.Horizontal,
						key: "key2",
						text: "Critical lorem long text"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						count: "50 / 934679035648 long counter",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Short text",
						key: "key3"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						count: "42",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key3"
					})
				],
				content: [
					new Label({
						text: "info info info"
					})
				]
			}),
			label10,
			new IconTabBar("itb10", {
			}),
			label11,
			new IconTabBar("itb11", {
				expanded: true,
				expandable: true,
				selectedKey: "key3",
				items: [
					new IconTabFilter("itf8", {
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "2 out of 10",
						design: IconTabFilterDesign.Horizontal,
						key: "key1",
						text: "Neutral with long long long text"

					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "images/candy_v_46x46.png",
						iconDensityAware: false,
						iconColor: IconColor.Critical,
						design: IconTabFilterDesign.Horizontal,
						key: "key2",
						text: "Critical lorem long text"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "images/candy_x_46x46.png",
						iconDensityAware: false,
						count: "50 / 934 long counter",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Short text",
						key: "key3"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "images/candy_star_46x46.png",
						iconDensityAware: false,
						count: "42",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						key: "key3"
					})
				],
				content: [
					new Label({
						text: "info info info"
					})
				]
			}),
			label12,
			new ScrollContainer({
				height: "250px",
				width: "100%",
				horizontal: false,
				vertical: false,
				content: [
					new IconTabBar("itb12", {
						stretchContentHeight: true,
						backgroundDesign: "Transparent",
						applyContentPadding: false,
						items: [
							new IconTabFilter({
								text: "Products",
								content: [

									new List({
										items: [
											new StandardListItem({
												title: "Item1",
												counter: 476
											}),
											new StandardListItem({
												title: "Item2",
												counter: 486
											}),
											new StandardListItem({
												title: "Item3",
												counter: 472
											})
										]
									})
								]
							}),
							new IconTabFilter({
								text: "Attachments",
								content: [new Text({text: "Attachments go here..."})]
							}),
							new IconTabFilter({
								text: "Notes",
								content: [new Text({text: "Notes go here..."})]
							}),
							new IconTabFilter({
								text: "People",
								content: [new Text({text: "People go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							}),
							new IconTabFilter({
								text: "Other",
								content: [new Text({text: "Other go here..."})]
							})

						]
					}).addStyleClass("sapUiResponsiveContentPadding")
				]
			}).addStyleClass("ITBContainer"),
			iconTabBarOverflowSelectList,
			labelIconTabBarResponsivePadding,
			iconTabBarResponsivePadding,
			panelBackgroundDesign,
			new Label({
				text: "Contrast IconTabBar with transparent backgrounds"
			}),
			contrastPlusIconTabBar,
			new Label({
				text: "IconTabBar Inline mode"
			}).addStyleClass("label"),
			new IconTabBar({
				headerMode: "Inline",
				items: [
					new IconTabFilter({
						text: "Tab1",
						iconColor: IconColor.Neutral
					}),
					new IconTabFilter({
						text: "Tab2",
						iconColor: IconColor.Critical
					}),
					new IconTabFilter({
						text: "Tab3",
						iconColor: IconColor.Positive
					}),
					new IconTabFilter({
						text: "Tab4",
						iconColor: IconColor.Default
					}),
					new IconTabFilter({
						text: "Tab5",
						iconColor: IconColor.Positive
					})
				]
			}),
			new Label({
				text: "IconTabBar with specific accesibility decription: 'Available spaces'"
			}),
			new IconTabBar({
				ariaTexts: {
					headerLabel: "Available spaces",
					headerDescription: "Select tab to show a space"
				},
				items: [
					new IconTabFilter({
						showAll: true,
						count: "8",
						text: "Orders Productive",
						key: "All",
						iconColor: IconColor.Neutral
					}),
					new IconTabSeparator(),
					new IconTabFilter({
						icon: "sap-icon://task",
						iconColor: IconColor.Critical,
						count: "3",
						text: "Open",
						key: "Open"
					})
				]
			})
		]
	});

	app.addPage(page1);
});
