/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.fiori.SideNavigationItem control
sap.ui.define([],
	function () {
		"use strict";

		var getItemDomRef = function(oControl) {
			return Array.from(oControl.getParent().getDomRef().shadowRoot.querySelectorAll("ui5-tree-item-ui5")).find(function (item) {
				return item.associatedItem === oControl.getDomRef();
			});
		};
		return {
			name: {
				singular: "SIDE_NAVIGATION_ITEM_NAME",
				plural: "SIDE_NAVIGATION_ITEM_PLURAL"
			},
			domRef: function (oControl) {
				var aItems = Array.from(oControl.getParent().getDomRef().shadowRoot.querySelectorAll("ui5-tree-ui5")[0].shadowRoot.querySelectorAll("ui5-li-tree-ui5"));
				var aFixedItems = Array.from(oControl.getParent().getDomRef().shadowRoot.querySelectorAll("ui5-tree-ui5")[1].shadowRoot.querySelectorAll("ui5-li-tree-ui5"));

				return aItems.find(function (item) {
					return item.treeItem === getItemDomRef(oControl);
				}) || aFixedItems.find(function (item) {
					return item.treeItem === getItemDomRef(oControl);
				});
			},
			actions: {
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						var aItems = Array.from(oControl.getParent().getDomRef().shadowRoot.querySelectorAll("ui5-tree-ui5")[0].shadowRoot.querySelectorAll("ui5-li-tree-ui5"));
						var aFixedItems = Array.from(oControl.getParent().getDomRef().shadowRoot.querySelectorAll("ui5-tree-ui5")[1].shadowRoot.querySelectorAll("ui5-li-tree-ui5"));

						return aItems.find(function (item) {
							return item.treeItem === getItemDomRef(oControl);
						}) || aFixedItems.find(function (item) {
							return item.treeItem === getItemDomRef(oControl);
						}).shadowRoot.querySelector(".ui5-li-title");
					},
					getTextMutators: function (oControl) {
						return {
							getText: function () {
								return oControl.getText();
							},
							setText: function (sNewText) {
								oControl.setText(sNewText);
							}
						};
					}
				}
			}
		};
	});