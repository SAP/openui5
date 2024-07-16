/*!
 * ${copyright}
 */

sap.ui.define([
	'./InputBase',
	'./ComboBoxBase',
	'./Tokenizer',
	'./Token',
	'./Popover',
	'./CheckBox',
	'./Toolbar',
	'./library',
	'sap/ui/core/Element',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/ui/core/Item',
	'sap/ui/core/ResizeHandler',
	'./MultiComboBoxRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/m/inputUtils/completeTextSelected",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/typeAhead",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/filterItems",
	"sap/m/inputUtils/itemsVisibilityHandler",
	"sap/m/inputUtils/forwardItemPropertiesToToken",
	"sap/m/inputUtils/getTokenByItem",
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual",
	"sap/base/assert",
	"sap/base/Log",
	'sap/ui/core/InvisibleText',
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
],
function(
	InputBase,
	ComboBoxBase,
	Tokenizer,
	Token,
	Popover,
	CheckBox,
	Toolbar,
	library,
	Element,
	EnabledPropagator,
	IconPool,
	Library,
	coreLibrary,
	Device,
	Item,
	ResizeHandler,
	MultiComboBoxRenderer,
	containsOrEquals,
	completeTextSelected,
	inputsDefaultFilter,
	typeAhead,
	ListHelpers,
	filterItems,
	itemsVisibilityHandler,
	forwardItemPropertiesToToken,
	getTokenByItem,
	KeyCodes,
	deepEqual,
	assert,
	Log,
	InvisibleText,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.m.TokenizerRenderMode
	var TokenizerRenderMode = library.TokenizerRenderMode;

	/**
	 * Constructor for a new MultiComboBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The MultiComboBox control provides a list box with items and a text field allowing the user to either type a value directly into the control or choose from the list of existing items.
	 *
	 * A drop-down list for selecting and filtering values.
	 * <h3>Overview</h3>
	 * The MultiComboBox control is commonly used to enable users to select one or more options from a predefined list. The control provides an editable input field to filter the list, and a dropdown arrow of available options.
	 * The select options in the list have checkboxes that permit multi-selection. Entered values are displayed as {@link sap.m.Token tokens}.
	 *
	 * When an invalid character is typed into the text field of the MultiComboBox control, the value state is changed to <code>sap.ui.core.ValueState.Error</code> only for a second, as the invalid value is immediately deleted from the input field.
	 * <h3>Structure</h3>
	 * The MultiComboBox consists of the following elements:
	 * <ul>
	 * <li> Input field - displays the selected option/s as token/s. Users can type to filter the list.
	 * <li> Drop-down arrow - expands\collapses the option list.</li>
	 * <li> Option list - the list of available options. <b>Note:</b> Disabled items are not visualized in the list with the available options, however they can still be accessed through the <code>items</code> aggregation.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>The user needs to select one or more options from a long list of options (maximum of approximately 200).</li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 * <li>The user needs to choose between two options such as ON or OFF and YES or NO. In this case, consider using a {@link sap.m.Switch switch} control instead</li>
	 * <li>You need to display more that one attribute. In this case, consider using the {@link sap.m.SelectDialog select dialog} or value help dialog instead.</li>
	 * <li>The user needs to search on multiple attributes. In this case, consider using the {@link sap.m.SelectDialog select dialog} or value help dialog instead.</li>
	 * <li>Your use case requires all available options to be displayed right away, without any user interaction. In this case, consider using the {@link sap.m.CheckBox checkboxes} instead.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * If there are many tokens, the control shows only the last selected tokens that fit and for the others a label N-more is provided.
	 * In case the length of the last selected token is exceeding the width of the control, only a label N-Items is shown. In both cases, pressing on the label will show the tokens in a popup.
	 * <u>On Phones:</u>
	 * <ul>
	 * <li>A new full-screen dialog opens where all items from the option list are shown.</li>
	 * <li>You can select and deselect items from the option list.</li>
	 * <li>With the help of a toggle button you can switch between showing all tokens and only selected ones.</li>
	 * <li>You can filter the option list by entering a value in the input.</li>
	 * </ul>
	 * <u>On Tablets:</u>
	 * <ul>
	 * <li>The auto-complete suggestions appear below or above the input field.</li>
	 * <li>You can review the tokens by swiping them to left or right.</li>
	 * </ul>
	 * <u>On Desktop:</u>
	 * <ul>
	 * <li>The auto-complete suggestions appear below or above the input field.</li>
	 * <li>You can review the tokens by pressing the right or left arrows on the keyboard.</li>
	 * <li>You can select single tokens or a range of tokens and you can copy/cut/delete them.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @extends sap.m.ComboBoxBase
	 * @public
	 * @since 1.22.0
	 * @alias sap.m.MultiComboBox
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/multi-combobox/ Multi-Combo Box}
	 */
	var MultiComboBox = ComboBoxBase.extend("sap.m.MultiComboBox", /** @lends sap.m.MultiComboBox.prototype */ {
		metadata: {

			library: "sap.m",
			designtime: "sap/m/designtime/MultiComboBox.designtime",
			properties: {

				/**
				 * Keys of the selected items. If the key has no corresponding item, no changes will apply. If duplicate keys exists the first item matching the key is used.
				 */
				selectedKeys: { type: "string[]", group: "Data", defaultValue: [] },

				/**
				 * Defines if there are selected items or not.
				 */
				hasSelection: { type: "boolean", visibility: "hidden", defaultValue: false },

				/**
				 * Determines if the select all checkbox is visible on top of suggestions.
				 */
				showSelectAll: { type: "boolean", defaultValue: false }
			},
			associations: {

				/**
				 * Provides getter and setter for the selected items from
				 * the aggregation named items.
				 */
				selectedItems: { type: "sap.ui.core.Item", multiple: true, singularName: "selectedItem" }
			},
			aggregations: {
				/**
				 * The tokenizer which displays the tokens
				 */
				tokenizer: {type: "sap.m.Tokenizer", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * Event is fired when selection of an item is changed.
				 * Note: please do not use the "change" event inherited from sap.m.InputBase
				 */
				selectionChange: {
					parameters: {

						/**
						 * Item which selection is changed
						 */
						changedItem: { type: "sap.ui.core.Item" },

						/**
						 * Array of items whose selection has changed.
						 */
						changedItems : {type : "sap.ui.core.Item[]"},

						/**
						 * Selection state: true if item is selected, false if
						 * item is not selected
						 */
						selected: { type: "boolean" },

						/**
						 * Indicates whether the select all action is triggered or not.
						 */
						selectAll : {type : "boolean"}
					}
				},

				/**
				 * Event is fired when user has finished a selection of items in a list box and list box has been closed.
				 */
				selectionFinish: {
					parameters: {

						/**
						 * The selected items which are selected after list box has been closed.
						 */
						selectedItems: { type: "sap.ui.core.Item[]" }
					}
				}
			},
			dnd: { draggable: false, droppable: true }
		},

		renderer: MultiComboBoxRenderer
	});

	IconPool.insertFontFaceStyle();
	EnabledPropagator.apply(MultiComboBox.prototype, [true]);


	/**
	 * Clones the <code>sap.m.MultiComboBox</code> control.
	 *
	 * @param {string} sIdSuffix Suffix to be added to the ids of the new control and its internal objects.
	 * @returns {this} The cloned <code>sap.m.MultiComboBox</code> control.
	 * @public
	 */
	MultiComboBox.prototype.clone = function (sIdSuffix) {
		var oComboBoxClone = ComboBoxBase.prototype.clone.apply(this, arguments),
			oList = this._getList();

		if (oList) {
			oComboBoxClone.syncPickerContent();
		}

		return oComboBoxClone;
	};

	/**
	 * Opens the control's picker popup.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @protected
	 */
	MultiComboBox.prototype.open = function () {

		if (!this.isOpen()) {
			this._bPickerIsOpening = true;
		}
		this.syncPickerContent();

		return ComboBoxBase.prototype.open.apply(this, arguments);
	};

	/* ----------------------------------------------------------- */
	/* Keyboard handling */
	/* ----------------------------------------------------------- */

	/**
	 * Handle End key pressed. Scroll the last token into viewport.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapend = function(oEvent) {
		if (oEvent.isMarked("forwardFocusToParent")) {
			this.focus();
		}
	};

	/**
	 * Handle Home key pressed. Scroll the first token into viewport.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsaphome = function(oEvent) {
		// if the caret is already moved to the start of the input text
		// execute tokenizer's onsaphome handler
		if (!this.getFocusDomRef().selectionStart && this._hasTokens()) {
			Tokenizer.prototype.onsaphome.apply(this.getAggregation("tokenizer"), arguments);
		}

		oEvent.setMarked();
	};

	/**
	 * Handle DOWN arrow key pressed. Set focus to the first list item if the list is open. Otherwise show in input field
	 * the description of the next traversal item.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapdown = function(oEvent) {
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled by this control
		oEvent.setMarked();

		// note: prevent document scrolling when arrow keys are pressed
		oEvent.preventDefault();

		this.syncPickerContent();

		if (!this.isOpen()) {
			this._oTraversalItem = this._getNextTraversalItem();

			if (this._oTraversalItem && !this.isFocusInTokenizer() && !this.isComposingCharacter()) {
				this.updateDomValue(this._oTraversalItem.getText());
				this.selectText(0, this.getValue().length);
			}
			return;
		}

		// wait for the composition and input events to fire properly since the focus of the list item
		// triggers unwanted extra events when called in while composing
		setTimeout(this.handleDownEvent.bind(this, oEvent), 0);
	};

	/**
	 * Handles Up arrow key pressed. Set the focus to the input field if there are no links in
	 * the value state message and the first list item is selected. Otherwise show in input field
	 * description of the previous traversal item.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapup = function(oEvent) {

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled
		// by this control
		oEvent.setMarked();

		// note: prevent document scrolling when arrow keys are pressed
		oEvent.preventDefault();

		this.syncPickerContent();

		if (this.isFocusInTokenizer() || this.isOpen()) {
			return;
		}

		this._oTraversalItem = this._getPreviousTraversalItem();

		if (this._oTraversalItem) {
			this.updateDomValue(this._oTraversalItem.getText());
			this.selectText(0, this.getValue().length);
		}
	};

	/**
	 * Handles the Down Arrow press event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.handleDownEvent = function (oEvent) {
		if (!this.isOpen()) {
			return;
		}

		var oSrcControl = oEvent.srcControl,
			oSrcDomRef = oSrcControl && oSrcControl.getDomRef(),
			bFocusInInput = containsOrEquals(this.getDomRef(), oSrcDomRef),
			oValueStateHeader = this.getPicker().getCustomHeader(),
			oValueStateHeaderDom = oValueStateHeader && oValueStateHeader.getDomRef();

		oEvent.setMarked();
		// note: Prevent document scrolling when Down key is pressed
		oEvent.preventDefault();

		if (bFocusInInput && this.getValueState() != ValueState.None) {
			this._handleFormattedTextNav();
			return;
		}

		if ((bFocusInInput || containsOrEquals(oValueStateHeaderDom, oSrcDomRef)) && this.getShowSelectAll()) {
			this.focusSelectAll();
			return;
		}

		this.focusFirstItemInList();
	};

	/**
	 * Handles the End press event.
	 *
	 * @param {jquery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.handleEndEvent = function (oEvent) {
		oEvent.setMarked();
		// Note: Prevent document scrolling when End key is pressed
		oEvent.preventDefault();

		var aVisibleItems = ListHelpers.getVisibleItems(this.getItems()),
			oListItem = aVisibleItems.length && ListHelpers.getListItem(aVisibleItems[aVisibleItems.length - 1]);

		oListItem && oListItem.focus();
	};

	/**
	 * Handles the Home press event.
	 *
	 * @param {jquery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.handleHomeEvent = function (oEvent) {
		oEvent.setMarked();
		// note: Prevent document scrolling when Home key is pressed
		oEvent.preventDefault();

		if (this.getValueState() !== ValueState.None) {
			this._handleFormattedTextNav();
			oEvent.stopPropagation(true);
			return;
		}

		if (this.getShowSelectAll()) {
			this.focusSelectAll();
			oEvent.stopPropagation(true);
			return;
		}

		this.focusFirstItemInList();
	};

	/**
	 * Focuses on the first item in the list of options.
	 * @private
	 */
	MultiComboBox.prototype.focusFirstItemInList = function () {
		var aVisibleItems = ListHelpers.getVisibleItems(this.getItems()),
			oListItem = aVisibleItems.length && ListHelpers.getListItem(aVisibleItems[0]);

		oListItem && oListItem.focus();
	};

	/**
	 * Checks if the focused element is part of the Tokenizer.
	 * @returns {boolean} True if the focus is inside the Tokenizer
	 * @private
	 */
	MultiComboBox.prototype.isFocusInTokenizer = function () {
		return this.getAggregation("tokenizer").getFocusDomRef() !== document.activeElement && this.getAggregation("tokenizer").getFocusDomRef().contains(document.activeElement);
	};

	/**
	 * Handles the <code>onsapshow</code> event when either F4 is pressed or Alt + Down arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapshow = function(oEvent) {
		oEvent.preventDefault();

		this._handleItemToFocus();
		ComboBoxBase.prototype.onsapshow.apply(this, arguments);
	};

	MultiComboBox.prototype._handlePopupOpenAndItemsLoad = function () {
		// should sync the content before setting the initial focus and opening the picker
		// the picker opening is handled in the base function
		this._handleItemToFocus();
		ComboBoxBase.prototype._handlePopupOpenAndItemsLoad.apply(this, arguments);
	};

	/**
	 * Generates an event delegate for keyboard navigation for <code>sap.m.FormattedText</code> value state header.
	 * If the focus is on the formatted text value state message:
	 *  - pressing the Up arrow key will move the focus to the input,
	 *  - pressing the Down arrow key - will select the first selectable item.
	 *
	 * @param {object} oValueStateHeader The value state header.
	 * @param {array} aValueStateLinks The links in <code>sap.m.FormattedText</code> value state message.
	 * @returns {object} Delegate for navigation and focus handling for <code>sap.m.ValueStateHeader</code> containing <code>sap.m.FormattedText</code> message with links.
	 *
	 * @private
	 */
	MultiComboBox.prototype._valueStateNavDelegate = function(oValueStateHeader, aValueStateLinks) {
		return {
			onsapdown: this.handleDownEvent,
			onsapup: this.focus,
			onsapend: this.handleEndEvent,
			onfocusout: function(oEvent) {
				// Links should not be tabbable after the focus is moved outside of the value state header
				oValueStateHeader.removeStyleClass("sapMFocusable");

				// Check if the element getting the focus is outside the value state header
				if (!oValueStateHeader.getDomRef().contains(oEvent.relatedTarget)) {
					aValueStateLinks.forEach(function(oLink) {
						oLink.getDomRef().setAttribute("tabindex", "-1");
					});
				}
			},
			onsapshow: this.close,
			onsaphide: this.close
		};
	};

	/**
	 * Event delegate for the last link in the <code>sap.m.FormattedText</code> value state message.
	 * Closes the picker and the value state popup if tab key is pressed on the last value state message link in the header.
	 *
	 * @private
	 */
	MultiComboBox.prototype._closePickerDelegate = {
		onsaptabnext: function() {
			this.close();

			// Closing with timeout as it is open that way
			setTimeout(function() {
				this.closeValueStateMessage();
			}.bind(this), 0);
		}
	};

	/**
	 * Event delegate that Handles the arrow navigation of the links in the value state header
	 *
	 * @private
	 */
	MultiComboBox.prototype._formattedTextLinksNav = {
		onsapup: this.focus,
		onsapdown: this.handleDownEvent
	};

	/**
	 * Handles the focus and the navigation of the value state header
	 * when <code>sap.m.Link</code> is present in the value state message.
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleFormattedTextNav = function() {
		var	oCustomHeader = this.getPicker().getCustomHeader(),
			aValueStateLinks = this.getValueStateLinks(),
			oLastValueStateLink = aValueStateLinks ? aValueStateLinks[aValueStateLinks.length - 1] : null,
			oFirstValueStateLink = aValueStateLinks ? aValueStateLinks[0] : null;

		if (!oCustomHeader.getDomRef()  || oCustomHeader.getDomRef() === document.activeElement) {
			return;
		}

		if (!this.oValueStateNavDelegate) {
			this.oValueStateNavDelegate = this._valueStateNavDelegate(oCustomHeader, aValueStateLinks);
			oCustomHeader.addEventDelegate(this.oValueStateNavDelegate, this);
		}

		// Make the value state header focusable and focus it
		oCustomHeader.getDomRef().setAttribute("tabindex", "-1");
		oCustomHeader.addStyleClass("sapMFocusable");
		oCustomHeader.focus();

		// Linka should not be part of the tab chain when the focus is out of the value state header
		// (on the items list or on the input) and the opposite when the header is focused.
		aValueStateLinks.forEach(function(oLink) {
			oLink.getDomRef().setAttribute("tabindex", "0");
			oLink.addEventDelegate(this._formattedTextLinksNav, this);
		}, this);

		this.oMoveFocusBackToVSHeader = !this.oMoveFocusBackToVSHeader ? {
			onsaptabprevious: function(oEvent) {
				oEvent.preventDefault();
				oCustomHeader.focus();
				oCustomHeader.addStyleClass("sapMFocusable");
			}
		} : this.oMoveFocusBackToVSHeader;

		oLastValueStateLink && oLastValueStateLink.addEventDelegate(this._closePickerDelegate, this);
		oFirstValueStateLink && oFirstValueStateLink.addEventDelegate(this.oMoveFocusBackToVSHeader, this);
	};

	/**
	 * Handles when Alt + Up arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	MultiComboBox.prototype.onsaphide = function (oEvent) {
		this.onsapshow(oEvent);
	};

	/**
	 * Handles the item selection when user triggers an item selection via key press (TAB, ENTER etc.).
	 *
	 * @param {jQuery.Event} oEvent The key event object
	 * @private
	 */
	MultiComboBox.prototype._selectItemByKey = function(oEvent) {
		var aVisibleItems, oParam,
			oItem, i, bItemMatched, bKeyIsValid;

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled
		// by this control
		if (oEvent) {
			oEvent.setMarked();
		}

		aVisibleItems = this._getUnselectedItems();

		for (i = 0; i < aVisibleItems.length; i++) {
			// Empty string should be valid key for sap.ui.core.Item only
			// as sap.ui.core.SeparatorItem with empty key is used for Grouping
			// while sap.ui.core.SeparatorItem without key and text is used for horizontal visible separator
			bKeyIsValid = !(aVisibleItems[i].getKey() === undefined || aVisibleItems[i].getKey() === null) && !aVisibleItems[i].isA("sap.ui.core.SeparatorItem");

			if (aVisibleItems[i].getText().toUpperCase() === this.getValue().toUpperCase() && bKeyIsValid) {
				oItem = aVisibleItems[i];
				bItemMatched = true;
				break;
			}
		}

		if (bItemMatched) {
			oParam = {
				item: oItem,
				id: oItem.getId(),
				key: oItem.getKey(),
				fireChangeEvent: true,
				fireFinishEvent: true,
				suppressInvalidate: true,
				listItemUpdated: false
			};

			this._bPreventValueRemove = false;

			if (this.getValue() === "" || (typeof this.getValue() === "string" && oItem.getText().toLowerCase().startsWith(this.getValue().toLowerCase()))) {
				if (ListHelpers.getListItem(oItem).getSelected()) {
					this.setValue('');
				} else {
					this.setSelection(oParam);
				}
			}
		} else {
			this._bPreventValueRemove = true;
		}

		if (oEvent) {
			this.close();
		}
	};

	/**
	 * Handle when enter is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapenter = function(oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");

		// intentionally skip implementation of ComboTextField.prototype.onsapenter
		InputBase.prototype.onsapenter.apply(this, arguments);

		// validate if an item is already selected
		this._showAlreadySelectedVisualEffect();

		if (this.getValue() && !this.isComposingCharacter()) {
			this._selectItemByKey(oEvent);
		}

		//Open popover with items if in readonly mode and has Nmore indicator
		if (!this.getEditable() && oTokenizer.getHiddenTokensCount() && oEvent.target === this.getFocusDomRef()) {
			oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		}

	};

	/**
	 * Handles tab key event. Selects an item according to given input if there is exactly one fitting item available.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsaptabnext = function(oEvent) {
		var sInputValue = this.getValue();
		if (sInputValue) {
			var aSelectableItems = this._getUnselectedItemsStartingText(sInputValue);
			if (aSelectableItems.length) {
				this._selectItemByKey(oEvent);
			} else {
				this._showWrongValueVisualEffect();
			}
		}
	};

	MultiComboBox.prototype.onsaptabprevious = MultiComboBox.prototype.onsaptabnext;

	/* =========================================================== */
	/* Event handlers */
	/* =========================================================== */

	/**
	 * Handle the focus leave event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapfocusleave = function(oEvent) {
		var bTablet = this.isPlatformTablet(),
			oControl = Element.getElementById(oEvent.relatedControlId),
			oFocusDomRef = oControl && oControl.getFocusDomRef(),
			sOldValue = this.getValue(),
			oPicker = this.getPicker(),
			oTokenizer = this.getAggregation("tokenizer");

		// If focus target is outside of picker and the picker is fully opened
		if (!this._bPickerIsOpening && (!oPicker || !oPicker.getFocusDomRef() || !oFocusDomRef || !(oPicker.getFocusDomRef() !== oFocusDomRef && oPicker.getFocusDomRef().contains(oFocusDomRef)))) {
			this.setValue(null);

			// fire change event only if the value of the MCB is not empty
			if (sOldValue) {
				this.fireChangeEvent("", { value: sOldValue });
			}

			// if the focus is outside the MultiComboBox, the tokenizer should be collapsed
			if (!(this.getDomRef() !== document.activeElement && this.getDomRef().contains(document.activeElement))) {
				oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);
			}
		}

		if (oPicker && oFocusDomRef) {
			if (deepEqual(oPicker.getFocusDomRef(), oFocusDomRef) && !bTablet && !this.isPickerDialog()) {
				// force the focus to stay in the MultiComboBox field when scrollbar
				// is moving
				this.focus();
			}
		}

	};

	/**
	 * Handle the focus in event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onfocusin = function(oEvent) {
		var oPicker = this.getPicker();
		var bPreviousFocusInDropdown = false;
		var oPickerDomRef  = oPicker && oPicker.getFocusDomRef();
		var sCurrentState = (oPicker && oPicker.oPopup.getOpenState()) || OpenState.CLOSED;
		var bPickerClosedOrClosing = sCurrentState === OpenState.CLOSING || sCurrentState === OpenState.CLOSED;
		var bDropdownPickerType = this.getPickerType() === "Dropdown";
		var oTokenizer = this.getAggregation("tokenizer");

		if (bDropdownPickerType) {
			bPreviousFocusInDropdown = oPickerDomRef && (oPickerDomRef !== oEvent.relatedTarget && oPickerDomRef.contains(oEvent.relatedTarget));
		}

		if (this.getEditable() && oEvent.target === this.getDomRef("inner")) {
			oTokenizer.setRenderMode(TokenizerRenderMode.Loose);
		}

		if (oEvent.target === this.getFocusDomRef()) {
			oTokenizer.hasOneTruncatedToken() && oTokenizer.setFirstTokenTruncated(false);
			this.getEnabled() && this.addStyleClass("sapMFocus");
			// enable type ahead when switching focus from the dropdown to the input field
			// we need to check whether the focus has been triggered by the popover's closing or just a manual focusin
			// isOpen is still true as the closing has not finished yet.
			!bPickerClosedOrClosing && bPreviousFocusInDropdown && this.handleInputValidation(oEvent, false);
		}

		if (oEvent.target === this.getOpenArea() && bDropdownPickerType && !this.isPlatformTablet()) {
			// avoid the text-editing mode popup to be open on mobile,
			// text-editing mode disturbs the usability experience (it blocks the UI in some devices)

			// force the focus to stay in the input field
			this.focus();
		}

		// message popup won't open when the item list is shown
		if (!this.isOpen() && this.shouldValueStateMessageBeOpened()) {
			this.openValueStateMessage();
		}
	};

	/**
	 * Handles the <code>tap</code> event on the list's items.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleItemTap = function(oEvent) {
		var oTappedControl = Element.closestTo(oEvent.target);

		if (!oTappedControl.isA("sap.m.CheckBox") && !oTappedControl.isA("sap.m.GroupHeaderListItem")) {
			this._bCheckBoxClicked = false;
		}
	};

	/**
	 * Handles the <code>press</code> event on the list's items.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleItemPress = function(oEvent) {

		// If an item is selected clicking on checkbox inside of suggest list the list with all entries should be opened
		if (this.isOpen() && this._isListInSuggestMode() && this.getPicker().oPopup.getOpenState() !== OpenState.CLOSING) {
			this.clearFilter();
			var oItem = this._getLastSelectedItem();

			// Scrolls an item into the visual viewport
			if (oItem) {
				ListHelpers.getListItem(oItem).focus();
			}
		}
	};

	/**
	 * Handles the <code>selectionChange</code> event on the List.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleSelectionLiveChange = function(oEvent) {
		if (oEvent.getParameter("selectAll")) {
			return;
		}

		var oListItem = oEvent.getParameter("listItem");
		var aListItems = oEvent.getParameter("listItems");
		var oListItemToFocus = aListItems && aListItems[aListItems.length - 1] || oListItem;
		var oInputControl = this.isPickerDialog() ? this.getPickerTextField() : this;
		var bShouldFocusItem = this._getIsClick() && !!oListItemToFocus;
		var bIsSelected = oEvent.getParameter("selected");
		var oNewSelectedItem = ListHelpers.getItemByListItem(this.getItems(), oListItem);
		var aNewSelectedItems;

		if (aListItems && aListItems.length) {
			aNewSelectedItems = [];
			aListItems.forEach(function (oNewItem) {
				if (oNewItem.getType() === "Active") {
					aNewSelectedItems.push(ListHelpers.getItemByListItem(this.getItems(), oNewItem));
				}
			}, this);
		}

		if (oListItem.getType() === "Inactive") {
			// workaround: this is needed because the List fires the "selectionChange" event on inactive items
			return;
		}

		// pre-assertion
		assert(oNewSelectedItem, "The corresponding mapped item was not found on " + this);

		if (!oNewSelectedItem) {
			return;
		}

		var oParam = {
			item: oNewSelectedItem,
			items: aNewSelectedItems,
			id: oNewSelectedItem.getId(),
			key: oNewSelectedItem.getKey(),
			selectAll: false,
			fireChangeEvent: true,
			suppressInvalidate: true,
			listItemUpdated: true
		};

		if (bIsSelected) {
			// update the selected item
			this.fireChangeEvent(oNewSelectedItem.getText());
			this.setSelection(oParam);
		} else {
			this.fireChangeEvent(oNewSelectedItem.getText());
			this.removeSelection(oParam);
		}

		if (this._bCheckBoxClicked) {
			oInputControl.setValue(this._sOldInput);

			if (bShouldFocusItem && this.isOpen() && this.getPicker().oPopup.getOpenState() !== OpenState.CLOSING) {
				oListItemToFocus.focus();
				this._setIsClick(false);
			}

		} else {
			this._bCheckBoxClicked = true;
			this.setValue("");
			this.close();
		}
	};

	/**
	 * Handles the <code>keydown</code> event when any key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onkeydown = function(oEvent) {
		var bEditable = this.getEditable(),
			oTokenizer = this.getAggregation("tokenizer"),
			iTokensCount = oTokenizer.getTokens().length;
		ComboBoxBase.prototype.onkeydown.apply(this, arguments);

		if (!this.getEnabled()) {
			return;
		}

		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.I && iTokensCount) {
			oEvent.preventDefault();
			if (bEditable) {
				this._togglePopover();
			} else {
				this._handleIndicatorPress();
			}
			return;
		}

		this._bIsPasteEvent = (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.V);

		// only if there is no text and tokenizer has some tokens
		if (this.getValue().length === 0 && (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.A)
			&& this._hasTokens()) {

			oTokenizer.focus();
			oTokenizer.selectAllTokens(true);
			oEvent.preventDefault();
		}

		// workaround - keyup is not fired on mobile device
		if (this.isPickerDialog()) {
			this._sOldValue = this.getPickerTextField().getValue();
			this._iOldCursorPos = jQuery(this.getFocusDomRef()).cursorPos();
		}

		this._bDoTypeAhead = !Device.os.android && (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
	};

	/**
	 * Handles the <code>input</code> event on the control's input field.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.oninput = function(oEvent) {
		ComboBoxBase.prototype.oninput.apply(this, arguments);

		var oInput = oEvent.srcControl,
			bIsPickerDialog = this.isPickerDialog(),
			oInputField = bIsPickerDialog ? this.getPickerTextField() : this,
			sValueState = oInputField.getValueState();

		// reset the value state
		if (sValueState === ValueState.Error && this._bAlreadySelected) {
				oInputField.setValueState(this._sInitialValueState);
				oInputField.setValueStateText(this._sInitialValueStateText);
				this._bAlreadySelected = false;
		}

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		this.syncPickerContent();

		// suppress invalid value
		this.handleInputValidation(oEvent, this.isComposingCharacter());

		if (this._bIsPasteEvent) {
			oInput.updateDomValue(this._sOldValue || oEvent.target.value || "");
			return;
		}


		if (this.isOpen()) {
			// wait a tick so the setVisible call has replaced the DOM
			setTimeout(this.highlightList.bind(this, this._sOldInput));
		}

		// if recommendations were shown - add the icon pressed style
		if (this._getItemsShownWithFilter()) {
			this.toggleIconPressedStyle(true);
		}
	};

	/**
	 * Filters array of items for given value.
	 *
	 * @param {object} mOptions Options object
	 * @returns {sap.ui.core.Item[]} Array of filtered items
	 * @private
	 */
	MultiComboBox.prototype.filterItems = function (mOptions) {
		return filterItems(this, mOptions.items, mOptions.value, true, false, this.fnFilter || inputsDefaultFilter);
	};

	/**
	 * Function is called on key up keyboard input
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onkeyup = function(oEvent) {
		ComboBoxBase.prototype.onkeyup.apply(this, arguments);

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		this._sOldValue = this.getValue();
		this._iOldCursorPos = jQuery(this.getFocusDomRef()).cursorPos();
	};

	/* ----------------------------------------------------------- */
	/*                                                             */
	/* ----------------------------------------------------------- */

	/**
	 * Triggers the value state "Error" for 1s, and resets the state to the previous one.
	 *
	 * @private
	 */
	MultiComboBox.prototype._showWrongValueVisualEffect = function() {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var sInitialValueStateText = this._sInitialValueStateText;
		var sInitialValueState = this._sInitialValueState;
		var sInvalidEntry = sInitialValueStateText || this._oRbC.getText("VALUE_STATE_ERROR");
		var that = this;

		if (sInitialValueState === ValueState.Error) {
			return;
		}

		if (oSuggestionsPopover) {
			oSuggestionsPopover.updateValueState(ValueState.Error, sInvalidEntry, true);
			setTimeout(oSuggestionsPopover.updateValueState.bind(oSuggestionsPopover, that.getValueState(), sInvalidEntry, true), 1000);
		}

		if (!this.isPickerDialog()) {
			this.setValueState(ValueState.Error);
			this.setValueStateText(this.getValueStateText() || sInvalidEntry);

			setTimeout(this["setValueState"].bind(this, sInitialValueState || ValueState.Error), 1000);
		}

		this._syncInputWidth(this.getAggregation("tokenizer"));
	};

	/**
	 * Triggers the value state "Error" when the item is already selected and enter is pressed.
	 *
	 * @private
	 */
	MultiComboBox.prototype._showAlreadySelectedVisualEffect = function() {
		var sAlreadySelectedText = this._oRb.getText("VALUE_STATE_ERROR_ALREADY_SELECTED");

		if (!this.getValue()) {
			return;
		}

		var bAlreadySelected = !!this.getSelectedItems().filter(function(oItem) {
			return oItem.getText().toLowerCase() === this.getValue().toLowerCase();
		}, this).length;

		var bNewSelection = this.getItems().filter(function(oItem) {
			return oItem.getText().toLowerCase() === this.getValue().toLowerCase();
		}, this).length;

		if (bAlreadySelected) {
			if (!this._bAlreadySelected) {
				this._sInitialValueState = this.getValueState();
				this._sInitialValueStateText = this.getValueStateText();
			}

			this._bAlreadySelected = true;
			this.setValueStateText(sAlreadySelectedText);
			this.setValueState("Error");

			return;
		} else if (bNewSelection) {
			return;
		} else {
			this._showWrongValueVisualEffect();
		}
	};

	MultiComboBox.prototype._hasShowSelectedButton = function () {
		return true;
	};

	MultiComboBox.prototype.forwardEventHandlersToSuggPopover = function (oSuggPopover) {
		ComboBoxBase.prototype.forwardEventHandlersToSuggPopover.apply(this, arguments);
		oSuggPopover.setShowSelectedPressHandler(this._filterSelectedItems.bind(this));
	};

	/**
	 * <code>MultiComboBox</code> picker configuration
	 *
	 * @param {sap.m.Popover | sap.m.Dialog} oPicker Picker instance
	 * @protected
	 */
	MultiComboBox.prototype.configPicker = function (oPicker) {
		var oRenderer = this.getRenderer(),
			CSS_CLASS_MULTICOMBOBOX = oRenderer.CSS_CLASS_MULTICOMBOBOX;

		oPicker.setHorizontalScrolling(false)
			.addStyleClass(oRenderer.CSS_CLASS_COMBOBOXBASE + "Picker")
			.addStyleClass(CSS_CLASS_MULTICOMBOBOX + "Picker")
			.addStyleClass(CSS_CLASS_MULTICOMBOBOX + "Picker-CTX")
			.attachBeforeOpen(this.onBeforeOpen, this)
			.attachAfterOpen(this.onAfterOpen, this)
			.attachBeforeClose(this.onBeforeClose, this)
			.attachAfterClose(this.onAfterClose, this)
			.addEventDelegate({
				onBeforeRendering : this.onBeforeRenderingPicker,
				onAfterRendering : this.onAfterRenderingPicker
			}, this);
	};

	/**
	 * Configures the SuggestionsPopover internal list and attaches it's event handlers/delegates.
	 *
	 * @param {sap.m.List} oList The list instance to be configured
	 * @private
	 * @function
	 */
	MultiComboBox.prototype._configureList = function (oList) {
		// overwrite the default page size of the list
		// in order to be consistent with the other inputs
		// page size is used for pageup and pagedown
		var iPageSize = 10;

		if (!oList) {
			return;
		}

		// apply aria role="listbox" to List control
		oList.applyAriaRole("listbox");

		// configure the list
		oList.setMode(ListMode.MultiSelect);
		oList.setIncludeItemInSelection(true);
		oList.setGrowingThreshold(iPageSize);

		// attach event handlers
		oList
			.attachBrowserEvent("tap", this._handleItemTap, this)
			.attachSelectionChange(this._handleSelectionLiveChange, this)
			.attachItemPress(this._handleItemPress, this);

		// attach event delegates
		oList.addEventDelegate({
			onAfterRendering: this.onAfterRenderingList,
			onfocusin: this.onFocusinList
		}, this);

		this.getShowSelectAll() && this.createSelectAllHeaderToolbar(oList);
	};

	/**
	 * Modifies the suggestions dialog input
	 * @param {sap.m.Input} oInput The input
	 *
	 * @returns {sap.m.Input} The modified input control
	 * @private
	 * @ui5-restricted
	 */
	MultiComboBox.prototype._decoratePopupInput = function(oInput) {
		ComboBoxBase.prototype._decoratePopupInput.apply(this, arguments);

		if (!oInput || !oInput.isA(["sap.m.InputBase"])) {
			return;
		}

		oInput.attachSubmit(function (oEvent) {
			var sValue = oInput.getValue();
			if (sValue) {
				this.setValue(sValue);
				this._selectItemByKey();
				this.setValue(this._sOldInput);
				this.close();
			}
		}.bind(this));

		oInput.addEventDelegate({
			// remove the type ahead when focus is not in the input
			onfocusout: this._handleInputFocusOut
		}, this);

		oInput.attachChange(this._handleInnerInputChange.bind(this));

		return oInput;
	};

	/**
	 * Handles dialog's OK button press.
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleOkPress = function () {
		ComboBoxBase.prototype._handleOkPress.apply(this, arguments);

		if (this.getValue()) {
			this._selectItemByKey();
		}
	};

	/**
	 * Handles the picker input change.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleInnerInputChange = function (oEvent) {
		if (oEvent.getParameter("value") === "") {
			this._sOldInput = "";
			this.clearFilter();
		}
	};

	/**
	 * This hook method is called before the MultiComboBox is rendered.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.onBeforeRendering = function() {

		var bEditable = this.getEditable();
		var oTokenizer = this.getAggregation("tokenizer");
		var aItems = this.getItems();

		ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);

		this._bInitialSelectedKeysSettersCompleted = true;

		oTokenizer.setEnabled(this.getEnabled());
		oTokenizer.setEditable(bEditable);
		this._updatePopoverBasedOnEditMode(bEditable);

		if (!aItems.length) {
			this._clearTokenizer();
		}

		if (this._getList()) {
			this.syncPickerContent(true);
		}

		this.toggleSelectAllVisibility(this.getShowSelectAll());

		// In case there is an old input, the picker is opened and there are items
		// we need to return the previous state of the filtering as syncPickerContent
		// will have removed it.
		if (this._sOldInput && aItems.length && this.isOpen()) {
			itemsVisibilityHandler(this.getItems(), this.filterItems({ value: this._sOldInput, items: aItems }));
			// wait a tick so the setVisible call has replaced the DOM
			setTimeout(this.highlightList.bind(this, this._sOldInput));
		}

		this._deregisterResizeHandler();
		this._synchronizeSelectedItemAndKey();
		this.setProperty("hasSelection", !!this.getSelectedItems().length);

		if (!this._bAlreadySelected) {
			this._sInitialValueStateText = this.getValueStateText();
		}

		if (this.getValueState() !== ValueState.Error) {
			this._sInitialValueState = this.getValueState();
		}

		if (this.getShowClearIcon()) {
			this._getClearIcon().setVisible(this.shouldShowClearIcon());
		} else if (this._oClearIcon) {
			this._getClearIcon().setVisible(false);
		}
	};

	/**
	 * Creates picker if doesn't exist yet and sync with Control items
	 *
	 * @param {boolean} [bForceListSync] Force MultiComboBox to SuggestionPopover sync
	 * @protected
	 * @returns {sap.m.Dialog|sap.m.Popover} The picker instance
	 */
	MultiComboBox.prototype.syncPickerContent = function (bForceListSync) {
		var aItems, oList;
		var oPicker = this.getPicker();
		var oTokenizer = this.getAggregation("tokenizer");

		if (!oPicker) {
			oPicker = this.createPicker(this.getPickerType());
			this._updateSuggestionsPopoverValueState();
			bForceListSync = true;
		}

		if (bForceListSync) {
			oList = this._getList();
			aItems = this.getEditable() ? this.getItems() : this.getSelectedItems();

			this._synchronizeSelectedItemAndKey();

			var aTokens = oTokenizer.getTokens();
			var iFocusedIndex = aTokens.findIndex(function (oToken) {
				return document.activeElement === oToken.getDomRef();
			});

			// prevent closing of popup on re-rendering
			oList.destroyItems();
			this._clearTokenizer();
			this._fillList(aItems);

			this.bShouldRestoreTokenizerFocus = iFocusedIndex > -1;
			this.iFocusedIndex = iFocusedIndex;

			// save focused index, and re-apply after rendering of the list
			if (oList.getItemNavigation()) {
				this._iFocusedIndex = oList.getItemNavigation().getFocusedIndex();
			}
		}

		return oPicker;
	};

	/**
	 * Registers resize handler
	 *
	 * @private
	 */
	MultiComboBox.prototype._registerResizeHandler = function () {
		assert(!this._iResizeHandlerId, "Resize handler already registered");
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	/**
	 * Deregisters resize handler
	 *
	 * @private
	 */
	MultiComboBox.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	/**
	 * Handler for resizing
	 *
	 * @private
	 */
	MultiComboBox.prototype._onResize = function () {
		var oTokenizer = this.getAggregation("tokenizer");
		oTokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		this._syncInputWidth(oTokenizer);
		this._handleNMoreAccessibility();
	};

	/**
	 * This hook method is called after the MultiComboBox's Pop-up is rendered.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.onAfterRenderingPicker = function() {
		var fnOnAfterRenderingPopupType = this["_onAfterRendering" + this.getPickerType()];
		var iInputWidth = this.getDomRef().getBoundingClientRect().width;
		var sPopoverMaxWidth = getComputedStyle(this.getDomRef()).getPropertyValue("--sPopoverMaxWidth");

		if (fnOnAfterRenderingPopupType) {
			fnOnAfterRenderingPopupType.call(this);
		}

		if (iInputWidth <= parseInt(sPopoverMaxWidth) && !Device.system.phone) {
			this.getPicker().addStyleClass("sapMSuggestionPopoverDefaultWidth");
		} else {
			this.getPicker().getDomRef().style.setProperty("max-width", iInputWidth + "px");
			this.getPicker().addStyleClass("sapMSuggestionPopoverInputWidth");
		}

	};

	/**
	 * This event handler will be called before the MultiComboBox Popup is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onBeforeOpen = function() {
		ComboBoxBase.prototype.onBeforeOpen.apply(this, arguments);
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var fnPickerTypeBeforeOpen = this["_onBeforeOpen" + this.getPickerType()],
			oDomRef = this.getFocusDomRef();

		if (oDomRef) {
			// expose a parent/child contextual relationship to assistive technologies,
			// notice that the "aria-controls" attribute is set when the popover opened.
			oDomRef.setAttribute("aria-controls", this.getPicker().getId());
		}

		// add the active state to the MultiComboBox's field
		this.addContent();
		this._aInitiallySelectedItems = this.getSelectedItems();
		this._synchronizeSelectedItemAndKey();

		if (fnPickerTypeBeforeOpen) {
			fnPickerTypeBeforeOpen.call(this);
		}

		oSuggestionsPopover.resizePopup(this);
	};

	/**
	 * This event handler will be called after the MultiComboBox's Pop-up is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterOpen = function() {
		var oDomRef = this.getFocusDomRef(),
			aValueStateLinks = this.getValueStateLinks();

		oDomRef && this.getFocusDomRef().setAttribute("aria-expanded", "true");
		this._bPickerIsOpening = false;

		// If there are links in the value state take the links out of
		// the tab chain by default. They will be tabbable only if the focus in the value state message
		aValueStateLinks.forEach(function(oLink) {
			oLink.addDelegate({
				onAfterRendering: function() {
					if (this.getFocusDomRef()) {
						this.getFocusDomRef().setAttribute("tabindex", "-1");
					}
				}
			}, oLink);
		});

		// close error message when the list is open, otherwise the list can be covered by the message
		this.closeValueStateMessage();
	};

	/**
	 * This event handler will be called before the MultiComboBox's Pop-up is closed.
	 *
	 */
	MultiComboBox.prototype.onBeforeClose = function () {
		ComboBoxBase.prototype.onBeforeClose.apply(this, arguments);
	};

	/**
	 * This event handler will be called after the MultiComboBox's Pop-up is closed.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterClose = function() {
		var bUseNarrow = !(this.getDomRef() !== document.activeElement && this.getDomRef().contains(document.activeElement)) || this.isPickerDialog(),
			oDomRef = this.getFocusDomRef();

		oDomRef && this.getFocusDomRef().setAttribute("aria-expanded", "false");

		// remove the active state of the MultiComboBox's field
		this.toggleIconPressedStyle(false);

		// Show all items when the list will be opened next time
		this.clearFilter();

		// resets or not the value of the input depending on the event (enter does not clear the value)
		!this.isComposingCharacter() && !this._bPreventValueRemove && this.setValue("");

		// clear old values
		this._sOldValue = "";
		this._sOldInput = "";

		// clear the typed in value, since SP does not clean it itself,
		// if no autocomplete property is present
		this._getSuggestionsPopover()._sTypedInValue = "";

		if (this.isPickerDialog()) {
			// reset the value state after the dialog is closed
			this.getPickerTextField().setValue("");
			this.getFilterSelectedButton() && this.getFilterSelectedButton().setPressed(false);
		}

		this.fireSelectionFinish({
			selectedItems: this.getSelectedItems()
		});

		this.getAggregation("tokenizer").setRenderMode(bUseNarrow ? TokenizerRenderMode.Narrow : TokenizerRenderMode.Loose);

		// show value state message when focus is in the input field
		if (this.getValueState() == ValueState.Error && document.activeElement === this.getFocusDomRef()) {
			this.selectText(0, this.getValue().length);
		}
	};

	/**
	 * Called before the Dialog is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype._onBeforeOpenDialog = function() {};

	/**
	 * This event handler will be called before the control's picker popover is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype._onBeforeOpenDropdown = function() {
		var oPopover = this.getPicker(),
			oDomRef = this.getDomRef(),
			sWidth;

		if (oDomRef && oPopover) {
			sWidth = (oDomRef.offsetWidth / parseFloat(library.BaseFontSize)) + "rem";
			oPopover.setContentMinWidth(sWidth);
		}
	};

	/**
	 * Gets the filter selected toggle button for the control's picker.
	 *
	 * @returns {sap.m.ToggleButton} The button's instance
	 * @private
	 */
	MultiComboBox.prototype.getFilterSelectedButton = function () {
		return this._getSuggestionsPopover().getFilterSelectedButton();
	};

	/**
	 * Filters visible selected items
	 * @param {jQuery.Event} oEvent The event object
	 * @param {boolean} bForceShowSelected Should the selected items be shown
	 * @returns {void}
	 * @private
	 */
	MultiComboBox.prototype._filterSelectedItems = function (oEvent, bForceShowSelected) {
		var oSource = oEvent.oSource, oListItem, bMatch,
			sValue = this.getPickerTextField() ? this.getPickerTextField().getValue() :  "",
			bShowSelectedOnly = (oSource && oSource.getPressed && oSource.getPressed()) || bForceShowSelected,
			aVisibleItems = ListHelpers.getVisibleItems(this.getItems()),
			aItems = this.getItems(),
			aSelectedItems = this.getSelectedItems(),
			oLastGroupListItem = null;

		if (bShowSelectedOnly) {
			aVisibleItems.forEach(function(oItem) {
				bMatch = aSelectedItems.indexOf(oItem) > -1 ? true : false;
				oListItem = ListHelpers.getListItem(oItem);

				if (!oListItem) {
					return;
				}

				if (oListItem.isA("sap.m.GroupHeaderListItem")) {
					oListItem.setVisible(false);
					oLastGroupListItem = oListItem;
				} else {
					oListItem.setVisible(bMatch);

					if (bMatch && oLastGroupListItem) {
						oLastGroupListItem.setVisible(true);
					}
				}
			}, this);
		} else {
			itemsVisibilityHandler(this.getItems(), this.filterItems({value: sValue, items: aItems}));
		}

		this.manageSelectAllCheckBoxState();
	};

	/**
	 * Reverts the selection as before opening the picker.
	 *
	 * @private
	 */
	MultiComboBox.prototype.revertSelection = function () {
		this.setSelectedItems(this._aInitiallySelectedItems);
	};

	/**
	 * Update and synchronize "selectedItems" association and the "selectedItems" in the List.
	 *
	 * @param {object} mOptions Options object
	 * @param {sap.ui.core.Item | null} mOptions.item The item instance
	 * @param {array} mOptions.items Array of sap.ui.core.Item
	 * @param {string} mOptions.id The item ID
	 * @param {string} mOptions.key The item key
	 * @param {boolean} mOptions.selectAll Wheather 'select all' keyboard combination is used for the selection
	 * @param {boolean} [mOptions.suppressInvalidate] Whether invalidation should be suppressed
	 * @param {boolean} [mOptions.listItemUpdated] Whether the item list is updated
	 * @param {boolean} [mOptions.fireChangeEvent] Whether the change event is fired
	 * @private
	 */
	MultiComboBox.prototype.setSelection = function(mOptions) {
		var oList = this._getList(),
			aNewItems;

		if (mOptions.item && this.isItemSelected(mOptions.item)) {
			return;
		}

		if (!mOptions.item) {
			return;
		}

		if (!mOptions.items || !mOptions.items.length || mOptions.selectAll) {
			aNewItems = [mOptions.item];
		} else {
			aNewItems = mOptions.items;
		}

		aNewItems.forEach(function(oNewItem) {
			if (!mOptions.listItemUpdated && ListHelpers.getListItem(oNewItem) && oList) {
				oList.setSelectedItem(ListHelpers.getListItem(oNewItem), true);
			}

			// Fill Tokenizer
			var oToken = new Token({
				key: oNewItem.getKey()
			});

			oToken.setText(oNewItem.getText());
			oNewItem.data(ListHelpers.CSS_CLASS + "Token", oToken);

			this.getAggregation("tokenizer").addToken(oToken);
			this.addAssociation("selectedItems", oNewItem, mOptions.suppressInvalidate);

			var aSelectedKeys = this.getSelectedKeys();
			var sKey = this.getKeys([oNewItem])[0];

			// Rather strange, but we need to keep it for backwards compatibility- when there are selectedItems with
			// empty keys, we need to append empty string, but if there's a key, it should be unique
			if (sKey === "" || aSelectedKeys.indexOf(sKey) === -1) {
				aSelectedKeys.push(sKey);
				this.setProperty("selectedKeys", aSelectedKeys, mOptions.suppressInvalidate);
			}
			if (mOptions.fireChangeEvent) {
				this.fireSelectionChange({
					changedItem: mOptions.item,
					changedItems: mOptions.items,
					selectAll: mOptions.selectAll,
					selected: true
				});
			}
		}, this);

		if (!this.getProperty("hasSelection") && this.getSelectedItems().length) {
			this.setProperty("hasSelection", true);
		}

		this.setValue('');

		if (mOptions.fireFinishEvent) {

			// Fire selectionFinish also if tokens are deleted directly in input field
			if (!this.isOpen()) {
				this.fireSelectionFinish({
					selectedItems: this.getSelectedItems()
				});
			}
		}
	};

	/**
	 * Remove an item from "selectedItems" association and the "selectedItems" in the List.
	 *
	 * @param {object} mOptions Options object
	 * @param {sap.ui.core.Item | null} mOptions.item The item instance
	 * @param {array} mOptions.items Array of sap.ui.core.Item
	 * @param {string} mOptions.id The item ID
	 * @param {string} mOptions.key The item key
	 * @param {boolean} mOptions.selectAll Wheather 'select all' keyboard combination is used for the selection
	 * @param {boolean} [mOptions.suppressInvalidate] Whether invalidation should be suppressed
	 * @param {boolean} [mOptions.listItemUpdated] Whether the item list is updated
	 * @param {boolean} [mOptions.fireChangeEvent] Whether the change event is fired
	 * @private
	 */
	MultiComboBox.prototype.removeSelection = function(mOptions) {
		var aDeselectedItems, aSelectedKeys, iItemSelectIndex;
		if (mOptions.item && !this.isItemSelected(mOptions.item)) {
			return;
		}

		if (!mOptions.item) {
			return;
		}

		if (!mOptions.items || !mOptions.items.length || mOptions.selectAll) {
			aDeselectedItems = [mOptions.item];
		} else {
			aDeselectedItems = mOptions.items;
		}

		aDeselectedItems.forEach(function(oNewItem) {
			this.removeAssociation("selectedItems", oNewItem, mOptions.suppressInvalidate);

			aSelectedKeys = this.getSelectedKeys();
			iItemSelectIndex = aSelectedKeys.indexOf(oNewItem.getKey());

			aSelectedKeys.splice(iItemSelectIndex, 1);
			this.setProperty("selectedKeys", aSelectedKeys, mOptions.suppressInvalidate);

			if (!mOptions.listItemUpdated && ListHelpers.getListItem(oNewItem)) {
				var oListItem = ListHelpers.getListItem(oNewItem);
				this._getList().setSelectedItem(oListItem, false);
			}

			// Synch the Tokenizer
			if (!mOptions.tokenUpdated) {
				var oToken = getTokenByItem(oNewItem);

				oNewItem.data(ListHelpers.CSS_CLASS + "Token", null);
				this.getAggregation("tokenizer").removeToken(oToken);
			}

			if (mOptions.fireChangeEvent) {
				this.fireSelectionChange({
					changedItem: mOptions.item,
					changedItems: mOptions.items,
					selectAll: mOptions.selectAll,
					selected: false
				});
			}
		}, this);

		if (this.getProperty("hasSelection") && !this.getSelectedItems().length) {
			this.setProperty("hasSelection", false);
		}

		if (mOptions.fireFinishEvent) {
			// Fire selectionFinish also if tokens are deleted directly in input field
			if (!this.isOpen()) {
				this.fireSelectionFinish({
					selectedItems: this.getSelectedItems()
				});
			}
		}
	};

	/**
	 * Synchronize selected item and key.
	 *
	 * @private
	 */
	MultiComboBox.prototype._synchronizeSelectedItemAndKey = function () {
		var aSelectedKeys = this.getSelectedKeys();
		var aKeyOfSelectedItems = this.getKeys(this.getSelectedItems());

		// the "selectedKey" property is not synchronized
		if (!aSelectedKeys.length) {
			Log.info("Info: _synchronizeSelectedItemAndKey() the MultiComboBox control does not contain any item on ", this);
			return;
		}

		for (var i = 0, sKey = null, oItem = null, iLength = aSelectedKeys.length; i < iLength; i++) {
			sKey = aSelectedKeys[i];

			if (aKeyOfSelectedItems.indexOf(sKey) > -1) {
				continue;
			}

			oItem = this.getItemByKey("" + sKey);

			// if the "selectedKey" has no corresponding aggregated item, no
			// changes will apply
			if (oItem) {

				this.setSelection({
					item: oItem,
					id: oItem.getId(),
					key: oItem.getKey(),
					fireChangeEvent: false,
					suppressInvalidate: true,
					listItemUpdated: false
				});
			}
		}
	};

	// --------------------------- End ------------------------------------

	/**
	 * Called whenever the binding of the aggregation named <code>items</code> is changed.
	 *
	 * @param {string} sReason The cause for items update
	 * @returns {undefined}
	 * @private
	 */
	MultiComboBox.prototype.updateItems = function (sReason) {
		var fnGetItemKey = function (oItem) {
				return oItem && oItem.getKey && oItem.getKey();
			},
			aSelectedItems,
			// Stash selected keys and items prior the update
			aSelectedItemKeys = this.getSelectedItems().map(fnGetItemKey),
			aSelectedKeys = this.getSelectedKeys();

		var oUpdateItems = ComboBoxBase.prototype.updateItems.apply(this, arguments);

		// Now check if selectedItems' keys have been modified. This means that the model has been updated.
		// And as the ListItem instances are reused, we need to check for something more relevant like the key
		aSelectedItemKeys = this.getSelectedItems().map(fnGetItemKey).filter(function (sItemKey) {
			return aSelectedItemKeys.indexOf(sItemKey) > -1;
		});

		aSelectedItems = aSelectedKeys.concat(aSelectedItemKeys);

		this.setSelectedKeys(aSelectedItems);

		return oUpdateItems;
	};

	/**
	 * Get selected items from "aItems".
	 *
	 * @param {array | null} aItems Array of sap.ui.core.Item
	 * @returns {array} The array of selected items
	 * @private
	 */
	MultiComboBox.prototype._getSelectedItemsOf = function(aItems) {
		for ( var i = 0, iLength = aItems.length, aSelectedItems = []; i < iLength; i++) {
			if (ListHelpers.getListItem(aItems[i]).getSelected()) {
				aSelectedItems.push(aItems[i]);
			}
		}

		return aSelectedItems;
	};

	/**
	 * Get the last selected item
	 *
	 * @returns {sap.ui.core.Item | null} The selected item
	 * @private
	 */
	MultiComboBox.prototype._getLastSelectedItem = function() {
		var aTokens = this.getAggregation("tokenizer").getTokens();
		var oToken = aTokens.length ? aTokens[aTokens.length - 1] : null;

		if (!oToken) {
			return null;
		}

		return this._getItemByToken(oToken);
	};

	/**
	 * Get the focused item from list
	 *
	 * @returns {sap.ui.core.Item | null} The focused item in the list
	 * @private
	 */
	MultiComboBox.prototype._getFocusedListItem = function() {

		if (!document.activeElement) {
			return null;
		}

		var oFocusedElement = Element.getElementById(document.activeElement.id);

		if (this._getList()
			&& containsOrEquals(this._getList().getFocusDomRef(), oFocusedElement.getFocusDomRef())) {
			return oFocusedElement;
		}

		return null;
	};

	/**
	 * Get the focused item
	 * @returns {sap.ui.core.Item} The focused item
	 * @private
	 */
	MultiComboBox.prototype._getFocusedItem = function() {
		return ListHelpers.getItemByListItem(this.getItems(), this._getFocusedListItem());
	};

	/**
	 * Tests if there are tokens in the combo box
	 * @returns {boolean} True if there are tokens
	 * @private
	 */
	MultiComboBox.prototype._hasTokens = function() {
		return this.getAggregation("tokenizer").getTokens().length > 0;
	};

	/**
	 * Decorate a ListItem instance by adding some delegate methods.
	 *
	 * @param {sap.m.StandardListItem} oListItem The item to be decorated
	 * @private
	 */
	MultiComboBox.prototype._decorateListItem = function(oListItem) {
		oListItem.addDelegate({
			onkeydown: function(oEvent) {
				// This delegate is needed for 'select all' functionality when Ctrl+A is pressed on a group header - it's not handled by the list
				if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which == KeyCodes.A) {
					oEvent.setMarked();
					oEvent.preventDefault();

					var aVisibleItems = ListHelpers.getSelectableItems(this.getItems());
					var aSelectedItems = this._getSelectedItemsOf(aVisibleItems);

					if (aSelectedItems.length !== aVisibleItems.length) {
						aVisibleItems.forEach(function(oItem) {
							this.setSelection({
								item: oItem,
								items: aVisibleItems,
								selectAll: true,
								id: oItem.getId(),
								key: oItem.getKey(),
								fireChangeEvent: true,
								suppressInvalidate: true,
								listItemUpdated: false
							});
						}, this);

					} else {
						aVisibleItems.forEach(function(oItem) {
							this.removeSelection({
								item: oItem,
								items: aVisibleItems,
								selectAll: true,
								id: oItem.getId(),
								key: oItem.getKey(),
								fireChangeEvent: true,
								suppressInvalidate: true,
								listItemUpdated: false
							});
						}, this);
					}
				}
			},

			onmousedown: function(oEvent) {
				this._setIsClick(true);
			},

			onkeyup: function(oEvent) {
				var oItem = null;

				// If an item is selected with SPACE inside of
				// suggest list the list
				// with all entries should be opened
				if (oEvent.which == KeyCodes.SPACE && this.isOpen() && this._isListInSuggestMode()) {
					this.open();
					oItem = this._getLastSelectedItem();

					// Scrolls an item into the visual viewport
					if (oItem) {
						ListHelpers.getListItem(oItem).focus();
					}

					return;
				}
			}
		}, true, this);

		oListItem.addEventDelegate({

			onsapbackspace: function(oEvent) {

				// Prevent the backspace key from navigating back
				oEvent.preventDefault();
			},

			onsapshow: function(oEvent) {

				// Handle when F4 or Alt + DOWN arrow are pressed.
				oEvent.setMarked();

				this.close();
			},

			onsaphide: function(oEvent) {

				// Handle when Alt + UP arrow are pressed.
				this.onsapshow(oEvent);
			},

			onsapenter: function(oEvent) {
				// Handle when enter is pressed.
				oEvent.setMarked();

				// prevent closing of popover, when Enter is pressed on a group header
				if (oEvent.srcControl && oEvent.srcControl.isA("sap.m.GroupHeaderListItem")) {
					return;
				}

				this.close();
			},

			onsaphome: this.handleHomeEvent.bind(this),

			onsapend: this.handleEndEvent.bind(this),

			onsapup: function(oEvent) {

				// Handle when key UP is pressed.
				oEvent.setMarked();

				// note: prevent document scrolling when arrow keys are pressed
				oEvent.preventDefault();

				var aVisibleItems = ListHelpers.getVisibleItems(this.getItems());
				var oItemFirst = aVisibleItems[0];
				var oItemCurrent = Element.closestTo(document.activeElement);

				if (oItemCurrent !== ListHelpers.getListItem(oItemFirst)) {
					return;
				}

				if (this.getShowSelectAll()) {
					this.focusSelectAll();
				} else if (this.getValueState() !== ValueState.None) {
					this._handleFormattedTextNav();
				} else {
					this.focus();
				}

				// prevent list from focusing list item
				oEvent.stopPropagation(true);
			},

			onfocusin: function(oEvent) {
				this.addStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX + "Focused");
			},

			onfocusout: function(oEvent) {
				this.removeStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX + "Focused");
			},

			onsapfocusleave: function(oEvent) {
				var oPopup = this.getAggregation("picker");
				var oControl = Element.getElementById(oEvent.relatedControlId);

				if (oPopup && oControl && deepEqual(oPopup.getFocusDomRef(), oControl.getFocusDomRef())) {

					// force the focus to stay in the list item field when
					// scrollbar is moving
					if (oEvent.srcControl) {
						oEvent.srcControl.focus();
					}
				}
			},

			onsaptabnext: function () {
				this.getPicker().close();
			},

			onsaptabprevious: function () {
				this.getPicker().close();
			}
		}, this);

		// required workaround
		if (Device.support.touch) {
			oListItem.addEventDelegate({
				ontouchstart: function(oEvent) {
					oEvent.setMark("cancelAutoClose");
				}
			});
		}
	};

	/**
	 * Updates the input value after focusout based on last user input
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleInputFocusOut = function (oEvent) {
		var bIsPickerDialog = this.isPickerDialog(),
		oInput = bIsPickerDialog ? this.getPickerTextField() : this,
		sUpdateValue = this._sOldInput || this._sOldValue || "",
		bOkButtonPressed = bIsPickerDialog && oEvent && oEvent.relatedTarget &&
			oEvent.relatedTarget.id.includes("-popup-closeButton");
		if (!bOkButtonPressed) {
			oInput.updateDomValue(sUpdateValue);
		}

		this._bIsPasteEvent = null;
	};

	MultiComboBox.prototype.onItemChange = function (oControlEvent) {
		var oValue = ComboBoxBase.prototype.onItemChange.call(this, oControlEvent, this.getShowSecondaryValues());
		var oParameters = oControlEvent.getParameters();

		forwardItemPropertiesToToken({
			item: oControlEvent.getSource(),
			propName: oParameters.name,
			propValue: oParameters.newValue
		});

		return oValue;
	};

	/**
	 * Handler for the press event on the N-more label.
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleIndicatorPress = function() {
		var oPicker,
			oTokenizer = this.getAggregation("tokenizer");

		if (this.getEditable()) {
			this.syncPickerContent();
			this._filterSelectedItems({}, true);
			this.focus();

			oPicker = this.getPicker();
			oPicker.open();
		} else {
			oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		}

		if (this.isPickerDialog()) {
			this.getFilterSelectedButton().setPressed(true);
			this.bOpenedByKeyboardOrButton = true;
		}
	};

	/**
	 * Close or open the suggestion popover depending on the current state
	 *
	 * @private
	 */
	MultiComboBox.prototype._togglePopover = function() {
		var oPicker = this.getPicker();

		if (!oPicker) {
			oPicker = this.syncPickerContent(true);
		}

		if (oPicker.isOpen()) {
			oPicker.close();
		} else {
			oPicker.open();
		}
	};

	/**
	 * Create an instance type of <code>sap.m.Tokenizer</code>.
	 *
	 * @returns {sap.m.Tokenizer} The tokenizer instance
	 * @private
	 */
	MultiComboBox.prototype._createTokenizer = function() {
		var oTokenizer = new Tokenizer({
			renderMode: TokenizerRenderMode.Narrow
		}).attachTokenDelete(this._handleTokenDelete, this);

		oTokenizer.getTokensPopup()
			.attachAfterOpen(function () {
				if (oTokenizer.hasOneTruncatedToken()) {
					oTokenizer.setFirstTokenTruncated(false);
				}
			})
			.attachAfterClose(function () {
				var aTokens = oTokenizer.getTokens();
				if (aTokens.length === 1 && !aTokens[0].getTruncated()) {
					oTokenizer.setFirstTokenTruncated(true);
				}
			});

		oTokenizer.addEventDelegate({
			onAfterRendering: this._onAfterRenderingTokenizer
		}, this);

		oTokenizer.setShouldRenderTabIndex(false);

		return oTokenizer;
	};

	/**
	 * This hook method is called after the MultiComboBox's Tokenizer is rendered.
	 *
	 * @private
	 */
	MultiComboBox.prototype._onAfterRenderingTokenizer = function() {
		var oTokenizer = this.getAggregation("tokenizer");
		if (this.getEditable()) {
			oTokenizer.addStyleClass("sapMTokenizerIndicatorDisabled");
		} else {
			oTokenizer.removeStyleClass("sapMTokenizerIndicatorDisabled");
		}
		setTimeout(this._syncInputWidth.bind(this, oTokenizer), 0);
		setTimeout(this._handleNMoreAccessibility.bind(this), 0);
		setTimeout(oTokenizer["scrollToEnd"].bind(oTokenizer), 0);
	};

	/**
	 * Handler for the <code>tokenChange</code> event of the token.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleTokenDelete = function(oEvent) {
		var aTokens = oEvent.getParameter("tokens");
		var aItemsBeforeRemoval = this.getSelectedItems();

		this._removeSelection(aTokens);

		if (aItemsBeforeRemoval.length !== ListHelpers.getSelectableItems(this.getItems())) {
			!this.isPickerDialog() && !this.isFocusInTokenizer() && this.focus();
			this.fireChangeEvent("");
		}
	};

	/**
	 * Destroys an array of tokens and removes selection of the mapped items.
	 *
	 * @param {sap.m.Token[]} aTokens Array of deleting tokens
	 * @private
	 */
	MultiComboBox.prototype._removeSelection = function (aTokens) {
		var oTokenizer = this.getAggregation("tokenizer");

		aTokens.forEach(function (oToken) {
			var oItem = (oToken && this._getItemByToken(oToken));

			if (!this.getEditable() || !this.getEnabled() || // MultiComboBox
				!oItem || !this.isItemSelected(oItem) || !oItem.getEnabled() || // core.Item
				!oToken.getEditable()) { // Token
				return;
			}

			this.removeSelection({
				item: oItem,
				id: oItem.getId(),
				key: oItem.getKey(),
				tokenUpdated: true,
				fireChangeEvent: true,
				fireFinishEvent: true, // Fire selectionFinish if token is deleted directly in input field
				suppressInvalidate: true
			});

			oToken.destroy();

			if (this.getSelectedItems().length > 0) {
				var aTokens = oTokenizer.getTokens();
				aTokens[aTokens.length - 1].focus();
			} else {
				this.focus();
			}
		}, this);
	};

	/**
	 * Required adaptations after rendering of List.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterRenderingList = function() {
		var bInputFocussed = document.activeElement === this.getFocusDomRef();
		var bControlFocussed = Element.closestTo(document.activeElement);
		var bTokenFocused = bControlFocussed && bControlFocussed.isA("sap.m.Token");
		var oList = this._getList();
		var aVisibleItems = oList ? oList.getVisibleItems() : [];

		if (this.getEditable() && !bInputFocussed && !bTokenFocused && aVisibleItems[this._iFocusedIndex]) {
			aVisibleItems[this._iFocusedIndex].focus();
			this._iFocusedIndex = null;
		}

		this.manageSelectAllCheckBoxState();
	};

	/**
	 * As the ItemNavigation of the list is created onfocusin we need handle this and set some initial root focus dome ref
	 *
	 * @private
	 */
	MultiComboBox.prototype.onFocusinList = function() {
		var oList = this._getList();

		if (this._bListItemNavigationInvalidated && this._getList().getItemNavigation()) {
			oList.getItemNavigation().setSelectedIndex(this._iInitialItemFocus);
			this._bListItemNavigationInvalidated = false;
		}

		this._getSuggestionsPopover().updateListDataAttributes(oList);
	};

	/**
	 * This hook method is called after the MultiComboBox control is rendered.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterRendering = function() {
		var oTokenizer = this.getAggregation("tokenizer");
		var oTokenToFocus;

		ComboBoxBase.prototype.onAfterRendering.apply(this, arguments);
		this._registerResizeHandler();

		setTimeout(function() {
			oTokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		}.bind(this), 0);

		if (this.bShouldRestoreTokenizerFocus) {
			oTokenToFocus = oTokenizer.getTokens()[this.iFocusedIndex];

			if (oTokenToFocus) {
				oTokenToFocus.focus();
			}

			this.bShouldRestoreTokenizerFocus = false;
		}
	};

	/**
	 * Handles the focus out event.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onfocusout = function(oEvent) {
		// if the focus switches from the picker to the dropdown
		// update the input value with the last typed in input from the user
		this.isOpen() && this._handleInputFocusOut();
		this.removeStyleClass("sapMFocus");

		// reset the value state
		if (this.getValueState() === ValueState.Error && this.getValueStateText() === this._oRb.getText("VALUE_STATE_ERROR_ALREADY_SELECTED")) {
			this.setValueState(this._sInitialValueState);
			this.setValueStateText(this._sInitialValueStateText);
		}

		ComboBoxBase.prototype.onfocusout.apply(this, arguments);
	};

	/**
	 * Handle the paste event
	 * Converts line-break separated strings into tokens,
	 * when there are selectable items available which contain the same text.
	 *
	 * @param {jQuery.Event} oEvent The occurring event
	 * @private
	 */
	MultiComboBox.prototype.onpaste = function (oEvent) {
		var sOriginalText;
		var bItemSelected = false;
		var aSelectedItems = this.getSelectedItems();
		var aSelectableItems = ListHelpers.getSelectableItems(this.getItems());

		if (!aSelectableItems.length) {
			this.syncPickerContent(true);
		}

		aSelectableItems = ListHelpers.getSelectableItems(this.getItems());

		sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');

		if (sOriginalText.length && sOriginalText.endsWith("\r\n")) {
			sOriginalText = sOriginalText.substring(0, sOriginalText.lastIndexOf("\r\n"));
		}

		var aSeparatedText = sOriginalText.split(/\r\n|\r|\n|\t/g);

		if (aSeparatedText && aSeparatedText.length > 1) {
			aSelectableItems
				.filter(function (oItem) {
					return aSelectedItems.indexOf(oItem) === -1;
				})
				.forEach(function (oItem) {
					if (aSeparatedText.indexOf(oItem.getText()) > -1) {
						bItemSelected = true;

						this.setSelection({
							item: oItem,
							id: oItem.getId(),
							key: oItem.getKey(),
							fireChangeEvent: true,
							fireFinishEvent: true,
							suppressInvalidate: true,
							listItemUpdated: false
						});
					}
				}, this);
		}

		if (bItemSelected) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
	};

	/**
	 * Function is called on keyboard backspace, if cursor is in front of a token, token gets selected and deleted
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapbackspace = function(oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");
		var aTokens = oTokenizer.getTokens();
		var aSelectedTokens = aTokens.filter(function(oToken) {
			return oToken.getSelected();
		});

		if (!this.getEnabled() || !this.getEditable()) {

			// Prevent the backspace key from navigating back
			oEvent.preventDefault();
			return;
		}

		// Deleting characters, not tokens
		if (this.getCursorPosition() > 0 || this.getValue().length > 0) {
			return;
		}

		if (aSelectedTokens.length > 0) {
			this._removeAllTokens();
			return;
		}

		if (document.activeElement === this.getFocusDomRef()) {
			aTokens[aTokens.length - 1] && aTokens[aTokens.length - 1].focus();
		}

		// Prevent the backspace key from navigating back
		oEvent.preventDefault();
	};

	MultiComboBox.prototype._removeAllTokens = function () {
		var oTokenizer = this.getAggregation("tokenizer");
		var aSelectedTokens = oTokenizer.getTokens().filter(function(oToken) {
			return oToken.getSelected();
		});

		if (!aSelectedTokens.length) {
			return;
		}

		this._removeSelection(aSelectedTokens);
		this.fireChangeEvent("");

		this.invalidate();
	};

	/**
	 * Function is called on delete keyboard input, deletes selected tokens
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapdelete = MultiComboBox.prototype.onsapbackspace;

	/**
	 * Handles the <code>sapnext</code> event when the 'Arrow down' or 'Arrow right' key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapnext = function(oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");

		if (oEvent.isMarked()) {
			return;
		}

		// find focused element
		var oFocusedElement = Element.closestTo(document.activeElement);

		if (!oFocusedElement) {

			// we cannot rule out that the focused element does not correspond to an SAPUI5 control in which case oFocusedElement
			// is undefined
			return;
		}

		if (oFocusedElement === oTokenizer || oTokenizer.$().find(oFocusedElement.$()).length > 0
			&& this.getEditable()) {
			oTokenizer.scrollToEnd();

			// focus is on the tokenizer or on some descendant of the tokenizer and the event was not handled ->
			// we therefore handle the event and focus the input element
			this.focus();
		}
	};

	/**
	 * Handles the <code>sapprevious</code> event when the 'Arrow up' or 'Arrow left' key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapprevious = function(oEvent) {
		if (this.getCursorPosition() === 0 && !completeTextSelected(this.getFocusDomRef())) {
			if (oEvent.srcControl === this) {
				Tokenizer.prototype.onsapprevious.apply(this.getAggregation("tokenizer"), arguments);
			}
		}
	};

	/**
	 * Handles control click event.
	 *
	 * @param oEvent
	 * @protected
	 */
	MultiComboBox.prototype.onclick = function (oEvent) {
		var bEditable = this.getEditable(),
			bEnabled = this.getEnabled(),
			bNMoreLableClick = oEvent.target.className.indexOf("sapMTokenizerIndicator") > -1;

		if (bEditable && bEnabled && bNMoreLableClick) {
			oEvent.preventDefault();
			this._handleIndicatorPress();
		}
	};

	/**
	 * Handles the tap event on the control.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	MultiComboBox.prototype.ontap = function(oEvent) {
		ComboBoxBase.prototype.ontap.apply(this, arguments);

		var oOpenArea = this.getOpenArea();

		// in case of a non-editable or disabled combo box, the picker popup cannot be opened
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled
		oEvent.setMarked();

		// if the picker is a dialog and the control open are is not a token, open the dialog
		if (this.isPickerDialog() && oOpenArea.contains(oEvent.target)) {
			this.open();
		}
	};

	/**
	 * Gets the trigger element of the control's picker popup.
	 *
	 * @returns {HTMLElement | null} The element that is used as trigger to open the control's picker popup.
	 * @private
	 */
	MultiComboBox.prototype.getOpenArea = function() {
		if (this.isPickerDialog()) {
			return this.getDomRef();
		} else {
			return ComboBoxBase.prototype.getOpenArea.apply(this, arguments);
		}
	};

	/**
	 * Gets items that match with starts with per term filter
	 *
	 * @param {string} sText The value to be matched
	 * @param {boolean} bInput Determines which items to search in (true - enabled items, false - selectable items)
	 * @returns {sap.ui.core.Item[]} The array of matching items
	 * @private
	 */
	MultiComboBox.prototype._getItemsStartingWithPerTerm = function(sText, bInput) {
		var aItems = [],
			selectableItems = bInput ? ListHelpers.getEnabledItems(this.getItems()) : ListHelpers.getSelectableItems(this.getItems()),
			fnFilter = this.fnFilter ? this.fnFilter : inputsDefaultFilter;

		selectableItems.forEach(function(oItem) {

			if (fnFilter(sText, oItem)) {
				aItems.push(oItem);
			}

		}, this);
		return aItems;
	};

	/**
	 * Gets items that match with starts with filter
	 *
	 * @param {string} sText The value to be matched
	 * @param {boolean} bInput Determines which items to search in (true - enabled items, false - selectable items)
	 * @returns {sap.ui.core.item[]} They array of matching items
	 * @private
	 */
	MultiComboBox.prototype._getItemsStartingWith = function(sText, bInput) {
		var aItems = [],
			selectableItems = bInput ? ListHelpers.getEnabledItems(this.getItems()) : ListHelpers.getSelectableItems(this.getItems());

		selectableItems.forEach(function(oItem) {

			if (typeof sText === "string" && sText !== "" && oItem.getText().toLowerCase().startsWith(sText.toLowerCase())) {
				aItems.push(oItem);
			}

		}, this);
		return aItems;
	};


	/**
	 * Get unselected items which match value of input field.
	 *
	 * @param {string} sText The value to be matched
	 * @returns {sap.ui.core.Item[]} The array of matching items
	 * @private
	 */
	MultiComboBox.prototype._getUnselectedItemsStartingText = function(sText) {
		var aItems = [];
		this._getUnselectedItems().forEach(function(oItem) {
			if (typeof sText === "string" && sText !== "" && oItem.getText().toLowerCase().startsWith(sText.toLowerCase())) {
				aItems.push(oItem);
			}
		}, this);
		return aItems;
	};

	/**
	 * Functions returns the current input field's cursor position
	 *
	 * @private
	 * @return {int} The cursor position
	 */
	MultiComboBox.prototype.getCursorPosition = function() {
		return this._$input.cursorPos();
	};

	/**
	 * Selects all previous items, starting from the given item, ending at the first preceding selected item.
	 *
	 * @param {sap.ui.core.Item} oItem The reference item.
	 * @private
	 */
	MultiComboBox.prototype._selectPreviousItemsOf = function(oItem) {
		var bIsSelected;

		do {
			bIsSelected = true;

			var oPreviousItem = this._getPreviousVisibleItemOf(oItem);
			if (oPreviousItem) {
				var oListItem = ListHelpers.getListItem(oPreviousItem);
				if (oListItem) {
					bIsSelected = ListHelpers.getListItem(oPreviousItem).getSelected();
				}
			}

			this.setSelection({
				item: oItem,
				id: oItem.getId(),
				key: oItem.getKey(),
				fireChangeEvent: true,
				suppressInvalidate: true
			});

			oItem = oPreviousItem;
		} while (!bIsSelected);
	};

	/**
	 * Returns the next visible item of the given item.
	 *
	 * @param {sap.ui.core.Item} oItem The reference item.
	 * @returns {sap.ui.core.Item} The first following visible item.
	 * @private
	 */
	MultiComboBox.prototype._getNextVisibleItemOf = function(oItem) {
		var aItems = ListHelpers.getSelectableItems(this.getItems());
		var iIndex = aItems.indexOf(oItem) + 1;

		if (iIndex <= 0 || iIndex > aItems.length - 1) {
			return null;
		}

		return aItems[iIndex];
	};

	/**
	 * Returns the previous visible item of the given item.
	 *
	 * @param {sap.ui.core.Item} oItem The reference item.
	 * @returns {sap.ui.core.Item} The first preceding visible item.
	 * @private
	 */
	MultiComboBox.prototype._getPreviousVisibleItemOf = function(oItem) {
		var aItems = ListHelpers.getSelectableItems(this.getItems());
		var iIndex = aItems.indexOf(oItem) - 1; // {-2,-1,0,1,2,3,...}

		if (iIndex < 0) {
			return null;
		}

		return aItems[iIndex];
	};

	/**
	 * Returns the next unselected item of the given item.
	 *
	 * @param {sap.ui.core.Item} oItem The reference item.
	 * @returns {sap.ui.core.Item} The first following unselected item.
	 * @private
	 */
	MultiComboBox.prototype._getNextUnselectedItemOf = function(oItem) {
		var aItems = this._getUnselectedItems();
		var iIndex = aItems.indexOf(oItem) + 1;

		if (iIndex <= 0 || iIndex > aItems.length - 1) {
			return null;
		}

		return aItems[iIndex];
	};

	/**
	 * Returns the previous unselected item of the given item.
	 *
	 * @param {sap.ui.core.Item} oItem The reference item.
	 * @returns {sap.ui.core.Item} The first preceding unselected item.
	 * @private
	 */
	MultiComboBox.prototype._getPreviousUnselectedItemOf = function(oItem) {
		var aItems = this._getUnselectedItems();
		var iIndex = aItems.indexOf(oItem) - 1;

		if (iIndex < 0) {
			return null;
		}

		return aItems[iIndex];
	};

	/**
	 * Gets next visible Item corresponding to text in input field.
	 *
	 * @returns {sap.ui.core.Item} The next visible item.
	 * @private
	 */
	MultiComboBox.prototype._getNextTraversalItem = function() {
		var sValue = this.getValue();
		var aUnselectedMatchingItems = this._getUnselectedItemsPerTerm(sValue);

		// if there is already a previous traversal item, return the next one
		if (aUnselectedMatchingItems.indexOf(this._oTraversalItem) > -1 && this._oTraversalItem.getText() === this.getValue()) {
			return this._getNextUnselectedItemOf(this._oTraversalItem);
		}

		// if there is an unselected matching item return it
		return aUnselectedMatchingItems[0];
	};

	/**
	 * Gets previous visible Item corresponding to text in input field.
	 * @returns {sap.ui.core.Item} The previous visible item.
	 * @private
	 */
	MultiComboBox.prototype._getPreviousTraversalItem = function() {
		var sValue = this.getValue();
		var aUnselectedMatchingItems = this._getUnselectedItemsPerTerm(sValue);

		if (aUnselectedMatchingItems.indexOf(this._oTraversalItem) > -1 && this._oTraversalItem.getText() === this.getValue()) {
			return this._getPreviousUnselectedItemOf(this._oTraversalItem);
		}

		return aUnselectedMatchingItems[aUnselectedMatchingItems.length - 1];
	};

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */

	/**
	 * Setter for association <code>selectedItems</code>.
	 *
	 * @param {string[] | sap.ui.core.Item[] | null} aItems new values for association <code>selectedItems</code>.
	 * Array of sap.ui.core.Item Id which becomes the new target of this <code>selectedItems</code> association.
	 * Alternatively, an array of sap.ui.core.Item instance may be given or null.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.setSelectedItems = function(aItems) {
		this.removeAllSelectedItems();

		if (!aItems || !aItems.length) {
			return this;
		}

		if (!Array.isArray(aItems)) {
			Log.warning("Warning: setSelectedItems() has to be an array of sap.ui.core.Item instances or of valid sap.ui.core.Item IDs", this);
			return this;
		}

		aItems.forEach(function(oItem) {

			if (!(oItem instanceof Item) && (typeof oItem !== "string")) {
				Log.warning("Warning: setSelectedItems() has to be an array of sap.ui.core.Item instances or of valid sap.ui.core.Item IDs", this);

				// Go to next item
				return;
			}

			if (typeof oItem === "string") {
				oItem = Element.getElementById(oItem);
			}

			// Update and synchronize "selectedItems" association,
			// "selectedKey" and "selectedItemId" properties.
			this.setSelection({
				item: oItem ? oItem : null,
				id: oItem ? oItem.getId() : "",
				key: oItem ? oItem.getKey() : "",
				suppressInvalidate : true
			});
		}, this);
		return this;
	};

	/**
	 * Adds some item <code>oItem</code> to the association named <code>selectedItems</code>.
	 *
	 * @param {sap.ui.core.ID|sap.ui.core.Item} oItem The selected item to add; if empty, nothing is added.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.addSelectedItem = function(oItem) {

		if (!oItem) {
			return this;
		}

		if (typeof oItem === "string") {
			oItem = Element.getElementById(oItem);
		}

		this.setSelection({
			item: oItem ? oItem : null,
			id: oItem ? oItem.getId() : "",
			key: oItem ? oItem.getKey() : "",
			fireChangeEvent: false,
			suppressInvalidate: true
		});

		return this;
	};

	/**
	 * Removes a selected item from the association named <code>selectedItems</code>.
	 *
	 * @param {sap.ui.core.Item | sap.ui.core.ID} oItem The item to be removed or its ID
	 * @returns {sap.ui.core.Item | null} The removed item or <code>null</code>
	 * @public
	 */
	MultiComboBox.prototype.removeSelectedItem = function(oItem) {

		if (!oItem) {
			return null;
		}

		if (typeof oItem === "string") {
			oItem = Element.getElementById(oItem);
		}

		if (!this.isItemSelected(oItem)) {
			return null;
		}

		this.removeSelection({
			item: oItem,
			id: oItem.getId(),
			key: oItem.getKey(),
			fireChangeEvent: false,
			suppressInvalidate: true
		});
		return oItem;
	};

	/**
	 * Removes all the controls in the association named selectedItems.
	 *
	 * @returns {sap.ui.core.ID[]} An array of the removed elements (might be empty)
	 * @public
	 */
	MultiComboBox.prototype.removeAllSelectedItems = function() {
		var aIds = [];
		var aItems = this.getAssociation("selectedItems", []);
		aItems.forEach(function(oItem) {
			var oItemRemoved = this.removeSelectedItem(oItem);
			if (oItemRemoved) {
				aIds.push(oItemRemoved.getId());
			}
		}, this);
		return aIds;
	};

	/**
	 * Removes selected items. Only items with valid keys are removed.
	 *
	 * @param {string[]} aKeys An array of item keys that identifies the items to be removed
	 * @returns {sap.ui.core.Item[]} The removed items
	 * @public
	 */
	MultiComboBox.prototype.removeSelectedKeys = function (aKeys) {
		var oItem, aItems = [];

		if (!aKeys || !aKeys.length || !Array.isArray(aKeys)) {
			return aItems;
		}

		aKeys.forEach(function (sKey) {
			oItem = this.getItemByKey(sKey);

			if (oItem) {
				this.removeSelection({
					item: oItem ? oItem : null,
					id: oItem ? oItem.getId() : "",
					key: oItem ? oItem.getKey() : "",
					fireChangeEvent: false,
					suppressInvalidate: true
				});
				aItems.push(oItem);
			}
		}, this);

		return aItems;
	};

	/**
	 * Sets a new value for property <code>selectedKeys</code>.
	 * Keys of the selected items. If the key has no corresponding item, no changes will apply. If duplicate keys exists the first item matching the key is used.
	 * When called with a value of null or undefined, the default value of the property will be restored.
	 * Default value is [].
	 *
	 * @param {string[]} aKeys Keys of items to be set as selected
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.setSelectedKeys = function (aKeys) {
		if (this._bInitialSelectedKeysSettersCompleted) {
			this.setProperty("selectedKeys", [], true);
			this.removeAllSelectedItems();
		}

		this.addSelectedKeys(aKeys);

		this._bInitialSelectedKeysSettersCompleted = true;

		return this;
	};

	/**
	 * Adds selected items. Only items with valid keys are added as selected.
	 *
	 * @param {string[]} aKeys An array of item keys that identifies the items to be added as selected
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.addSelectedKeys = function (aKeys) {
		var aStoredSelectedKeys,
			aSelectedKeys = [];

		aKeys = this.validateProperty("selectedKeys", aKeys);

		aKeys.forEach(function (sKey) {
			var oItem = this.getItemByKey(sKey);

			if (oItem) {
				this.addSelectedItem(oItem);
			} else if (sKey != null) {

				// If at this point of time aggregation 'items' does not exist we
				// have save provided key.
				aSelectedKeys.push(sKey);
			}
		}, this);

		// Merging should happen here as addSelectedItem could modify the selectedKeys property
		if (aSelectedKeys.length > 0) {
			aStoredSelectedKeys = this.getProperty("selectedKeys").filter(function (sKey) {
				return aSelectedKeys.indexOf(sKey) === -1;
			});
			aSelectedKeys = aStoredSelectedKeys.concat(aSelectedKeys);

			this.setProperty("selectedKeys", aSelectedKeys, true);
		}

		return this;
	};

	/**
	 * Retrieves the unselected item objects from the association named <code>selectedItems</code>.
	 *
	 * @returns {sap.ui.core.Item[]} Array of sap.ui.core.Item instances. The current target of the <code>selectedItems</code> association.
	 * @private
	 * @since 1.26.0
	 */
	MultiComboBox.prototype._getUnselectedItems = function() {
		var aItems =  jQuery(ListHelpers.getSelectableItems(this.getItems())).not(this.getSelectedItems()).get();

		// If the MultiComboBox is not opened, we want to skip any items that
		// represent group headers or separators.
		if (!this.isOpen()) {
			return aItems.filter(function (oItem) {
				return !oItem.isA("sap.ui.core.SeparatorItem");
			});
		}

		return aItems;
	};

	/**
	 * Gets the unselected items, matching a certain term
	 *
	 * @param {string} sText The text to be used for filtering
	 * @returns {sap.ui.core.Item[]} Array of sap.ui.core.Item instances. The current target of the <code>selectedItems</code> association.
	 * @private
	 */
	 MultiComboBox.prototype._getUnselectedItemsPerTerm = function(sText) {
		var aItems =  jQuery(ListHelpers.getSelectableItems(this.getItems())).not(this.getSelectedItems()).get();
		var aSelectableMatchingItems = [];
		var fnFilter = this.fnFilter ? this.fnFilter : inputsDefaultFilter;

		// If the MultiComboBox is not opened, we want to skip any items that
		// represent group headers or separators.
		if (!this.isOpen()) {
			aItems = aItems.filter(function (oItem) {
				return !oItem.isA("sap.ui.core.SeparatorItem");
			});
		}

		aItems.forEach(function(oItem) {
			if (fnFilter(sText, oItem)) {
				aSelectableMatchingItems.push(oItem);
			}
		}, this);

		return aSelectableMatchingItems;
	};

	/**
	 * Retrieves the selected item objects from the association named <code>selectedItems</code>.
	 *
	 * @returns {sap.ui.core.Item[]} Array of sap.ui.core.Item instances. The current target of the <code>selectedItems</code> association.
	 * @public
	 */
	MultiComboBox.prototype.getSelectedItems = function() {
		var aItems = [], aItemIds = this.getAssociation("selectedItems") || [];

		aItemIds.forEach(function(sItemId) {
			var oItem = Element.getElementById(sItemId);

			if (oItem) {
				aItems.push(oItem);
			}
		}, this);
		return aItems;
	};

	/**
	 * Gets current value of property width.
	 *
	 * @returns {string} The value of property width or "100%"
	 * @public
	 * @override
	 */
	MultiComboBox.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	// ----------------------- Inheritance ---------------------

	/**
	 * Adds correct content and sets the correct list mode for the popover.
	 * The method is used to switch between read-only mode and edit mode.
	 *
	 * @param {boolean} bEditable The mode of the popover
	 * @private
	 */
	MultiComboBox.prototype._updatePopoverBasedOnEditMode = function (bEditable) {
		var oList = this._getList(),
			oSuggestionsPopover = this._getSuggestionsPopover();

		if (oList && bEditable !== this._bPrevEditable && bEditable) {
			oSuggestionsPopover.addContent(oList);
		}

		this._bPrevEditable = bEditable;
	};

	/**
	 * TODO: correction in ComboBoxBase regarding 'this.getSelectedItem()'
	 *
	 * Map an item type of sap.ui.core.Item to an item type of sap.m.StandardListItem.
	 *
	 * @param {sap.ui.core.Item} oItem The item to be matched
	 * @returns {sap.m.StandardListItem | sap.m.GroupHeaderListItem | null} The matched StandardListItem
	 * @private
	 */
	MultiComboBox.prototype._mapItemToListItem = function (oItem) {
		var oListItem, sListItem, sListItemSelected,
			oRenderer = this.getRenderer();

		if (!oItem) {
			return null;
		}

		oListItem = ListHelpers.createListItemFromCoreItem(oItem, this.getShowSecondaryValues());
		this._decorateListItem(oListItem);

		if (oItem.isA("sap.ui.core.SeparatorItem")) {
			return oListItem;
		}

		sListItem = oRenderer.CSS_CLASS_MULTICOMBOBOX + "Item";
		sListItemSelected = (this.isItemSelected(oItem)) ? sListItem + "Selected" : "";
		oListItem.addStyleClass(sListItem + " " + sListItemSelected);

		this.setSelectable(oItem, oItem.getEnabled());
		return oListItem;
	};

	/**
	 * Set selectable property of sap.ui.core.Item
	 *
	 * @param {sap.ui.core.Item} oItem The item to set the property
	 * @param {boolean} bSelectable The selectable value
	 * @private
	 */
	MultiComboBox.prototype.setSelectable = function(oItem, bSelectable) {
		ComboBoxBase.prototype.setSelectable.call(this, oItem, bSelectable);

		var oToken = getTokenByItem(oItem);

		if (oToken) {
			oToken.setVisible(bSelectable);
		}
	};

	/**
	 * TODO: ComboBoxBase should be changed regarding 'this.getSelectedItem()'
	 *
	 * Fill the list of items.
	 *
	 * @param {array} aItems An array with items type of sap.ui.core.Item.
	 * @returns {null} Null if array is empty
	 * @private
	 */
	MultiComboBox.prototype._fillList = function() {
		var oTokenizer;
		var aSelectedItems;
		var oItem;
		var oList = this._getList();
		var aItems = this.getEditable() ?
		this.getItems() : this.getSelectedItems();

		if (!oList) {
			return;
		}

		oList.destroyItems();

		for ( var i = 0, oListItem, aItemsLength = aItems.length; i < aItemsLength; i++) {
			// add a private property to the added item containing a reference
			// to the corresponding mapped item
			oListItem = this._mapItemToListItem(aItems[i]);

			// add the mapped item type of sap.m.StandardListItem to the list
			// do not prevent invalidation as invalidations will stack
			if (oListItem.isA("sap.m.GroupHeaderListItem")) {
				this._getList().addItemGroup(null, oListItem);
			} else {
				this._getList().addItem(oListItem);
			}

			// add active state to the selected item
			if (this.isItemSelected(aItems[i])) {
				this._getList().setSelectedItem(oListItem, true);
			}
		}

		// the following code adds the selected items to the tokenizer
		// in the order they have been selected
		oTokenizer = this.getAggregation("tokenizer");
		aSelectedItems = this.getSelectedItems();

		for ( var j = 0; j < aSelectedItems.length; j++) {
			oItem = aSelectedItems[j];
			var oToken = new Token({
				key: oItem.getKey(),
				text: oItem.getText()
			});
			oItem.data(ListHelpers.CSS_CLASS + "Token", oToken);
			oTokenizer.addToken(oToken, true);
		}

	};

	/**
	 *
	 * Validate the text input
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @param {boolean} bCompositionEvent Is true if the fired event is a composition event
	 * @private
	 */
	MultiComboBox.prototype.handleInputValidation = function(oEvent, bCompositionEvent) {
		var sValue = oEvent.target.value,
			bValidInputValue = this.isValueValid(sValue),
			aItemsToCheck, oSelectedButton, aStartsWithItems;

		// "compositionstart" and "compositionend" are native events and don't have srcControl
		var oInput = oEvent.srcControl;

		if (!bValidInputValue && sValue !== "" && !bCompositionEvent) {
			this._handleFieldValidationState(oInput);
			return;
		}

		aStartsWithItems = this._getItemsStartingWith(sValue, true);

		if (!bCompositionEvent || this._bIsPasteEvent) {
			this._handleTypeAhead(sValue, aStartsWithItems, oInput);
		}

		aItemsToCheck = this.getItems();

		if (this.isPickerDialog()) {
			oSelectedButton = this.getFilterSelectedButton();
			if (oSelectedButton != null && oSelectedButton.getPressed()) {
				oSelectedButton.setPressed(false);
			}
		}
		itemsVisibilityHandler(this.getItems(), this.filterItems({ value: sValue, items: aItemsToCheck }));
		this.manageSelectAllCheckBoxState();

		this._sOldInput = sValue;

		// First do manipulations on list items and then let the list render
		if ((!this.getValue() || !bValidInputValue) && !this.bOpenedByKeyboardOrButton && !this.isPickerDialog())  {
			this.close();
		} else {
			this.open();
		}
	};

	/**
	 * Determines if a given value matches an item.
	 *
	 * @param {string} sValue The string value to be checked
	 * @returns {int} The number of items starting with the given value
	 * @private
	 */
	MultiComboBox.prototype.isValueValid = function (sValue) {
		var aStartsWithItems = this._getItemsStartingWith(sValue, true);
		var aStartsWithPerTermItems = this._getItemsStartingWithPerTerm(sValue, true);

		return aStartsWithItems.length || aStartsWithPerTermItems.length;
	};

	/**
	 * Autocompletes input based on given items and a value
	 *
	 * @param {string} sValue Current value of the input field
	 * @param {sap.ui.core.Item[]} aItems Items to type ahead
	 * @param {sap.m.InputBase} oInput Input to be typed ahead
	 * @private
	 */
	MultiComboBox.prototype._handleTypeAhead = function (sValue, aItems, oInput) {
		// type ahead, if there is an matching unselected item in the list
		var aSelectedItems, aFilteredItems;

		if (!this._bDoTypeAhead) {
			return;
		}

		aSelectedItems = this.getSelectedItems();
		aFilteredItems = aItems.filter(function (oItem) {
			return aSelectedItems.indexOf(oItem) === -1;
		});

		typeAhead(sValue, oInput, aFilteredItems);
	};

	/**
	 * Shows invalid state to an input control
	 *
	 * @param {sap.m.InputBase} oInput Input to be validated
	 * @private
	 */
	MultiComboBox.prototype._handleFieldValidationState = function (oInput) {
		// ensure that the value, which will be updated is valid
		// needed for the composition characters
		if (this._sOldInput && this.isValueValid(this._sOldInput)) {
			oInput.updateDomValue(this._sOldInput);
		} else if (this._sOldValue && this.isValueValid(this._sOldValue)) {
			oInput.updateDomValue(this._sOldValue);
		} else {
			oInput.updateDomValue("");
			oInput.setProperty("effectiveShowClearIcon", false);
		}

		if (this._iOldCursorPos) {
			jQuery(oInput.getFocusDomRef()).cursorPos(this._iOldCursorPos);
		}

		this._showWrongValueVisualEffect();
	};

	MultiComboBox.prototype.init = function() {
		ComboBoxBase.prototype.init.apply(this, arguments);

		// Flag to mark that all the initial setters have completed.
		// This would help with the synchronisation within dependent properties.
		this._bInitialSelectedKeysSettersCompleted = false;

		// To detect whether the List's item navigation is inited
		this._bListItemNavigationInvalidated = false;

		// Defines the initial selected index of List's item navigation
		this._iInitialItemFocus = -1;

		/**
		 * To detect whether a checkbox or an item body is clicked.
		 *
		 */
		this._bCheckBoxClicked = true;

		// determines if value of the combobox should be empty string after popup's close
		this._bPreventValueRemove = false;
		// ToDo: Remove. Just for backwards compatibility with the runtime layer. When this change merges, we'd need to adjust the code in the runtime
		this._oTokenizer = this._createTokenizer();
		this.setAggregation("tokenizer", this._oTokenizer);
		this._aInitiallySelectedItems = [];

		this._oRbC = Library.getResourceBundleFor("sap.ui.core");

		this._fillList();
	};

	/**
	 * Fires when an object gets removed from the items aggregation
	 *
	 * @param {sap.ui.core.Item} oItem The item to be removed
	 * @private
	 */
	MultiComboBox.prototype.handleItemRemoval = function (oItem) {
		this.removeSelection({
			item: oItem,
			id: oItem ? oItem.getId() : "",
			key: oItem ? oItem.getKey() : "",
			fireChangeEvent: false,
			suppressInvalidate: true,
			listItemUpdated: true
		});
	};

	/**
	 * Checks whether an item is selected.
	 *
	 * @param {sap.ui.core.Item} oItem The item to check.
	 * @returns {boolean} True if the item is selected.
	 * @public
	 */
	MultiComboBox.prototype.isItemSelected = function(oItem) {
		return this.getSelectedItems().indexOf(oItem) > -1;
	};

	/**
	 * Destroy the tokens in the Tokenizer.
	 *
	 * @private
	 */
	MultiComboBox.prototype._clearTokenizer = function() {
		this.getAggregation("tokenizer").destroyTokens();
	};

	MultiComboBox.prototype.exit = function() {
		ComboBoxBase.prototype.exit.apply(this, arguments);
		this._deregisterResizeHandler();

		if (this._oTokenizer) {
			this._oTokenizer.destroy();
			this._oTokenizer = null;
		}

		this._oRbC = null;
		this.oValueStateNavDelegate = null;

		this._sInitialValueState = null;
	};

	/**
	 * Destroys all the items in the aggregation named <code>items</code>.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.destroyItems = function() {
		this.setProperty("selectedKeys", []);
		this._clearTokenizer();

		return this.destroyAggregation("items");
	};

	/**
	 * Get item corresponding to given token.
	 *
	 * @param {sap.m.Token | null} oToken The given token
	 * @return {sap.ui.core.Item} The corresponding item
	 * @private
	 * @since 1.24.0
	 */
	MultiComboBox.prototype._getItemByToken = function(oToken) {
		return ListHelpers.getItemBy(this.getItems(), oToken, "Token");
	};

	/**
	 * Gets item corresponding to the given value.
	 *
	 * @param {string} sValue The given value
	 * @return {sap.ui.core.Item} The corresponding item
	 * @private
	 */
	MultiComboBox.prototype._getItemByValue = function (sValue) {
		var oSelectableItems = ListHelpers.getSelectableItems(this.getItems());

		for (var i = 0; i < oSelectableItems.length; i++) {
			if (oSelectableItems[i].getText().toLowerCase() === sValue.toLowerCase()) {
				return oSelectableItems[i];
			}
		}
	};

	/**
	 * Handles the initial placement of the focus and item selection before the picker is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleItemToFocus = function () {
		if (this.isOpen()) {
			return;
		}

		this.syncPickerContent();

		var iItemToFocus, oItemToFocus,
			oCurrentlyFocusedObject = Element.getElementById(document.activeElement.id),
			aSelectedItems = this.getSelectedItems(),
			aSelectableItems = ListHelpers.getSelectableItems(this.getItems()),
			oList = this._getList(),
			oItemNavigation = oList && oList.getItemNavigation(),
			sValue = this.getValue(),
			oPicker = this.getPicker();


		if (oCurrentlyFocusedObject && oCurrentlyFocusedObject.isA("sap.m.Token")) {
			oItemToFocus = this._getItemByToken(oCurrentlyFocusedObject);
		} else if (sValue) {
			oItemToFocus = this._getItemByValue(sValue);
		}

		// If no items are selected focus the first visible one
		if (!oItemToFocus) {
			oItemToFocus = aSelectedItems.length ? ListHelpers.getItemByListItem(this.getItems(), this._getList().getSelectedItems()[0]) : aSelectableItems[0];
		}

		iItemToFocus = ListHelpers.getVisibleItems(this.getItems()).indexOf(oItemToFocus);

		// Set the initial selected index and focus
		if (oItemNavigation) {
			oItemNavigation.setSelectedIndex(iItemToFocus);
		} else {
			this._bListItemNavigationInvalidated = true;
			this._iInitialItemFocus = iItemToFocus;
		}

		if (!oItemToFocus) {
			// If there are no items currently in the MultiComboBox the focus needs to return to the Input field,
			// as otherwise it is moved to the first focusable element of the static UI area, which prevents
			// the normal keyboard interaction flow.
			oPicker.setInitialFocus(this);
		} else {
			oPicker.setInitialFocus(oList);
		}
	};

	/**
	 * Gets the accessibility info for the control
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {sap.ui.core.AccessibilityInfo} The accessibility info
	 * @protected
	 */
	MultiComboBox.prototype.getAccessibilityInfo = function() {
		var sText = this.getSelectedItems().map(function(oItem) {
			return oItem.getText();
		}).join(" ");

		var oInfo = ComboBoxBase.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_MULTICOMBO");
		oInfo.description = (this.getValueDescriptionInfo() + " " + sText).trim();
		return oInfo;
	};

	/**
	 * Gets the value of the accessibility description info field.
	 *
	 * @protected
	 * @override
	 * @returns {string} The value of the accessibility description info
	 */
	MultiComboBox.prototype.getValueDescriptionInfo = function () {
		if (this.getValue()) {
			return this.getValue();
		}
		return this._hasTokens() ? "" : Library.getResourceBundleFor("sap.m").getText("INPUTBASE_VALUE_EMPTY");
	};

	/**
	 * Indicates if selection is triggered by a click
	 *
	 * @param {boolean} bIsClick Click indicator
	 *
	 * @private
	 */
	MultiComboBox.prototype._setIsClick = function (bIsClick) {
		this._bIsClick = bIsClick;
	};

	/**
	 * Gets flag for a mouse press
	 *
	 * @returns {boolean} if selection is triggered by a click
	 * @private
	 */
	 MultiComboBox.prototype._getIsClick = function () {
		return this._bIsClick;
	};

	/**
	 * Function calculates the available space for the tokenizer
	 *
	 * @private
	 * @return {string | null} CSSSize in px
	 */
	MultiComboBox.prototype._calculateSpaceForTokenizer = function () {
		if (this.getDomRef()) {
			var iSpace,
				iControlWidth = this.getDomRef().getBoundingClientRect().width,
				iSummedIconsWidth = this._calculateIconsSpace(),
				oInputRef = this.$().find(".sapMInputBaseInner"),
				aInputRelevantCss = ["min-width", "padding-right", "padding-left"],
				// calculate width of the input html element based on its min-width
				iInputWidth = aInputRelevantCss.reduce(function(iAcc, sProperty) {
					return iAcc + (parseInt(oInputRef.css(sProperty)) || 0);
				}, 0);

			iSpace = iControlWidth - (iSummedIconsWidth + iInputWidth);
			iSpace = iSpace < 0 ? 0 : iSpace;

			return iSpace + "px";
		} else {
			return null;
		}
	};

	/**
	 * Calculates and sets the available width of the html input element
	 * when there is a tokenizer.
	 *
	 * @param {sap.m.Tokenizer} oTokenizer The tokenizer of the control
	 * @private
	 */
	MultiComboBox.prototype._syncInputWidth = function (oTokenizer) {
		var oFocusDomRef = this.getDomRef('inner'),
			iSummedIconsWidth, fTokenizerWidth;

		if (!oFocusDomRef || (oTokenizer && !oTokenizer.getDomRef())) {
			return;
		}

		/* Most of the time the tokenizer's BoundingClientRect width is a decimal number.
		Rounding it to an integer causes visual bugs in some cases (depending on the tokens'
		width - see BCP: 2070139347)as the width is no longer the exact calculated one.

		Handle numbers as floating and rounded to 2 decimal points for cross-browser compatability */
		fTokenizerWidth = parseFloat(oTokenizer.getDomRef().getBoundingClientRect().width.toFixed(2));
		iSummedIconsWidth = this._calculateIconsSpace();
		oFocusDomRef.style.width = 'calc(100% - ' + parseFloat(iSummedIconsWidth + fTokenizerWidth) + "px)";
	};

	/**
	 * Adds or removes aria-describedby attribute to indicate that you can interact with Nmore.
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleNMoreAccessibility = function () {
		var sInvisibleTextId = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER"),
			oTokenizer = this.getAggregation("tokenizer"),
			oFocusDomRef = this.getFocusDomRef(),
			sAriaDescribedBy = (oFocusDomRef && oFocusDomRef.getAttribute("aria-describedby")),
			aAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy.split(" ") : [],
			iNMoreIndex = aAriaDescribedBy.indexOf(sInvisibleTextId),
			bEnabled = this.getEnabled(),
			bNMoreAriaRequirements = !this.getEditable() && oTokenizer && oTokenizer.getHiddenTokensCount();

		// if the control is readonly and has a visible n-more, provide the respective aria attributes
		if (bNMoreAriaRequirements && iNMoreIndex === -1) {
			aAriaDescribedBy.push(sInvisibleTextId);
			bEnabled && this.getFocusDomRef().setAttribute("aria-keyshortcuts", "Enter");
		// if the control is no longer readonly or the n-more is not visible, make sure to clear out the attributes
		} else if (iNMoreIndex !== -1 && !bNMoreAriaRequirements) {
			aAriaDescribedBy.splice(iNMoreIndex, 1);
			this.getFocusDomRef().removeAttribute("aria-keyshortcuts");
		}

		if (oFocusDomRef && aAriaDescribedBy.length) {
			oFocusDomRef.setAttribute("aria-describedby", aAriaDescribedBy.join(" ").trim());
		}
	};


	/**
	 * Applies <code>MultiComboBox</code> specific filtering over the list items.
	 * Called within showItems method.
	 *
	 * @since 1.64
	 * @private
	 * @ui5-restricted
	 */
	MultiComboBox.prototype.applyShowItemsFilters = function () {
		this.syncPickerContent();
		itemsVisibilityHandler(this.getItems(), this.filterItems({value: this.getValue() || "_", items: this.getItems()}));
		this.manageSelectAllCheckBoxState();
	};

	/**
	 * Opens the <code>SuggestionsPopover</code> with the available items.
	 *
	 * @param {function} fnFilter Function to filter the items shown in the SuggestionsPopover
	 * @returns {void}
	 *
	 * @override
	 */
	MultiComboBox.prototype.showItems = function (fnFilter) {
		var bHasItemsAfterFiltering = true,
			fnFilterRestore = this.fnFilter;

		if (typeof fnFilter === "function") {
			this.syncPickerContent();
			// Get filtered items and open the popover only when the items array is not empty.
			this.setFilterFunction(fnFilter || function () { return true; });
			bHasItemsAfterFiltering = this.filterItems({value: this.getValue() || "_", items: this.getItems()}).items.length > 0;
			this.setFilterFunction(fnFilterRestore);
		}

		if (bHasItemsAfterFiltering) {
			ComboBoxBase.prototype.showItems.apply(this, arguments);
		}
	};

	/**
	 * Creates a list header toolbar containing the select all checkbox.
	 *
	 * @param {sap.m.List} oList The list instance to be configured
	 * @private
	 */
	MultiComboBox.prototype.createSelectAllHeaderToolbar = function (oList) {
		oList = oList || this._getList();

		if (!oList || oList.getHeaderToolbar()) {
			return;
		}

		var oSelectAllCheckbox = new CheckBox({
			select: function (oEvent) {
				var oCheckBox = oEvent.getSource(),
					aVisibleSelectableItems = ListHelpers.getSelectableItems(this.getItems()),
					aSelectedVisibleItems = this._getSelectedItemsOf(aVisibleSelectableItems);

				if (oEvent.getParameter("selected")) {
					var aNotSelectedVisibleItems = aVisibleSelectableItems.filter(function (aCurSelectedItem) {
						return aSelectedVisibleItems.indexOf(aCurSelectedItem) === -1;
					});

					aNotSelectedVisibleItems.forEach(function(oItem) {
						this.setSelection({
							item: oItem,
							items: aNotSelectedVisibleItems,
							selectAll: true,
							id: oItem.getId(),
							key: oItem.getKey(),
							fireChangeEvent: true,
							suppressInvalidate: true,
							listItemUpdated: false
						});
					}, this);

				} else {
					aSelectedVisibleItems.forEach(function(oItem) {
						this.removeSelection({
							item: oItem,
							items: aSelectedVisibleItems,
							selectAll: true,
							id: oItem.getId(),
							key: oItem.getKey(),
							fireChangeEvent: true,
							suppressInvalidate: true,
							listItemUpdated: false
						});
					}, this);
				}

				oCheckBox.focus();
			}.bind(this)
		});

		oSelectAllCheckbox.addEventDelegate(this._selectAllDelegate(), this);

		oList.setHeaderToolbar(new Toolbar({
				content: oSelectAllCheckbox
			}).addStyleClass("sapMMultiComboBoxSelectAll"))
			.setSticky(["HeaderToolbar"]);

		this.attachSelectionChange(this.manageSelectAllCheckBoxState.bind(this));
	};

	/**
	 * Updates the state and text of the select all checkbox.
	 *
	 * @private
	 */
	MultiComboBox.prototype.manageSelectAllCheckBoxState = function () {
		var oSelectAllCheckbox = this.getSelectAllCheckbox();

		if (!oSelectAllCheckbox) {
			return;
		}

		var aItems = this.getItems(),
			aSelectedItems = this.getSelectedItems(),
			bSelectAll = ListHelpers.getSelectableItems(aItems).filter(function (oSelectableItem) {
				return aSelectedItems.indexOf(oSelectableItem) > -1;
			}).length === ListHelpers.getSelectableItems(aItems).length;

		oSelectAllCheckbox
			.setText(this._oRb.getText("MULTICOMBOBOX_SELECT_ALL_CHECKBOX", [aSelectedItems.length, ListHelpers.getAllSelectableItems(aItems).length]))
			.setSelected(bSelectAll);
	};

	/**
	 * Gets the list header toolbar containing the select all checkbox.
	 *
	 * @returns {sap.m.Toolbar|undefined} The header toolbar, if defined
	 * @private
	 */
	MultiComboBox.prototype.getSelectAllToolbar = function () {
		var oList = this._getList();

		return oList && oList.getHeaderToolbar();
	};

	/**
	 * Gets the select all checkbox.
	 *
	 * @returns {sap.m.Checkbox|undefined} The select all checkbox, if defined
	 * @private
	 */
	MultiComboBox.prototype.getSelectAllCheckbox = function () {
		var oSelectAllToolbar = this.getSelectAllToolbar();

		return oSelectAllToolbar && oSelectAllToolbar.getContent()[0];
	};

	/**
	 * Event Delegate for the select all checkbox.
	 *
	 * @returns {object} The delegate object, containing all event delegates
	 * @private
	 */
	MultiComboBox.prototype._selectAllDelegate = function () {
		return {
			onsapdown: this.handleDownEvent,
			onsapup: function (oEvent) {
				oEvent.preventDefault();
				if (this.getValueState() !== ValueState.None) {
					this._handleFormattedTextNav();
					return;
				}

				this.getFocusDomRef().focus();
			},
			onsaphome: this.handleHomeEvent,
			onsapend: this.handleEndEvent,
			onfocusin: function () {
				var oRenderer = this.getRenderer(),
					oSelectAllToolbar = this.getSelectAllToolbar();

				oSelectAllToolbar && oSelectAllToolbar.addStyleClass(oRenderer.CSS_CLASS_MULTICOMBOBOX + "SelectAllFocused");
			},
			onfocusout: function () {
				var oRenderer = this.getRenderer(),
					oSelectAllToolbar = this.getSelectAllToolbar();

				oSelectAllToolbar && oSelectAllToolbar.removeStyleClass(oRenderer.CSS_CLASS_MULTICOMBOBOX + "SelectAllFocused");
			},
			onsapshow: this.close,
			onsaphide: this.close
		};
	};

	/**
	 * Focuses the select all checkbox.
	 * @private
	 */
	MultiComboBox.prototype.focusSelectAll = function () {
		var oSelectAllCheckbox = this.getSelectAllCheckbox();

		oSelectAllCheckbox && oSelectAllCheckbox.focus();
	};

	/**
	 * Toggles the visibility of the list header toolbar, containing the select all checkbox.
	 *
	 * @param {boolean} bShow If true, the select all should be visible
	 * @private
	 */
	MultiComboBox.prototype.toggleSelectAllVisibility = function (bShow) {
		var oSelectAllToolbar = this.getSelectAllToolbar();

		if (oSelectAllToolbar) {
			oSelectAllToolbar.setVisible(bShow);
			return;
		}

		bShow && this.createSelectAllHeaderToolbar();
	};

	/**
	 * Handles the clear icon press.
	 *
	 * @param {sap.ui.base.Event} oEvent The press event object
	 * @returns {void}
	 *
	 * @override
	 */
	MultiComboBox.prototype.handleClearIconPress = function () {
		if (!(this.getEnabled() && this.getEditable())) {
			return;
		}

		if (this.getValue() !== "") {
			this.setValue("");
			this._sOldInput = "";

			this.bOpenedByKeyboardOrButton ? this.clearFilter() : this.close();
			this.setProperty("effectiveShowClearIcon", false);
		}
	};

	// support for SemanticFormElement
	MultiComboBox.prototype.getFormFormattedValue = function () {
		return this.getSelectedItems()
			.map(function (oItem) {
				return oItem.getText();
			})
			.join(", ");
	};

	MultiComboBox.prototype.getFormObservingProperties = function() {
		return ["value", "selectedKeys"];
	};

	return MultiComboBox;

	});
