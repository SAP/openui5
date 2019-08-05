/*!
 * ${copyright}
 */

sap.ui.define([
	'./InputBase',
	'./ComboBoxTextField',
	'./ComboBoxBase',
	'./Input',
	'./Tokenizer',
	'./Token',
	'./ToggleButton',
	'./List',
	'./Popover',
	'./GroupHeaderListItem',
	'./library',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/ui/core/Item',
	'sap/ui/core/SeparatorItem',
	'sap/ui/core/ResizeHandler',
	'./MultiComboBoxRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
],
function(
	InputBase,
	ComboBoxTextField,
	ComboBoxBase,
	Input,
	Tokenizer,
	Token,
	ToggleButton,
	List,
	Popover,
	GroupHeaderListItem,
	library,
	EnabledPropagator,
	IconPool,
	coreLibrary,
	Device,
	Item,
	SeparatorItem,
	ResizeHandler,
	MultiComboBoxRenderer,
	containsOrEquals,
	KeyCodes,
	deepEqual,
	assert,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	var PlacementType = library.PlacementType;

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
	 * <h3>Structure</h3>
	 * The MultiComboBox consists of the following elements:
	 * <ul>
	 * <li> Input field - displays the selected option/s as token/s. Users can type to filter the list.
	 * <li> Drop-down arrow - expands\collapses the option list.</li>
	 * <li> Option list - the list of available options.</li>
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
	 * <li>Your use case requires all available options to be displayed right away, without any user interaction. In this case, consider using the {@link sap.m.Checkbox checkboxes} instead.</li>
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiComboBox = ComboBoxBase.extend("sap.m.MultiComboBox", /** @lends sap.m.MultiComboBox.prototype */ { metadata: {

		library: "sap.m",
		designtime: "sap/m/designtime/MultiComboBox.designtime",
		properties: {

			/**
			 * Keys of the selected items. If the key has no corresponding item, no changes will apply. If duplicate keys exists the first item matching the key is used.
			 */
			selectedKeys: { type: "string[]", group: "Data", defaultValue: [] }
		},
		associations: {

			/**
			 * Provides getter and setter for the selected items from
			 * the aggregation named items.
			 */
			selectedItems: { type: "sap.ui.core.Item", multiple: true, singularName: "selectedItem" }
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
					 * Selection state: true if item is selected, false if
					 * item is not selected
					 */
					selected: { type: "boolean" }
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
		}
	}});

	IconPool.insertFontFaceStyle();
	EnabledPropagator.apply(MultiComboBox.prototype, [true]);

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
		sap.m.Tokenizer.prototype.onsapend.apply(this._oTokenizer, arguments);
	};

	/**
	 * Handle Home key pressed. Scroll the first token into viewport.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsaphome = function(oEvent) {
		sap.m.Tokenizer.prototype.onsaphome.apply(this._oTokenizer, arguments);
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

		// mark the event for components that needs to know if the event was handled
		// by this control
		oEvent.setMarked();

		// note: prevent document scrolling when arrow keys are pressed
		oEvent.preventDefault();

		// If list is open then go to the first visible list item. Set this item
		// into the visual viewport.
		// If list is closed...
		var aItems = this.getSelectableItems();
		var oItem = aItems[0];

		if (oItem && this.isOpen()) {
			this.getListItem(oItem).focus();
			return;
		}

		if (this._oTokenizer.getSelectedTokens().length) {
			return;
		}

		this._oTraversalItem = this._getNextTraversalItem();

		if (this._oTraversalItem) {
			this.updateDomValue(this._oTraversalItem.getText());
			this.selectText(0, this.getValue().length);
		}
	};

	/**
	 * Handle UP arrow key pressed. Set focus to input field if first list item has focus. Otherwise show in input field
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

		if (this._oTokenizer.getSelectedTokens().length) {
			return;
		}

		this._oTraversalItem = this._getPreviousTraversalItem();

		if (this._oTraversalItem) {
			this.updateDomValue(this._oTraversalItem.getText());
			this.selectText(0, this.getValue().length);
		}
	};

	/**
	 * Handles the <code>onsapshow</code> event when either F4 is pressed or Alt + Down arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onsapshow = function(oEvent) {
		var oList = this.getList(),
			oPicker = this.getPicker(),
			aSelectableItems = this.getSelectableItems(),
			aSelectedItems = this.getSelectedItems(),
			oItemToFocus, oItemNavigation = oList.getItemNavigation(),
			iItemToFocus, oCurrentFocusedControl;

		oCurrentFocusedControl = jQuery(document.activeElement).control()[0];

		if (oCurrentFocusedControl instanceof sap.m.Token) {
			oItemToFocus = this._getItemByToken(oCurrentFocusedControl);
		} else {
			// we need to take the list's first selected item not the first selected item by the combobox user
			oItemToFocus = aSelectedItems.length ? this._getItemByListItem(this.getList().getSelectedItems()[0]) : aSelectableItems[0];
		}

		iItemToFocus = this.getItems().indexOf(oItemToFocus);

		if (oItemNavigation) {
			oItemNavigation.setSelectedIndex(iItemToFocus);
		} else {
			this._bListItemNavigationInvalidated = true;
			this._iInitialItemFocus = iItemToFocus;
		}

		oPicker.setInitialFocus(oList);
		ComboBoxBase.prototype.onsapshow.apply(this, arguments);
	};

	/**
	 * Handles when Alt + Up arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	MultiComboBox.prototype.onsaphide = MultiComboBox.prototype.onsapshow;

	/**
	 * Handles the item selection when user triggers an item selection via key press (TAB, ENTER etc.).
	 *
	 * @param {jQuery.Event} oEvent The key event object
	 * @private
	 */
	MultiComboBox.prototype._selectItemByKey = function(oEvent) {
		var aVisibleItems, oParam,
			oItem, i, bItemMatched,
			bPickerOpened = this.isOpen();

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled
		// by this control
		if (oEvent) {
			oEvent.setMarked();
		}

		aVisibleItems = this._getUnselectedItems(bPickerOpened ? "" : this.getValue());

		for (i = 0; i < aVisibleItems.length; i++) {
			if (aVisibleItems[i].getText().toUpperCase() === this.getValue().toUpperCase()) {
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
				if (this.getListItem(oItem).isSelected()) {
					this.setValue('');
				} else {
					this.setSelection(oParam);
				}
			}
		} else {
			this._bPreventValueRemove = true;
			this._showWrongValueVisualEffect();
		}

		if (oEvent) {
			this.close();
		}
	};

	/**
	 * Function calculates the available space for the tokenizer
	 *
	 * @private
	 * @return {String | null} CSSSize in px
	 */
	MultiComboBox.prototype._calculateSpaceForTokenizer = function () {
		if (this.getDomRef()) {
			var iWidth = this.getDomRef().offsetWidth,
				iArrowButtonWidth = parseInt(this.getDomRef("arrow").offsetWidth, 10),
				iInputWidth = parseInt(this.$().find(".sapMInputBaseInner").css("min-width"), 10) || 0,
				iInputPadding = parseInt(this.$().find(".sapMInputBaseInner").css("padding-right"), 10) || 0;

			return iWidth - (iArrowButtonWidth + iInputWidth + iInputPadding) + "px";
		} else {
			return null;
		}
	};
	/**
	 * Handle when enter is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.onsapenter = function(oEvent) {
		InputBase.prototype.onsapenter.apply(this, arguments);

		if (this.getValue()) {
			this._selectItemByKey(oEvent);
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
			if (aSelectableItems.length === 1) {
				this._selectItemByKey(oEvent);
			} else {
				this._showWrongValueVisualEffect();
			}
		}
	};

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
		var oPicker = this.getAggregation("picker"),
			bTablet = this.isPlatformTablet(),
			oControl = sap.ui.getCore().byId(oEvent.relatedControlId),
			oFocusDomRef = oControl && oControl.getFocusDomRef(),
			sOldValue = this.getValue();

		// If focus target is outside of picker
		if (!oPicker || !oPicker.getFocusDomRef() || !oFocusDomRef || !jQuery.contains(oPicker.getFocusDomRef(), oFocusDomRef)) {

			this.setValue(null);

			// fire change event only if the value of the MCB is not empty
			if (sOldValue) {
				this.fireChangeEvent("", { value: sOldValue });
			}

			// If focus is outside of the MultiComboBox
			if (!(oControl instanceof Token || oEvent.srcControl instanceof Token)) {
				this._oTokenizer.scrollToEnd();
			}

			// if the focus is outside the MultiComboBox, the tokenizer should be collapsed
			if (!jQuery.contains(this.getDomRef(), document.activeElement)) {
				this._oTokenizer._useCollapsedMode(true);
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
		var oPickerDomRef  = oPicker.getFocusDomRef();
		var bPickerClosing = oPicker.oPopup.getOpenState() === OpenState.CLOSING;
		var bDropdownPickerType = this.getPickerType() === "Dropdown";

		if (bDropdownPickerType) {
			bPreviousFocusInDropdown = oPickerDomRef && jQuery.contains(oPickerDomRef, oEvent.relatedTarget);
		}

		if (this.getEditable()) {
			this._oTokenizer._useCollapsedMode(false);
			this._oTokenizer.scrollToEnd();
		}

		if (oEvent.target === this.getFocusDomRef()) {
			this.getEditable() && this.addStyleClass("sapMFocus");
			// enable type ahead when switching focus from the dropdown to the input field
			// we need to check whether the focus has been triggered by the popover's closing or just a manual focusin
			// isOpen is still true as the closing has not finished yet.
			!bPickerClosing && bPreviousFocusInDropdown && this.handleInputValidation(oEvent, false);
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
	 * Handle the browser tap event on the List item.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleItemTap = function(oEvent) {
		var oTappedControl = jQuery(oEvent.target).control(0);

		if (!oTappedControl.isA("sap.m.CheckBox") && !oTappedControl.isA("sap.m.GroupHeaderListItem")) {
			this._bCheckBoxClicked = false;
			if (this.isOpen() && !this._isListInSuggestMode()) {
				this.close();
			}
		}
	};

	/**
	 * Handle the item press event on the List.
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
				this.getListItem(oItem).focus();
			}
		}
	};

	/**
	 * Handle the selection change event on the List.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype._handleSelectionLiveChange = function(oEvent) {
		var oListItem = oEvent.getParameter("listItem");
		var bIsSelected = oEvent.getParameter("selected");
		var oNewSelectedItem = this._getItemByListItem(oListItem);
		var oInputControl = this.isPickerDialog() ? this.getPickerTextField() : this;

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
			id: oNewSelectedItem.getId(),
			key: oNewSelectedItem.getKey(),
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

			if (this.isOpen() && this.getPicker().oPopup.getOpenState() !== OpenState.CLOSING) {
				// workaround: this is needed because the List fires the "selectionChange" event during the popover is closing.
				// So clicking on list item description the focus should be replaced to input field. Otherwise the focus is set to
				// oListItem.

				// Scrolls an item into the visual viewport
				oListItem.focus();
			}
		} else {
			this._bCheckBoxClicked = true;
			this.setValue("");
			this.close();
		}
	};

	/**
	 * Function is called on key down keyboard input
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onkeydown = function(oEvent) {
		ComboBoxBase.prototype.onkeydown.apply(this, arguments);

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		this._bIsPasteEvent = (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.V);

		// only if there is no text and tokenizer has some tokens
		if (this.getValue().length === 0 && (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.A)
			&& this._hasTokens()) {

			this._oTokenizer.focus();
			this._oTokenizer.selectAllTokens(true);
			oEvent.preventDefault();
		}

		// workaround - keyup is not fired on mobile device
		if (this.isPickerDialog()) {
			this._sOldValue = this.getPickerTextField().getValue();
			this._iOldCursorPos = jQuery(this.getFocusDomRef()).cursorPos();
		}

		this._bDoTypeAhead = (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
	};

	/**
	 * Handle the input event on the control's input field.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiComboBox.prototype.oninput = function(oEvent) {
		ComboBoxBase.prototype.oninput.apply(this, arguments);
		var oInput = oEvent.srcControl;

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		if (this._bIsPasteEvent) {
			oInput.updateDomValue(this._sOldValue || "");
			return;
		}

		// suppress invalid value
		this.handleInputValidation(oEvent, this.isComposingCharacter());

		if (this.isOpen()) {
			// wait a tick so the setVisible call has replaced the DOM
			setTimeout(this._highlightList.bind(this, this._sOldInput));
		}
	};

	/**
	 * Filters array of items for given value
	 *
	 * @private
	 */
	MultiComboBox.prototype.filterItems = function (mOptions) {
		var fnFilter = this.fnFilter ? this.fnFilter : ComboBoxBase.DEFAULT_TEXT_FILTER;
		var aFilteredItems = [];
		var bGrouped = false;
		var oGroups = [];

		mOptions.items.forEach(function(oItem) {

			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				oGroups.push({
					separator: oItem
				});

				this.getListItem(oItem).setVisible(false);

				bGrouped = true;

				return;
			}

			var bMatch = !!fnFilter(mOptions.value, oItem, "getText");

			if (mOptions.value === "") {
				bMatch = true;
				if (!this.bOpenedByKeyboardOrButton && !this.isPickerDialog()) {
					// prevent filtering of the picker if it will be closed
					return;
				}
			}

			if (bGrouped && bMatch) {
				this.getListItem(oGroups[oGroups.length - 1].separator).setVisible(true);
			}

			var oListItem = this.getListItem(oItem);

			if (oListItem) {
				oListItem.setVisible(bMatch);
				bMatch && aFilteredItems.push(oItem);
			}
		}, this);

		return aFilteredItems;
	};

	/**
	 * Function is called on key up keyboard input
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onkeyup = function(oEvent) {
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
		var sOldValueState = this.getValueState();

		if (sOldValueState === ValueState.Error) {
			return;
		}

		if (this.isPickerDialog()) {
			this.getPickerTextField().setValueState(ValueState.Error);
			setTimeout(this.getPickerTextField()["setValueState"].bind(this.getPickerTextField(), sOldValueState), 1000);
		} else {
			this.setValueState(ValueState.Error);
			setTimeout(this["setValueState"].bind(this, sOldValueState), 1000);
		}

		this._syncInputWidth(this._oTokenizer);
	};

	/**
	 * Returns a modified instance type of <code>sap.m.Popover</code> used in read-only mode.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiComboBox.prototype._getReadOnlyPopover = function() {
		if (!this._oReadOnlyPopover) {
			this._oReadOnlyPopover = this._createReadOnlyPopover();
		}

		return this._oReadOnlyPopover;
	};

	/**
	 * Creates an instance type of <code>sap.m.Popover</code> used in read-only mode.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiComboBox.prototype._createReadOnlyPopover = function() {
		return new Popover({
			showArrow: true,
			placement: PlacementType.Auto,
			showHeader: false,
			contentMinWidth: "auto"
		}).addStyleClass("sapMMultiComboBoxReadOnlyPopover");
	};

	/**
	 * Creates a picker. To be overwritten by subclasses.
	 *
	 * @param {string} sPickerType The picker type
	 * @returns {sap.m.Popover | sap.m.Dialog} The picker pop-up to be used
	 * @protected
	 * @function
	 */
	MultiComboBox.prototype.createPicker = function(sPickerType) {
		var oPicker = this.getAggregation("picker");

		if (oPicker) {
			return oPicker;
		}

		oPicker = this["create" + sPickerType]();

		// define a parent-child relationship between the control's and the picker pop-up (Popover or Dialog)
		this.setAggregation("picker", oPicker, true);

		var oRenderer = this.getRenderer(),
			CSS_CLASS_MULTICOMBOBOX = oRenderer.CSS_CLASS_MULTICOMBOBOX;

		// configuration
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
				}, this)
				.addContent(this.getList());

		return oPicker;
	};

	MultiComboBox.prototype.createPickerTextField = function () {
		var that = this;

		return new Input({
			// select a list item, when enter is triggered in picker text field
			submit: function (oEvent) {
				var sValue = this.getValue();
				if (sValue) {
					that.setValue(sValue);
					that._selectItemByKey();
					this.setValue(that._sOldInput);
				}
			}
		}).addEventDelegate({
			// remove the type ahead when focus is not in the input
			onfocusout: this._handleInputFocusOut
		}, this);
	};

	MultiComboBox.prototype.onBeforeRendering = function() {
		ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
		var aItems = this.getItems();

		var oList = this.getList();
		if (oList) {
			this._synchronizeSelectedItemAndKey(aItems);

			// prevent closing of popup on re-rendering
			oList.destroyItems();
			this._clearTokenizer();
			this._fillList(aItems);

			// save focused index, and re-apply after rendering of the list
			if (oList.getItemNavigation()) {
				this._iFocusedIndex = oList.getItemNavigation().getFocusedIndex();
			}

			// Re-apply editable state to make sure tokens are rendered in right state.
			this.setEditable(this.getEditable());
		}

		this._deregisterResizeHandler();
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
		this._oTokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		this._syncInputWidth(this._oTokenizer);
	};

	/**
	 * This hook method is called before the MultiComboBox's Pop-up is rendered.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.onBeforeRenderingPicker = function() {
		var fnOnBeforeRenderingPopupType = this["_onBeforeRendering" + this.getPickerType()];

		if (fnOnBeforeRenderingPopupType) {
			fnOnBeforeRenderingPopupType.call(this);
		}
	};

	/**
	 * This hook method is called after the MultiComboBox's Pop-up is rendered.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.onAfterRenderingPicker = function() {
		var fnOnAfterRenderingPopupType = this["_onAfterRendering" + this.getPickerType()];

		if (fnOnAfterRenderingPopupType) {
			fnOnAfterRenderingPopupType.call(this);
		}
	};

	/**
	 * This event handler will be called before the MultiComboBox Popup is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onBeforeOpen = function() {
		var fnPickerTypeBeforeOpen = this["_onBeforeOpen" + this.getPickerType()];

		// add the active state to the MultiComboBox's field
		this.addStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		this._resetCurrentItem();
		this.addContent();
		this._aInitiallySelectedItems = this.getSelectedItems();

		if (fnPickerTypeBeforeOpen) {
			fnPickerTypeBeforeOpen.call(this);
		}
	};

	/**
	 * This event handler will be called after the MultiComboBox's Pop-up is opened.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterOpen = function() {
		var oDomRef = this.getFocusDomRef();

		oDomRef && oDomRef.setAttribute("aria-expanded", "true");

		// reset the initial focus back to the input
		if (!this.isPlatformTablet()) {
			this.getPicker().setInitialFocus(this);
		}

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
		var bUseCollapsed = !jQuery.contains(this.getDomRef(), document.activeElement) || this.isPickerDialog(),
			oDomRef = this.getFocusDomRef();

		oDomRef && oDomRef.setAttribute("aria-expanded", "false");

		// remove the active state of the MultiComboBox's field
		this.removeStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);

		// Show all items when the list will be opened next time
		this.clearFilter();

		// resets or not the value of the input depending on the event (enter does not clear the value)
		!this.isComposingCharacter() && !this._bPreventValueRemove && this.setValue("");
		this._sOldValue = "";

		if (this.isPickerDialog()) {
			this.getPickerTextField().setValue("");
			this._getFilterSelectedButton() && this._getFilterSelectedButton().setPressed(false);
		}

		this.fireSelectionFinish({
			selectedItems: this.getSelectedItems()
		});

		this._oTokenizer._useCollapsedMode(bUseCollapsed);
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
	 * Decorate a Popover instance by adding some private methods.
	 *
	 * @param {sap.m.Popover} oPopover The popover to be decorated
	 * @private
	 */
	MultiComboBox.prototype._decoratePopover = function(oPopover) {
		var that = this;

		oPopover.open = function() {
			return this.openBy(that);
		};
	};

	/**
	 * Creates an instance type of <code>sap.m.Popover</code>.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiComboBox.prototype.createDropdown = function() {
		var oDropdown = new Popover(this.getDropdownSettings());
		oDropdown.setInitialFocus(this);
		this._decoratePopover(oDropdown);
		return oDropdown;
	};

	MultiComboBox.prototype.createDialog = function () {
		var oDialog = ComboBoxBase.prototype.createDialog.apply(this, arguments),
			oSelectAllButton = this._createFilterSelectedButton();

		oDialog.getSubHeader().addContent(oSelectAllButton);
		return oDialog;
	};

	/**
	 * Creates an instance of <code>sap.m.ToggleButton</code>.
	 *
	 * @returns {sap.m.ToggleButton} The Button instance
	 * @private
	 */
	MultiComboBox.prototype._createFilterSelectedButton = function () {
		var sIconURI = IconPool.getIconURI("multiselect-all"),
			oRenderer = this.getRenderer(),
			that = this;
		return new ToggleButton({
			icon: sIconURI,
			press: that._filterSelectedItems.bind(this)
		}).addStyleClass(oRenderer.CSS_CLASS_MULTICOMBOBOX + "ToggleButton");
	};

	MultiComboBox.prototype._getFilterSelectedButton = function () {
			return this.getPicker().getSubHeader().getContent()[1];
	};

	/**
	 * Filters visible selected items
	 * @param {jQuery.Event} oEvent The event object
	 * @returns {void}
	 * @private
	 */
	MultiComboBox.prototype._filterSelectedItems = function (oEvent, bForceShowSelected) {
		var oSource = oEvent.oSource, oListItem, bMatch,
			sValue = this.getPickerTextField() ? this.getPickerTextField().getValue() :  "",
			bShowSelectedOnly = (oSource && oSource.getPressed && oSource.getPressed()) || bForceShowSelected,
			aVisibleItems = this.getVisibleItems(),
			aItems = this.getItems(),
			aSelectedItems = this.getSelectedItems(),
			oLastGroupListItem = null;

		if (bShowSelectedOnly) {
			aVisibleItems.forEach(function(oItem) {
				bMatch = aSelectedItems.indexOf(oItem) > -1 ? true : false;
				oListItem = this.getListItem(oItem);

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
			this.filterItems({ value: sValue, items: aItems });
		}
	};

	MultiComboBox.prototype.revertSelection = function () {
		this.setSelectedItems(this._aInitiallySelectedItems);
	};

	/**
	 * Create an instance type of <code>sap.m.List</code>.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.createList = function() {
		var oRenderer = this.getRenderer();

		// list to use inside the picker
		this._oList = new List({
			width: "100%",
			mode: ListMode.MultiSelect,
			includeItemInSelection: true,
			rememberSelections: false
		}).addStyleClass(oRenderer.CSS_CLASS_COMBOBOXBASE + "List")
		.addStyleClass(oRenderer.CSS_CLASS_MULTICOMBOBOX + "List")
		.attachBrowserEvent("tap", this._handleItemTap, this)
		.attachSelectionChange(this._handleSelectionLiveChange, this)
		.attachItemPress(this._handleItemPress, this);

		this._oList.addEventDelegate({
			onAfterRendering: this.onAfterRenderingList,
			onfocusin: this.onFocusinList
		}, this);
	};

	/**
	 * Update and synchronize "selectedItems" association and the "selectedItems" in the List.
	 *
	 * @param {object} mOptions Options object
	 * @param {sap.ui.core.Item | null} mOptions.item The item instance
	 * @param {string} mOptions.id The item ID
	 * @param {string} mOptions.key The item key
	 * @param {boolean} [mOptions.suppressInvalidate] Whether invalidation should be suppressed
	 * @param {boolean} [mOptions.listItemUpdated] Whether the item list is updated
	 * @param {boolean} [mOptions.fireChangeEvent] Whether the change event is fired
	 * @private
	 */
	MultiComboBox.prototype.setSelection = function(mOptions) {
		if (mOptions.item && this.isItemSelected(mOptions.item)) {
			return;
		}

		if (!mOptions.item) {
			return;
		}


		if (!mOptions.listItemUpdated && this.getListItem(mOptions.item)) {
			// set the selected item in the List
			this.getList().setSelectedItem(this.getListItem(mOptions.item), true);
		}

		// Fill Tokenizer
		var oToken = new sap.m.Token({
			key: mOptions.key
		});
		oToken.setText(mOptions.item.getText());
		oToken.setTooltip(mOptions.item.getText());

		mOptions.item.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "Token", oToken);

		this._oTokenizer.addToken(oToken);
		this.$().toggleClass("sapMMultiComboBoxHasToken", this._hasTokens());
		this.setValue('');

		this.addAssociation("selectedItems", mOptions.item, mOptions.suppressInvalidate);
		var aSelectedKeys = this.getKeys(this.getSelectedItems());
		this.setProperty("selectedKeys", aSelectedKeys, mOptions.suppressInvalidate);

		if (mOptions.fireChangeEvent) {
			this.fireSelectionChange({
				changedItem: mOptions.item,
				selected: true
			});
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
	 * Remove an item from "selectedItems" association and the "selectedItems" in the List.
	 *
	 * @param {object} mOptions Options object
	 * @param {sap.ui.core.Item | null} mOptions.item The item instance
	 * @param {string} mOptions.id The item ID
	 * @param {string} mOptions.key The item key
	 * @param {boolean} [mOptions.suppressInvalidate] Whether invalidation should be suppressed
	 * @param {boolean} [mOptions.listItemUpdated] Whether the item list is updated
	 * @param {boolean} [mOptions.fireChangeEvent] Whether the change event is fired
	 * @private
	 */
	MultiComboBox.prototype.removeSelection = function(mOptions) {

		if (mOptions.item && !this.isItemSelected(mOptions.item)) {
			return;
		}

		if (!mOptions.item) {
			return;
		}

		this.removeAssociation("selectedItems", mOptions.item, mOptions.suppressInvalidate);
		var aSelectedKeys = this.getKeys(this.getSelectedItems());
		this.setProperty("selectedKeys", aSelectedKeys, mOptions.suppressInvalidate);

		if (!mOptions.listItemUpdated && this.getListItem(mOptions.item)) {
			// set the selected item in the List
			this.getList().setSelectedItem(this.getListItem(mOptions.item), false);
		}

		// Synch the Tokenizer
		if (!mOptions.tokenUpdated) {
			var oToken = this._getTokenByItem(mOptions.item);
			mOptions.item.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "Token", null);
			this._oTokenizer.removeToken(oToken);
		}

		this.$().toggleClass("sapMMultiComboBoxHasToken", this._hasTokens());

		if (mOptions.fireChangeEvent) {
			this.fireSelectionChange({
				changedItem: mOptions.item,
				selected: false
			});
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
	 * @param {array} [aItems] The items array
	 * @private
	 */
	MultiComboBox.prototype._synchronizeSelectedItemAndKey = function(aItems) {

		// no items
		if (!aItems.length) {
			Log.info("Info: _synchronizeSelectedItemAndKey() the MultiComboBox control does not contain any item on ", this);
			return;
		}

		var aSelectedKeys = this.getSelectedKeys() || this._aCustomerKeys;
		var aKeyOfSelectedItems = this.getKeys(this.getSelectedItems());

		// the "selectedKey" property is not synchronized
		if (aSelectedKeys.length) {
			for ( var i = 0, sKey = null, oItem = null, iIndex = null, iLength = aSelectedKeys.length; i < iLength; i++) {
				sKey = aSelectedKeys[i];

				if (aKeyOfSelectedItems.indexOf(sKey) > -1) {

					if (this._aCustomerKeys.length && (iIndex = this._aCustomerKeys.indexOf(sKey)) > -1) {
						this._aCustomerKeys.splice(iIndex, 1);
					}

					continue;
				}

				oItem = this.getItemByKey("" + sKey);

				// if the "selectedKey" has no corresponding aggregated item, no
				// changes will apply
				if (oItem) {

					if (this._aCustomerKeys.length && (iIndex = this._aCustomerKeys.indexOf(sKey)) > -1) {
						this._aCustomerKeys.splice(iIndex, 1);
					}

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

			return;
		}
	};

	// --------------------------- End ------------------------------------

	/**
	 * Get token instance for a specific item
	 *
	 * @param {sap.ui.core.Item} oItem The item in question
	 * @returns {sap.m.Token | null} Token instance, null if not found
	 * @private
	 */
	MultiComboBox.prototype._getTokenByItem = function(oItem) {
		return oItem ? oItem.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "Token") : null;
	};


	MultiComboBox.prototype.updateItems = function (sReason) {
		var bKeyItemSync, aItems,
			// Get selected keys should be requested at that point as it
			// depends on getSelectedItems()- calls it internally
			aKeys = this.getSelectedKeys();

		var oUpdateItems = ComboBoxBase.prototype.updateItems.apply(this, arguments);

		// It's important to request the selected items after the update,
		// because the sync breaks there.
		aItems = this.getSelectedItems();

		// Check if selected keys and selected items are in sync
		bKeyItemSync = (aItems.length === aKeys.length) && aItems.every(function (oItem) {
				return oItem && oItem.getKey && aKeys.indexOf(oItem.getKey()) > -1;
			});

		// Synchronize if sync has been broken by the update
		if (!bKeyItemSync) {
			aItems = aKeys.map(this.getItemByKey, this);
			this.setSelectedItems(aItems);
		}

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
			if (this.getListItem(aItems[i]).isSelected()) {
				aSelectedItems.push(aItems[i]);
			}
		}

		return aSelectedItems;
	};

	/**
	 * Get the last selected item
	 * @returns {sap.ui.core.Item} The selected item
	 * @private
	 */
	MultiComboBox.prototype._getLastSelectedItem = function() {
		var aTokens = this._oTokenizer.getTokens();
		var oToken = aTokens.length ? aTokens[aTokens.length - 1] : null;

		if (!oToken) {
			return null;
		}

		return this._getItemByToken(oToken);
	};

	/**
	 * Get the selected items ordered
	 * @returns {sap.ui.core.Item[]} The ordered list of selected items
	 * @private
	 */
	MultiComboBox.prototype._getOrderedSelectedItems = function() {
		var aItems = [];

		for (var i = 0, aTokens = this._oTokenizer.getTokens(), iLength = aTokens.length; i < iLength; i++) {
			aItems[i] = this._getItemByToken(aTokens[i]);
		}

		return aItems;
	};

	/**
	 * Get the focused item from list
	 * @returns {sap.ui.core.Item} The focused item in the list
	 * @private
	 */
	MultiComboBox.prototype._getFocusedListItem = function() {

		if (!document.activeElement) {
			return null;
		}

		var oFocusedElement = sap.ui.getCore().byId(document.activeElement.id);

		if (this.getList()
			&& containsOrEquals(this.getList().getFocusDomRef(), oFocusedElement.getFocusDomRef())) {
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
		var oListItem = this._getFocusedListItem();
		return this._getItemByListItem(oListItem);
	};

	/**
	 * Tests if an item is in a selected range
	 * @param {sap.ui.core.Item} oListItem The item
	 * @returns {boolean} True if the item is in the selected range
	 * @private
	 */
	MultiComboBox.prototype._isRangeSelectionSet = function(oListItem) {
		var $ListItem = oListItem.getDomRef();
		return $ListItem.indexOf(this.getRenderer().CSS_CLASS_MULTICOMBOBOX + "ItemRangeSelection") > -1 ? true : false;
	};

	/**
	 * Tests if there are tokens in the combo box
	 * @returns {boolean} True if there are tokens
	 * @private
	 */
	MultiComboBox.prototype._hasTokens = function() {
		return this._oTokenizer.getTokens().length > 0;
	};

	/**
	 * Gets the current item
	 * @returns {sap.ui.core.Item} The current item
	 * @private
	 */
	MultiComboBox.prototype._getCurrentItem = function() {

		if (!this._oCurrentItem) {
			return this._getFocusedItem();
		}

		return this._oCurrentItem;
	};

	/**
	 * Sets the current item
	 * @param {sap.ui.core.Item} oItem The item to be set
	 * @private
	 */
	MultiComboBox.prototype._setCurrentItem = function(oItem) {
		this._oCurrentItem = oItem;
	};

	/**
	 * Resets the current item
	 * @private
	 */
	MultiComboBox.prototype._resetCurrentItem = function() {
		this._oCurrentItem = null;
	};

	/**
	 * Decorate a ListItem instance by adding some delegate methods.
	 *
	 * @param {sap.m.StandardListItem} oListItem The item to be decorated
	 * @private
	 */
	MultiComboBox.prototype._decorateListItem = function(oListItem) {
		oListItem.addDelegate({
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
						this.getListItem(oItem).focus();
					}

					return;
				}
			},

			onkeydown: function(oEvent) {
				var oItem = null, oItemCurrent = null;

				if (oEvent.shiftKey && oEvent.which == KeyCodes.ARROW_DOWN) {
					oItemCurrent = this._getCurrentItem();
					oItem = this._getNextVisibleItemOf(oItemCurrent);
				}

				if (oEvent.shiftKey && oEvent.which == KeyCodes.ARROW_UP) {
					oItemCurrent = this._getCurrentItem();
					oItem = this._getPreviousVisibleItemOf(oItemCurrent);
				}

				if (oEvent.shiftKey && oEvent.which === KeyCodes.SPACE) {
					oItemCurrent = this._getCurrentItem();
					this._selectPreviousItemsOf(oItemCurrent);
				}

				if (oItem && oItem !== oItemCurrent) {

					if (this.getListItem(oItemCurrent).isSelected()) {
						this.setSelection({
							item: oItem,
							id: oItem.getId(),
							key: oItem.getKey(),
							fireChangeEvent: true,
							suppressInvalidate: true
						});
						this._setCurrentItem(oItem);
					} else {

						this.removeSelection({
							item: oItem,
							id: oItem.getId(),
							key: oItem.getKey(),
							fireChangeEvent: true,
							suppressInvalidate: true
						});
						this._setCurrentItem(oItem);
					}

					return;
				}

				this._resetCurrentItem();

				// Handle when CTRL + A is pressed to select all
				// Note: at first this function should be called and
				// not the
				// ListItemBase
				if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which == KeyCodes.A) {
					oEvent.setMarked();
					oEvent.preventDefault();

					var aVisibleItems = this.getSelectableItems();
					var aSelectedItems = this._getSelectedItemsOf(aVisibleItems);

					if (aSelectedItems.length !== aVisibleItems.length) {
						aVisibleItems.forEach(function(oItem) {
							this.setSelection({
								item: oItem,
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
								id: oItem.getId(),
								key: oItem.getKey(),
								fireChangeEvent: true,
								suppressInvalidate: true,
								listItemUpdated: false
							});
						}, this);
					}
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

				if (this.isOpen()) {
					this.close();
					return;
				}

				if (this.hasContent()) {
					this.open();
				}
			},

			onsaphide: function(oEvent) {

				// Handle when Alt + UP arrow are pressed.
				this.onsapshow(oEvent);
			},

			onsapenter: function(oEvent) {
				// Handle when enter is pressed.
				oEvent.setMarked();
				this.close();
			},

			onsaphome: function(oEvent) {

				// Handle when Pos1 is pressed.
				oEvent.setMarked();

				// note: prevent document scrolling when Home key is pressed
				oEvent.preventDefault();
				var aVisibleItems = this.getSelectableItems();
				var oItem = aVisibleItems[0];

				// Scrolls an item into the visual viewport
				this.getListItem(oItem).focus();
			},

			onsapend: function(oEvent) {

				// Handle when End is pressed.
				oEvent.setMarked();

				// note: prevent document scrolling when End key is pressed
				oEvent.preventDefault();
				var aVisibleItems = this.getSelectableItems();
				var oItem = aVisibleItems[aVisibleItems.length - 1];

				// Scrolls an item into the visual viewport
				this.getListItem(oItem).focus();
			},

			onsapup: function(oEvent) {

				// Handle when key UP is pressed.
				oEvent.setMarked();

				// note: prevent document scrolling when arrow keys are pressed
				oEvent.preventDefault();

				var aVisibleItems = this.getSelectableItems();
				var oItemFirst = aVisibleItems[0];
				var oItemCurrent = jQuery(document.activeElement).control()[0];

				if (oItemCurrent === this.getListItem(oItemFirst)) {
					this.focus();

					// Stop the propagation of event. Otherwise the list item sets
					// the focus and
					// it is not possible to come up from list box to input field.
					oEvent.stopPropagation(true);
				}
			},

			onfocusin: function(oEvent) {
				this.addStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX + "Focused");
			},

			onfocusout: function(oEvent) {
				this.removeStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX + "Focused");
			},

			onsapfocusleave: function(oEvent) {
				var oPopup = this.getAggregation("picker");
				var oControl = sap.ui.getCore().byId(oEvent.relatedControlId);

				if (oPopup && oControl && deepEqual(oPopup.getFocusDomRef(), oControl.getFocusDomRef())) {

					// force the focus to stay in the list item field when
					// scrollbar is moving
					if (oEvent.srcControl) {
						oEvent.srcControl.focus();
					}
				}
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
	MultiComboBox.prototype._handleInputFocusOut = function () {
		var oInput = this.isPickerDialog() ? this.getPickerTextField() : this,
		sUpdateValue = this._sOldInput || this._sOldValue || "";

		oInput.updateDomValue(sUpdateValue);
	};

	MultiComboBox.prototype.onItemChange = function (oControlEvent) {
		var oValue = ComboBoxBase.prototype.onItemChange.apply(this, arguments);
		this._forwardItemInfoToToken(oControlEvent);

		return oValue;
	};

	MultiComboBox.prototype._forwardItemInfoToToken = function (oControlEvent) {
		var oItem = oControlEvent.getSource(),
			oPropertyInfo = oControlEvent.getParameters(),
			oToken = this._getTokenByItem(oItem);

		if (oPropertyInfo.name === "enabled" && oToken) {
			oToken.setVisible(oPropertyInfo.newValue);
		}
	};

	/**
	 * Handler for the press event on the N-more label
	 *
	 * @private
	 */
	MultiComboBox.prototype._handleIndicatorPress = function(oEvent) {
		this._filterSelectedItems(oEvent, true);
		this.focus();

		if (this.getEditable()) {
			this.getPicker().open();
		} else {
			this._getReadOnlyPopover().openBy(this._oTokenizer._oIndicator);
		}

		if (this.isPickerDialog()) {
			this._getFilterSelectedButton().setPressed(true);
			this.bOpenedByKeyboardOrButton = true;
		} else {
			setTimeout(this._oTokenizer["scrollToEnd"].bind(this._oTokenizer), 0);
		}
	};

	/**
	 * Create an instance type of <code>sap.m.Tokenizer</code>.
	 *
	 * @returns {sap.m.Tokenizer} The tokenizer instance
	 * @private
	 */
	MultiComboBox.prototype._createTokenizer = function() {
		var oTokenizer = new sap.m.Tokenizer({
			tokens: []
		}).attachTokenChange(this._handleTokenChange, this);
		oTokenizer._setAdjustable(true);

		oTokenizer._handleNMoreIndicatorPress(this._handleIndicatorPress.bind(this));

		// Set parent of Tokenizer, otherwise the Tokenizer renderer is not called.
		// Control.prototype.invalidate -> this.getUIArea() is null
		oTokenizer.setParent(this);

		oTokenizer.addEventDelegate({
			onAfterRendering: this._onAfterRenderingTokenizer,
			onfocusin: function (oEvent) {

				// if a token is selected, the tokenizer should not scroll
				if (this.getEditable() && jQuery(oEvent.target).hasClass("sapMToken")) {
					oTokenizer._useCollapsedMode(false);
				}
			}
		}, this);

		return oTokenizer;
	};

	/**
	 * @private
	 */
	MultiComboBox.prototype._onAfterRenderingTokenizer = function() {
		setTimeout(this._syncInputWidth.bind(this, this._oTokenizer), 0);
		setTimeout(this._oTokenizer["scrollToEnd"].bind(this._oTokenizer), 0);
	};

	MultiComboBox.prototype._handleTokenChange = function(oEvent) {
		var sType = oEvent.getParameter("type");
		var oToken = oEvent.getParameter("token");
		var oItem = null;

		if (sType !== sap.m.Tokenizer.TokenChangeType.Removed && sType !== sap.m.Tokenizer.TokenChangeType.Added) {
			return;
		}

		if (sType === sap.m.Tokenizer.TokenChangeType.Removed) {

			oItem = (oToken && this._getItemByToken(oToken));

			if (oItem && this.isItemSelected(oItem)) {

				this.removeSelection({
					item: oItem,
					id: oItem.getId(),
					key: oItem.getKey(),
					tokenUpdated: true,
					fireChangeEvent: true,
					fireFinishEvent: true, // Fire selectionFinish if token is deleted directly in input field
					suppressInvalidate: true
				});

				!this.isPickerDialog() && this.focus();
				this.fireChangeEvent("");
			}
		}
	};

	/**
	 * Required adaptations after rendering of List.
	 *
	 * @private
	 */
	MultiComboBox.prototype.onAfterRenderingList = function() {
		var oList = this.getList();

		if (this._iFocusedIndex != null && oList.getItems().length > this._iFocusedIndex) {
			oList.getItems()[this._iFocusedIndex].focus();
			this._iFocusedIndex = null;
		}
	};

	/**
	 * Collects information for dom refs of list items and passes them on to {@link sap.m.ComboBoxBase#highLightList}
	 *
	 * @param {string} sValue Currenly typed value of the input field
	 * @private
	 */
	MultiComboBox.prototype._highlightList = function (sValue) {
		var aListItemsDOM = [],
			aListItemAdditionalText = [],
			oItemAdditionalTextRef, oItemDomRef;

		this._oList.getItems().forEach(function(oItem) {
			oItemDomRef = oItem.getDomRef();

			if (oItemDomRef) {
				aListItemsDOM.push({
					ref: oItemDomRef.getElementsByClassName("sapMSLITitleOnly")[0],
					text: oItem.getTitle()
				});

				oItemAdditionalTextRef = oItemDomRef.querySelector(".sapMSLIInfo");

				if (oItemAdditionalTextRef && oItem.getInfo) {
					aListItemAdditionalText.push({
						ref: oItemAdditionalTextRef,
						text: oItem.getInfo()
					});
				}
			}
		});

		this.highLightList(sValue, aListItemsDOM);
		this.highLightList(sValue, aListItemAdditionalText);
	};

	/**
	 * As the ItemNavigation of the list is created onfocusin we need handle this and set some initial root focus dome ref
	 *
	 * @private
	 */
	MultiComboBox.prototype.onFocusinList = function() {
		if (this._bListItemNavigationInvalidated) {
			this.getList().getItemNavigation().setSelectedIndex(this._iInitialItemFocus);
			this._bListItemNavigationInvalidated = false;
		}
	};

	MultiComboBox.prototype.onAfterRendering = function() {
		ComboBoxBase.prototype.onAfterRendering.apply(this, arguments);
		this._oTokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		this._registerResizeHandler();
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

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		if (window.clipboardData) {

			// IE
			sOriginalText = window.clipboardData.getData("Text");
		} else {

			// Chrome, Firefox, Safari
			sOriginalText =  oEvent.originalEvent.clipboardData.getData('text/plain');
		}

		var aSeparatedText = this._oTokenizer._parseString(sOriginalText);

		if (aSeparatedText && aSeparatedText.length > 0) {
			this.getSelectableItems().forEach(function(oItem) {

				if (aSeparatedText.indexOf(oItem.getText()) > -1) {
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
	};

	/**
	 * Function is called on keyboard backspace, if cursor is in front of a token, token gets selected and deleted
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onsapbackspace = function(oEvent) {

		if (!this.getEnabled() || !this.getEditable()) {

			// Prevent the backspace key from navigating back
			oEvent.preventDefault();
			return;
		}

		// Deleting characters, not tokens
		if (this.getCursorPosition() > 0 || this.getValue().length > 0) {
			return;
		}

		sap.m.Tokenizer.prototype.onsapbackspace.apply(this._oTokenizer, arguments);

		// Prevent the backspace key from navigating back
		oEvent.preventDefault();
	};

	/**
	 * Function is called on delete keyboard input, deletes selected tokens
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onsapdelete = function(oEvent) {

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// do not return if everything is selected
		if (this.getValue() && !this._isCompleteTextSelected()) {
			return;
		}

		sap.m.Tokenizer.prototype.onsapdelete.apply(this._oTokenizer, arguments);
	};

	/**
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onsapnext = function(oEvent) {

		if (oEvent.isMarked()) {
			return;
		}

		// find focused element
		var oFocusedElement = jQuery(document.activeElement).control()[0];

		if (!oFocusedElement) {

			// we cannot rule out that the focused element does not correspond to an SAPUI5 control in which case oFocusedElement
			// is undefined
			return;
		}

		if (oFocusedElement === this._oTokenizer || this._oTokenizer.$().find(oFocusedElement.$()).length > 0
			&& this.getEditable()) {

			// focus is on the tokenizer or on some descendant of the tokenizer and the event was not handled ->
			// we therefore handle the event and focus the input element
			this.focus();
		}
	};

	/**
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiComboBox.prototype.onsapprevious = function(oEvent) {

		if (this.getCursorPosition() === 0 && !this._isCompleteTextSelected()) {

			if (oEvent.srcControl === this) {
				sap.m.Tokenizer.prototype.onsapprevious.apply(this._oTokenizer, arguments);
			}
		}
	};

	/**
	 * Handles the tap event on the control.
	 *
	 * @param {jQuery.Event} oEvent The event object.
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
			selectableItems = bInput ? this.getEnabledItems() : this.getSelectableItems(),
			fnFilter = this.fnFilter ? this.fnFilter : ComboBoxBase.DEFAULT_TEXT_FILTER;

		selectableItems.forEach(function(oItem) {

			if (fnFilter(sText, oItem, "getText")) {
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
			selectableItems = bInput ? this.getEnabledItems() : this.getSelectableItems();

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
	 * Functions returns true if the input's text is completely selected
	 *
	 * @private
	 * @return {boolean} true if text is selected, otherwise false,
	 */
	MultiComboBox.prototype._isCompleteTextSelected = function() {

		if (!this.getValue().length) {
			return false;
		}

		var oInput = this._$input[0];

		if (oInput.selectionStart !== 0 || oInput.selectionEnd !== this.getValue().length) {
			return false;
		}

		return true;
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
				var oListItem = this.getListItem(oPreviousItem);
				if (oListItem) {
					bIsSelected = this.getListItem(oPreviousItem).getSelected();
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
		var aItems = this.getSelectableItems();
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
		var aItems = this.getSelectableItems();
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
		var aItems = sValue ? this._getItemsStartingWithPerTerm(sValue) : [];
		var aSelectableItems = this._getUnselectedItems();

		if (aItems.indexOf(this._oTraversalItem) > -1 && this._oTraversalItem.getText() === this.getValue()) {
			return this._getNextUnselectedItemOf(this._oTraversalItem);
		}

		if (aItems.length && aItems[0].getText() === this.getValue()) {
			return this._getNextUnselectedItemOf(aItems[0]);
		}

		return aItems.length ? aItems[0] : aSelectableItems[0];
	};

	/**
	 * Gets previous visible Item corresponding to text in input field.
	 * @returns {sap.ui.core.Item} The previous visible item.
	 * @private
	 */
	MultiComboBox.prototype._getPreviousTraversalItem = function() {
		var sValue = this.getValue();
		var aItems = sValue ? this._getItemsStartingWithPerTerm(sValue) : [];

		if (aItems.indexOf(this._oTraversalItem) > -1 && this._oTraversalItem.getText() === this.getValue()) {
			return this._getPreviousUnselectedItemOf(this._oTraversalItem);
		}

		if (aItems.length && aItems[aItems.length - 1].getText() === this.getValue()) {
			return this._getPreviousUnselectedItemOf(aItems[aItems.length - 1]);
		}

		if (aItems.length) {
			return aItems[aItems.length - 1];
		} else {
			var aSelectableItems = this._getUnselectedItems();

			if (aSelectableItems.length > 0) {
				return aSelectableItems[aSelectableItems.length - 1];
			} else {
				return null;
			}
		}
	};

	/**
	 * Retrieves the first enabled item from the aggregation named <code>items</code>.
	 *
	 * @param {array} [aItems] The item aggregation
	 * @returns {sap.ui.core.Item | null} The first enabled item
	 */
	MultiComboBox.prototype.findFirstEnabledItem = function(aItems) {
		aItems = aItems || this.getItems();

		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getEnabled()) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Gets the visible items from the aggregation named <code>items</code>.
	 *
	 * @return {sap.ui.core.Item[]} The visible items in the aggregation
	 */
	MultiComboBox.prototype.getVisibleItems = function() {
		for (var i = 0, oListItem, aItems = this.getItems(), aVisibleItems = []; i < aItems.length; i++) {
			oListItem = this.getListItem(aItems[i]);

			if (oListItem && oListItem.getVisible()) {
				aVisibleItems.push(aItems[i]);
			}
		}

		return aVisibleItems;
	};

	/**
	 * Retrieves the last enabled item from the aggregation named <code>items</code>.
	 *
	 * @param {array} [aItems] The item aggregation
	 * @returns {sap.ui.core.Item | null} The last enabled item
	 */
	MultiComboBox.prototype.findLastEnabledItem = function(aItems) {
		aItems = aItems || this.getItems();
		return this.findFirstEnabledItem(aItems.reverse());
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
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
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
				oItem = sap.ui.getCore().byId(oItem);
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
	 * @param {sap.ui.core.Item} oItem The selected item to add; if empty, nothing is added.
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.addSelectedItem = function(oItem) {

		if (!oItem) {
			return this;
		}

		if (typeof oItem === "string") {
			oItem = sap.ui.getCore().byId(oItem);
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

	MultiComboBox.prototype.removeSelectedItem = function(oItem) {

		if (!oItem) {
			return null;
		}

		if (typeof oItem === "string") {
			oItem = sap.ui.getCore().byId(oItem);
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
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	MultiComboBox.prototype.removeSelectedKeys = function(aKeys) {
		var aItems = [], iIndex;

		if (!aKeys || !aKeys.length || !Array.isArray(aKeys)) {
			return aItems;
		}

		var oItem;
		aKeys.forEach(function(sKey) {
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

			if (this._aCustomerKeys.length && (iIndex = this._aCustomerKeys.indexOf(sKey)) > -1) {
				this._aCustomerKeys.splice(iIndex, 1);
			}
		}, this);
		return aItems;
	};

	MultiComboBox.prototype.setSelectedKeys = function(aKeys) {
		this.removeAllSelectedItems();
		this._aCustomerKeys = [];
		this.addSelectedKeys(aKeys);
		return this;
	};

	/**
	 * Adds selected items. Only items with valid keys are added as selected.
	 *
	 * @param {string[]} aKeys An array of item keys that identifies the items to be added as selected
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	MultiComboBox.prototype.addSelectedKeys = function(aKeys) {
		aKeys = this.validateProperty("selectedKeys", aKeys);

		aKeys.forEach(function(sKey) {
			var oItem = this.getItemByKey(sKey);

			if (oItem) {
				this.addSelectedItem(oItem);
			} else if (sKey != null) {

				// If at this point of time aggregation 'items' does not exist we
				// have save provided key.
				this._aCustomerKeys.push(sKey);
			}
		}, this);
		return this;
	};

	MultiComboBox.prototype.getSelectedKeys = function() {
		var aItems = this.getSelectedItems() || [], aKeys = [];
		aItems.forEach(function(oItem) {
			aKeys.push(oItem.getKey());
		}, this);

		if (this._aCustomerKeys.length) {
			aKeys = aKeys.concat(this._aCustomerKeys);
		}

		return aKeys;
	};

	/**
	 * Retrieves the unselected item objects from the association named <code>selectedItems</code>.
	 *
	 * @returns {sap.ui.core.Item[]} Array of sap.ui.core.Item instances. The current target of the <code>selectedItems</code> association.
	 * @private
	 * @since 1.26.0
	 */
	MultiComboBox.prototype._getUnselectedItems = function() {
		return jQuery(this.getSelectableItems()).not(this.getSelectedItems()).get();
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
			var oItem = sap.ui.getCore().byId(sItemId);

			if (oItem) {
				aItems.push(oItem);
			}
		}, this);
		return aItems;
	};

	/**
	 * Gets the selectable items from the aggregation named <code>items</code>.
	 *
	 * @returns {sap.ui.core.Item[]} An array containing the selectable items.
	 */
	MultiComboBox.prototype.getSelectableItems = function() {
		return this.getEnabledItems(this.getVisibleItems());
	};

	MultiComboBox.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	// ----------------------- Inheritance ---------------------

	MultiComboBox.prototype.setEditable = function(bEditable) {
		var oList = this.getList();
		ComboBoxBase.prototype.setEditable.apply(this, arguments);
		this._oTokenizer.setEditable(bEditable);

		if (bEditable) {
			oList.setMode(ListMode.MultiSelect);
			this.getPicker().addContent(oList);
		} else {
			oList.setMode(ListMode.None);
			this._getReadOnlyPopover().addContent(oList);
		}
		return this;
	};

	MultiComboBox.prototype.clearFilter = function() {
		this.getItems().forEach(function(oItem) {
			this.getListItem(oItem).setVisible(oItem.getEnabled() && this.getSelectable(oItem));
		}, this);
	};

	/**
	 * @returns {boolean} true if the list has at least one not visible item, false if all items in the list are visible.
	 * @private
	 */
	MultiComboBox.prototype._isListInSuggestMode = function() {
		return this.getList().getItems().some(function(oListItem) {
			return !oListItem.getVisible() && this._getItemByListItem(oListItem).getEnabled();
		}, this);
	};

	/**
	 * TODO: correction in ComboBoxBase regarding 'this.getSelectedItem()'
	 *
	 * Map an item type of sap.ui.core.Item to an item type of sap.m.StandardListItem.
	 *
	 * @param {sap.ui.core.Item} oItem The item to be matched
	 * @returns {sap.m.StandardListItem | null} The matched StandardListItem
	 * @private
	 */
	MultiComboBox.prototype._mapItemToListItem = function(oItem) {
		var oListItem, sListItem, sListItemSelected, sAdditionalText;
		var oRenderer = this.getRenderer();

		if (!oItem) {
			return null;
		}
		sAdditionalText = (oItem.getAdditionalText && this.getShowSecondaryValues()) ? oItem.getAdditionalText() : "";

		if (oItem.isA("sap.ui.core.SeparatorItem")) {
			oListItem = this._mapSeparatorItemToGroupHeader(oItem);
			oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "ListItem", oListItem);
			oListItem.addStyleClass(oRenderer.CSS_CLASS_MULTICOMBOBOX + "NonInteractiveItem");
			this._decorateListItem(oListItem);

			return oListItem;
		}

		sListItem = oRenderer.CSS_CLASS_MULTICOMBOBOX + "Item";
		sListItemSelected = (this.isItemSelected(oItem)) ? sListItem + "Selected" : "";

		oListItem = new sap.m.StandardListItem({
			type: ListType.Active,
			info: sAdditionalText,
			visible: oItem.getEnabled()
		}).addStyleClass(sListItem + " " + sListItemSelected);

		oListItem.setTooltip(oItem.getTooltip());

		oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "ListItem", oListItem);
		oListItem.setTitle(oItem.getText());

		if (sListItemSelected) {
			var oToken = new sap.m.Token({
				key: oItem.getKey()
			});
			oToken.setText(oItem.getText());
			oToken.setTooltip(oItem.getText());

			oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "Token", oToken);
			// TODO: Check this invalidation
			this._oTokenizer.addToken(oToken, true);
		}

		this.setSelectable(oItem, oItem.getEnabled());
		this._decorateListItem(oListItem);
		return oListItem;
	};

	/**
	 * Given an item type of sap.m.StandardListItem, find the corresponding item type of sap.ui.core.Item.
	 *
	 * @param {sap.m.StandardListItem} oListItem The item to search for
	 * @param {array} [aItems] The item array
	 * @returns {sap.ui.core.Item | null} The matching item
	 * @private
	 */
	MultiComboBox.prototype._findMappedItem = function(oListItem, aItems) {
		for (var i = 0, aItems = aItems || this.getItems(), aItemsLength = aItems.length; i < aItemsLength; i++) {
			if (this.getListItem(aItems[i]) === oListItem) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Set selectable property of sap.ui.core.Item
	 *
	 * @param {sap.ui.core.Item} oItem The item to set the property
	 * @param {boolean} bSelectable The selectable value
	 * @private
	 */
	MultiComboBox.prototype.setSelectable = function(oItem, bSelectable) {

		if (this.indexOfItem(oItem) < 0) {
			return;
		}

		oItem._bSelectable = bSelectable;
		var oListItem = this.getListItem(oItem);

		if (oListItem) {
			oListItem.setVisible(bSelectable);
		}

		var oToken = this._getTokenByItem(oItem);

		if (oToken) {
			oToken.setVisible(bSelectable);
		}
	};

	/**
	 * Get selectable property of sap.ui.core.Item
	 *
	 * @param {sap.ui.core.Item} oItem The item in question
	 * @returns {boolean} The selectable value
	 * @private
	 */
	MultiComboBox.prototype.getSelectable = function(oItem) {
		return oItem._bSelectable;
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
	MultiComboBox.prototype._fillList = function(aItems) {
		if (!aItems) {
			return null;
		}

		if (!this._oListItemEnterEventDelegate) {
			this._oListItemEnterEventDelegate = {
				onsapenter: function(oEvent) {
					// If ListItem is already selected,
					// prevent its de-selection, according to Keyboard Handling Specification.
					if (oEvent.srcControl.isSelected()) {
						oEvent.setMarked();
					}
				}
			};
		}

		for ( var i = 0, oListItem, aItemsLength = aItems.length; i < aItemsLength; i++) {
			// add a private property to the added item containing a reference
			// to the corresponding mapped item
			oListItem = this._mapItemToListItem(aItems[i]);

			// remove the previous event delegate
			oListItem.removeEventDelegate(this._oListItemEnterEventDelegate);

			// add the sap enter event delegate
			oListItem.addDelegate(this._oListItemEnterEventDelegate, true, this, true);

			// add the mapped item type of sap.m.StandardListItem to the list
			this.getList().addAggregation("items", oListItem, true);

			// add active state to the selected item
			if (this.isItemSelected(aItems[i])) {
				this.getList().setSelectedItem(oListItem, true);
			}
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
			bResetFilter = this._sOldInput && this._sOldInput.length > sValue.length,
			bValidInputValue = this.isValueValid(sValue),
			aItemsToCheck, oSelectedButton, aStartsWithItems;

		// "compositionstart" and "compositionend" are native events and don't have srcControl
		var oInput = oEvent.srcControl;

		if (!bValidInputValue && sValue !== "" && !bCompositionEvent) {
			this._handleFieldValidationState(oInput);
			return;
		}

		aStartsWithItems = this._getItemsStartingWith(sValue, true);

		!bCompositionEvent && this._handleTypeAhead(sValue, aStartsWithItems, oInput);

		aItemsToCheck = this.getEnabledItems();

		if (this.isPickerDialog()) {
			oSelectedButton = this._getFilterSelectedButton();
			if (oSelectedButton != null && oSelectedButton.getPressed()) {
				oSelectedButton.setPressed(false);
			}
		}

		if (bResetFilter) {
			aItemsToCheck = this.getItems();
		}

		this.filterItems({ value: sValue, items: aItemsToCheck });

		this._sOldInput = sValue;

		// First do manipulations on list items and then let the list render
		if ((!this.getValue() || !bValidInputValue) && !this.bOpenedByKeyboardOrButton && !this.isPickerDialog())  {
			this.close();
		} else {
			this.open();
		}
	};

	/**
	 * Determines if a given value matches an item
	 *
	 * @param {string} sValue The string value to be checked
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
		var aSelectedItems = this.getSelectedItems();
		var aItemsUnselected = aItems.filter(function (oItem) {
			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				return false;
			}

			return aSelectedItems.indexOf(oItem) === -1;
		});

		if (this._bDoTypeAhead && aItemsUnselected.length) {
			oInput.updateDomValue(aItemsUnselected[0].getText());

			if (document.activeElement === oInput.getFocusDomRef()) {
				oInput.selectText(sValue.length, oInput.getValue().length);
			}
		}
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
		}

		if (this._iOldCursorPos) {
			jQuery(oInput.getFocusDomRef()).cursorPos(this._iOldCursorPos);
		}

		this._showWrongValueVisualEffect();
	};

	MultiComboBox.prototype.init = function() {
		// initialize list
		this.createList();

		ComboBoxBase.prototype.init.apply(this, arguments);

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
		this._oTokenizer = this._createTokenizer();
		this._aCustomerKeys = [];
		this._aInitiallySelectedItems = [];
	};

	/**
	 * Clear the selection.
	 *
	 * @protected
	 */
	MultiComboBox.prototype.clearSelection = function() {
		this.removeAllSelectedItems();
	};

	MultiComboBox.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem);

		if (oItem) {
			oItem.attachEvent("_change", this.onItemChange, this);
		}

		if (this.getList()) {
			this.getList().addItem(this._mapItemToListItem(oItem));
		}

		return this;
	};

	/**
	 * Inserts an item into the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item} oItem The item to insert; if empty, nothing is inserted.
	 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
	 * a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
	 * greater than the current size of the aggregation, the item is inserted at
	 * the last position.
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.insertItem = function(oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, true);

		if (oItem) {
			oItem.attachEvent("_change", this.onItemChange, this);
		}

		if (this.getList()) {
			this.getList().insertItem(this._mapItemToListItem(oItem), iIndex);
		}

		return this;
	};

	/**
	 * Add an sap.ui.core.SeparatorItem item to the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item} oGroup Item of that group
	 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
	 * @returns {sap.m.GroupHeaderListItem} The group header
	 * @private
	 */
	MultiComboBox.prototype.addItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new SeparatorItem({
			text: oGroup.text || oGroup.key
		});

		this.addAggregation("items", oHeader, bSuppressInvalidate);
		return oHeader;
	};

	/**
	 * Map an item type of sap.ui.core.SeparatorItem to an item type of sap.m.GroupHeaderListItem.
	 *
	 * @param {sap.ui.core.SeparatorItem} oSeparatorItem The item to be matched
	 * @returns {sap.m.GroupHeaderListItem} The matched GroupHeaderListItem
	 * @private
	 */
	MultiComboBox.prototype._mapSeparatorItemToGroupHeader = function (oSeparatorItem) {
		return new GroupHeaderListItem({
			title: oSeparatorItem.getText()
		});
	};

	/**
	 * Gets the enabled items from the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item[]} [aItems=getItems()] Items to filter.
	 * @return {sap.ui.core.Item[]} An array containing the enabled items.
	 * @public
	 */
	MultiComboBox.prototype.getEnabledItems = function(aItems) {
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
	MultiComboBox.prototype.getItemByKey = function(sKey) {
		return this.findItem("key", sKey);
	};

	/**
	 * Removes an item from the aggregation named <code>items</code>.
	 *
	 * @param {int | string | sap.ui.core.Item} oItem The item to remove or its index or id.
	 * @returns {sap.ui.core.Item} The removed item or null.
	 * @public
	 */
	MultiComboBox.prototype.removeItem = function(oItem) {

		// remove the item from the aggregation items
		oItem = this.removeAggregation("items", oItem);

		// remove the corresponding mapped item from the List
		if (this.getList()) {
			this.getList().removeItem(oItem && this.getListItem(oItem));
		}

		// If the removed item is selected remove it also from 'selectedItems'.
		this.removeSelection({
			item: oItem,
			id: oItem ? oItem.getId() : "",
			key: oItem ? oItem.getKey() : "",
			fireChangeEvent: false,
			suppressInvalidate: true,
			listItemUpdated: true
		});

		return oItem;
	};

	MultiComboBox.prototype.isItemSelected = function(oItem) {
		return this.getSelectedItems().indexOf(oItem) > -1;
	};

	/**
	 * Retrieves an item by searching for the given property/value from the aggregation named <code>items</code>.<br>
	 * <b>Note:</b> If duplicate values exist, the first item matching the value is returned.
	 *
	 * @param {string} sProperty An item property.
	 * @param {string} sValue An item value that specifies the item to retrieve.
	 * @returns {sap.ui.core.Item | null} The matched item or null.
	 */
	MultiComboBox.prototype.findItem = function(sProperty, sValue) {
		var sMethod = "get" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

		for (var i = 0, aItems = this.getItems(); i < aItems.length; i++) {
			if (aItems[i][sMethod]() === sValue) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Destroy the tokens in the Tokenizer.
	 *
	 * @private
	 */
	MultiComboBox.prototype._clearTokenizer = function() {
		this._oTokenizer.destroyAggregation("tokens", true);
	};

	/**
	 * Getter for the control's List.
	 *
	 * @returns {sap.m.List} The list
	 * @private
	 */
	MultiComboBox.prototype.getList = function() {
		return this._oList;
	};

	MultiComboBox.prototype.exit = function() {
		ComboBoxBase.prototype.exit.apply(this, arguments);
		this._deregisterResizeHandler();

		if (this.getList()) {
			this.getList().destroy();
			this._oList = null;
		}

		if (this._oTokenizer) {
			this._oTokenizer.destroy();
			this._oTokenizer = null;
		}
	};

	/**
	 * Destroys all the items in the aggregation named <code>items</code>.
	 *
	 * @returns {sap.m.MultiComboBox} <code>this</code> to allow method chaining.
	 * @public
	 */
	MultiComboBox.prototype.destroyItems = function() {
		this.destroyAggregation("items");

		if (this.getList()) {
			this.getList().destroyItems();
		}

		this._oTokenizer.destroyTokens();
		return this;
	};

	/**
	 * Removes all the items in the aggregation named <code>items</code>.
	 *
	 * @returns {sap.ui.core.Item[]} An array of sap.ui.core.Item of the removed items (might be empty).
	 * @public
	 */
	MultiComboBox.prototype.removeAllItems = function() {
		var aItems = this.removeAllAggregation("items");
		this.removeAllSelectedItems();
		if (this.getList()) {
			this.getList().removeAllItems();
		}
		return aItems;
	};

	/**
	 * Get item corresponding to given list item.
	 *
	 * @param {sap.m.StandardListItem | null} oListItem The given list item
	 * @return {sap.ui.core.Item} The corresponding item
	 * @private
	 * @since 1.24.0
	 */
	MultiComboBox.prototype._getItemByListItem = function(oListItem) {
		return this._getItemBy(oListItem, "ListItem");
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
		return this._getItemBy(oToken, "Token");
	};

	/**
	 * Get item corresponding to given data object.
	 *
	 * @param {Object | null} oDataObject The given object
	 * @param {string} sDataName The data name
	 * @return {sap.ui.core.Item} The corresponding item
	 * @private
	 * @since 1.24.0
	 */
	MultiComboBox.prototype._getItemBy = function(oDataObject, sDataName) {
		sDataName = this.getRenderer().CSS_CLASS_COMBOBOXBASE + sDataName;

		for ( var i = 0, aItems = this.getItems(), iItemsLength = aItems.length; i < iItemsLength; i++) {
			if (aItems[i].data(sDataName) === oDataObject) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Getter for the control's ListItem.
	 *
	 * @param {sap.ui.core.Item} oItem The item
	 * @returns {sap.m.StandardListItem | null} The ListItem
	 * @private
	 * @since 1.24.0
	 */
	MultiComboBox.prototype.getListItem = function(oItem) {
		return oItem ? oItem.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "ListItem") : null;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	MultiComboBox.prototype.getAccessibilityInfo = function() {
		var sText = this.getSelectedItems().map(function(oItem) {
			return oItem.getText();
		}).join(" ");

		var oInfo = ComboBoxBase.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_MULTICOMBO");
		oInfo.description = ((oInfo.description || "") + " " + sText).trim();
		return oInfo;
	};

	/**
	 * Function calculates the available space for the tokenizer
	 *
	 * @private
	 * @return {String | null} CSSSize in px
	 */
	MultiComboBox.prototype._calculateSpaceForTokenizer = function () {
		if (this.getDomRef()) {
			var iControlWidth = this.getDomRef().offsetWidth,
				iSummedIconsWidth = this._calculateIconsSpace(),
				oInputRef = this.$().find(".sapMInputBaseInner"),
				aInputRelevantCss = ["min-width", "padding-right", "padding-left"],
				// calculate width of the input html element based on its min-width
				iInputWidth = aInputRelevantCss.reduce(function(iAcc, sProperty) {
					return iAcc + (parseInt(oInputRef.css(sProperty), 10) || 0);
				}, 0);

			return iControlWidth - (iSummedIconsWidth + iInputWidth) + "px";
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
			iSummedIconsWidth, iTokenizerWidth;

		if (!oFocusDomRef || (oTokenizer && !oTokenizer.getDomRef())) {
			return;
		}

		iSummedIconsWidth = this._calculateIconsSpace();
		iTokenizerWidth = Math.ceil(oTokenizer.getDomRef().getBoundingClientRect().width);
		oFocusDomRef.style.width = 'calc(100% - ' + Math.floor(iSummedIconsWidth + iTokenizerWidth) + "px";
	};

	return MultiComboBox;

	});