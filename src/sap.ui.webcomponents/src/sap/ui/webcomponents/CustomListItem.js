/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.CustomListItem.
sap.ui.define([
	"./ListItem",
	"./thirdparty/ui5-wc-bundles/CustomListItem"
], function(ListItem) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomListItem</code>.
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
	 * @alias sap.ui.webcomponents.CustomListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CustomListItem = ListItem.extend("sap.ui.webcomponents.CustomListItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-li-custom",
			aggregations: {

				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	return CustomListItem;
});
