sap.ui.define([
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuButton",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(
	Menu,
	MenuItem,
	MenuButton,
	MessageToast,
	JSONModel
) {
	"use strict";

	var oMenu = new Menu({
		title: "random",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
					sItemPath = "";
			while (oItem instanceof MenuItem) {
				sItemPath = oItem.getText() + " > " + sItemPath;
				oItem = oItem.getParent();
			}

			sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

			MessageToast.show("itemSelected: " + sItemPath);
		}
	});

	oMenu.addItem(new MenuItem({
		text: "fridge",
		icon: "sap-icon://fridge",
		items: [
			new MenuItem({
				text: "accidental leave",
				icon: "sap-icon://accidental-leave",
				items: [
					new MenuItem({
						icon: "sap-icon://factory",
						text: "factory"
					}),
					new MenuItem({
						icon: "sap-icon://flag",
						text: "flag"
					}),
					new MenuItem({
						icon: "sap-icon://flight",
						text: "flight"
					})
				]
			}),
			new MenuItem({
				text: "iphone",
				// icon: "sap-icon://iphone",
				items: [
					new MenuItem({
						icon: "sap-icon://video",
						text: "video"
					}),
					new MenuItem({
						// icon: "sap-icon://loan",
						text: "loan"
					}),
					new MenuItem({
						icon: "sap-icon://commission-check",
						text: "commission check",
						startsSection: true
					}),
					new MenuItem({
						icon: "sap-icon://doctor",
						text: "doctor"
					})
				]
			})
		]
	}));

	oMenu.addItem(new MenuItem({
		text: "iphone",
		icon: "sap-icon://iphone",
		items: [
			new MenuItem({
				icon: "sap-icon://video",
				text: "no icons",
				items: [
					new MenuItem({
						text: "new"
					}),
					new MenuItem({
						text: "save and open",
						items: [
							new MenuItem({
								text: "save as"
							}),
							new MenuItem({
								text: "save"
							}),new MenuItem({
								text: "open from"
							}),
							new MenuItem({
								text: "open"
							})
						]
					})
				]
			}),
			new MenuItem({
				icon: "sap-icon://loan",
				text: "loan"
			}),
			new MenuItem({
				icon: "sap-icon://commission-check",
				text: "commission check"
			}),
			new MenuItem({
				icon: "sap-icon://doctor",
				text: "doctor"
			})
		]
	}));

	var oButton = new MenuButton({
		text: "Open Menu",
		menu: oMenu
	});

	oButton.placeAt("body");

	//////////////////////////

	var oModel = new JSONModel();

	function bindAggregations(dataNumber) {
		if (!dataNumber) {
			var template = new MenuItem({
				text: "{text}",
				icon: "{icon}",
				items: {
					path: 'items',
					template: new MenuItem({
						text: "{text}",
						icon: "{icon}",
						items: {
							path: 'items',
							template: new MenuItem({
								text: "{text}",
								icon: "{icon}"
							}),
							templateShareable: true
						}
					}),
					templateShareable: true
				}
			});

			oModel.setData({
				items: [
					{
						text: "item1",
						icon: "sap-icon://accidental-leave"
					},
					{
						text: "item2",
						icon: "sap-icon://accidental-leave",
						items: [
							{
								text: "sub-item1",
								icon: "sap-icon://accidental-leave",
								items: [
									{
										text: "sub-sub-item1",
										icon: "sap-icon://accidental-leave"
									}
								]
							}
						]
					}
				]
			});

			oMenu2.setModel(oModel);
			oMenu2.bindAggregation("items", "/items", template);
		} else {
			var oSecondData = {
				items: [
					{
						text: "second-item1",
						icon: "sap-icon://accidental-leave"
					},
					{
						text: "second-item2",
						icon: "sap-icon://accidental-leave",
						items: [
							{
								text: "second-sub-item1",
								icon: "sap-icon://accidental-leave",
								items: [
									{
										text: "second-sub-sub-item1",
										icon: "sap-icon://accidental-leave"
									},
									{
										text: "second-sub-sub-item2",
										icon: "sap-icon://accidental-leave"
									}
								]
							}
						]
					}
				]
			};
			oSecondData.items.push({
				text: "second-item3",
				icon: "sap-icon://accidental-leave"
			});
			oMenu2.getModel().setProperty('/items', oSecondData.items);
		}
	}

	var oMenu2 = new Menu();
	bindAggregations();

	var oButton2 = new MenuButton({
		text: "Test binding",
		menu: oMenu2
	});

	oButton2.placeAt("body");
});
