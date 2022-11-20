/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.mdc.Link
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery"
], function(Element, jQuery) {
	"use strict";

	return {
		// RTA mode
		domRef: function(oPanelItem) {
			var aPanelListItems = jQuery.find(".mdcbaseinfoPanelListItem");
			var aFilteredPanelListItem = aPanelListItems.filter(function(oPanelListItem) {
				return Element.closestTo(oPanelListItem).getParent().getKey() === oPanelItem.getId();
			});
			return aFilteredPanelListItem[0];
		},
		name: {
			singular: "p13nDialog.PANEL_ITEM_NAME",
			plural: "p13nDialog.PANEL_ITEM_NAME_PLURAL"
		},
		// RTA mode
		actions: {
			remove: function() {
				return {
					changeType: "hideItem"
				};
			},
			reveal: function() {
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