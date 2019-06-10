/*!
 * ${copyright}
 */

// Provides control sap.m.SelectList.
sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/Item',
	'./SelectListRenderer',
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
],
	function(library, Core, Control, ItemNavigation, Item, SelectListRenderer, jQuery) {
		"use strict";

		// shortcut for sap.m.touch
		var touch = library.touch;

		// shortcut for sap.m.SelectListKeyboardNavigationMode
		var SelectListKeyboardNavigationMode = library.SelectListKeyboardNavigationMode;

		/**
		 * Constructor for a new <code>sap.m.SelectList</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.SelectList</code> displays a list of items that allows the user to select an item.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.26.0
		 * @alias sap.m.SelectList
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var SelectList = Control.extend("sap.m.SelectList", /** @lends sap.m.SelectList.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Indicates whether the user can change the selection.
					 */
					enabled: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					},

					/**
					 * Sets the width of the control.
					 */
					width: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "auto"
					},

					/**
					 * Sets the maximum width of the control.
					 */
					maxWidth: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%"
					},

					/**
					 * Key of the selected item.
					 *
					 * <b>Note: </b> If duplicate keys exist, the first item matching the key is used.
					 */
					selectedKey: {
						type: "string",
						group: "Data",
						defaultValue: ""
					},

					/**
					 * ID of the selected item.
					 */
					selectedItemId: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},

					/**
					 * Indicates whether the text values of the <code>additionalText</code> property of a
					 * {@link sap.ui.core.ListItem} are shown.
					 * @since 1.32.3
					 */
					showSecondaryValues: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					},

					/**
					 * Defines the keyboard navigation mode.
					 *
					 * <b>Note:</b> The <code>sap.m.SelectListKeyboardNavigationMode.None</code> enumeration value,
					 * is only intended for use in some composite controls that handles keyboard navigation by themselves.
					 *
					 * @protected
					 * @since 1.38
					 */
					keyboardNavigationMode: {
						type: "sap.m.SelectListKeyboardNavigationMode",
						group: "Behavior",
						defaultValue: SelectListKeyboardNavigationMode.Delimited
					}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * Defines the items contained within this control.
					 */
					items: {
						type: "sap.ui.core.Item",
						multiple: true,
						singularName: "item",
						bindable: "bindable"
					}
				},
				associations: {

					/**
					 * Sets or retrieves the selected item from the aggregation named items.
					 */
					selectedItem: {
						type: "sap.ui.core.Item",
						multiple: false
					},

					/**
					 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
					 * @since 1.27.0
					 */
					ariaLabelledBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "ariaLabelledBy"
					}
				},
				events: {

					/**
					 * This event is fired when the selection has changed.
					 *
					 * <b>Note: </b> The selection can be changed by pressing a non-selected item or
					 * via keyboard and after the enter or space key is pressed.
					 */
					selectionChange: {
						parameters: {

							/**
							 * The selected item.
							 */
							selectedItem: {
								type: "sap.ui.core.Item"
							}
						}
					},

					/**
					 * This event is fired when an item is pressed.
					 * @since 1.32.4
					 */
					itemPress: {
						parameters: {

							/**
							 * The pressed item.
							 */
							item: {
								type: "sap.ui.core.Item"
							}
						}
					}
				}
			}
		});

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		/**
		 * Sets the selected item by its index.
		 *
		 * @param {int} iIndex
		 * @private
		 */
		SelectList.prototype._setSelectedIndex = function(iIndex, _aItems /* only for internal usage */) {
			var oItem;
			_aItems = _aItems || this.getItems();

			// constrain the new index
			iIndex = (iIndex > _aItems.length - 1) ? _aItems.length - 1 : Math.max(0, iIndex);
			oItem = _aItems[iIndex];

			if (oItem) {

				this.setSelection(oItem);
			}
		};

		SelectList.prototype.updateItems = function(sReason) {
			this.bItemsUpdated = false;

			// note: for backward compatibility and to keep the old data binding behavior,
			// the items should be destroyed before calling .updateAggregation("items")
			this.destroyItems();
			this.updateAggregation("items");
			this.bItemsUpdated = true;

			// Try to synchronize the selection (synchronous), but if any item's key match with the value of the "selectedKey" property,
			// don't force the first enabled item to be selected when the forceSelection property is set to true.
			// It could be possible that the items' properties (models and bindingContext) are not propagated at this point.
			this.synchronizeSelection({
				forceSelection: false
			});

			// the properties (models and bindingContext) should be propagated
			setTimeout(this.synchronizeSelection.bind(this), 0);
		};

		/**
		 * Called when the items aggregation needs to be refreshed.
		 *
		 * <b>Note:</b> This method has been overwritten to prevent <code>updateItems()</code>
		 * from being called when the bindings are refreshed.
		 * @see sap.ui.base.ManagedObject#bindAggregation
		 */
		SelectList.prototype.refreshItems = function() {
			this.bItemsUpdated = false;
			this.refreshAggregation("items");
		};

		/**
		 * Activates an item on the list.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be activated.
		 * @private
		 */
		SelectList.prototype._activateItem = function(oItem) {

			if (oItem instanceof Item && oItem && oItem.getEnabled()) {

				this.fireItemPress({
					item: oItem
				});

				if (this.getSelectedItem() !== oItem) {

					this.setSelection(oItem);
					this.fireSelectionChange({
						selectedItem: oItem
					});
				}
			}
		};

		/**
		 * Retrieves the enabled items DOM references.
		 *
		 * @param {object} [oDomRef] The selectList DOM reference.
		 * @returns {array} The enabled items DOM references.
		 * @private
		 */
		SelectList.prototype._queryEnabledItemsDomRefs = function(oDomRef) {
			var CSS_CLASS = "." + this.getRenderer().CSS_CLASS + "ItemBase";
			oDomRef = oDomRef || this.getDomRef();
			return oDomRef ? Array.prototype.slice.call(oDomRef.querySelectorAll(CSS_CLASS + ":not(" + CSS_CLASS + "Disabled)")) : [];
		};

		SelectList.prototype._handleARIAActivedescendant = function() {
			var oActiveDescendant = jQuery(document.activeElement).control(0),
				oDomRef = this.getDomRef();

			if (oActiveDescendant && oDomRef) {
				oDomRef.setAttribute("aria-activedescendant", oActiveDescendant.getId());
			}
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		SelectList.prototype.init = function() {

			// timeoutID used to cancel the active state added on touchstart
			this._iStartTimeout = 0;

			// id of the active touch point during the touch session
			this._iActiveTouchId = 0;

			// track coordinates of the touch point
			this._fStartX = 0;
			this._fStartY = 0;

			this._oItemNavigation = null;
			this._$ItemPressed = null;
		};

		SelectList.prototype.onBeforeRendering = function() {
			this.synchronizeSelection({
				forceSelection: false
			});
		};

		SelectList.prototype.onAfterRendering = function() {
			if (this.getKeyboardNavigationMode() === SelectListKeyboardNavigationMode.None) {
				this.destroyItemNavigation();
			} else {
				this.createItemNavigation();
			}
		};

		SelectList.prototype.exit = function() {
			this.destroyItemNavigation();
			this._$ItemPressed = null;
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handles the <code>touchstart</code> event on the select list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.ontouchstart = function(oEvent) {

			// only process single touches (only the first active touch point)
			if (touch.countContained(oEvent.touches, this.getId()) > 1 ||
				!this.getEnabled()) {

				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var oTargetTouch = oEvent.targetTouches[0];

			// track the id of the first active touch point
			this._iActiveTouchId = oTargetTouch.identifier;

			// track coordinates of the touch point relative to the viewport to determine movement/scrolling
			this._fStartX = oTargetTouch.pageX;
			this._fStartY = oTargetTouch.pageY;

			// after a delay, set the active state to the pressed item
			// note: the active state should not be set during scrolling
			this._iStartTimeout = setTimeout(function() {
				var oItemDomRef = oEvent.srcControl.$();

				if (oItemDomRef) {

					// add the active state to the pressed item
					oItemDomRef.addClass(this.getRenderer().CSS_CLASS + "ItemBasePressed");
					this._$ItemPressed = oItemDomRef;
				}
			}.bind(this), 100);
		};

		/**
		 * Handles the <code>touchmove</code> event on the select list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.ontouchmove = function(oEvent) {
			var oTouch = null;

			if (!this.getEnabled()) {
				return;
			}

			// find the active touch point
			oTouch = touch.find(oEvent.changedTouches, this._iActiveTouchId);

			// only process the active touch
			if (oTouch && ((Math.abs(oTouch.pageX - this._fStartX) > 10) || (Math.abs(oTouch.pageY - this._fStartY) > 10))) {

				// don't set the active state, there is movement and therefore no click or tap
				clearTimeout(this._iStartTimeout);

				// remove the active state
				if (this._$ItemPressed) {
					this._$ItemPressed.removeClass(this.getRenderer().CSS_CLASS + "ItemBasePressed");
					this._$ItemPressed = null;
				}
			}
		};

		/**
		 * Handles the <code>touchend</code> event on the select list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.ontouchend = function(oEvent) {
			var oTouch = null;

			if (!this.getEnabled()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// find the active touch point
			oTouch = touch.find(oEvent.changedTouches, this._iActiveTouchId);

			// process this event only if the touch we're tracking has changed
			if (oTouch) {

				setTimeout(function() {

					// remove the active state
					if (this._$ItemPressed) {
						this._$ItemPressed.removeClass(this.getRenderer().CSS_CLASS + "ItemBasePressed");
						this._$ItemPressed = null;
					}

					this._iStartTimeout = null;
				}.bind(this), 100);
			}
		};

		/**
		 * Handles the <code>touchcancel</code> event on the select list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.ontouchcancel = SelectList.prototype.ontouchend;

		/**
		 * Handles the <code>tap</code> event on the select list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.ontap = function(oEvent) {
			if (this.getEnabled()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();
				this._activateItem(oEvent.srcControl);
			}
		};

		/**
		 * Handles when the space or enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SelectList.prototype.onsapselect = function(oEvent) {

			if (this.getEnabled()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();

				// note: prevent document scrolling when space keys is pressed
				oEvent.preventDefault();

				this._activateItem(oEvent.srcControl);
			}
		};

		/**
		 * Handle after an item is focused.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 */
		SelectList.prototype.onAfterFocus = function(oControlEvent) {
			this._handleARIAActivedescendant();
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* protected methods                                           */
		/* ----------------------------------------------------------- */

		/*
		 * Retrieves the first enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 */
		SelectList.prototype.findFirstEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getEnabled()) {
					return aItems[i];
				}
			}

			return null;
		};

		/**
		 * Updates and synchronizes <code>selectedItem</code> association, <code>selectedItemId</code> and <code>selectedKey</code> properties.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem
		 * @protected
		 */
		SelectList.prototype.setSelection = function(vItem) {
			this.setAssociation("selectedItem", vItem, true);
			this.setProperty("selectedItemId", (vItem instanceof Item) ? vItem.getId() : vItem);

			if (typeof vItem === "string") {
				vItem = Core.byId(vItem);
			}

			this.setProperty("selectedKey", vItem ? vItem.getKey() : "", true);
			return this;
		};

		/*
		 * Synchronize selected item and key.
		 *
		 * @protected
		 */
		SelectList.prototype.synchronizeSelection = function(mOptions) {

			var sKey = this.getSelectedKey(),
				vItem = this.getItemByKey("" + sKey),	// find the first item with the given key
				bForceSelection = true;

			if (mOptions) {
				bForceSelection = !!mOptions.forceSelection;
			}

			// the "selectedKey" property is set and it is synchronized with the "selectedItem" association
			if (this.isSelectionSynchronized({
				selectedKey: sKey,
				firstItemWithKey: vItem,
				forceSelection: bForceSelection
			})) {
				return;
			}

			// there is an item that match with the "selectedKey" property and
			// it does not have the default value
			if (vItem && (sKey !== "")) {

				// update and synchronize "selectedItem" association and "selectedKey" property
				this.setAssociation("selectedItem", vItem, true);
				this.setProperty("selectedItemId", vItem.getId(), true);

			// the aggregation items is not bound or
			// it is bound and the data is already available
			} else if (bForceSelection && this.getDefaultSelectedItem() && (!this.isBound("items") || this.bItemsUpdated)) {
				this.setSelection(this.getDefaultSelectedItem());
			}
		};

		/*
		 * Determines whether the <code>selectedItem</code> association and <code>selectedKey</code> property are synchronized.
		 *
		 * @param {object} sSelectedKey current selectedKey
		 * @param {object} vFirstItemWithKey first item with key equal to selectedKey
		 * @param {boolean} bForceSelection is force selection enabled
		 *
		 * @returns {boolean}
		 * @protected
		 */
		SelectList.prototype.isSelectionSynchronized = function(mOptions) {
			var vSelectedItem = this.getSelectedItem(),
				sSelectedKey,
				vFirstItemWithKey,
				bForceSelection;

			if (mOptions) {
				sSelectedKey = mOptions.selectedKey;
				vFirstItemWithKey = mOptions.firstItemWithKey;
				bForceSelection = mOptions.forceSelection;
			} else {
				// FallBack - if the method is used without configuration
				sSelectedKey = this.getSelectedKey();
				vFirstItemWithKey = this.getItemByKey(sSelectedKey);
				bForceSelection = this.getForceSelection();
			}

			if (bForceSelection) { // Upon force selection we need to have at minimum a "selectedItem"

				if (!vSelectedItem) {
					// If we don't have "selectedItem" - we need synchronization
					return false;
				}

				if (sSelectedKey === "" && vSelectedItem.getKey() === "") {
					// If we have "selectedItem" with empty string as "key" and "selectedKey" is equal to it's default
					// value we don't need synchronization. As the "selectedKey" is equal to empty string it will be
					// wrong to check if this is the first item in the list with that "key"
					return true;
				}

				// If the "selectedKey" is equal to the "selectedItem" key and the "selectedItem" is the first item
				// in the list with that "key" - we don't need synchronization
				return sSelectedKey === vSelectedItem.getKey() && vSelectedItem === vFirstItemWithKey;

			} else { // Force selection is false so it's not mandatory to have a "selectedItem"

				if (vSelectedItem === null && sSelectedKey === "") {
					// If "selectedItem" and "selectedKey" are both having their default values we don't need synchronization
					return true;
				}

				if (sSelectedKey === "") {
					// In this case "selectedKey" is equal to it's default value and we have vSelectedItem we need synchronization
					return false;
				}

				// In this case we test that we have a "selectedItem" with "key" matching the "selectedKey" and it is
				// the first item in the list with that "key" - in this case we don't need synchronization
				return sSelectedKey === (vSelectedItem && vSelectedItem.getKey()) && vSelectedItem === vFirstItemWithKey;
			}

		};

		/*
		 * Returns force selection status
		 * @returns {boolean}
		 * @private
		 */
		SelectList.prototype.getForceSelection = function() {
			return false;
		};

		/*
		 * Retrieves the last enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 */
		SelectList.prototype.findLastEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();
			return this.findFirstEnabledItem(aItems.reverse());
		};

		/*
		 * Gets the visible <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]}
		 * @protected
		 */
		SelectList.prototype.getVisibleItems = function() {
			for (var i = 0, oItem, aItems = this.getItems(), aVisiblesItems = []; i < aItems.length; i++) {
				oItem = aItems[i];

				if (oItem.bVisible || (oItem.bVisible === undefined)) {
					aVisiblesItems.push(oItem);
				}
			}

			return aVisiblesItems;
		};

		/*
		 * Retrieves the selectables items from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item[]} An array containing the selectables items.
		 * @protected
		 */
		SelectList.prototype.getSelectableItems = function() {
			return this.getEnabledItems(this.getVisibleItems());
		};

		/*
		 * Retrieves an item by searching for the given property/value from the aggregation named <code>items</code>.
		 *
		 * <code>Note: </code> If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sProperty An item property.
		 * @param {string} sValue An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @protected
		 */
		SelectList.prototype.findItem = function(sProperty, sValue) {
			var sMethod = "get" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

			for (var i = 0, aItems = this.getItems(); i < aItems.length; i++) {
				if (aItems[i][sMethod]() === sValue) {
					return aItems[i];
				}
			}

			return null;
		};

		/*
		 * Retrieves the item with the given value from the aggregation named <code>items</code>.
		 *
		 * <code>Note: </code> If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sText An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @protected
		 */
		SelectList.prototype.getItemByText = function(sText) {
			return this.findItem("text", sText);
		};

		/*
		 * Determines whether the provided item is selected.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean}
		 * @protected
		 */
		SelectList.prototype.isItemSelected = function(oItem) {
			return oItem && (oItem.getId() === this.getAssociation("selectedItem"));
		};

		/**
		 * Returns how many items, which are not separators, are in the SelectList
		 *
		 * returns {int}
		 * @private
		 */
		SelectList.prototype._getNonSeparatorItemsCount = function () {
			return this.getItems().filter(function(oItem) {
				return !(oItem instanceof sap.ui.core.SeparatorItem);
			}).length;
		};

		/**
		 * Retrieves the default selected item from the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item[]} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 */
		SelectList.prototype.getDefaultSelectedItem = function(aItems) {
			return null;
		};

		/**
		 * Clear the selection.
		 *
		 * @protected
		 */
		SelectList.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/*
		 * Creates the item navigation.
		 *
		 */
		SelectList.prototype.createItemNavigation = function() {
			var oDomRef;

			// initialize the item navigation and add apply it to the control (only once)
			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigation(null, null, !this.getEnabled() /* not in tab chain */);
				this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this.onAfterFocus, this);
				this._oItemNavigation.setDisabledModifiers({
					// Alt + arrow keys are reserved for browser navigation
					sapnext: [
						"alt", // Windows and Linux
						"meta" // Apple (⌘)
					],
					sapprevious: [
						"alt",
						"meta"
					]
				});
				this.addEventDelegate(this._oItemNavigation);
			}

			oDomRef = this.getDomRef();

			// set the root dom node that surrounds the items
			this._oItemNavigation.setRootDomRef(oDomRef);

			// set the array of DOM elements representing the items
			this._oItemNavigation.setItemDomRefs(this._queryEnabledItemsDomRefs(oDomRef));

			// turn of the cycling
			this._oItemNavigation.setCycling(false);

			// set the selected index
			this._oItemNavigation.setSelectedIndex(this.indexOfItem(this.getSelectedItem()));

			// set the page size
			this._oItemNavigation.setPageSize(10);
		};

		SelectList.prototype.destroyItemNavigation = function() {
			if (this._oItemNavigation) {
				this.removeEventDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				this._oItemNavigation = null;
			}
		};

		SelectList.prototype.getItemNavigation = function() {
			return this._oItemNavigation;
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Sets the <code>selectedItem</code> association.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem New value for the <code>selectedItem</code> association.
		 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the <code>selectedItem</code> association.
		 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear the selection.
		 *
		 * @returns {sap.m.SelectList} <code>this</code> to allow method chaining.
		 * @public
		 */
		SelectList.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				this.setAssociation("selectedItem", vItem, true);
				vItem = Core.byId(vItem);
			}

			if (!(vItem instanceof Item) && vItem !== null) {
				return this;
			}

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);

			return this;
		};

		/**
		 * Sets property <code>selectedItemId</code>.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * @param {string | undefined} vItem New value for property <code>selectedItemId</code>.
		 * @returns {sap.m.SelectList} <code>this</code> to allow method chaining.
		 * @public
		 */
		SelectList.prototype.setSelectedItemId = function(vItem) {
			vItem = this.validateProperty("selectedItemId", vItem);
			this.setSelection(vItem);
			return this;
		};

		/**
		 * Sets property <code>selectedKey</code>.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * @returns {sap.m.SelectList} <code>this</code> to allow method chaining.
		 * @public
		 */
		SelectList.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var oItem = this.getItemByKey(sKey);

			if (oItem || (sKey === "")) {

				if (!oItem && sKey === "") {
					oItem = this.getDefaultSelectedItem();
				}

				this.setSelection(oItem);
				return this;
			}

			return this.setProperty("selectedKey", sKey);
		};

		/**
		 * Gets the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association, or null.
		 * @public
		 */
		SelectList.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : Core.byId(vSelectedItem) || null;
		};

		/**
		 * Gets the item from the aggregation named <code>items</code> at the given 0-based index.
		 *
		 * @param {int} iIndex Index of the item to return.
		 * @returns {sap.ui.core.Item | null} Item at the given index, or null if none.
		 * @public
		 */
		SelectList.prototype.getItemAt = function(iIndex) {
			return this.getItems()[ +iIndex] || null;
		};

		/**
		 * Gets the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The first item, or null if there are no items.
		 * @public
		 */
		SelectList.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Gets the enabled items from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The last item, or null if there are no items.
		 * @public
		 */
		SelectList.prototype.getLastItem = function() {
			var aItems = this.getItems();
			return aItems[aItems.length - 1] || null;
		};

		/**
		 * Gets the enabled items from the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item[]} [aItems=getItems()] items to filter
		 * @return {sap.ui.core.Item[]} An array containing the enabled items.
		 * @public
		 */
		SelectList.prototype.getEnabledItems = function(aItems) {
			aItems = aItems || this.getItems();
			return aItems.filter(function(oItem) {
				return oItem.getEnabled();
			});
		};

		/**
		 * Gets the item with the given key from the aggregation named <code>items</code>.
		 *
		 * <b>Note: </b> If duplicate keys exists, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null
		 * @public
		 */
		SelectList.prototype.getItemByKey = function(sKey) {
			return this.findItem("key", sKey);
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or id.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		SelectList.prototype.removeItem = function(vItem) {

			// remove the item from the aggregation items
			vItem = this.removeAggregation("items", vItem);

			// no items, the removed item was the last
			if (this.getItems().length === 0) {

				// clear the selection
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {	// if the removed item is selected
				this.setSelection(this.getDefaultSelectedItem());
			}

			// return the removed item or null
			return vItem;
		};

		/**
		 * Removes all the items in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 */
		SelectList.prototype.removeAllItems = function() {
			var aItems = this.removeAllAggregation("items", true);
			this.$().children("li").remove();
			return aItems;
		};

		/**
		 * Destroys all the items in the aggregation named <code>items</code>.
		 *
		 * @returns {sap.m.SelectList} <code>this</code> to allow method chaining.
		 * @public
		 */
		SelectList.prototype.destroyItems = function() {
			this.destroyAggregation("items", true);
			return this;
		};

		SelectList.prototype.setNoDataText = function() {};

		return SelectList;
	});