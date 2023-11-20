/*!
 * ${copyright}
 */

// Provides control sap.m.ViewSettingsFilterItem.
sap.ui.define(['./ViewSettingsItem', './library'],
	function(ViewSettingsItem, library) {
	"use strict";



	/**
	 * Constructor for a new ViewSettingsFilterItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A ViewSettingsFilterItem control is used for modelling filter behaviour in the ViewSettingsDialog.
	 * It is derived from a core Item, but does not support the base class properties like textDirection and enabled.
	 * Setting these properties will not have any effects.
	 * @extends sap.m.ViewSettingsItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ViewSettingsFilterItem
	 */
	var ViewSettingsFilterItem = ViewSettingsItem.extend("sap.m.ViewSettingsFilterItem", /** @lends sap.m.ViewSettingsFilterItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * If set to (true), multi selection will be allowed for the items aggregation.
			 */
			multiSelect : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		aggregations : {

			/**
			 * Items with key and value that are logically grouped under this filter item.
			 * They are used to display filter details in the ViewSettingsDialog.
			 */
			items : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "item", bindable: "bindable"}
		},
		events : {
			/**
			 * Let the outside world know that the filter detail aggregation was changed.
			 * @private
			 */
			filterDetailItemsAggregationChange: {}
		}
	}});

		/**
		 * Attach events and fire events about the added aggregation.
		 * @param {object} oObject Instance to which to attach events
		 * @private
		 */
	ViewSettingsFilterItem.prototype._handleNewAggregationEvents = function (oObject) {
		// Attach 'itemPropertyChanged' handler, that will re-initiate (specific) dialog content
		oObject.attachEvent('itemPropertyChanged', function (oEvent) {
			this.fireItemPropertyChanged({
				changedItem     : oEvent.getParameter('changedItem'),
				propertyKey     : oEvent.getParameter('propertyKey'),
				propertyValue   : oEvent.getParameter('propertyValue')
			});
		}.bind(this));
		this.fireFilterDetailItemsAggregationChange({
			item: oObject
		});
	};


		/**
		 * Override the method in order to attach an event handler responsible for propagating item property changes.
		 * @override
		 * @param {string} sAggregationName Name of the added aggregation
		 * @param {object} oObject Intance that is going to be added
		 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be supressed
		 * @returns {this} This instance for chaining
		 */
	ViewSettingsFilterItem.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		ViewSettingsItem.prototype.addAggregation.apply(this, arguments);
		this._handleNewAggregationEvents(oObject);
		return this;
	};


	/**
	 * Inserts an entity to the aggregation named <code>sAggregationName</code> at position <code>iIndex</code>.
	 *
	 * @param {string} sAggregationName The name of the aggregation
	 * @param {any} oObject The value of the aggregation to be inserted
	 * @param {int} iIndex The index of the position of the entity to be inserted
	 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
	 * @returns {this} <code>this</code> pointer for chaining
	 * @override
	 */
	ViewSettingsFilterItem.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		ViewSettingsItem.prototype.insertAggregation.apply(this, arguments);
		this._handleNewAggregationEvents(oObject);
		return this;
	};

	/**
	 * Removes an entity from the aggregation named <code>sAggregationName</code>.
	 *
	 * @param {string} sAggregationName The name of the aggregation
	 * @param {any} oObject The value of aggregation to be removed
	 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
	 * @returns {this} <code>this</code> pointer for chaining
	 * @override
	 */
	ViewSettingsFilterItem.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		ViewSettingsItem.prototype.removeAggregation.apply(this, arguments);
		this.fireFilterDetailItemsAggregationChange();
		return this;
	};

	/**
	 * Removes all objects from the aggregation named <code>sAggregationName</code>.
	 *
	 * @param {string} sAggregationName The name of aggregation
	 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
	 * @returns {this} <code>this</code> pointer for chaining
	 * @override
	 */
	ViewSettingsFilterItem.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		ViewSettingsItem.prototype.removeAllAggregation.apply(this, arguments);
		this.fireFilterDetailItemsAggregationChange();
		return this;
	};

	/**
	 * Destroys all the entities in the aggregation named <code>sAggregationName</code>.
	 *
	 * @param {string} sAggregationName The name of aggregation
	 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
	 * @returns {this} <code>this</code> pointer for chaining
	 * @override
	 */
	ViewSettingsFilterItem.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		ViewSettingsItem.prototype.destroyAggregation.apply(this, arguments);
		this.fireFilterDetailItemsAggregationChange();
		return this;
	};



	return ViewSettingsFilterItem;

});
