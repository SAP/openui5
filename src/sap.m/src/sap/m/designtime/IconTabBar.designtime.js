/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.IconTabBar control
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/base/i18n/ResourceBundle"
],
	function(Element, JSONModel, Fragment, ResourceBundle) {
		"use strict";

		var oSelectIconTabBarFilter = function (oControl, mPropertyBag) {
			return Promise.all([
					ResourceBundle.create({
						bundleName: "sap.m.designtime.messagebundle",
						async: true
					}),
					Fragment.load({
						name:"sap.m.designtime.IconTabBarSelectTab",
						controller: this
					})
				]).then(function ([oTextResources, oDialog]) {
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

					oDialog.setModel(new JSONModel({
						selectedKey: oControl.getSelectedKey(),
						titleText: oTextResources.getText("ICON_TAB_BAR_SELECT_TAB"),
						cancelBtn: oTextResources.getText("ICON_TAB_BAR_CANCEL_BTN"),
						okBtn: oTextResources.getText("ICON_TAB_BAR_SELECT_BTN"),
						items: aItemsList
					}));

					const pAwaitSelection = new Promise(function (fnResolve) {
						oDialog.getBeginButton().attachPress(function (oEvent) {
							var sNewSelectedKey = Element.getElementById("targetCombo").getSelectedKey();
							fnResolve(sNewSelectedKey);
							oDialog.close();
						});
					});

					oDialog.getEndButton().attachPress(function (oEvent) {
						oDialog.close();
					});

					oDialog.attachEventOnce("afterClose", function (oEvent) {
						oDialog.destroy();
					});

					oDialog.addStyleClass(mPropertyBag.styleClass);
					oDialog.open();

					return pAwaitSelection;
				}).then(function (sNewSelectedKey) {
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
				});
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
					},
					propagateMetadata: function (oFilter) {
						if (oFilter.isA("sap.m.IconTabFilter")) {
							return {
								aggregations: {
									content: {
										domRef: ":sap-domref > .sapMITBContainerContent",

										actions: {
											move: "moveControls"
										}
									}
								}
							};
						}

						return null;
					}
				},
				content: {
					domRef: function(oControl) {
						var oSelectedItem = oControl._getIconTabHeader().oSelectedItem;

						// item with own content
						if (oSelectedItem && oSelectedItem.getContent().length) {
							return null;
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
							name: "ICON_TAB_BAR_SELECT_TAB",
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