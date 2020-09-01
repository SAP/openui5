/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.GroupHeaderListItem.
sap.ui.define([
	"./ListItemBase",
	"./thirdparty/ui5-wc-bundles/GroupHeaderListItem"
], function(ListItemBase, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>GroupHeaderListItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.GroupHeaderListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupHeaderListItem = ListItemBase.extend("sap.ui.webcomponents.GroupHeaderListItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-li-groupheader",
			properties: {

				text : {
					type : "string",
					group : "Appearance",
					mapping: "textContent"
				}
			}
		}
	});

	return GroupHeaderListItem;
});
