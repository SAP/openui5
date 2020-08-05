/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Item.
sap.ui.define(['sap/ui/core/Element',
	'sap/ui/core/IconPool',
	'./TabStripItem',
	'./library'],
	function(Element, IconPool, TabStripItem, library) {
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
				 * Determines additional text to be displayed for the item.
				 * @experimental
				 * since 1.63 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				additionalText : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * Defines the icon to be displayed as graphical element within the <code>TabContainerItem</code>.
				 * It can be an image or an icon from the icon font.
				 * @experimental
				 * since 1.63 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

				/**
				 * Determines the tooltip text of the <code>TabContainerItem</code>'s icon.
				 * @experimental
				 * since 1.63 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				iconTooltip : {type : "string", group : "Accessibility", defaultValue : null},

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
				content : {type : "sap.ui.core.Control", multiple : true, defaultValue : null},

				/**
				 *
				 * Icon / Image for the <code>TabContainerItem</code> are managed in this aggregation.
				 */
				_image: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
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
			},
			dnd: { draggable: true, droppable: false }
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
			this.fireItemPropertyChanged({
				itemChanged : this,
				propertyKey : sName,
				propertyValue : vValue
			});

			return Element.prototype.setProperty.call(this, sName, vValue, bSuppressInvalidation);
		};


		/**
		 * Property setter for the icon
		 *
		 * @param {sap.ui.core.URI} sIcon new value of the Icon property
		 * @return {sap.m.TabContainerItem} <code>this</code> to allow method chaining
		 * @public
		 */
		TabContainerItem.prototype.setIcon = function(sIcon) {
			return TabStripItem.prototype._setIcon.call(this, sIcon, true);
		};

		/**
		 * Function is called when image control needs to be loaded.
		 *
		 * @param {string} sImgId - id to be used for the image
		 * @param {sap.ui.core.URI} sSrc - URI indicating the image to use as image source
		 * @return {sap.m.TabContainerItem} this to allow method chaining
		 * @private
		 */
		TabContainerItem.prototype._getImage = function () {
			return this.getAggregation("_image");
		};

		return TabContainerItem;
});
