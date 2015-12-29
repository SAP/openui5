/*
 * ! ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Item'
], function(jQuery, library, Item) {
	"use strict";

	/**
	 * Constructor for a new P13nDimMeasureItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>columnsItems</code> aggregation in P13nDimMeasurePanel control.
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * @constructor
	 * @author SAP SE
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.P13nDimMeasureItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nDimMeasureItem = Item.extend("sap.m.P13nDimMeasureItem", /** @lends sap.m.P13nDimMeasureItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Specifies the unique chart column key. In this context a column refers to dimensions or measures of a chart.
				 *
				 * @since 1.34.0
				 */
				columnKey: {
					type: "string"
				},

				/**
				 * Specifies the order of visible dimensions or measures of a chart.
				 *
				 * @since 1.34.0
				 */
				index: {
					type: "int",
					defaultValue: -1
				},

				/**
				 * Specifies the visibility of dimensions or measures.
				 *
				 * @since 1.34.0
				 */
				visible: {
					type: "boolean"
				},

				/**
				 * Specifies the role of dimensions or measures. The role determines how dimensions and measures influence the chart.
				 *
				 * @since 1.34.0
				 */
				role: {
					type: "string"
				}
			}
		}
	});

	return P13nDimMeasureItem;

}, /* bExport= */true);
