/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	"sap/ui/core/Lib"
], function(Element, Library) {
	"use strict";

	/**
	 * Constructor for a new ContactDetailsItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.link.ContactDetailsItem
	 */
	const ContactDetailsItem = Element.extend("sap.ui.mdc.link.ContactDetailsItem", /** @lends sap.ui.mdc.link.ContactDetailsItem.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					sectionTitle: {
						type: "string",
						defaultValue: Library.getResourceBundleFor("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE")
					},
					photo: {
						type: "string"
					},
					formattedName: {
						type: "string"
					},
					role: {
						type: "string"
					},
					title: {
						type: "string"
					},
					org: {
						type: "string"
					},
					parameters: {
						type: "object"
					}
				},
				defaultAggregation: "emails",
				aggregations: {
					emails: {
						type: "sap.ui.mdc.link.ContactDetailsEmailItem",
						multiple: true,
						singularName: "email"
					},
					phones: {
						type: "sap.ui.mdc.link.ContactDetailsPhoneItem",
						multiple: true,
						singularName: "phone"
					},
					addresses: {
						type: "sap.ui.mdc.link.ContactDetailsAddressItem",
						multiple: true,
						singularName: "address"
					}
				}
			}
		});

	return ContactDetailsItem;

});
