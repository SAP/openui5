/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.IconTabBar control
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment"
],
	function (JSONModel, Core, Fragment) {
		"use strict";

		var oTextResources = Core.getLibraryResourceBundle("sap.m.designtime");

		var oSelectIconTabBarFilter = function (oControl, mPropertyBag) {
			return new Promise(function (fnResolve) {
				var aItemsList = [];
				var aItems = oControl.getItems();

				aItems.forEach(function (oItem) {
					if (!oItem.isA("sap.m.IconTabSeparator")){
						aItemsList.push({
							'text': oItem.getText() || oItem.getKey(),
							'key': oItem.getKey()
						});
					}
				});

				var oData = {
					selectedKey: oControl.getSelectedKey(),
					titleText: oTextResources.getText("ICON_TAB_BAR_SELECT_TAB"),
					cancelBtn: oTextResources.getText("ICON_TAB_BAR_CANCEL_BTN"),
					okBtn: oTextResources.getText("ICON_TAB_BAR_SELECT_BTN"),
					items: aItemsList
				};
				var oModel = new JSONModel();
				oModel.setData(oData);

				Fragment.load({
						name:"sap.m.designtime.IconTabBarSelectTab",
						controller: this
					}).then(function(oDialog){
					oDialog.setModel(oModel);

					oDialog.getBeginButton().attachPress(function (oEvent) {
						var sNewSelectedKey = sap.ui.getCore().byId("targetCombo").getSelectedKey();

						fnResolve(sNewSelectedKey);
						oDialog.close();
					});

					oDialog.getEndButton().attachPress(function (oEvent) {
						oDialog.close();
					});

					oDialog.attachEventOnce("afterClose", function (oEvent) {
						oDialog.destroy();
					});

					oDialog.addStyleClass(mPropertyBag.styleClass);
					oDialog.open();
				});
			}).then(
				function (sNewSelectedKey) {
					return [{
						selectorControl: oControl,
						changeSpecificData: {
							changeType: "selectIconTabBarFilter",
							content: {
								selectedKey: sNewSelectedKey,
								previousSelectedKey: oControl.getSelectedKey(),
								fireEvent: true
							}
						}
					}];
				}
			);
		};

		return {
			name: {
				singular: "ICON_TAB_BAR_NAME",
				plural: "ICON_TAB_BAR_NAME_PLURAL"
			},
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/m/designtime/IconTabBar.icon.svg"
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref > .sapMITH",
					actions: {
						move: "moveControls"
					}
				},
				content: {
					domRef: function(oControl) {
						var oSelectedItem = oControl._getIconTabHeader().oSelectedItem;

						if (oSelectedItem && oSelectedItem.getContent().length) {
							return;
						}

						return oControl.getDomRef("content");
					},
					actions: {
						move: "moveControls"
					}
				}
			},
			actions: {
				settings: function () {
					return {
						"selectIconTabBarFilter": {
							name: oTextResources.getText("ICON_TAB_BAR_SELECT_TAB"),
							isEnabled: function (oControl) {
								return !!oControl._getIconTabHeader().oSelectedItem;
							},
							handler: oSelectIconTabBarFilter
						}
					};
				}
			},
			templates: {
				create: "sap/m/designtime/IconTabBar.create.fragment.xml"
			}
		};

	});