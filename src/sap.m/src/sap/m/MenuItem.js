/*!
 * ${copyright}
 */

// Provides control sap.m.MenuItem.
sap.ui.define([
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Element',
	'sap/ui/core/Item',
	'sap/ui/base/ManagedObjectObserver'
], function(
	library,
	coreLibrary,
	Element,
	Item,
	ManagedObjectObserver
) {
		"use strict";


		// shortcut for sap.ui.core.ItemSelectionMode
		var ItemSelectionMode = coreLibrary.ItemSelectionMode;

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
		 * @implements sap.m.IMenuItem
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.38
		 * @alias sap.m.MenuItem
		 */
		var MenuItem = Item.extend("sap.m.MenuItem", /** @lends sap.m.MenuItem.prototype */ { metadata : {

			interfaces: [
				"sap.m.IMenuItem"
			],
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
				 * Determines whether the <code>MenuItem</code> is selected.
				 * A selected <code>MenuItem</code> has a check mark rendered at its end.
				 * <b>Note: </b> selection functionality works only if the menu item is a member of <code>MenuItemGroup</code> with
				 * <code>itemSelectionMode</code> set to {@link sap.ui.core.ItemSelectionMode.SingleSelect} or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}.
				 * @since 1.127.0
				 */
				selected : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines the shortcut text that should be displayed on the menu item on non-mobile devices.
				 * <b>Note:</b> The text is only displayed and set as а value of the <code>aria-keyshortcuts</code> attribute.
				 */
				shortcutText : {type : "string", group : "Appearance", defaultValue : ''},

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
				items: { type: "sap.m.IMenuItem", multiple: true, singularName: "item", bindable: "bindable" }

			},
			associations : {

				/**
				 * MenuItemGroup associated with this item.
				 */
				_group : {type : "sap.ui.unified.MenuItemGroup",  group : "Behavior", visibility : "hidden"}

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
						aggregationName : {type: "string"},

						/**
						 * Which method changed the aggregation.
						 */
						methodName: {type: "string"},

						/**
						 * What parameters were used to change the aggregation.
						 */
						methodParams: {type: "object"}
					}
				}

			}
		}});

		MenuItem.UNIFIED_MENU_ITEMS_ID_SUFFIX = '-unifiedmenu';

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
			this.fireEvent("propertyChanged", {propertyKey: sPropertyKey, propertyValue: vPropertyValue }, false, true);
		};

		MenuItem.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			Item.prototype.setAggregation.apply(this, arguments);

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "set", methodParams: { item: oObject } }, false, true);

			return this;
		};

		MenuItem.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var oVisualItemId = this._getVisualControl(),
				oVisualItem;

			Item.prototype.addAggregation.apply(this, arguments);

			if (sAggregationName === 'customData' && oVisualItemId) {
				oVisualItem = Element.getElementById(oVisualItemId);
				this._addCustomData(oVisualItem, oObject);
			}

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "add", methodParams: { item: oObject } }, false, true);

			return this;
		};

		MenuItem.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			var oVisualItemId = this._getVisualControl(),
				oVisualItem;

			Item.prototype.insertAggregation.apply(this, arguments);

			if (sAggregationName === 'customData' && oVisualItemId) {
				oVisualItem = Element.getElementById(oVisualItemId);
				oVisualItem.insertCustomData(oObject.clone(MenuItem.UNIFIED_MENU_ITEMS_ID_SUFFIX), iIndex);
				this._observeCustomDataChanges(oObject);
			}

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "insert", methodParams: { item: oObject, index: iIndex }}, false, true);

			return this;
		};

		MenuItem.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			var oObject = Item.prototype.removeAggregation.apply(this, arguments);

			if (sAggregationName === "customData") {
				if (this.getCustomData().length === 1) {
					this._disconnectAndDestroyCustomDataObserver();
				} else if (vObject && this._oCustomDataObserver) {
					this._oCustomDataObserver.unobserve(vObject, {
						properties: ["value"]
					});
				}
			}

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "remove", methodParams: { item: oObject }}, false, true);

			return oObject;
		};

		MenuItem.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			var aObjects = Item.prototype.removeAllAggregation.apply(this, arguments);

			if (sAggregationName === 'customData') {
				this._disconnectAndDestroyCustomDataObserver();
			}

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "removeall", methodParams: { items: aObjects }}, false, true);

			return aObjects;
		};

		MenuItem.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === 'customData') {
				this._disconnectAndDestroyCustomDataObserver();
			}

			this.fireEvent("aggregationChanged", { aggregationName: sAggregationName, methodName: "destroy"}, false, true);
			return Item.prototype.destroyAggregation.apply(this, arguments);
		};

		MenuItem.prototype.destroy = function() {
			var oVisualControl = Element.getElementById(this._getVisualControl());

			if (oVisualControl) {
				oVisualControl.destroy();
			}

			return Item.prototype.destroy.apply(this, arguments);
		};

		MenuItem.prototype.addEventDelegate = function (oDelegate, oThis) {
			Item.prototype.addEventDelegate.apply(this, arguments);

			if (this._getVisualControl()) {
				var oVisualControl = Element.getElementById(this._getVisualControl());
				oVisualControl.addEventDelegate(oDelegate, oThis);
			}

			return this;
		};

		MenuItem.prototype.removeEventDelegate = function (oDelegate) {
			Item.prototype.removeEventDelegate.apply(this, arguments);

			if (this._getVisualControl()) {
				var oVisualControl = Element.getElementById(this._getVisualControl());
				oVisualControl.removeEventDelegate(oDelegate);
			}

			return this;
		};

		/**
		 * Sets the <code>selected</code> state of the <code>MenuItem</code> if it is allowed.
		 *
		 * @override
		 * @param {boolean} bState Whether the menu item should be selected
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 */
		MenuItem.prototype.setSelected = function(bState) {
			var oGroup = Element.getElementById(this.getAssociation("_group"));

			// in case of single selection, clear selected state of all other items in the group to ensure that only one item is selected
			if (bState && oGroup && oGroup.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
				oGroup._clearSelectedItems();
			}

			this.setProperty("selected", bState);

			return this;
		};

		/**
		 * Observes the value property of the passed menu item
		 *
		 * @param {sap.ui.unified.MenuItem} oVisualItem the sap.ui.unified.MenuItem, which property will be observed
		 * @param {sap.ui.core.CustomData} oCustomData the custom data, which property will be observed
		 * @private
		 */
		MenuItem.prototype._addCustomData = function (oVisualItem, oCustomData) {
			oVisualItem.addCustomData(oCustomData.clone(MenuItem.UNIFIED_MENU_ITEMS_ID_SUFFIX, undefined, { bCloneChildren: false, bCloneBindings: true }));
			this._observeCustomDataChanges(oCustomData);
		};

		/**
		 * Observes the value property of the passed menu item
		 *
		 * @param {sap.ui.core.CustomData} oCustomData the custom data, which property will be observed
		 * @private
		 */
		MenuItem.prototype._observeCustomDataChanges = function (oCustomData) {
			this._getCustomDataObserver().observe(oCustomData, {
				properties: ["value"]
			});
		};

		/**
		 * Sets the value property of the inner sap.ui.unified.MenuItem
		 *
		 * @param {object} oChanges the detected from the ManagedObjectObserver changes
		 * @private
		 */
		MenuItem.prototype._customDataObserverCallbackFunction = function (oChanges) {
			Element.getElementById(oChanges.object.getId() + "-" + MenuItem.UNIFIED_MENU_ITEMS_ID_SUFFIX).setValue(oChanges.current);
		};

		/**
		 * Returns the ManagedObjectObserver for the custom data
		 *
		 * @return {sap.ui.base.ManagedObjectObserver} the custom data observer object
		 * @private
		 */
		MenuItem.prototype._getCustomDataObserver = function () {
			if (!this._oCustomDataObserver) {
				this._oCustomDataObserver = new ManagedObjectObserver(this._customDataObserverCallbackFunction);
			}
			return this._oCustomDataObserver;
		};

		/**
		 * Disconnects and destroys the ManagedObjectObserver observing the menu items
		 *
		 * @private
		 */
		MenuItem.prototype._disconnectAndDestroyCustomDataObserver = function () {
			if (this._oCustomDataObserver) {
				this._oCustomDataObserver.disconnect();
				this._oCustomDataObserver.destroy();
				this._oCustomDataObserver = null;
			}
		};

		//Internal methods used to identify the item in the Menu's hierarchy.

		/**
		 * Sets visual child of the control (unified Menu).
		 * @private
		 */
		MenuItem.prototype._setVisualChild = function(vControl) {
			this._setInternalRef(vControl, "_sVisualChild");
		};

		/**
		 * Sets visual parent of the control (unified Menu).
		 * @private
		 */
		MenuItem.prototype._setVisualParent = function(vControl) {
			this._setInternalRef(vControl, "_sVisualParent");
		};

		/**
		 * Sets visual control of the control (unified MenuItem).
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
		 * Gets visual child of the control (unified Menu).
		 * @private
		 */
		MenuItem.prototype._getVisualChild = function() {
			return this._sVisualChild;
		};

		/**
		 * Gets visual parent of the control (unified Menu).
		 * @private
		 */
		MenuItem.prototype._getVisualParent = function() {
			return this._sVisualParent;
		};

		/**
		 * Gets visual control of the control (unified MenuItem).
		 * @private
		 */
		MenuItem.prototype._getVisualControl = function() {
			return this._sVisualControl;
		};

		MenuItem.prototype._getItems = function() {
			var aItems = [];

			const findItems = (aItemItems) => {
				aItemItems.forEach((oItem) => {
					if (!oItem.getItemSelectionMode) {
						aItems.push(oItem);
					} else {
						findItems(oItem.getItems());
					}
				});
			};

			findItems(this.getItems());
			return aItems;
		};

		return MenuItem;

	});
