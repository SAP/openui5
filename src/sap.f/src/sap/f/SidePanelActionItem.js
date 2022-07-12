/*!
 * ${copyright}
 */

// Provides control sap.f.SidePanelActionItem.
sap.ui.define([
	"sap/ui/core/Item"
], function(
	Item
) {
	"use strict";

	/**
	 * Constructor for a new <code>SidePanelActionItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The SidePanel Navigation Item.
	 *
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.107
	 * @alias sap.f.SidePanelActionItem
	 * @experimental Since 1.107. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	 var SidePanelActionItem = Item.extend("sap.f.SidePanelActionItem", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				* Specifies the icon for the item.
				*/
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: '' }
			}
		}
	});

	return SidePanelActionItem;
});