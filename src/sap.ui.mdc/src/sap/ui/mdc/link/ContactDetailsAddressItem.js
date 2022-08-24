/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new ContactDetailsAddressItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.link.ContactDetailsAddressItem
	 */
	var ContactDetailsAddressItem = Element.extend("sap.ui.mdc.link.ContactDetailsAddressItem", /** @lends sap.ui.mdc.link.ContactDetailsAddressItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				street: {
					type: "string"
				},
				code: {
					type: "string"
				},
				locality: {
					type: "string"
				},
				region: {
					type: "string"
				},
				country: {
					type: "string"
				},
				types: {
					type: "sap.ui.mdc.ContactDetailsAddressType[]",
					defaultValue: []
				}
			}
		}
	});

	return ContactDetailsAddressItem;

});
