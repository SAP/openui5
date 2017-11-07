/*!
 * ${copyright}
 */

// Provides control sap.m.MenuItem.
sap.ui.define(['./library', 'sap/ui/core/Item'],
	function(library, Item) {
		"use strict";



		/**
		 * Constructor for a new <code>MenuItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>MenuItem</code> control is used for creating items for the <code>sap.m.Menu</code>.
		 * It is derived from a core <code>sap.ui.core.Item</code>.
		 * @extends sap.ui.core.Item
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.38
		 * @alias sap.m.MenuItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MenuItem = Item.extend("sap.m.MenuItem", /** @lends sap.m.MenuItem.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Defines the icon, which belongs to the item.
				 * This can be a URI to an image or an icon font URI.
				 */
				icon : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Defines whether the item should be visible on the screen. If set to <code>false</code>,
				 * a placeholder is rendered instead of the real item.
				 */
				visible : {type: "boolean", group : "Appearance", defaultValue: true},

				/**
				 * Defines whether a visual separator should be rendered before the item.
				 * <b>Note:</b> If an item is invisible its separator is also not displayed.
				 */
				startsSection : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Defines the sub-items contained within this element.
				 */
				items: { type: "sap.m.MenuItem", multiple: true, singularName: "item", bindable: "bindable" }
			},
			events: {
				/**
				 * Fired after the item has been pressed.
				 */
				press : {},

				/**
				 * Fired when a property of the item changes.
				 */
				propertyChanged : {
					parameters: {
						/**
						 * The property name to be changed.
						 */
						propertyKey: {type: "string"},
						/**
						 * The new property value.
						 */
						propertyValue:  {type: "any"}
					}
				},

				/**
				 * Fired when aggregation of the item changes.
				 */
				aggregationChanged : {
					parameters: {
						/**
						 * The aggregation name of the changed aggregation.
						 */
						aggregationName : {type: "String"},

						/**
						 * Which method changed the aggregation.
						 */
						methodName: {type: "String"},

						/**
						 * What parameters were used to change the aggregation.
						 */
						methodParams: {type: "Object"}
					}
				}
			}
		}});

		MenuItem.prototype.exit = function() {
			if (this._sVisualChild) {
				this._sVisualChild = null;
			}

			if (this._sVisualParent) {
				this._sVisualParent = null;
			}

			if (this._sVisualControl) {
				this._sVisualControl = null;
			}
		};

		MenuItem.prototype.setProperty = function(sPropertyKey, vPropertyValue) {
			Item.prototype.setProperty.apply(this, arguments);
			this.fireEvent("propertyChanged", {propertyKey: sPropertyKey, propertyValue: vPropertyValue });
		};

		MenuItem.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			Item.prototype.addAggregation.apply(this, arguments);

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "add", methodParams: { item: oObject } });

			return this;
		};

		MenuItem.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			Item.prototype.insertAggregation.apply(this, arguments);

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "insert", methodParams: { item: oObject, index: iIndex }});

			return this;
		};

		MenuItem.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			var oObject = Item.prototype.removeAggregation.apply(this, arguments);

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "remove", methodParams: { item: oObject }});

			return oObject;
		};

		MenuItem.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			var aObjects = Item.prototype.removeAllAggregation.apply(this, arguments);

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "removeall", methodParams: { items: aObjects }});

			return aObjects;
		};

		MenuItem.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "destroy"});
			return Item.prototype.destroyAggregation.apply(this, arguments);
		};

		MenuItem.prototype.destroy = function() {
			var oVisualControl = sap.ui.getCore().byId(this._getVisualControl());

			if (oVisualControl) {
				oVisualControl.destroy();
			}

			return Item.prototype.destroy.apply(this, arguments);
		};

		//Internal methods used to identify the item in the Menu's hierarchy.

		/**
		 * Sets visual child of the control.
		 * @private
		 */
		MenuItem.prototype._setVisualChild = function(vControl) {
			this._setInternalRef(vControl, "_sVisualChild");
		};

		/**
		 * Sets visual parent of the control.
		 * @private
		 */
		MenuItem.prototype._setVisualParent = function(vControl) {
			this._setInternalRef(vControl, "_sVisualParent");
		};

		/**
		 * Sets visual control of the control.
		 * @private
		 */
		MenuItem.prototype._setVisualControl = function(vControl) {
			this._setInternalRef(vControl, "_sVisualControl");
		};

		MenuItem.prototype._setInternalRef = function(vControl, sInternalPropertyName) {
			if (!vControl || typeof vControl === "string") {
				this[sInternalPropertyName] = vControl;
			} else if (vControl.getId) {
				this[sInternalPropertyName] = vControl.getId();
			}
		};

		/**
		 * Gets visual child of the control.
		 * @private
		 */
		MenuItem.prototype._getVisualChild = function() {
			return this._sVisualChild;
		};

		/**
		 * Gets visual parent of the control.
		 * @private
		 */
		MenuItem.prototype._getVisualParent = function() {
			return this._sVisualParent;
		};

		/**
		 * Gets visual control of the control.
		 * @private
		 */
		MenuItem.prototype._getVisualControl = function() {
			return this._sVisualControl;
		};

		return MenuItem;

	});
