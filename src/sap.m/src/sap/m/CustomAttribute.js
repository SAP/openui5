/*!
* ${copyright}
*/

sap.ui.define([
	'sap/ui/core/Control'
], function (
    Control
    ) {
	"use strict";

	/**
	 * Constructor for a new ElementAttribute.
	 *
	 * @class
	 * Holds details of an attribute used in the ActionTile.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @private
	 * @since 1.107.0
	 * @alias sap.m.CustomAttribute
	 */

	var CustomAttribute = Control.extend("sap.m.CustomAttribute", /** @lends sap.m.CustomAttribute.prototype */{
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Label of the attribute. If set to null, the label is not displayed.
				 */
				label: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Value of the attribute. If set to null, the value is not displayed.
				 */
				value: {
					type: "string", group: "Misc", defaultValue: null
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {}
		}
	});

    return CustomAttribute;
});
