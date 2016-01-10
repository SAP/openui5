/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Item.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";



	/**
	 * Constructor for a new TabContainerItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
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
			 * The text to be displayed for the item.
			 */
			name : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * Can be used as input for subsequent actions.
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Boolean property to show if a control is edited (default is false). Items that are marked as 'modified'
			 * have a star to indicate that they haven't been saved
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
			 * Let the outside world know that some of its properties has changed.
			 * @private
			 */
			itemPropertyChanged : {
				parameters: {
					/**
					 * The item changed
					 */
					itemChanged : {type : "sap.m.TabContainerItem"},
					/**
					 * The key of the property
					 */
					propertyKey : {type : "string"},
					/**
					 * The value of the property
					 */
					propertyValue : {type : "mixed"}
				}
			}
		}
	}});




	/**
	 * Overwrite the method in order to suppress invalidation for some properties.
	 * @param {string} sName
	 * @param {mixed} vValue
	 * @param {boolean} bSuppressInvalidation
	 * @return {object} This instance for chaining
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

		return sap.ui.core.Control.prototype.setProperty.call(this, sName, vValue, bSuppressInvalidation);
	};

	return TabContainerItem;

});
