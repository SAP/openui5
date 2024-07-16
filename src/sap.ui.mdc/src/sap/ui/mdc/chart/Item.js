/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element", "sap/base/Log"
], (Element, Log) => {
	"use strict";

	/**
	 * Constructor for a new <code>Item</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>Item</code> control for the chart/property metadata used within MDC Chart. An instance can be created to override the default/metadata behavior.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @public
	 * @experimental As of version 1.88
	 * @since 1.88
	 * @alias sap.ui.mdc.chart.Item
	 */
	const Item = Element.extend("sap.ui.mdc.chart.Item", /** @lends sap.ui.mdc.chart.Item.prototype */ {
		metadata: {
			"abstract": false, //TODO: see comment at the end.
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The unique identifier of the chart item that reflects the name of the data property in the resulting data set.
				 *
				 * @since 1.115
				 */
				propertyKey: {
					type: "string"
				},

				/**
				 * Label for the item, either as a string literal or by a pointer, using the binding to some property containing the label.
				 */
				label: {
					type: "string"
				},

				/**
				 * Specifies the type of the item for the chart (groupable and aggregatable).
				 * This is specific for the used chart library.
				 */
				type: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Specifies the role of the item for the chart (category, axis1...).
				 * This is specific for the used chart library.<br>
				 * <b>Note:</b> This property must not be changed after initialization.
				 */
				role: {
					type: "string"
				}
			}

		}
	});

	//Temporary fallback for compatibility until the dataProperty can be removed
	Item.prototype.getPropertyKey = function() {
		const sPropertyKey = this.getProperty("propertyKey");
		return sPropertyKey || undefined;
	};

	return Item;

});