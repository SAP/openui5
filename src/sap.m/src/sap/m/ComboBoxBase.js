/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Dialog', './ComboBoxTextField', './SelectList', './Popover', './library'],
	function(jQuery, Dialog, ComboBoxTextField, SelectList, Popover, library) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.m.ComboBoxBase</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * An abstract class for combo boxes.
		 * @extends sap.m.ComboBoxTextField
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.22.0
		 * @alias sap.m.ComboBoxBase
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var ComboBoxBase = ComboBoxTextField.extend("sap.m.ComboBoxBase", /** @lends sap.m.ComboBoxBase.prototype */ {
			metadata: {
				library: "sap.m",
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
					},

					/**
					 * Internal aggregation to hold the inner picker popup.
					 */
					picker: {
						type: "sap.ui.core.PopupInterface",
						multiple: false,
						visibility: "hidden"
					}
				},
				events: {

					/**
					 * This event is fired when the end user moves the cursor to the text field, performs
					 * an action that requires items to be loaded, and items are not already loaded. For example,
					 * pressing F4 to open the dropdown list or typing something in the text field fires the event.
					 *
					 * <b>Note:</b> We strongly recommend to only use this feature in performance critical scenarios.
					 * Loading the items lazily (on demand) to defer initialization has several implications for the end user
					 * experience. For example, the busy indicator has to be shown while the items are being loaded and
					 * assistive technology software also has to announce the state changes (which may be confusing
					 * for some screen reader users).
					 *
					 * <b>Note</b>: Currently the <code>sap.m.MultiComboBox</code> does not support this event.
					 * @since 1.38
					 */
					loadItems: {}
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
		 * Called whenever the binding of the aggregation items is changed.
		 *
		 */
		ComboBoxBase.prototype.updateItems = function(sReason) {
			this.bItemsUpdated = false;

			// note: for backward compatibility and to keep the old data binding behavior,
			// the items should be destroyed before calling .updateAggregation("items")
			this.destroyItems();
			this.updateAggregation("items");
			this.bItemsUpdated = true;

			if (this.hasLoadItemsEventListeners()) {
				this.onItemsLoaded();
			}
		};

		/**
		 * Called when the items' aggregation needs to be refreshed.
		 *
		 * <b>Note:</b> This method has been overwritten to prevent <code>updateItems()</code>
		 * from being called when the bindings are refreshed.
		 * @see sap.ui.base.ManagedObject#bindAggregation
		 */
		ComboBoxBase.prototype.refreshItems = function() {
			this.bItemsUpdated = false;
			this.refreshAggregation("items");
		};

		/**
		 * Gets the <code>list</code>.
		 *
		 * @returns {sap.m.SelectList} The list instance object or <code>null</code>.
		 * @protected
		 */
		ComboBoxBase.prototype.getList = function() {
			if (this.bIsDestroyed) {
				return null;
			}

			return this._oList;
		};

		/**
		 * Fires the {@link #loadItems} event if the items are not already loaded and enqueue the
		 * <code>fnCallBack</code> callback into the event queue for further processing.
		 *
		 * @param {function} [fnCallBack] A callback function to execute after the items are loaded.
		 * @param {object} [mOptions] Additional options.
		 * @param {string} [mOptions.id] Identifier of the message.
		 * @param {boolean} [mOptions.busyIndicator=true] Indicate whether the loading indicator is shown in the
		 * text field after some delay.
		 * @param {int} [mOptions.busyIndicatorDelay=300] Indicates the delay in milliseconds after which the busy
		 * indicator is shown.
		 * @since 1.32.4
		 */
		ComboBoxBase.prototype.loadItems = function(fnCallBack, mOptions) {
			var bCallBackIsAFunction = typeof fnCallBack === "function";

			// items are not loaded
			if (this.hasLoadItemsEventListeners() && (this.getItems().length === 0)) {
				this._bOnItemsLoadedScheduled = false;

				if (bCallBackIsAFunction) {

					mOptions = jQuery.extend({
						action: fnCallBack,
						busyIndicator: true,
						busyIndicatorDelay: 300
					}, mOptions);

					this.aMessageQueue.push(mOptions);

					// sets up a timeout to know if the items are not loaded after a 300ms delay,
					// to show the busy indicator in the text field, notice that if the items
					// are loaded before 300ms the timeout is canceled
					if ((this.iLoadItemsEventInitialProcessingTimeoutID === -1) &&

						// the busy indicator in the input field should not be shown while the user is typing
						(mOptions.busyIndicator)) {

						this.iLoadItemsEventInitialProcessingTimeoutID = setTimeout(function onItemsNotLoadedAfterDelay() {
							this.setInternalBusyIndicatorDelay(0);
							this.setInternalBusyIndicator(true);
						}.bind(this), mOptions.busyIndicatorDelay);
					}
				}

				// process the loadItems event only once
				if (!this.bProcessingLoadItemsEvent) {
					this.bProcessingLoadItemsEvent = true;

					// application code must provide the items
					// in the loadItems event listener
					this.fireLoadItems();
				}

			// items are already loaded
			} else if (bCallBackIsAFunction) {

				// synchronous callback
				fnCallBack.call(this);
			}
		};

		ComboBoxBase.prototype.onItemsLoaded = function() {
			this.bProcessingLoadItemsEvent = false;
			clearTimeout(this.iLoadItemsEventInitialProcessingTimeoutID);

			// restore the busy indicator state to its previous state (if it has not been changed)
			// note: this is needed to avoid overriding application settings
			if (this.bInitialBusyIndicatorState !== this.getBusy()) {
				this.setInternalBusyIndicator(this.bInitialBusyIndicatorState);
			}

			// restore the busy indicator delay to its previous state (if it has not been changed)
			// note: this is needed to avoid overriding application settings
			if (this.iInitialBusyIndicatorDelay !== this.getBusyIndicatorDelay()) {
				this.setInternalBusyIndicatorDelay(this.iInitialBusyIndicatorDelay);
			}

			// process the message queue
			for (var i = 0, mCurrentMessage, mNextMessage, bIsCurrentMessageTheLast; i < this.aMessageQueue.length; i++) {
				mCurrentMessage = this.aMessageQueue.shift(); // get and delete the first event from the queue
				i--;
				bIsCurrentMessageTheLast = (i + 1) === this.aMessageQueue.length;
				mNextMessage = bIsCurrentMessageTheLast ? null : this.aMessageQueue[i + 1];

				if (typeof mCurrentMessage.action === "function") {
					if ((mCurrentMessage.name === "input") &&
						!bIsCurrentMessageTheLast &&
						(mNextMessage.name === "input")) {

						// no need to process this input event because the next is pending
						continue;
					}

					mCurrentMessage.action.call(this);
				}
			}
		};

		ComboBoxBase.prototype.hasLoadItemsEventListeners = function() {
			return this.hasListeners("loadItems");
		};

		ComboBoxBase.prototype._scheduleOnItemsLoadedOnce = function() {
			if (!this._bOnItemsLoadedScheduled &&
				!this.isBound("items") &&
				this.hasLoadItemsEventListeners() &&
				this.bProcessingLoadItemsEvent) {

				this._bOnItemsLoadedScheduled = true;
				setTimeout(this.onItemsLoaded.bind(this), 0);
			}
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		ComboBoxBase.prototype.init = function() {
			ComboBoxTextField.prototype.init.apply(this, arguments);

			// sets the picker popup type
			this.setPickerType(sap.ui.Device.system.phone ? "Dialog" : "Dropdown");

			if (sap.ui.Device.system.phone) {
				this.attachEvent("_change", this.onPropertyChange, this);
			}

			// initialize composites
			this.createPicker(this.getPickerType());

			// indicate whether the items are updated
			this.bItemsUpdated = false;

			this.bProcessingLoadItemsEvent = false;
			this.iLoadItemsEventInitialProcessingTimeoutID = -1;
			this.aMessageQueue = [];
			this.bInitialBusyIndicatorState = this.getBusy();
			this.iInitialBusyIndicatorDelay = this.getBusyIndicatorDelay();
			this._bOnItemsLoadedScheduled = false;
			this._bDoTypeAhead = true;
		};

		ComboBoxBase.prototype.exit = function() {
			ComboBoxTextField.prototype.exit.apply(this, arguments);

			if (this.getList()) {
				this.getList().destroy();
				this._oList = null;
			}

			clearTimeout(this.iLoadItemsEventInitialProcessingTimeoutID);
			this.aMessageQueue = null;
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handles the touch start event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.ontouchstart = function(oEvent) {

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.isOpenArea(oEvent.target)) {

				// add the active state to the control's field
				this.addStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "Pressed");
			}
		};

		/**
		 * Handles the touch end event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.ontouchend = function(oEvent) {

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (!this.isOpen() && this.isOpenArea(oEvent.target)) {

				// remove the active state of the control's field
				this.removeStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "Pressed");
			}
		};

		/**
		 * Handles the tap event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.ontap = function(oEvent) {
			ComboBoxTextField.prototype.ontap.apply(this, arguments);

			var CSS_CLASS = this.getRenderer().CSS_CLASS_COMBOBOXBASE,
				oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the picker popup cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (oControl.isOpenArea(oEvent.target)) {

				if (this.isOpen()) {
					this.close();
					this.removeStyleClass(CSS_CLASS + "Pressed");
					return;
				}

				this.loadItems();
				this.open();
			}

			if (this.isOpen()) {

				// add the active state to the control's field
				this.addStyleClass(CSS_CLASS + "Pressed");
			}
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handles the <code>onsapshow</code> event when either F4 is pressed or Alt + Down arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.onsapshow = function(oEvent) {

			// in case of a non-editable or disabled combo box, the picker popup cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent browser address bar to be open in ie9, when F4 is pressed
			if (oEvent.keyCode === jQuery.sap.KeyCodes.F4) {
				oEvent.preventDefault();
			}

			if (this.isOpen()) {
				this.close();
				return;
			}

			this.selectText(0, this.getValue().length); // select all text
			this.loadItems();
			this.open();
		};

		/**
		 * Handles when escape is pressed.
		 *
		 * If picker popup is closed, cancels changes and revert to the original value when the input field got its focus.
		 * If list is open, closes list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.onsapescape = function(oEvent) {

			// a non editable or disabled ComboBox, the value cannot be changed
			if (this.getEnabled() && this.getEditable() && this.isOpen()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();

				// note: fix for Firefox
				oEvent.preventDefault();

				this.close();
			} else {

				// cancel changes and revert to the value which the Input field had when it got the focus
				ComboBoxTextField.prototype.onsapescape.apply(this, arguments);
			}
		};

		/**
		 * Handles when Alt + Up arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.onsaphide = ComboBoxBase.prototype.onsapshow;

		/**
		 * Handles the <code>sapfocusleave</code> event of the input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxBase.prototype.onsapfocusleave = function(oEvent) {

			if (!oEvent.relatedControlId) {
				ComboBoxTextField.prototype.onsapfocusleave.apply(this, arguments);
				return;
			}

			var oRelatedControl = sap.ui.getCore().byId(oEvent.relatedControlId);

			// to prevent the change event from firing when the arrow button is pressed
			if (oRelatedControl === this) {
				return;
			}

			var oPicker = this.getAggregation("picker"),
				oFocusDomRef = oRelatedControl && oRelatedControl.getFocusDomRef();

			// to prevent the change event from firing when an item is pressed
			if (oPicker && jQuery.sap.containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef)) {
				return;
			}

			ComboBoxTextField.prototype.onsapfocusleave.apply(this, arguments);
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Gets the DOM reference the popup should be docked.
		 *
		 * @return {object}
		 */
		ComboBoxBase.prototype.getPopupAnchorDomRef = function() {
			return this.getDomRef();
		};

		/**
		 * Hook method, can be used to add additional content to the control's picker popup.
		 *
		 * @param {sap.m.Dialog | sap.m.Popover} [oPicker]
		 */
		ComboBoxBase.prototype.addContent = function(oPicker) {};

		/**
		 * Sets the property <code>_sPickerType</code>.
		 *
		 * @param {string} sPickerType
		 * @protected
		 */
		ComboBoxBase.prototype.setPickerType = function(sPickerType) {
			this._sPickerType = sPickerType;
		};

		/**
		 * Gets the property <code>_sPickerType</code>
		 *
		 * @returns {string}
		 * @protected
		 */
		ComboBoxBase.prototype.getPickerType = function() {
			return this._sPickerType;
		};

		/**
		 * Creates a picker popup container where the selection should take place.
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker popup to be used.
		 * @protected
		 */
		ComboBoxBase.prototype.createPicker = function(sPickerType) {};

		/**
		 * Gets the control's picker popup.
		 *
		 * @returns {sap.m.Dialog | sap.m.Popover | null} The picker instance, creating it if necessary by calling
		 * the <code>createPicker()</code> method.
		 * @protected
		 */
		ComboBoxBase.prototype.getPicker = function() {

			if (this.bIsDestroyed) {
				return null;
			}

			// initialize the control's picker
			return this.createPicker(this.getPickerType());
		};

		/*
		 * Determines whether the control has content or not.
		 *
		 * @returns {boolean}
		 * @protected
		 */
		ComboBoxBase.prototype.hasContent = function() {
			return this.getItems().length > 0;
		};

		/**
		 * Retrieves the first enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 */
		ComboBoxBase.prototype.findFirstEnabledItem = function(aItems) {
			var oList = this.getList();
			return oList ? oList.findFirstEnabledItem(aItems) : null;
		};

		/**
		 * Retrieves the last enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 */
		ComboBoxBase.prototype.findLastEnabledItem = function(aItems) {
			var oList = this.getList();
			return oList ? oList.findLastEnabledItem(aItems) : null;
		};

		/**
		 * Opens the control's picker popup.
		 *
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @protected
		 */
		ComboBoxBase.prototype.open = function() {
			var oPicker = this.getPicker();

			if (oPicker) {
				oPicker.open();
			}

			return this;
		};

		/*
		 * Gets the visible items from the aggregation named <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]}
		 * @protected
		 */
		ComboBoxBase.prototype.getVisibleItems = function() {
			var oList = this.getList();
			return oList ? oList.getVisibleItems() : [];
		};

		/*
		 * Checks whether an item is selected or not.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean} Whether the item is selected.
		 * @protected
		 * @since 1.24.0
		 */
		ComboBoxBase.prototype.isItemSelected = function() {};

		/*
		 * Get key of each item from the aggregation named items.
		 *
		 * @param {sap.ui.core.Item[]} [aItems]
		 * @return {string[]}
		 * @protected
		 * @since 1.24.0
		 */
		ComboBoxBase.prototype.getKeys = function(aItems) {
			aItems = aItems || this.getItems();

			for (var i = 0, aKeys = []; i < aItems.length; i++) {
				aKeys[i] = aItems[i].getKey();
			}

			return aKeys;
		};

		/**
		 * Gets the selectable items from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item[]} An array containing the selectables items.
		 */
		ComboBoxBase.prototype.getSelectableItems = function() {
			var oList = this.getList();
			return oList ? oList.getSelectableItems() : [];
		};

		/**
		 * Retrieves an item by searching for the given property/value from the aggregation named <code>items</code>.
		 *
		 * <b>Note:</b> If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sProperty An item property.
		 * @param {string} sValue An item value that specifies the item to be retrieved.
		 * @returns {sap.ui.core.Item | null} The matched item or <code>null</code>.
		 */
		ComboBoxBase.prototype.findItem = function(sProperty, sValue) {
			var oList = this.getList();
			return oList ? oList.findItem(sProperty, sValue) : null;
		};

		/*
		 * Gets the item with the given value from the aggregation named <code>items</code>.
		 *
		 * <b>Note:</b> If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sText An item value that specifies the item to be retrieved.
		 * @returns {sap.ui.core.Item | null} The matched item or <code>null</code>.
		 * @protected
		 */
		ComboBoxBase.prototype.getItemByText = function(sText) {
			return this.findItem("text", sText);
		};

		/**
		 * Scrolls an item into the visual viewport.
		 *
		 */
		ComboBoxBase.prototype.scrollToItem = function(oItem) {
			var oPicker = this.getPicker(),
				oPickerDomRef = oPicker.getDomRef("cont"),
				oItemDomRef = oItem && oItem.getDomRef();

			if (!oPicker || !oPickerDomRef || !oItemDomRef) {
				return;
			}

			var iPickerScrollTop = oPickerDomRef.scrollTop,
				iItemOffsetTop = oItemDomRef.offsetTop,
				iPickerHeight = oPickerDomRef.clientHeight,
				iItemHeight = oItemDomRef.offsetHeight;

			if (iPickerScrollTop > iItemOffsetTop) {

				// scroll up
				oPickerDomRef.scrollTop = iItemOffsetTop;

			// bottom edge of item > bottom edge of viewport
			} else if ((iItemOffsetTop + iItemHeight) > (iPickerScrollTop + iPickerHeight)) {

				// scroll down, the item is partly below the viewport of the list
				oPickerDomRef.scrollTop = Math.ceil(iItemOffsetTop + iItemHeight - iPickerHeight);
			}
		};

		/**
		 * Clears the filter.
		 *
		 */
		ComboBoxBase.prototype.clearFilter = function() {
			for (var i = 0, aItems = this.getItems(); i < aItems.length; i++) {
				aItems[i].bVisible = true;
			}
		};

		/**
		 * Handles properties' changes of items in the aggregation named <code>items</code>.
		 * To be overwritten by subclasses.
		 *
		 * @experimental
		 * @param {sap.ui.base.Event} oControlEvent
		 * @since 1.30
		 */
		ComboBoxBase.prototype.onItemChange = function(oControlEvent) {};

		/**
		 * Clears the selection.
		 * To be overwritten by subclasses.
		 *
		 * @protected
		 */
		ComboBoxBase.prototype.clearSelection = function() {};

		ComboBoxBase.prototype.setInternalBusyIndicator = function(bBusy) {
			this.bInitialBusyIndicatorState = this.getBusy();
			return this.setBusy.apply(this, arguments);
		};

		ComboBoxBase.prototype.setInternalBusyIndicatorDelay = function(iDelay) {
			this.iInitialBusyIndicatorDelay = this.getBusyIndicatorDelay();
			return this.setBusyIndicatorDelay.apply(this, arguments);
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Adds an item to the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be added; if empty, nothing is added.
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBoxBase.prototype.addItem = function(oItem) {
			this.addAggregation("items", oItem);

			if (oItem) {
				oItem.attachEvent("_change", this.onItemChange, this);
			}

			this._scheduleOnItemsLoadedOnce();
			return this;
		};

		/**
		 * Inserts an item into the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be inserted; if empty, nothing is inserted.
		 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
		 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *             greater than the current size of the aggregation, the item is inserted at the last position.
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBoxBase.prototype.insertItem = function(oItem, iIndex) {
			this.insertAggregation("items", oItem, iIndex, true);

			if (oItem) {
				oItem.attachEvent("_change", this.onItemChange, this);
			}

			this._scheduleOnItemsLoadedOnce();
			return this;
		};

		/**
		 * Gets the item from the aggregation named <code>items</code> at the given 0-based index.
		 *
		 * @param {int} iIndex Index of the item to return.
		 * @returns {sap.ui.core.Item} Item at the given index, or null if none.
		 * @public
		 */
		ComboBoxBase.prototype.getItemAt = function(iIndex) {
			return this.getItems()[ +iIndex] || null;
		};

		/**
		 * Gets the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item} The first item, or null if there are no items.
		 * @public
		 */
		ComboBoxBase.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Gets the last item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item} The last item, or null if there are no items.
		 * @public
		 */
		ComboBoxBase.prototype.getLastItem = function() {
			var aItems = this.getItems();
			return aItems[aItems.length - 1] || null;
		};

		/**
		 * Gets the enabled items from the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item[]} [aItems=getItems()] Items to filter.
		 * @return {sap.ui.core.Item[]} An array containing the enabled items.
		 * @public
		 */
		ComboBoxBase.prototype.getEnabledItems = function(aItems) {
			var oList = this.getList();
			return oList ? oList.getEnabledItems(aItems) : [];
		};

		/**
		 * Gets the item with the given key from the aggregation named <code>items</code>.
		 *
		 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item}
		 * @public
		 */
		ComboBoxBase.prototype.getItemByKey = function(sKey) {
			var oList = this.getList();
			return oList ? oList.getItemByKey(sKey) : null;
		};

		/**
		 * Indicates whether the control's picker popup is open.
		 *
		 * @returns {boolean} Determines whether the control's picker popup is currently open (this includes opening and closing animations).
		 * @public
		 */
		ComboBoxBase.prototype.isOpen = function() {
			var oPicker = this.getAggregation("picker");
			return !!(oPicker && oPicker.isOpen());
		};

		/**
		 * Closes the control's picker popup.
		 *
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBoxBase.prototype.close = function() {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				oPicker.close();
			}

			return this;
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or ID.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		ComboBoxBase.prototype.removeItem = function(vItem) {
			var oList = this.getList();

			vItem = oList ? oList.removeItem(vItem) : null;

			if (vItem) {
				vItem.detachEvent("_change", this.onItemChange, this);
			}

			return vItem;
		};

		/**
		 * Removes all the controls in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea and clears the selection.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 */
		ComboBoxBase.prototype.removeAllItems = function() {
			var oList = this.getList(),
				aItems = oList ? oList.removeAllItems() : [];

			// clear the selection
			this.clearSelection();

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].detachEvent("_change", this.onItemChange, this);
			}

			return aItems;
		};

		/**
		 * Destroys all the items in the aggregation named <code>items</code>.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBoxBase.prototype.destroyItems = function() {
			var oList = this.getList();

			if (oList) {
				oList.destroyItems();
			}

			return this;
		};

		return ComboBoxBase;

	}, /* bExport= */ true);
