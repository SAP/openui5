sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/Text",
	"sap/base/i18n/Localization",
	"sap/m/Label",
	"sap/m/Switch",
	"sap/ui/layout/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Input",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Toolbar",
	"sap/f/ShellBar",
	"sap/m/Avatar",
	"sap/m/OverflowToolbarButton",
	"sap/m/IconTabBar",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter"
], function(
	App,
	Page,
	Element,
	JSONModel,
	Text,
	Localization,
	Label,
	Switch,
	layoutLibrary,
	SimpleForm,
	Input,
	VerticalLayout,
	Toolbar,
	ShellBar,
	Avatar,
	OverflowToolbarButton,
	IconTabBar,
	IconTabHeader,
	IconTabFilter
) {
	"use strict";

	var oShellBar = new ShellBar({
		homeIcon: sap.ui.require.toUrl("sap/ui/documentation/sdk/images/logo_sap.png"),
		title: "Title",
		showCopilot: true,
		showSearch: true,
		showProductSwitcher: true,
		showNotifications: true,
		notificationsNumber: "2",
		profile: new Avatar({
			initials: "DN"
		}),
		additionalContent: [
			new OverflowToolbarButton({ icon: "sap-icon://home", text: "home", type: "Transparent" }),
			new OverflowToolbarButton({ icon: "sap-icon://action-settings", text: "Action settings", type: "Transparent" }),
			new OverflowToolbarButton({ icon: "sap-icon://add-photo", text: "Add photo", type: "Transparent" })
		]
	});

	var oIconTabBar = new IconTabBar({
		items: [
			new IconTabFilter({
				text: 'Tab 1 - Single Click',
				items: [
					new IconTabFilter({
						text: 'Tab 1.1',
						content: [
							new Text({
								text: 'Content 1.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 1.2',
						content: [
							new Text({
								text: 'Content 1.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 2',
				content: [
					new Text({
						text: 'Content 2'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 2.1',
						content: [
							new Text({
								text: 'Content 2.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 2.2',
						content: [
							new Text({
								text: 'Content 2.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 3',
				content: [
					new Text({
						text: 'Content 3'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 31.1',
						content: [
							new Text({
								text: 'Content 3.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 3.2',
						content: [
							new Text({
								text: 'Content 3.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 4',
				content: [
					new Text({
						text: 'Content 4'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 4.1',
						content: [
							new Text({
								text: 'Content 4.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 4.2',
						content: [
							new Text({
								text: 'Content 4.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 5',
				content: [
					new Text({
						text: 'Content 5'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 5.1',
						content: [
							new Text({
								text: 'Content 5.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 5.2',
						content: [
							new Text({
								text: 'Content 5.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 6',
				content: [
					new Text({
						text: 'Content 6'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 6.1',
						content: [
							new Text({
								text: 'Content 6.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 6.2',
						content: [
							new Text({
								text: 'Content 6.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 7',
				content: [
					new Text({
						text: 'Content 7'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 7.1',
						content: [
							new Text({
								text: 'Content 7.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 7.2',
						content: [
							new Text({
								text: 'Content 7.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 8',
				content: [
					new Text({
						text: 'Content 8'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 8.1',
						content: [
							new Text({
								text: 'Content 8.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 8.2',
						content: [
							new Text({
								text: 'Content 8.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 9',
				content: [
					new Text({
						text: 'Content 9'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 9.1',
						content: [
							new Text({
								text: 'Content 9.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 9.2',
						content: [
							new Text({
								text: 'Content 9.2'
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 10',
				content: [
					new Text({
						text: 'Content 10'
					})
				],
				items: [
					new IconTabFilter({
						text: 'Tab 10.1',
						content: [
							new Text({
								text: 'Content 10.1'
							})
						]
					}),
					new IconTabFilter({
						text: 'Tab 10.2',
						content: [
							new Text({
								text: 'Content 10.2'
							})
						]
					})
				]
			})
		]
	}).addStyleClass('sapUshellShellTabBar');

	var oIconTabBarWithIcons = new IconTabBar({
		items: [
			new IconTabFilter({
				icon: "sap-icon://home",
				text: 'TymgggYMym',
				count: '1'
			}),
			new IconTabFilter({
				icon: "sap-icon://home",
				text: 'Tymgggy',
				count: '2'
			})
		]
	}).addStyleClass('sapUshellShellTabBar');

	var oLabel = new Label({text: "Empty IconTabHeader for testing of the min height"}).addStyleClass("sapUiMediumMarginTop");

	var oIconTabHeaderEmpty = new IconTabHeader({
		items: []
	}).addStyleClass('sapUshellShellTabBar');

	var oPage = new Page("page", {
		showHeader: false,
		content: [
			oShellBar,
			oIconTabBar,
			oIconTabBarWithIcons,
			oLabel,
			oIconTabHeaderEmpty
		]
	}).addStyleClass('sapUshellShell');

	var oApp = new App("myApp", {
		initialPage: "page"
	});

	oApp.addPage(oPage).placeAt("body");

});