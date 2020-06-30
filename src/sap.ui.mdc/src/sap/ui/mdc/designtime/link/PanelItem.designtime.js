/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.mdc.link.ILinkHandler
sap.ui.define([], function() {
	"use strict";

	return {
		// RTA mode
		domRef: function(oPanelItem) {
			var $aPanelListItems = jQuery.find(".mdcbaseinfoPanelListItem");
			var $oPanelListItem = $aPanelListItems.filter(function($PanelListItem) {
				return jQuery($PanelListItem).control(0).getParent().getKey() === oPanelItem.getId();
			});
			return $oPanelListItem[0];
		},
		name: {
			singular: "p13nDialog.PANEL_ITEM_NAME",
			plural: "p13nDialog.PANEL_ITEM_NAME_PLURAL"
		},
		// RTA mode
		actions: {
			remove: function(oPanelItem) {
				if (oPanelItem.getIsMain()) {
					return null;
				}
				return {
					changeType: "hideItem"
				};
			},
			reveal: function(oPanelItem) {
				if (oPanelItem.getIsMain()) {
					return null;
				}
				return {
					changeType: "revealItem"
				};
			}
		},
		// Needed for Elements, that are not derived from sap.ui.core.Control. The function should return the visibility of the PanelItem.
		isVisible: function (oPanelItem) {
			return oPanelItem.getVisible();
		}
	};

});