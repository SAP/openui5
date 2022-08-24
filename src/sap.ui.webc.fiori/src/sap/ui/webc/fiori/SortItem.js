/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.SortItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/SortItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SortItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * <h3>Usage</h3>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.97.0
	 * @experimental Since 1.97.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.SortItem
	 * @implements sap.ui.webc.fiori.ISortItem
	 */
	var SortItem = WebComponent.extend("sap.ui.webc.fiori.SortItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-sort-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.ISortItem"
			],
			properties: {

				/**
				 * Defines if the component is selected.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SortItem;
});