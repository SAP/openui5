/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	// Provides the Item class.
	/**
	 * Constructor for a new Item.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Item for the field/property metadata used within MDC controls, an instance can be created to override the default/metadata
	 *        behavior.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.61
	 * @alias sap.ui.mdc.chart.Item
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Item = Element.extend("sap.ui.mdc.chart.Item", /** @lends sap.ui.mdc.chart.Item.prototype */
	{
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The unique identifier of the chart item which reflects to the name of the data property in the resulting data set
				 */
				key: {
					type: "string"
				},
				/**
				 * Label for the item, either as a string literal or by a pointer using the binding syntax to some property containing the label.
				 *
				 * <b>NOTE:</b> This property was bound internally if automatically created via metadata of oData service and please call "unbindProperty" before setting.
				 */
				label: {
					type: "string"
				},
				/**
				 * The visibility of the chart item
				 */
				visible: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * The data type
				 */
				type: {
					type: "string",
					defaultValue: "string"
				}
			}
		}
	});

	/**
	 *
	 * @param mMetadata the metadata
	 */
	Item.prototype.getSettings = function(mMetadata) {
		throw new Error("sap.ui.mdc.chart.Item - getSettings not implemented see sap.ui.mdc.chart.DimensionItem or sap.ui.mdc.chart.MeasureItem");
	};

	/**
	 * Transfer the MDC chart item to a viz Chart item
	 * @param mMetadata the metadata
	 */
	Item.prototype.toVizChartItem = function(mMetadata) {
		throw new Error("sap.ui.mdc.chart.Item - getChartVizItem not implemented see sap.ui.mdc.chart.DimensionItem or sap.ui.mdc.chart.MeasureItem");
	};

	/**
	 * Role of the inner chart item, see @sap.ui.mdc.ChartItemRoleType
	 * @param {string} vRole The role of the inner chart item
	 * @return {this}
	 */
	Item.prototype.setRole = function(vRole) {
		throw new Error("sap.ui.mdc.chart.Item - setRole not implemented see sap.ui.mdc.chart.DimensionItem or sap.ui.mdc.chart.MeasureItem");
	};

	/**
	 *
	 * @return {string} The type of the inner charts item which can be 'Dimension' or 'Measure'
	 */
	Item.prototype.getVizItemType = function() {
		throw new Error("sap.ui.mdc.chart.Item - getVizItemType not implemented see sap.ui.mdc.chart.DimensionItem or sap.ui.mdc.chart.MeasureItem");
	};

	return Item;

}, true);
