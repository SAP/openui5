/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Item.
sap.ui.define(['sap/ui/core/Element'],
	function(Element) {
		"use strict";

		/**
		 * Constructor for a new <code>TabContainerItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * An item to be used in a TabContainer.
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.m.TabContainerItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var TabContainerItem = Element.extend("sap.m.TabContainerItem", /** @lends sap.m.TabContainerItem.prototype */ { metadata : {

			library : "sap.ui.core",
			properties : {

				/**
				 * Determines the text to be displayed for the item.
				 */
				name : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * Determines the name of the item. Can be used as input for subsequent actions.
				 */
				key : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Shows if a control is edited (default is false). Items that are marked as modified have a * symbol to indicate that they haven't been saved.
				 */
				modified : {type : "boolean", group : "Misc", defaultValue : false}
			},
			aggregations : {

				/**
				 * The content displayed for this item.
				 */
				content : {type : "sap.ui.core.Control", multiple : true, defaultValue : null}
			},
			events : {

				/**
				 * Sends information that some of the properties have changed.
				 * @private
				 */
				itemPropertyChanged : {
					parameters: {

						/**
						 * The item changed.
						 */
						itemChanged : {type : "sap.m.TabContainerItem"},

						/**
						 * The key of the property.
						 */
						propertyKey : {type : "string"},

						/**
						 * The value of the property.
						 */
						propertyValue : {type : "any"}
					}
				}
			}
		}});

		/**
		 * Overwrites the method in order to suppress invalidation for some properties.
		 *
		 * @param {string} sName Property name to be set
		 * @param {boolean | string | object} vValue Property value to be set
		 * @param {boolean} bSuppressInvalidation Whether invalidation to be suppressed
		 * @return {sap.m.TabContainerItem} This instance for chaining
		 * @public
		 */
		TabContainerItem.prototype.setProperty = function(sName, vValue, bSuppressInvalidation) {
			if (sName === "modified") {
				bSuppressInvalidation = true;
			}

			this.fireItemPropertyChanged({
				itemChanged : this,
				propertyKey : sName,
				propertyValue : vValue
			});

			return Element.prototype.setProperty.call(this, sName, vValue, bSuppressInvalidation);
		};

		return TabContainerItem;

});
