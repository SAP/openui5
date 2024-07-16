/*!
 * ${copyright}
 */

sap.ui.define([
	'./Input',
	'./ComboBoxTextField',
	'./ComboBoxBaseRenderer',
	'./SuggestionsPopover',
	'sap/ui/base/ManagedObjectObserver',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	'sap/ui/core/SeparatorItem',
	'sap/ui/core/InvisibleText',
	'sap/ui/base/ManagedObject',
	'sap/base/Log',
	'./library',
	'sap/ui/Device',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/m/inputUtils/forwardItemProperties",
	"sap/m/inputUtils/highlightDOMElements",
	"sap/m/inputUtils/highlightItemsWithContains",
	"sap/m/inputUtils/ListHelpers",
	"sap/ui/core/IconPool"
],
	function(
		Input,
		ComboBoxTextField,
		ComboBoxBaseRenderer,
		SuggestionsPopover,
		ManagedObjectObserver,
		Element,
		Library,
		SeparatorItem,
		InvisibleText,
		ManagedObject,
		Log,
		library,
		Device,
		containsOrEquals,
		KeyCodes,
		jQuery,
		forwardItemProperties,
		highlightDOMElements,
		highlightItemsWithContains,
		ListHelpers,
		IconPool
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
					},

					/**
					 * Specifies whether clear icon is shown.
					 * Pressing the icon will clear input's value.
					 * @since 1.96
					 */
					showClearIcon: { type: "boolean", defaultValue: false },

					/**
					 * Specifies whether the clear icon should be shown/hidden on user interaction.
					 * @private
					 */
					effectiveShowClearIcon: { type: "boolean", defaultValue: false, visibility: "hidden" }
				},
				aggregations: {

					/**
					 * Defines the items contained within this control. <b>Note:</b> Disabled items are not visualized in the list with the available options, however they can still be accessed through the aggregation.
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
			},
			renderer: ComboBoxBaseRenderer
		});

		/**
		 * Called when the composition of a passage of text has been completed or cancelled.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @protected
		 */
		ComboBoxBase.prototype.oncompositionend = function (oEvent) {
			ComboBoxTextField.prototype.oncompositionend.apply(this, arguments);

			// In Firefox the events are fired correctly
			// http://blog.evanyou.me/2014/01/03/composition-event/
			if (!Device.browser.firefox) {
				this.handleInputValidation(oEvent, this.isComposingCharacter());
			}
		};

		/* =========================================================== */
		/* Private methods                                             */
		/* =========================================================== */

		/**
		 * Determines if the clear icon should be visible or hidden based on the control's state
		 *
		 * @returns {boolean} True if the clear icon should be shown.
		 * @private
		 * @ui5-restricted sap.m.ComboBox,sap.m.MultiComboBox
		 */
		ComboBoxBase.prototype.shouldShowClearIcon = function () {
			return this.getProperty("effectiveShowClearIcon") && !!this.getValue() && this.getEditable() && this.getEnabled();
		};

		/**
		 * Called whenever the binding of the aggregation items is changed.
		 * @param {string} sReason The reason for the update
		 *
		 */
		ComboBoxBase.prototype.updateItems = function(sReason) {
			this.bItemsUpdated = false;

			var iItemsCount = this.getItems().length;
			var oList;

			// for backward compatibility and to keep the old data binding behavior,
			// the items should be destroyed before calling .updateAggregation("items")
			this.destroyItems();
			this.updateAggregation("items");
			this.bItemsUpdated = true;

			if (this.hasLoadItemsEventListeners()) {

				if (this.isOpen()) {
					ListHelpers.fillList(this.getItems(), this._getList(), this._mapItemToListItem.bind(this));
					this.setRecreateItems(false);
				}

				this.onItemsLoaded();
			}

			oList = this._getList();

			// when there are no items both before the update and after it, we have to remove the busy state
			if (oList && iItemsCount === this.getItems().length) {
				oList.setBusy(false);
				oList.setShowNoData(!this.getItems().length);
				this.bInitialBusyIndicatorState = false;
			}
		};

		/**
		 * Sets a custom filter function for items.
		 * The function accepts two parameters:
		 * - currenly typed value in the input field
		 * - item to be matched
		 * The function should return a Boolean value (true or false) which represents whether an item will be shown in the dropdown or not.
		 * If no callback is provided, the control fallbacks to default filtering.
		 *
		 * @public
		 * @param {function(string=, sap.ui.core.Item=):boolean} [fnFilter] A callback function called when typing in a ComboBoxBase control or ancestor.
		 * @returns {this} <code>this</code> to allow method chaining.
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
		 * Handles highlighting of items after filtering.
		 *
		 * @param {string} sValue The value of the item
		 * @protected
		 */
		ComboBoxBase.prototype.highlightList = function (sValue) {
			var aListItemsDOM = [];

			aListItemsDOM = this._getList().$().find('.sapMSLIInfo [id$=-infoText], .sapMSLITitleOnly [id$=-titleText]');

			if (this.useHighlightItemsWithContains()) {
				highlightItemsWithContains(aListItemsDOM, sValue);
			} else {
				highlightDOMElements(aListItemsDOM, sValue);
			}
		};

		/**
		 * Handles highlighting of items after filtering.
		 *
		 * @protected
		 * @ui5-restricted sap.ui.comp.smartfield.ComboBox
		 */
		ComboBoxBase.prototype.useHighlightItemsWithContains = function () {
			return false;
		};

		/**
		 * Decorates the Input.
		 *
		 * @param {sap.m.InputBase} [oInput] The input which should be decorated
		 * @returns {sap.m.InputBase|undefined} The decorated input or <code>undefined</code>
		 * @private
		 * @ui5-restricted
		 */
		ComboBoxBase.prototype._decoratePopupInput = function (oInput) {
			if (oInput) {
				this.setTextFieldHandler(oInput);
				oInput.setShowClearIcon(this.getShowClearIcon());
			}
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

				if (/keydown|keyup|sapdown|sapup|saphome|sapend|sappagedown|sappageup|input/.test(oEvent.type)) {
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
		 * Checks if the list is in suggestions mode.
		 *
		 * @returns {boolean} true if the list has at least one not visible item, false if all items in the list are visible.
		 * @private
		 */
		ComboBoxBase.prototype._isListInSuggestMode = function() {
			return this._getList().getItems().some(function(oListItem) {
				return !oListItem.getVisible() && ListHelpers.getItemByListItem(this.getItems(), oListItem).getEnabled();
			}, this);
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

		/**
		 * Gets the clear icon.
		 *
		 * @returns {object} The clear icon
		 * @private
		 */
		ComboBoxBase.prototype._getClearIcon = function () {
			if (this._oClearIcon) {
				return this._oClearIcon;
			}

			this._oClearIcon = this.addEndIcon({
				src: IconPool.getIconURI("decline"),
				noTabStop: true,
				visible: false,
				alt: this._oRb.getText("INPUT_CLEAR_ICON_ALT"),
				useIconTooltip: false,
				decorative: false,
				press: this.handleClearIconPress.bind(this)
			}, 0);

			this._oClearIcon.addStyleClass("sapMComboBoxBaseClearIcon");

			return this._oClearIcon;
		};

		/**
		 * Function is called when the clear icon is pressed.
		 * Should be overwritten by subclasses.
		 *
		 * @param {sap.ui.base.Event} oEvent The press event object
		 * @protected
		 * @ui5-restricted sap.m.ComboBox, sap.m.MultiComboBox
		 */
		ComboBoxBase.prototype.handleClearIconPress = function (oEvent) {};

		/**
		 * Function is called on key up keyboard input.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		ComboBoxBase.prototype.onkeyup = function (oEvent) {
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			this.getShowClearIcon() && this.setProperty("effectiveShowClearIcon", !!this.getValue());
		};

		/**
		 * Sets the value property of the control.
		 *
		 * @param {string} sValue The new value
		 * @returns {this} this instance for method chaining
		 * @public
		 */
		ComboBoxBase.prototype.setValue = function (sValue) {
			ComboBoxTextField.prototype.setValue.apply(this, arguments);
			this.setProperty("effectiveShowClearIcon", !!sValue);
			return this;
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		ComboBoxBase.prototype.init = function() {
			ComboBoxTextField.prototype.init.apply(this, arguments);
			this._oRb = Library.getResourceBundleFor("sap.m");

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

			this.bProcessingLoadItemsEvent = false;
			this.iLoadItemsEventInitialProcessingTimeoutID = -1;
			this.aMessageQueue = [];
			this.bInitialBusyIndicatorState = this.getBusy();
			this.iInitialBusyIndicatorDelay = this.getBusyIndicatorDelay();
			this._bOnItemsLoadedScheduled = false;
			this._bDoTypeAhead = true;

			this.getArrowIcon().addEventDelegate({
				onmousedown: function (oEvent) {
						this._bShouldClosePicker = this.isOpen();
				}
			}, this);

			this.getArrowIcon().attachPress(this._handlePopupOpenAndItemsLoad.bind(this, true, this));

			// a method to define whether an item should be filtered in the picker
			this.fnFilter = null;

			var oItemsAggregationObserver = new ManagedObjectObserver(function(oChange) {
				var sMutation = oChange.mutation;
				var oItem = oChange.child;
				var oEventMapping = {
					"remove": "detachEvent",
					"insert": "attachEvent"
				};
				var callbackMapping = {
					"remove": "handleItemRemoval",
					"insert": "handleItemInsertion"
				};

				if (!oItem[oEventMapping[sMutation]] || !this[callbackMapping[sMutation]]) {
					return;
				}

				// attach / detach a _change event to items on insert / remove events
				oItem[oEventMapping[sMutation]]("_change", this.onItemChange, this);

				// mark the list items to be recreated
				this.setRecreateItems(true);

				// call handle Inserttion / Removal of items
				this[callbackMapping[sMutation]](oItem);
			}.bind(this));

			oItemsAggregationObserver.observe(this, { aggregations: ["items"] });
		};

		/**
		 * Fires when an object gets removed from the items aggregation.
		 *
		 * @param {sap.ui.core.Item} oItem The item that should be removed
		 * @protected
		 */
		ComboBoxBase.prototype.handleItemRemoval = function (oItem) {};

		/**
		 * Fires when an object gets inserted in the items aggregation.
		 *
		 * @param {sap.ui.core.Item} oItem The item that should be inserted
		 * @protected
		 */
		ComboBoxBase.prototype.handleItemInsertion = function (oItem) {};

		/**
		 * Sets whether the list items should be recreated.
		 *
		 * @param {boolean} bRecreate True if the list items should be recreated
		 * @protected
		 */
		ComboBoxBase.prototype.setRecreateItems = function (bRecreate) {
			this._bRecreateItems = bRecreate;
		};

		/**
		 * Gets the flag indicating whether the list items should be recreated
		 *
		 * @returns {boolean} True if the list items should be recreated
		 * @protected
		 */
		ComboBoxBase.prototype.getRecreateItems = function () {
			return this._bRecreateItems;
		};

		ComboBoxBase.prototype.onBeforeRendering = function () {
			var bSuggestionsPopoverIsOpen =  this.isOpen(),
			sValueStateHeaderText = bSuggestionsPopoverIsOpen ?  this._getSuggestionsPopover()._getValueStateHeader().getText() : null,
			sValueStateHeaderValueState = bSuggestionsPopoverIsOpen ?  this._getSuggestionsPopover()._getValueStateHeader().getValueState() : null;

			ComboBoxTextField.prototype.onBeforeRendering.apply(this, arguments);

			if (bSuggestionsPopoverIsOpen && ((this.getValueStateText() && sValueStateHeaderText !== this.getValueStateText()) ||
				(this.getValueState() !== sValueStateHeaderValueState) || this.getFormattedValueStateText())) {
				/* If new value state, value state plain text or FormattedText is set
				while the suggestions popover is open update the value state header.
				If the input has FormattedText aggregation while the suggestions popover is open then
				it's new, because the old is already switched to have the value state header as parent */
				this._updateSuggestionsPopoverValueState();
			}
		};

		ComboBoxBase.prototype._handlePopupOpenAndItemsLoad = function (bOpenOnInteraction, oObjectToFocus) {
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

			if (oObjectToFocus) {
				oPicker = this.getPicker();
				oPicker && oPicker.setInitialFocus(oObjectToFocus);
			}

			this.open();
		};

		ComboBoxBase.prototype.exit = function() {
			ComboBoxTextField.prototype.exit.apply(this, arguments);

			this._oRb = null;

			if (this._getGroupHeaderInvisibleText()) {
				this._getGroupHeaderInvisibleText().destroy();
				this._oGroupHeaderInvisibleText = null;
			}

			if (this._oSuggestionPopover) {
				this._oSuggestionPopover.destroy();
				this._oSuggestionPopover = null;
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

			var oRelatedControl = Element.getElementById(oEvent.relatedControlId);

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
		 * @returns {sap.m.List|null} The list instance object or <code>null</code>.
		 * @private
		 */
		ComboBoxBase.prototype._getList = function() {
			var oList = this._oSuggestionPopover && this._oSuggestionPopover.getItemsContainer();

			if (this.bIsDestroyed || !oList) {
				return null;
			}

			return oList;
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
			var oSuggestionsPopover = this._getSuggestionsPopover();
			if (!oSuggestionsPopover) {
				return;
			}

			var	sValueState = this.getValueState(),
				bNewValueState = this.getValueState() !== oSuggestionsPopover._getValueStateHeader().getValueState(),
				oNewFormattedValueStateText = this.getFormattedValueStateText(),
				sValueStateText = this.getValueStateText(),
				bShouldPopoverBeUpdated = oNewFormattedValueStateText || bNewValueState;

			/* If open and no new FormattedText or value state is set to the Input then this is called
			onBeforeClose of the SuggestionsPopover. Switch the value state aggregation's
			parent from the ValueStateHeader to the ComboBox */
			if (oSuggestionsPopover.isOpen() && !bShouldPopoverBeUpdated) {
				this.setFormattedValueStateText(oSuggestionsPopover._getValueStateHeader().getFormattedText());
			}
			oSuggestionsPopover.updateValueState(sValueState, (oNewFormattedValueStateText || sValueStateText), this.getShowValueStateMessage());
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
			oPicker = this._oSuggestionPopover.getPopover();
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
			var oSuggPopover = new SuggestionsPopover(this);

			oSuggPopover.decorateParent(this);
			// Creates the internal controls of the <code>SuggestionsPopover</code>
			oSuggPopover.createSuggestionPopup(this, {showSelectedButton: this._hasShowSelectedButton()}, Input);
			this._decoratePopupInput(oSuggPopover.getInput());
			oSuggPopover.initContent(this.getId());
			this.forwardEventHandlersToSuggPopover(oSuggPopover);

			this._configureList(oSuggPopover.getItemsContainer());

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
			var oListItem = ListHelpers.getListItem(oItem);

			if (oListItem) {
				oListItem.setVisible(bSelectable);
			}
		};

		/**
		 * This event handler is called before the picker popup is opened.
		 *
		 */
		ComboBoxBase.prototype.onBeforeOpen = function () {
			this.closeValueStateMessage();
			this._updateSuggestionsPopoverValueState();
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
			this._updateSuggestionsPopoverValueState();
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
		 * @returns {sap.m.SuggestionsPopover} The SuggestionsPopover instance.
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
		ComboBoxBase.prototype.getPickerTextField = function () {
			var oSuggestionsPopover = this._getSuggestionsPopover();
			return oSuggestionsPopover ? oSuggestionsPopover.getInput() : null;
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
		 * @returns {sap.ui.core.Control}
		 * @protected
		 */
		ComboBoxBase.prototype.syncPickerContent = function () {};

		/**
		 * Opens the control's picker popup.
		 *
		 * @returns {this} <code>this</code> to allow method chaining.
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
			return ListHelpers.getVisibleItems(this.getItems());
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
				var oListItem = ListHelpers.getListItem(oItem);

				if (oListItem) {
					oListItem.setVisible(oItem.getEnabled() && this.getSelectable(oItem));
				}
			}, this);
		};

		/**
		 * Handles properties' changes of items in the aggregation named <code>items</code>.
		 *
		 * @protected
		 * @param {sap.ui.base.Event} oControlEvent The change event
		 * @param {boolean} bShowSecondaryValues Indicates whether second values should be shown
		 * @since 1.90
		 */
		ComboBoxBase.prototype.onItemChange = function(oControlEvent, bShowSecondaryValues) {
			forwardItemProperties({
				item: oControlEvent.getSource(),
				propName: oControlEvent.getParameter("name"),
				propValue: oControlEvent.getParameter("newValue")
			}, bShowSecondaryValues);
		};

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
		 * Gets the item from the aggregation named <code>items</code> at the given 0-based index.
		 *
		 * @param {int} iIndex Index of the item to return.
		 * @returns {sap.ui.core.Item|null} Item at the given index, or <code>null</code> if none.
		 * @public
		 */
		ComboBoxBase.prototype.getItemAt = function(iIndex) {
			return this.getItems()[ +iIndex] || null;
		};

		/**
		 * Gets the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item|null} The first item, or <code>null</code> if there are no items.
		 * @public
		 */
		ComboBoxBase.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Gets the last item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item|null} The last item, or <code>null</code> if there are no items.
		 * @public
		 */
		ComboBoxBase.prototype.getLastItem = function() {
			var aItems = this.getItems();
			return aItems[aItems.length - 1] || null;
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
				// The SeparatorItem does not escape those settings, so we need to take care of that.
				// This will ensure that values containing curly braces do not break the code.
				text: ManagedObject.escapeSettingsValue(oGroup.text) || ManagedObject.escapeSettingsValue(oGroup.key)
			});

			this.addAggregation("items", oHeader, bSuppressInvalidate);

			if (this._getList() && oHeader.isA("sap.ui.core.SeparatorItem")) {
				this._getList().addItem(this._mapItemToListItem(oHeader));
			}

			return oHeader;
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
		 * @returns {this} <code>this</code> to allow method chaining.
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
		 * @returns {sap.ui.core.Item|null} The removed item or <code>null</code>.
		 * @public
		 */

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
		 * @param {function|undefined} fnFilter Function to filter the items shown in the SuggestionsPopover
		 * @returns {void}
		 *
		 * @since 1.64
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
					this._handlePopupOpenAndItemsLoad(false, this);
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
		 * @protected
		 * @ui5-restricted
		 */
		ComboBoxBase.prototype.applyShowItemsFilters = function () {};

		return ComboBoxBase;
	});
