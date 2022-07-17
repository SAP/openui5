/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/library', 'sap/ui/core/Item'
], function(library, Item) {
	"use strict";

	/**
	 * Constructor for a new sap.m.VariantItem.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The VariantItem class describes a variant item.
	 * @extends sap.ui.core.Item
	 * @constructor
	 * @public
	 * @alias sap.m.VariantItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VariantItem = Item.extend("sap.m.VariantItem", /** @lends sap.m.VariantItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Contains the information is the item is public or private.
				 */
				sharing: {
					type: "string",
					group: "Misc",
					defaultValue: "private"
				},

				/**
				 * Indicates if the item is removable.
				 */
				remove: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates if the item is marked as favorite.
				 */
				favorite: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Contains the initial value of the property <code>favorite</code>. Is used for cancel operations.
				 */
				originalFavorite: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the item is marked as apply automatically.
				 */
				executeOnSelect: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Contains the initial value of the property <code>executeOnSelect</code>. Is used for cancel operations.
				 */
				originalExecuteOnSelect: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates if the item is renamable.
				 */
				rename: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Contains the title if the item.
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Contains the initial value of the property <code>title</code>. Is used for cancel operations.
				 */
				originalTitle: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Indicates if the item is visible.
				 */
				visible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the item is changeable.
				 */
				changeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Contains the author information of the item.
				 */
				author: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Contains the contexts information of the item.
				 */
				contexts: {
					type: "object",
					group: "Misc",
					defaultValue: {}
				},

				/**
				 * Contains the initial value of the property <code>contexts</code>. Is used for cancel operations.
				 */
				originalContexts:{
					type: "object",
					group: "Misc",
					defaultValue: {}
				}
			}
		}
	});

	return VariantItem;
});