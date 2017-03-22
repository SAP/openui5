/*
 * ! ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', './library', './P13nSelectionItem'
], function(jQuery, library, P13nSelectionItem) {
	"use strict";

	/**
	 * Constructor for a new P13nChartSelectionItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>selectionItems</code> aggregation in P13nChartSelectionPanel control.
	 * @extends sap.m.P13nSelectionItem
	 * @version ${version}
	 * @constructor
	 * @author SAP SE
	 * @private
	 * @since 1.46.0
	 * @alias sap.m.P13nChartSelectionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nChartSelectionItem = P13nSelectionItem.extend("sap.m.P13nChartSelectionItem", /** @lends sap.m.P13nChartSelectionItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * Specifies the role of dimensions or measures. The role determines how dimensions and measures influence the chart.
				 */
				role: {
					type: "string"
				}
			}
		}
	});

	return P13nChartSelectionItem;

}, /* bExport= */true);
