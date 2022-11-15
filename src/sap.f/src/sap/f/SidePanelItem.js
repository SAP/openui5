/*!
 * ${copyright}
 */

// Provides control sap.f.SidePanelItem.
sap.ui.define([
	"sap/ui/core/Item"
], function(
	Item
) {
	"use strict";

	/**
	 * Constructor for a new <code>SidePanelItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The SidePanel Action Item.
	 *
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.107
	 * @alias sap.f.SidePanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	 var SidePanelItem = Item.extend("sap.f.SidePanelItem", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				* Specifies the icon for the item.
				*/
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: '' }
			},
			defaultAggregation: "content",
			aggregations: {
				/**
				 * The list of controls for side content of the action item.
				 */
				content: { type: "sap.ui.core.Control", multiple: true }
			}
		}
	});

	return SidePanelItem;
});