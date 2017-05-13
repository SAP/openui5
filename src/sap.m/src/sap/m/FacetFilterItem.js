/*!
 * ${copyright}
 */

// Provides control sap.m.FacetFilterItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";



	/**
	 * Constructor for a new <code>FacetFilterItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a value for the {@link sap.m.FacetFilterList} control.
	 * @extends sap.m.ListItemBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FacetFilterItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FacetFilterItem = ListItemBase.extend("sap.m.FacetFilterItem", /** @lends sap.m.FacetFilterItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Can be used as input for subsequent actions.
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Determines the text to be displayed for the item.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the number of objects that match this item in the target data set.
			 * @deprecated Since version 1.18.11. Use setCounter instead.
			 */
			count : {type : "int", group : "Misc", defaultValue : null, deprecated: true}
		}
	}});

	/**
	 * Sets count for the FacetFilterList.
	 * @param {int} iCount The counter to be set to
	 * @returns {sap.m.FacetFilterItem} this for chaining
	 */
	FacetFilterItem.prototype.setCount = function(iCount) {

		 // App dev can still call setCounter on ListItemBase, so we have redundancy here.
		this.setProperty("count", iCount);
		this.setProperty("counter", iCount);
		return this;
	};

	/**
	 * Sets counter for the FacetFilter list.
	 * @param {int} iCount The counter to be set to
	 * @returns {sap.m.FacetFilterItem} this for chaining
	 */
	FacetFilterItem.prototype.setCounter = function(iCount) {

		this.setProperty("count", iCount);
		this.setProperty("counter", iCount);
		return this;
	};

	/**
	 * @private
	 */
	FacetFilterItem.prototype.init = function() {

	  ListItemBase.prototype.init.apply(this);

	  // This class must be added to the ListItemBase container element, not the FacetFilterItem container
	  this.addStyleClass("sapMFFLI");
	};



	return FacetFilterItem;

}, /* bExport= */ true);
