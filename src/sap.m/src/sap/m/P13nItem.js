/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nItem.
sap.ui.define([
	'./library', 'sap/ui/core/Element'
], function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new P13nItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Base type for <code>items</code> aggregation in <code>P13nPanel</code> control.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.P13nItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nItem = Element.extend("sap.m.P13nItem", /** @lends sap.m.P13nItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * Can be used as input for subsequent actions.
				 */
				columnKey: {
					type: "string",
					group: "Data",
					defaultValue: null
				},
				/**
				 * The text to be displayed for the item.
				 */
				text: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Defines visibility of column
				 */
				visible: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * data type of the column (text, numeric or date is supported)
				 */
				type: {
					type: "string",
					group: "Misc",
					defaultValue: "text"
				},

				/**
				 * data type instance of the column. Can be used instead of the type, precision, scale and formatSettings properties
				 */
				typeInstance: {
					type: "object",
					group: "Misc",
					defaultValue: null,
					since: "1.56"
				},

				/**
				 * if type==numeric the precision will be used to format the entered value (maxIntegerDigits of the used Formatter)
				 */
				precision: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * A JSON object containing the formatSettings which will be used to pass additional type/format settings for the entered value.
				 * if type==time or date or datetime the object will be used for the DateFormatter, TimeFormatter or DateTimeFormatter
				 *
				 *<i>Below you can find a brief example</i>
				 *
				 * <pre><code>
				 * {
				 *		UTC: false,
				 * 		style: "medium" //"short" or "long"
				 * }
				 * </code></pre>
				 */
				formatSettings: {
					type: "object",
					group: "Misc",
					defaultValue: null,
					since: "1.52"
				},

				/**
				 * if type==numeric the scale will be used to format the entered value (maxFractionDigits of the used Formatter)
				 */
				scale: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * specifies the number of characters which can be entered in the value fields of the condition panel
				 */
				maxLength: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines column width
				 */
				width: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * the column with isDefault==true will be used as the selected column item on the conditionPanel
				 */
				isDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * the array of values for type bool. e.g. ["", "Off", "On"]. The first entry can be empty (used to blank the value field). Next value
				 * represent the false value, last entry the true value.
				 *
				 * @since 1.34.0
				 */
				values: {
					type: "string[]",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines role. The role is reflected in the manner how the dimension will influence the chart layout.
				 *
				 * @since 1.34.0
				 */
				role: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines aggregation role
				 *
				 * @since 1.34.0
				 */
				aggregationRole: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines href of a link.
				 *
				 * @since 1.46.0
				 */
				href: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines target of a link.
				 */
				target: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines press handler of a link.
				 *
				 * @since 1.46.0
				 */
				press: {
					type: "object",
					defaultValue: null
				},
				/**
				 * Defines additional information of the link.
				 *
				 * @since 1.56.0
				 */
				description: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines if the item is nullable
				 */
				nullable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			}
		}
	});

	return P13nItem;

});
