/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new ContactDetailsEmailItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.link.ContactDetailsEmailItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ContactDetailsEmailItem = Element.extend("sap.ui.mdc.link.ContactDetailsEmailItem", /** @lends sap.ui.mdc.link.ContactDetailsEmailItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Email address
				 */
				uri: {
					type: "string"
				},
				types: {
					type: "sap.ui.mdc.ContactDetailsEmailType[]",
					defaultValue: []
				}
			}
		}
	});

	return ContactDetailsEmailItem;

});
