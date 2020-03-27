/*!
 * ${copyright}
 */

sap.ui.define([
	'./Dialog',
	'./ComboBoxTextField',
	'./Input',
	'./GroupHeaderListItem',
	'./SuggestionsPopover',
	'sap/ui/core/SeparatorItem',
	'sap/ui/core/InvisibleText',
	'sap/base/Log',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/library',
	'./ComboBoxBaseRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/encodeXML",
	"sap/base/strings/escapeRegExp"
],
	function(
		Dialog,
		ComboBoxTextField,
		Input,
		GroupHeaderListItem,
		SuggestionsPopover,
		SeparatorItem,
		InvisibleText,
		Log,
		library,
		Device,
		coreLibrary,
		ComboBoxBaseRenderer,
		containsOrEquals,
		KeyCodes,
		jQuery,
		encodeXML,
		escapeRegExp
	) {
		"use strict";

		// shortcut for sap.m.PlacementType
		var PlacementType = library.PlacementType;

		var InputForwardableProperties = ["value", "enabled", "name", "placeholder",
			"editable", "textAlign", "textDirection", "valueState", "valueStateText"];

		/**
		 * Constructor for a new <code>sap.m.ComboBoxBase</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * An abstract class for combo boxes.
		 * @extends sap.m.ComboBoxTextField
		 * @abstract
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
				"abstract": true,
				defaultAggregation: "items",
				properties: {
					/**
					 * Indicates whether the text values of the <code>additionalText</code> property of a
					 * {@link sap.ui.core.ListItem} are shown.
					 * @since 1.60
					 */
					showSecondaryValues: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					}
				},
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
					 * This event is fired when the end user clicks the combo box button to open the dropdown list and
					 * the data used to display items is not already loaded.
					 * Alternatively, it is fired after the user moves the cursor to the combo box text
					 * field and perform an action that requires data to be loaded. For example,
					 * pressing F4 to open the dropdown list or typing something in the text field fires the event.
					 *
					 * <b>Note:</b> Use this feature in performance critical scenarios only.
					 * Loading the data lazily (on demand) to defer initialization has several implications for the
					 * end user experience. For example, the busy indicator has to be shown while the items are being
					 * loaded and assistive technology software also has to announce the state changes
					 * (which may be confusing for some screen reader users).
					 *
					 * <b>Note</b>: Currently the <code>sap.m.MultiComboBox</code> does not support this event.
					 * @since 1.38
					 */
					loadItems: {}
				},
				dnd: { draggable: false, droppable: true }
			}
		});

		/**
		 * Default filtering function for items.
		 *
		 * @param {string} sInputValue Current value of the input field.
		 * @param {sap.ui.core.Item} oItem Item to be matched
		 * @param {string} sPropertyGetter A Getter for property of an item (could be getText or getAdditionalText)
		 * @static
		 * @since 1.58
		 */
		ComboBoxBase.DEFAULT_TEXT_FILTER = function (sInputValue, oItem, sPropertyGetter) {
			var sLowerCaseText, sInputLowerCaseValue, oMatchingTextRegex;

			if (!oItem[sPropertyGetter]) {
				return false;
			}

			sLowerCaseText = oItem[sPropertyGetter]().toLowerCase();
			sInputLowerCaseValue = sInputValue.toLowerCase();
			oMatchingTextRegex = new RegExp('(^|\\s)' + escapeRegExp(sInputLowerCaseValue) + ".*", 'g');

			return oMatchingTextRegex.test(sLowerCaseText);
		};

		/**
		 * Called when the composition of a passage of text is started.
		 *
		 * @protected
		 */
		ComboBoxBase.prototype.oncompositionstart = function () {
			this._bIsComposingCharacter = true;
		};

		/**
		 * Called when the composition of a passage of text has been completed or cancelled.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @protected
		 */
		ComboBoxBase.prototype.oncompositionend = function (oEvent) {
			this._bIsComposingCharacter = false;
			this._sComposition = oEvent.target.value;

			// In Firefox and Edge the events are fired correctly
			// http://blog.evanyou.me/2014/01/03/composition-event/
			if (!Device.browser.edge && !Device.browser.firefox) {
				ComboBoxTextField.prototype.handleInput.apply(this, arguments);
				this.handleInputValidation(oEvent, this.isComposingCharacter());
			}
		};

		/**
		 * indicating if a character is currently composing.
		 *
		 * @returns {boolean} Whether or not a character is composing.
		 * True if after "compositionstart" event and before "compositionend" event.
		 * @protected
		 */
		ComboBoxBase.prototype.isComposingCharacter = function() {
			return this._bIsComposingCharacter;
		};

		/* =========================================================== */
		/* Private methods                                             */
		/* =========================================================== */

		/**
		 * Called whenever the binding of the aggregation items is changed.
		 * @param {string} sReason The reason for the update
		 *
		 */
		ComboBoxBase.prototype.updateItems = function(sReason) {
			this.bItemsUpdated = false;

			// for backward compatibility and to keep the old data binding behavior,
			// the items should be destroyed before calling .updateAggregation("items")
			this.destroyItems();
			this.updateAggregation("items");
			this.bItemsUpdated = true;

			if (this.hasLoadItemsEventListeners()) {
				this.onItemsLoaded();
			}
		};

		/**
		 * Sets a custom filter function for items.
		 * The function accepts two parameters:
		 * - currenly typed value in the input field
		 * - item to be matched
		 * The function should return a Boolean value (true or false) which represents whether an item will be shown in the dropdown or not.
		 *
		 * @public
		 * @param {function} fnFilter A callback function called when typing in a ComboBoxBase control or ancestor.
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @since 1.58
		 */
		ComboBoxBase.prototype.setFilterFunction = function(fnFilter) {

			if (fnFilter === null || fnFilter === undefined) {
				this.fnFilter = null;
				return this;
			}

			if (typeof (fnFilter) !== "function") {
				Log.warning("Passed filter is not a function and the default implementation will be used");
			} else {
				this.fnFilter = fnFilter;
			}

			return this;
		};

		/**
		 * Highlights Dom Refs based on a value of the input and text of an item
		 *
		 * @param {string} sValue Currently typed value of the input
		 * @param {object[]} aItemsDomRefs Array of objects with information for dom ref and text to be highlighted
		 * @param {function} fnBold Method for bolding the text
		 *
		 * @protected
		 * @since 1.58
		 */
		ComboBoxBase.prototype.highLightList = function (sValue, aItemsDomRefs, fnBold) {
			if (fnBold && typeof fnBold === "function") {
				fnBold(aItemsDomRefs, sValue);
			} else {
				this._oSuggestionPopover.highlightSuggestionItems(aItemsDomRefs, sValue, true);
			}
		};

		/**
		 * Handles highlighting of items after filtering.
		 *
		 * @param {string} sValue The value of the item
		 * @protected
		 */
		ComboBoxBase.prototype._highlightList = function (sValue) {
			var aListItemsDOM = [],
				aListItemAdditionalText = [],
				oItemAdditionalTextRef, oItemDomRef, oItemTitleDomRef;

			this._getList().getItems().forEach(function (oItem) {
				oItemDomRef = oItem.getDomRef();
				oItemTitleDomRef = oItemDomRef && oItemDomRef.getElementsByClassName("sapMSLITitleOnly")[0];

				if (oItemTitleDomRef) {
					aListItemsDOM.push(oItemTitleDomRef);

					oItemAdditionalTextRef = oItemDomRef.querySelector(".sapMSLIInfo");

					if (oItemAdditionalTextRef && oItem.getInfo) {
						aListItemAdditionalText.push(oItemAdditionalTextRef);
					}
				}
			});

			this.highLightList(sValue, aListItemsDOM);
			this.highLightList(sValue, aListItemAdditionalText);
		};

		ComboBoxBase.prototype._modifyPopupInput = function (oInput) {
			this.setTextFieldHandler(oInput);
			return oInput;
		};

		/**
		 * Sets the TextField handler
		 *
		 * @param {sap.m.ComboBoxTextField | sap.m.Input} oTextField Text field instance
		 * @protected
		 */
		ComboBoxBase.prototype.setTextFieldHandler = function (oTextField) {
			var that = this,
				oTextFieldHandleEvent = oTextField._handleEvent;

			oTextField._handleEvent = function(oEvent) {
				oTextFieldHandleEvent.apply(this, arguments);

				if (/keydown|sapdown|sapup|saphome|sapend|sappagedown|sappageup|input/.test(oEvent.type)) {
					that._handleEvent(oEvent);
				}
			};
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
		 * Fires the {@link #loadItems} event if the data used to display items in the dropdown list
		 * is not already loaded and enqueue the <code>fnCallBack</code> and <code>mOptions</code> into a message
		 * queue for processing.
		 *
		 * @param {function} [fnCallBack] A callback function to execute after the items are loaded.
		 * @param {object} [mOptions] Additional options.
		 * @param {string} [mOptions.name] Identifier of the message.
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

					// sets up a timeout to know if the data used to display the items in the dropdown list
					// is loaded after a 300ms delay, to show the busy indicator in the text field,
					// notice that if the items are loaded before 300ms the timeout is canceled
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

			// restore the busy indicator state to its previous state (if it has not been changed),
			// this is needed to avoid overriding application settings
			if (this.bInitialBusyIndicatorState !== this.getBusy()) {
				this.setInternalBusyIndicator(this.bInitialBusyIndicatorState);
			}

			// restore the busy indicator delay to its previous state (if it has not been changed),
			// this is needed to avoid overriding application settings
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

		/**
		 * Gets the ID of the hidden label
		 * @returns {string} Id of hidden text
		 * @protected
		 */
		ComboBoxBase.prototype.getPickerInvisibleTextId = function() {
			return InvisibleText.getStaticId("sap.m", "COMBOBOX_AVAILABLE_OPTIONS");
		};

		/**
		 * Gets the ID of the hidden label for the group header items
		 * @returns {string} Id of hidden text
		 * @protected
		 */
		ComboBoxBase.prototype._getGroupHeaderInvisibleText = function() {
			if (!this._oGroupHeaderInvisibleText) {
				this._oGroupHeaderInvisibleText = new InvisibleText();
				this._oGroupHeaderInvisibleText.toStatic();
			}

			return this._oGroupHeaderInvisibleText;
		};


		/**
		 * Gets the item corresponding to given list item.
		 *
		 * @param {sap.m.StandardListItem | null} oListItem The given list item
		 * @return {sap.ui.core.Item} The corresponding item
		 * @private
		 */
		ComboBoxBase.prototype._getItemByListItem = function(oListItem) {
			return this._getItemBy(oListItem, "ListItem");
		};

		/**
		 * Gets the item corresponding to given data object.
		 *
		 * @param {Object | null} oDataObject The given object
		 * @param {string} sDataName The data name
		 * @return {sap.ui.core.Item} The corresponding item
		 * @private
		 */
		ComboBoxBase.prototype._getItemBy = function(oDataObject, sDataName) {
			sDataName = this.getRenderer().CSS_CLASS_COMBOBOXBASE + sDataName;

			for ( var i = 0, aItems = this.getItems(), iItemsLength = aItems.length; i < iItemsLength; i++) {
				if (aItems[i].data(sDataName) === oDataObject) {
					return aItems[i];
				}
			}

			return null;
		};

		/**
		 * Checks if the list is in suggestions mode.
		 *
		 * @returns {boolean} true if the list has at least one not visible item, false if all items in the list are visible.
		 * @private
		 */
		ComboBoxBase.prototype._isListInSuggestMode = function() {
			return this._getList().getItems().some(function(oListItem) {
				return !oListItem.getVisible() && this._getItemByListItem(oListItem).getEnabled();
			}, this);
		};

		/**
		 * Gets the control's ListItem.
		 *
		 * @param {sap.ui.core.Item} oItem The item
		 * @returns {sap.m.StandardListItem | null} The ListItem
		 * @private
		 */
		ComboBoxBase.prototype.getListItem = function(oItem) {
			return oItem ? oItem.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "ListItem") : null;
		};

		/**
		 * Gets the selectable property of sap.ui.core.Item
		 *
		 * @param {sap.ui.core.Item} oItem The item in question
		 * @returns {boolean} The selectable value
		 * @private
		 */
		ComboBoxBase.prototype.getSelectable = function(oItem) {
			return oItem._bSelectable;
		};

		ComboBoxBase.prototype._setItemsShownWithFilter = function (bValue) {
			this._bItemsShownWithFilter = bValue;
		};

		ComboBoxBase.prototype._getItemsShownWithFilter = function () {
			return this._bItemsShownWithFilter;
		};


		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		ComboBoxBase.prototype.init = function() {
			ComboBoxTextField.prototype.init.apply(this, arguments);

			// sets the picker popup type
			this.setPickerType(Device.system.phone ? "Dialog" : "Dropdown");

			// indicates if the picker was opened by the showItems function
			this._setItemsShownWithFilter(false);

			// indicate whether the items are updated
			this.bItemsUpdated = false;

			// indicates if the picker is opened by the keyboard or by a click/tap on the downward-facing arrow button
			this.bOpenedByKeyboardOrButton = false;

			// indicates if the picker should be closed when toggling the opener icon
			this._bShouldClosePicker = false;

			this._oPickerValueStateText = null;
			this.bProcessingLoadItemsEvent = false;
			this.iLoadItemsEventInitialProcessingTimeoutID = -1;
			this.aMessageQueue = [];
			this.bInitialBusyIndicatorState = this.getBusy();
			this.iInitialBusyIndicatorDelay = this.getBusyIndicatorDelay();
			this._bOnItemsLoadedScheduled = false;
			this._bDoTypeAhead = true;

			this.getIcon().addEventDelegate({
				onmousedown: function (oEvent) {
						this._bShouldClosePicker = this.isOpen();
				}
			}, this);

			this.getIcon().attachPress(this._handlePopupOpenAndItemsLoad.bind(this, true));

			// handle composition events & validation of composition symbols
			this._sComposition = "";

			// a method to define whether an item should be filtered in the picker
			this.fnFilter = null;
		};

		ComboBoxBase.prototype._handlePopupOpenAndItemsLoad = function (bOpenOnInteraction) {
			var oPicker;

			// in case of a non-editable or disabled combo box, the picker popup cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			if (bOpenOnInteraction && this._getItemsShownWithFilter()) {
				this._bShouldClosePicker = false;

				// instead of closing and reopening the SuggestionsPopover we set the default filter
				// and use it to show all items in the picker, while adding the correct style class to the
				// ComboBoxes icon.
				this.toggleIconPressedStyle(true);
				this.bOpenedByKeyboardOrButton = false;
				this.clearFilter();
				this._setItemsShownWithFilter(false);

				return;
			}

			if (this._bShouldClosePicker) {
				this._bShouldClosePicker = false;
				this.close();
				return;
			}

			this.loadItems();
			this.bOpenedByKeyboardOrButton = bOpenOnInteraction;

			if (this.isPlatformTablet()) {
				this.syncPickerContent();
				oPicker = this.getPicker();
				oPicker.setInitialFocus(oPicker);
			}

			this.open();
		};

		ComboBoxBase.prototype.exit = function() {
			ComboBoxTextField.prototype.exit.apply(this, arguments);

			if (this._getList()) {
				this._getList().destroy();
				this._oList = null;
			}

			if (this._getGroupHeaderInvisibleText()) {
				this._getGroupHeaderInvisibleText().destroy();
				this._oGroupHeaderInvisibleText = null;
			}

			clearTimeout(this.iLoadItemsEventInitialProcessingTimeoutID);
			this.aMessageQueue = null;
			this.fnFilter = null;
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

			if (oEvent.keyCode === KeyCodes.F4) {
				this.onF4(oEvent);
			}

			if (this._getItemsShownWithFilter()) {
				this.loadItems(this._handlePopupOpenAndItemsLoad.bind(this, true));
				return;
			}

			if (this.isOpen()) {
				this.close();
				return;
			}

			this.selectText(0, this.getValue().length); // select all text
			this.loadItems();
			this.bOpenedByKeyboardOrButton = true;
			this.open();
		};

		/**
		 * Handles when the F4  key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @since 1.46
		 */
		ComboBoxBase.prototype.onF4 = function(oEvent) {

			// prevent browser address bar to be open in ie, when F4 is pressed
			oEvent.preventDefault();
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

				// fix for Firefox
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

			// to prevent the change event from firing when the downward-facing arrow button is pressed
			if (oRelatedControl === this) {
				return;
			}

			var oPicker = this.getPicker(),
				oFocusDomRef = oRelatedControl && oRelatedControl.getFocusDomRef();

			// to prevent the change event from firing when an item is pressed
			if (oPicker && containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef)) {
				return;
			}

			ComboBoxTextField.prototype.onsapfocusleave.apply(this, arguments);
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Gets the DOM reference the popup should be docked to.
		 *
		 * @return {Element} The DOM reference
		 */
		ComboBoxBase.prototype.getPopupAnchorDomRef = function() {
			return this.getDomRef();
		};

		/**
		 * Hook method, can be used to add additional content to the control's picker popup.
		 *
		 * @param {sap.m.Dialog | sap.m.Popover} [oPicker] The picker popup
		 */
		ComboBoxBase.prototype.addContent = function(oPicker) {};

		/**
		 * Gets the <code>list</code>.
		 *
		 * @returns {sap.m.List} The list instance object or <code>null</code>.
		 * @protected
		 * @deprecated As of version 1.62. The list structure should not be used as per SAP note: 2746748.
		 */
		ComboBoxBase.prototype.getList = function() {
			Log.warning(
				"[Warning]:",
				"You are attempting to use deprecated method 'getList()', please refer to SAP note 2746748.",
				this);

			// This is needed for backward compatibility
			return this._getList();
		};

		/**
		 * Gets the <code>list</code>.
		 *
		 * @returns {sap.m.List} The list instance object or <code>null</code>.
		 * @private
		 */
		ComboBoxBase.prototype._getList = function() {
			if (this.bIsDestroyed) {
				return null;
			}

			return this._oList;
		};

		/**
		 * Sets the property <code>_sPickerType</code>.
		 *
		 * @param {string} sPickerType The picker type
		 * @protected
		 */
		ComboBoxBase.prototype.setPickerType = function(sPickerType) {
			this._sPickerType = sPickerType;
		};

		/**
		 * Gets the property <code>_sPickerType</code>
		 *
		 * @returns {string} The picker type
		 * @protected
		 */
		ComboBoxBase.prototype.getPickerType = function() {
			return this._sPickerType;
		};

		/**
		 * Updates the suggestions popover value state
		 *
		 * @private
		 */
		ComboBoxBase.prototype._updateSuggestionsPopoverValueState = function() {
			var oSuggestionsPopover = this._getSuggestionsPopover(),
				sValueState = this.getValueState(),
				vValueStateMessage;

			if (!oSuggestionsPopover) {
				return;
			}

			if (this._oFormattedValueStateHeader) {
				vValueStateMessage = this._oFormattedValueStateHeader;
			} else {
				vValueStateMessage = this.getValueStateText();
			}

			oSuggestionsPopover.updateValueState(sValueState, vValueStateMessage, this.getShowValueStateMessage());
		};

		/**
		 * Sets the visualization of the validation state of the control,
		 * e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
		 *
		 * @param {sap.ui.core.ValueState} [sValueState] The new value state
		 * @returns {sap.m.InputBase} this for chaining
		 *
		 * @public
		 */
		ComboBoxBase.prototype.setValueState = function(sValueState) {
			ComboBoxTextField.prototype.setValueState.apply(this, arguments);
			this._updateSuggestionsPopoverValueState();

			return this;
		};

		/**
		 * Sets the value state text
		 *
		 * @param {string} [sValueStateText] The new value state text
		 * @returns {sap.m.InputBase} this for chaining
		 *
		 * @public
		 */
		ComboBoxBase.prototype.setValueStateText = function(sValueStateText) {
			ComboBoxTextField.prototype.setValueStateText.apply(this, arguments);
			this._updateSuggestionsPopoverValueState();
			return this;
		};

		/**
		 * Sets <code>sap.m.FormattedText</code> value state message and creates
		 * a cloned object for aggregation of <code>sap.m.ValueStateHeader</code>.
		 *
		 * @param {object} [oFormattedValueStateText] The new value state formatted text
		 * @returns {sap.m.InputBase} this for chaining
		 *
		 * @public
		 */
		ComboBoxBase.prototype.setFormattedValueStateText = function(oFormattedValueStateText) {
			ComboBoxTextField.prototype.setFormattedValueStateText.apply(this, arguments);

			if (oFormattedValueStateText) {
				this._oFormattedValueStateHeader = oFormattedValueStateText.clone();
			}

			this._updateSuggestionsPopoverValueState();
			return this;
		};

		/**
		 * Sets whether the value state message should be shown or not.
		 *
		 * @param {boolean} [bShow] The new value state text
		 * @returns {sap.m.InputBase} this for chaining
		 *
		 * @public
		 */
		ComboBoxBase.prototype.setShowValueStateMessage = function(bShow) {
			ComboBoxTextField.prototype.setShowValueStateMessage.apply(this, arguments);
			this._updateSuggestionsPopoverValueState();
			return this;
		};

		ComboBoxBase.prototype.shouldValueStateMessageBeOpened = function() {
			var bShouldValueStateMessageBeOpened = ComboBoxTextField.prototype.shouldValueStateMessageBeOpened.apply(this, arguments);
			return (bShouldValueStateMessageBeOpened && !this.isOpen());
		};

		ComboBoxBase.prototype.onPropertyChange = function(oControlEvent, oData) {
			var sNewValue = oControlEvent.getParameter("newValue"),
				sProperty = oControlEvent.getParameter("name"),
				sMutator = "set" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1),
				oControl = (oData && oData.srcControl) || this.getPickerTextField();

			// propagate some property changes to the picker text field
			if (this.getInputForwardableProperties().indexOf(sProperty) > -1 &&
				oControl && (typeof oControl[sMutator] === "function")) {
				oControl[sMutator](sNewValue);
			}
		};

		/**
		 * Gets the input properties, which should be forwarded from the combobox  text field to the picker text field
		 *
		 * @returns {Array} Array of the forwardable properties
		 * @protected
		 * @since 1.66
		 */
		ComboBoxBase.prototype.getInputForwardableProperties = function() {
			return InputForwardableProperties;
		};

		/*
		 * Determines if the Picker is a Dialog
		 *
		 * @returns {boolean}
		 * @protected
		 * @since 1.42
		 */
		ComboBoxBase.prototype.isPickerDialog = function() {
			return this.getPickerType() === "Dialog";
		};

		/*
		 * Determines if the platform is a tablet.
		 *
		 * @returns {boolean}
		 * @protected
		 * @since 1.48
		 */
		ComboBoxBase.prototype.isPlatformTablet = function() {
			var bNotCombi = !Device.system.combi,
				bTablet = Device.system.tablet && bNotCombi;

			return bTablet;
		};

		/**
		 * Creates an instance of <code>sap.m.ComboBoxTextField</code>.
		 *
		 * @returns {sap.m.ComboBoxTextField} The TextField instance
		 * @private
		 */
		ComboBoxBase.prototype.createPickerTextField = function() {
			var oInput = new Input({
				width: "100%",
				showValueStateMessage: false
			});

			return oInput;
		};

		/*
		 * Gets the dropdown default settings.
		 * @returns {object} A map object with the default settings
		 * @protected
		 * @since 1.48
		 */
		ComboBoxBase.prototype.getDropdownSettings = function() {
			return {
				showArrow: false,
				placement: PlacementType.VerticalPreferredBottom,
				offsetX: 0,
				offsetY: 0,
				bounce: false,
				ariaLabelledBy: this.getPickerInvisibleTextId() || undefined
			};
		};

		/*
		 * Base method for the <code>List</code> configuration
		 *
		 * @protected
		 */
		ComboBoxBase.prototype._configureList = function () {};

		/**
		 * Creates a picker popup container where the selection should take place.
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType The picker type
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker popup to be used.
		 * @protected
		 */
		ComboBoxBase.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				return oPicker;
			}

			this._oSuggestionPopover = this._createSuggestionsPopover();
			oPicker = this._oSuggestionPopover._oPopover;
			// define a parent-child relationship between the control's and the picker pop-up (Popover or Dialog)
			this.setAggregation("picker", oPicker, true);

			this.configPicker(oPicker);

			return oPicker;
		};

		/**
		 * Base method for picker configuration
		 *
		 * @param {sap.m.Popover | sap.m.Dialog} oPicker Picker instance
		 * @protected
		 */
		ComboBoxBase.prototype.configPicker = function (oPicker) {};

		ComboBoxBase.prototype._hasShowSelectedButton = function () {
			return false;
		};

		/**
		 * Creates and configures a new instance of the <code>SuggestionsPopover</code> and its internal controls.
		 *
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker popup to be used.
		 * @private
		 */
		ComboBoxBase.prototype._createSuggestionsPopover = function () {
			var bUseDialog = this.isPickerDialog(),
				oSuggPopover;

			oSuggPopover = new SuggestionsPopover(this);

			if (bUseDialog) {
				var oInput = this.createPickerTextField();
				oSuggPopover._oPopupInput = this._modifyPopupInput(oInput);
			}

			// Creates the internal controls of the <code>SuggestionsPopover</code>
			oSuggPopover._createSuggestionPopup({showSelectedButton: this._hasShowSelectedButton()});
			oSuggPopover._createSuggestionPopupContent(false);

			this.forwardEventHandlersToSuggPopover(oSuggPopover);
			this._updateSuggestionsPopoverValueState();

			// Amends the suggestions popovers list
			// this._oList is used by the ComboBoxBase
			this._oList = oSuggPopover._oList;
			this._configureList(this._oList);

			return oSuggPopover;
		};

		ComboBoxBase.prototype.forwardEventHandlersToSuggPopover = function (oSuggPopover) {
			oSuggPopover.setOkPressHandler(this._handleOkPress.bind(this));
			oSuggPopover.setCancelPressHandler(this._handleCancelPress.bind(this));
			oSuggPopover.setInputLabels(this.getLabels.bind(this));
		};

		ComboBoxBase.prototype._handleOkPress = function () {
			var that = this,
				oTextField = that.getPickerTextField();

			that.updateDomValue(oTextField.getValue());
			that.onChange();
			that.close();
		};

		ComboBoxBase.prototype._handleCancelPress = function(){
			this.close();
			this.revertSelection();
		};

		/**
		 * Sets the selectable property of <code>sap.ui.core.Item</code>
		 *
		 * @param {sap.ui.core.Item} oItem The item to set the property
		 * @param {boolean} bSelectable The selectable value
		 * @protected
		 */
		ComboBoxBase.prototype.setSelectable = function(oItem, bSelectable) {

			if (this.indexOfItem(oItem) < 0) {
				return;
			}

			oItem._bSelectable = bSelectable;
			var oListItem = this.getListItem(oItem);

			if (oListItem) {
				oListItem.setVisible(bSelectable);
			}
		};

		/**
		 * This event handler is called before the picker popup is opened.
		 *
		 */
		ComboBoxBase.prototype.onBeforeOpen = function () {
			if (!this._getItemsShownWithFilter()) {
				this.toggleIconPressedStyle(true);
			}
		};

		/**
		 * This event handler is called before the picker popup is closed.
		 *
		 */
		ComboBoxBase.prototype.onBeforeClose = function() {
			// reset opener
			this.bOpenedByKeyboardOrButton = false;
			this._setItemsShownWithFilter(false);
		};

		/**
		 * Gets the control's picker popup.
		 *
		 * @returns {sap.m.Dialog | sap.m.Popover | null} The picker instance
		 * the <code>createPicker()</code> method.
		 * @protected
		 */
		ComboBoxBase.prototype.getPicker = function () {
			var oPicker = this.getAggregation("picker");

			if (oPicker && !oPicker.bIsDestroyed && !this.bIsDestroyed) {
				return oPicker;
			}

			return null;
		};

		/**
		 * Gets the control's suggestions popover.
		 *
		 * @returns {sap.m.SuggestionsPopover} The SuggestionsPopover instance, creating it if necessary by calling
		 * the <code>createPicker()</code> method.
		 * @private
		 */
		ComboBoxBase.prototype._getSuggestionsPopover = function() {
			return this._oSuggestionPopover;
		};

		/**
		 *
		 * @return {array} <code>sap.m.FormattedText</code> links in the value state message
		 * @private
		 */
		ComboBoxBase.prototype.getValueStateLinks = function() {
			var bHasFormattedTextValueState = this.getPicker() && this.getPicker().getCustomHeader() && typeof this.getPicker().getCustomHeader().getFormattedText === "function",
				oFormattedTextValueState = bHasFormattedTextValueState && this.getPicker().getCustomHeader().getFormattedText(),
				aValueStateLinks = oFormattedTextValueState && oFormattedTextValueState.getControls();

			return aValueStateLinks || [];
		};

		/**
		 * Gets the control's input from the picker.
		 *
		 * @returns {sap.m.ComboBoxTextField | sap.m.Input | null} Picker's input for filtering the list
		 * @protected
		 * @since 1.42
		 */
		ComboBoxBase.prototype.getPickerTextField = function() {
			var oPicker = this.getPicker(),
				oSubHeader = oPicker && oPicker.getSubHeader();
			return oSubHeader && oSubHeader.getContent()[0] || null;
		};

		/*
		 * Gets the picker header title.
		 *
		 * @returns {sap.m.Title | null} The title instance of the Picker
		 * @protected
		 * @since 1.42
		 */
		ComboBoxBase.prototype.getPickerTitle = function() {
			var oPicker = this.getPicker(),
				oHeader = oPicker && oPicker.getCustomHeader();

			if (this.isPickerDialog() && oHeader) {
				return oHeader.getContentMiddle()[0];
			}

			return null;
		};

		/*
		 * Reverts the selection as before opening the picker
		 *
		 * @type void
		 * @protected
		 * @since 1.42
		 */
		ComboBoxBase.prototype.revertSelection = function() {};
		/**
		 * Determines whether the control has content or not.
		 *
		 * @returns {boolean} True if the control has content
		 * @protected
		 */
		ComboBoxBase.prototype.hasContent = function() {
			return this.getItems().length > 0;
		};

		/**
		 * Creates picker if doesn't exist yet and sync with Control items
		 * To be overwritten by subclasses.
		 *
		 * @protected
		 */
		ComboBoxBase.prototype.syncPickerContent = function () {};

		/**
		 * Retrieves the first enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems] The items array
		 * @returns {sap.ui.core.Item | null} The first enabled item
		 */
		ComboBoxBase.prototype.findFirstEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getEnabled()) {
					return aItems[i];
				}
			}

			return null;
		};

		/**
		 * Retrieves the last enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems] The items array
		 * @returns {sap.ui.core.Item | null} The last enabled item
		 */
		ComboBoxBase.prototype.findLastEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();
			return this.findFirstEnabledItem(aItems.reverse());
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
				this._updateSuggestionsPopoverValueState();
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
			for (var i = 0, oListItem, aItems = this.getItems(), aVisibleItems = []; i < aItems.length; i++) {
				oListItem = this.getListItem(aItems[i]);

				if (oListItem && oListItem.getVisible()) {
					aVisibleItems.push(aItems[i]);
				}
			}

			return aVisibleItems;
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
			return this.getEnabledItems(this.getVisibleItems());
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
			var sMethod = "get" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

			for (var i = 0, aItems = this.getItems(); i < aItems.length; i++) {
				if (aItems[i][sMethod]() === sValue) {
					return aItems[i];
				}
			}

			return null;
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
		 * Clears the filter.
		 *
		 */
		ComboBoxBase.prototype.clearFilter = function() {
			this.getItems().forEach(function(oItem) {
				var oListItem = this.getListItem(oItem);

				if (oListItem) {
					oListItem.setVisible(oItem.getEnabled() && this.getSelectable(oItem));
				}
			}, this);
		};

		/**
		 * Handles properties' changes of items in the aggregation named <code>items</code>.
		 * To be overwritten by subclasses.
		 *
		 * @experimental
		 * @param {sap.ui.base.Event} oControlEvent The change event
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

			if (this._getList()) {
				this._getList().addItem(this._mapItemToListItem(oItem));
			}

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

			if (this._getList()) {
				this._getList().insertItem(this._mapItemToListItem(oItem), iIndex);
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
		 * @returns {sap.ui.core.Item[]} An array containing the enabled items.
		 * @public
		 */
		ComboBoxBase.prototype.getEnabledItems = function(aItems) {
			aItems = aItems || this.getItems();

			return aItems.filter(function(oItem) {
				return oItem.getEnabled();
			});
		};

		/**
		 * Gets the item with the given key from the aggregation named <code>items</code>.<br>
		 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item} The matching item
		 * @public
		 */
		ComboBoxBase.prototype.getItemByKey = function(sKey) {
			return this.findItem("key", sKey);
		};

		/**
		 * Adds a sap.ui.core.SeparatorItem item to the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oGroup Item of that group
		 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
		 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
		 * @returns {sap.m.GroupHeaderListItem} The group header
		 * @private
		 */
		ComboBoxBase.prototype.addItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
			oHeader = oHeader || new SeparatorItem({
				text: oGroup.text || oGroup.key
			});

			this.addAggregation("items", oHeader, bSuppressInvalidate);

			if (this._getList() && oHeader.isA("sap.ui.core.SeparatorItem")) {
				this._getList().addItem(this._mapItemToListItem(oHeader));
			}

			return oHeader;
		};

		/**
		 * Maps an item type of sap.ui.core.SeparatorItem to an item type of sap.m.GroupHeaderListItem.
		 *
		 * @param {sap.ui.core.SeparatorItem} oSeparatorItem The item to be matched
		 * @param {sap.ui.core.Renderer} oControlRenderer The controls renderer
		 * @returns {sap.m.GroupHeaderListItem} The matched GroupHeaderListItem
		 * @private
		 */
		ComboBoxBase.prototype._mapSeparatorItemToGroupHeader = function (oSeparatorItem, oControlRenderer) {
			var oGroupHeaderListItem = new GroupHeaderListItem({
				title: oSeparatorItem.getText(),
				ariaLabelledBy: this._getGroupHeaderInvisibleText().getId()
			});

			oGroupHeaderListItem.addStyleClass(oControlRenderer.CSS_CLASS_COMBOBOXBASE + "NonInteractiveItem");
			if (oSeparatorItem.getText && !oSeparatorItem.getText()) {
				oGroupHeaderListItem.addStyleClass(oControlRenderer.CSS_CLASS_COMBOBOXBASE + "SeparatorItemNoText");
			}

			return oGroupHeaderListItem;
		};

		/**
		 * Indicates whether the control's picker popup is open.
		 *
		 * @returns {boolean} Determines whether the control's picker popup is currently open
		 * (this includes opening and closing animations).
		 * @public
		 */
		ComboBoxBase.prototype.isOpen = function() {
			var oPicker = this.getPicker();
			return !!(oPicker && oPicker.isOpen());
		};

		/**
		 * Closes the control's picker popup.
		 *
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBoxBase.prototype.close = function() {
			var oPicker = this.getPicker();

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
			vItem = this.removeAggregation("items", vItem);

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
			var aItems = this.removeAllAggregation("items");

			// clear the selection
			this.clearSelection();

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].detachEvent("_change", this.onItemChange, this);
			}

			return aItems;
		};

		/**
		 * Finds the common items of two arrays
		 * @param {sap.ui.core.Item[]} aItems Array of Items
		 * @param {sap.ui.core.Item[]} aOtherItems Second array of items
		 * @protected
		 * @returns {sap.ui.core.Item[]} Array of unique items from both arrays
		 */
		ComboBoxBase.prototype.intersectItems = function (aItems, aOtherItems) {
			return aItems.filter(function (oItem) {
				return aOtherItems.map(function(oOtherItem) {
					return oOtherItem.getId();
				}).indexOf(oItem.getId()) !== -1;
			});
		};

		/**
		 * Opens the <code>SuggestionsPopover</code> with the available items.
		 *
		 * @param {function} fnFilter Function to filter the items shown in the SuggestionsPopover
		 * @returns {void}
		 *
		 * @since 1.64
		 * @experimental Since 1.64
		 * @public
		 */
		ComboBoxBase.prototype.showItems = function (fnFilter) {
			var fnFilterStore = this.fnFilter,
				fnLoadItemsListener = function () {
					if (!this.getItems().length) {
						return;
					}

					this.detachLoadItems(fnLoadItemsListener);

					// Replace the filter with provided one or show all the items
					this.setFilterFunction(fnFilter || function () {
						return true;
					});

					this.applyShowItemsFilters(); // Apply control specific filtering
					this._handlePopupOpenAndItemsLoad(false);
					this.setFilterFunction(fnFilterStore); // Restore filtering function
				}.bind(this);

			// in case of a non-editable or disabled, the popup cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// Indicate that in the moment the items are shown using this API
			this._setItemsShownWithFilter(true);

			this.attachLoadItems(fnLoadItemsListener);
			this.loadItems(fnLoadItemsListener);
		};

		/**
		 * Should be overwritten in children classes to apply control specific filtering over the items.
		 *
		 * @since 1.64
		 * @experimental Since 1.64
		 * @private
		 * @ui5-restricted
		 */
		ComboBoxBase.prototype.applyShowItemsFilters = function () {};

		return ComboBoxBase;
	});