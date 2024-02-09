sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
    "sap/tnt/NavigationList",
    "sap/tnt/NavigationListItem"
],
    function (
        App,
        Page,
        Button,
        NavigationList,
        NavigationListItem
    ){
        "use strict";

		var list = new NavigationList("navLiWithIcons", {
			// width: '320px',
			expanded: true,
			items: [
				new NavigationListItem({
					// textDirection: sap.ui.core.TextDirection.RTL,
					text: 'Root 1',
					expanded: true,
					// icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Looooooooooooooooooooong Child'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Only Root',
					icon: 'sap-icon://employee'
				}),
				new NavigationListItem({
					text: 'Disabled Root',
					enabled: false,
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Looooooooooooooooong Root 2',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 3',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				})
			]
		});

        var menuButton = new Button({
			text: 'menu',
			press: function () {
				list.setExpanded(!list.getExpanded());
			}
		});
		var change = new Button({
			text: 'Change',
			press: function () {
				list.getItems()[0].getItems()[0].setText('New text');
			}
		});

		var oNavigationListWithoutIcons = new NavigationList("navLiWithoutIcons", {
			width: '320px',
			expanded: true,
			items: [
				new NavigationListItem({
					text: 'Root 1',
					expanded: true,
					items: [
						new NavigationListItem({
							text: 'Looooooooooooooooooooong Child'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Only Root'
				}),
				new NavigationListItem({
					text: 'Disabled Root',
					enabled: false,
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Looooooooooooooooong Root 2',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 3',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				})
			]
		});

		var oApp = new App({
			pages: [
				new Page("page1", {
					title: "NavigationList with icons",
					headerContent: [
						new Button("toPage2", {
							text: "Go to Page2",
							press: function () {
								oApp.to("page2");
							}
						})
					],
					content: [menuButton, list, change]
				}),
				new Page("page2", {
					title: "NavigationList without icons",
					headerContent: [
						new Button({
							text: "Go to Page1",
							press: function () {
								oApp.to("page1");
							}
						})
					],
					content: [oNavigationListWithoutIcons]
				})
			]
		});

		oApp.placeAt("content");
});