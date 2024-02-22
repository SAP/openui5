/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], (Element) => {
	"use strict";

	/**
	 * Constructor for a new <code>SelectionButtonItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @private
	 * @since 1.122
	 * @alias sap.ui.mdc.chart.SelectionButtonItem
	 */
	const Item = Element.extend("sap.ui.mdc.chart.SelectionButtonItem", /** @lends sap.ui.mdc.chart.SelectionButtonItem.prototype */ {
		metadata: {
			"abstract": false,
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The unique identifier of the item that reflects the name of the data property in the resulting data set.
				 */
				key: {
					type: "string"
				},
				/**
				 * The tooltipof the item.
				 */
				tooltip: {
					type: "string"
				},
				/**
				 * Label for the item, either as a string literal or by a pointer, using the binding to some property containing the label.
				 */
				text: {
					type: "string"
				},
				/**
				 * Specifies the icon of the item.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				}
			}

		}
	});

	return Item;

});