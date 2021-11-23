/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.FilterItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/FilterItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>FilterItem</code>.
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
	 * @alias sap.ui.webc.fiori.FilterItem
	 * @implements sap.ui.webc.fiori.IFilterItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterItem = WebComponent.extend("sap.ui.webc.fiori.FilterItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-filter-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IFilterItem"
			],
			properties: {

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {

				/**
				 * Defines the <code>values</code> list.
				 */
				values: {
					type: "sap.ui.webc.fiori.IFilterItemOption",
					multiple: true,
					slot: "values"
				}
			}
		}
	});

	return FilterItem;
});