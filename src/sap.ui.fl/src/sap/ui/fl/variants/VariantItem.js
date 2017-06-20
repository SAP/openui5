/*
 * ! ${copyright}
 */

// Provides control sap.ui.fl.variants.VariantItem.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Item'
], function(jQuery, Item) {
	"use strict";

	/**
	 * Constructor for a new variants/VariantItem.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The VariantItem class describes a variant item.
	 * @extends sap.ui.core.Item
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.ui.fl.variants.VariantItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VariantItem = Item.extend("sap.ui.fl.variants.VariantItem", /** @lends sap.ui.fl.variants.VariantItem.prototype */
	{
		metadata: {

			library: "sap.ui.fl",
			properties: {

				/**
				 * Attribute for usage in <code>SmartFilterBar</code>
				 */
				executeOnSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * If set to <code>false</code>, the user is allowed to change the item's data
				 */
				readOnly: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicator if a variant is visible for all users.
				 */
				global: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * ABAP package the variant is assigned to. Used for transport functionality.
				 */
				lifecyclePackage: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Identifier of the ABAP transport object the variant is assigned to.
				 */
				lifecycleTransportId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Variant namespace
				 */
				namespace: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Indicates if the variant title can be changed.
				 */
				textReadOnly: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Author of the variant
				 */
				author: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	return VariantItem;

}, /* bExport= */true);
