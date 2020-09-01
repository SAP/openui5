/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.ListItem.
sap.ui.define([
	"./ListItemBase",
	"./library"
], function(ListItemBase, library) {
	"use strict";

	var ListItemType = library.ListItemType;

	/**
	 * Constructor for a new <code>ListItem</code>.
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
	 * @alias sap.ui.webcomponents.ListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListItem = ListItemBase.extend("sap.ui.webcomponents.ListItem", {
		metadata: {
			abstract: true,
			library: "sap.ui.webcomponents",
			properties: {

				type: {
					type: "sap.ui.webcomponents.ListItemType",
					defaultValue: ListItemType.Active,
				},
			},
			events: {
				detailClick: {}
			}
		}
	});

	return ListItem;
});
