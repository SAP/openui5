/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/EventProvider',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ValueStateSupport',
	'sap/m/library',
	'sap/ui/core/library',
	'sap/m/List',
	"sap/m/inputUtils/scrollToItem",
	"sap/m/inputUtils/SuggestionsPopoverDialogMixin",
	"sap/m/inputUtils/SuggestionsPopoverPopoverMixin"
], function (
	Device,
	EventProvider,
	InvisibleText,
	ValueStateSupport,
	library,
	coreLibrary,
	List,
	scrollToItem,
	SuggestionsPopoverDialogMixin,
	SuggestionsPopoverPopoverMixin
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = library.ListSeparators;

	var CSS_CLASS_SUGGESTIONS_POPOVER = "sapMSuggestionsPopover",
		CSS_CLASS_NO_CONTENT_PADDING = "sapUiNoContentPadding";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Provides a popover that should be used with an input control which requires suggestions.
	 *
	 * @extends sap.ui.base.EventProvider
	 *
	 * @param {sap.ui.core.Control} oControl The input control that instantiates this suggestions popover
	 * @constructor
	 * @private
	 * @alias sap.m.SuggestionsPopover
	 *
	 * @author SAP SE
	 * @version ${version}
	 */
	var SuggestionsPopover = EventProvider.extend("sap.m.SuggestionsPopover", /** @lends sap.m.SuggestionsPopover.prototype */ {

		constructor: function () {
			EventProvider.apply(this, arguments);

			// specifies the width of the suggestion list
			this._sPopoverContentWidth = null;

			this._sOldValueState = ValueState.None;

			// Apply Mixin depending on the Device
			if (Device.system.phone) {
				SuggestionsPopoverDialogMixin.apply(SuggestionsPopover.prototype);
			} else {
				SuggestionsPopoverPopoverMixin.apply(SuggestionsPopover.prototype);
			}

		},

		destroy: function () {
			this._destroySuggestionPopup();
		}
	});

	/**
	 * Map of event names and ids, that are provided by this class.
	 *
	 * @private
	 * @static
	 */
	SuggestionsPopover.M_EVENTS = {
		SELECTION_CHANGE : "selectionChange"
	};

	/**
	 * Checks if the suggestions popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @public
	 */
	SuggestionsPopover.prototype.isOpen = function () {
		var oPopover = this.getPopover();
		return oPopover && oPopover.isOpen();
	};

	SuggestionsPopover.prototype.setPopover = function (oPopoverOrDialog) {
		this._oPopover = oPopoverOrDialog;
	};

	SuggestionsPopover.prototype.getPopover = function () {
		return this._oPopover;
	};

	SuggestionsPopover.prototype.destroyPopover = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		this._oPopover = null;
	};

	/**
	 * Sets a function, that returns the labels associated with the parent input.
	 *
	 * @public
	 */
	SuggestionsPopover.prototype.setInputLabels = function (fnGetLabels) {
		this._fnInputLabels = fnGetLabels;
	};

	/**
	 * Helper function that creates suggestion popup.
	 *
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param mOptions {object} Settings for the Popover
	 * @public
	 */
	SuggestionsPopover.prototype.createSuggestionPopup = function (oParent, mOptions, InputClass) {
		var oPopover,
			oList = this.getItemsContainer();

		mOptions = mOptions || [];
		oPopover = this.createPopover(oParent, mOptions, InputClass);

		this.setPopover(oPopover);
		oPopover.addStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER);
		oPopover.addStyleClass(CSS_CLASS_NO_CONTENT_PADDING);
		oPopover.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"));

		if (oList) {
			this.addContent(oList);
		}
	};

	/**
	 * Helper function that creates  (List/Table) for the suggestion popup.
	 *
	 * @param {string} sParentId The input control that instantiates this suggestions popover
	 * @param {sap.ui.core.Control} oContent Typically a List or a Table which would be Popover's content
	 * @public
	 */
	SuggestionsPopover.prototype.initContent = function (sParentId, oContent) {
		var oList = oContent,
			oPopover = this.getPopover();

		if (!oPopover) {
			return;
		}

		if (!oList) {
			oList = new List(sParentId + "-popup-list", {
				showNoData : false,
				mode : ListMode.SingleSelectMaster,
				rememberSelections : false,
				width: "100%",
				showSeparators: ListSeparators.None,
				busyIndicatorDelay: 0
			});
		}

		this.addContent(oList);
	};

	/**
	 * Helper function that destroys suggestion popup.
	 */
	SuggestionsPopover.prototype._destroySuggestionPopup = function () {
		this.destroyPopover();

		this._oValueStateHeader = null; // The value state header is destroyed by the Popover
	};

	/**
	 * Adds flex content.
	 *
	 * @param {sap.ui.core.Control} oControl Control to be added
	 * @protected
	 */
	SuggestionsPopover.prototype.addContent = function(oControl) {
		this.getPopover().addContent(oControl);
	};

	/**
	 * Gets Popover's List or Table.
	 *
	 * @return {sap.m.List | sap.m.Table | null}
	 * @public
	 */
	SuggestionsPopover.prototype.getItemsContainer = function () {
		var oPopover = this.getPopover(),
			aContent = oPopover && oPopover.getContent();

		return aContent && aContent.filter(function (oControl) {
			return (oControl.isA("sap.m.List") && oControl.getId().indexOf("-popup-list") > -1)
				|| oControl.isA("sap.m.Table");
		})[0];
	};


	/* =================== List Navigation =================== */

	/**
	 * Handles the navigation inside the list.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param {jQuery.Event} oEvent Arrow key event.
	 */
	SuggestionsPopover.prototype.handleListNavigation = function(oParent, oEvent) {
		var	oPopover = this.getPopover();

		if (oEvent.isMarked()) {
			return;
		}

		if (!oParent.getEnabled() || !oParent.getEditable()) {
			return;
		}

		if (!oPopover || !oPopover.isOpen()) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		var oList = this.getItemsContainer(),
			oValueStateHeader = this._getValueStateHeader(),
			bHasValueStateHeader = oValueStateHeader && oValueStateHeader.getVisible(),
			bFocusInInput = oParent.hasStyleClass("sapMFocus"),
			aSelectableItems = oList && oList.getItems().filter(function (oItem) {
				return oItem.getVisible && oItem.getVisible();
			}),
			iSelectedItemIndex = aSelectableItems.indexOf(this.getFocusedListItem()),
			oNewItem;

		switch (oEvent.type) {
			case "sapdown":
				oNewItem = this.handleArrowDown(aSelectableItems, iSelectedItemIndex, bFocusInInput, bHasValueStateHeader);
				break;
			case "sapup":
				oNewItem = this.handleArrowUp(aSelectableItems, iSelectedItemIndex, bFocusInInput, bHasValueStateHeader);
				break;
			case "sapend":
				oNewItem = this.handleEnd(aSelectableItems, bHasValueStateHeader);
				break;
			case "saphome":
				oNewItem = this.handleHome(aSelectableItems, bHasValueStateHeader);
				break;
			case "sappagedown":
				oNewItem = this.handlePageDown(aSelectableItems, iSelectedItemIndex, bHasValueStateHeader);
				break;
			case "sappageup":
				oNewItem = this.handlePageUp(aSelectableItems, iSelectedItemIndex, bHasValueStateHeader);
				break;
		}

		this.updateFocus(oParent, oNewItem);

		// The ComboBox updates the selected item and key, while navigating
		if (oParent.handleSelectionFromList) {
			oParent.handleSelectionFromList(oNewItem);
		} else {
			this.handleSelectionFromList(oNewItem);
		}

		this.updateAriaActiveDescendant(oParent, oNewItem);

		if (Device.system.desktop && oNewItem) {
			scrollToItem(oNewItem, this.getPopover());
		}
	};

	/**
	 * Handles the list navigation on <code>onsapdown</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleArrowDown = function(aSelectableItems, iSelectedItemIndex, bFocusInInput, bHasValueStateHeader) {
		// if the focus is on the input and there is no VSH available, return the first selectable item
		if (bFocusInInput && !bHasValueStateHeader) {
			return aSelectableItems[0];
		}

		// if the focus is on the list, return the next item
		if (!bFocusInInput && !this.getValueStateActiveState()) {
			// if the focus is on the last item, it should remain there
			if (iSelectedItemIndex === aSelectableItems.length - 1) {
				return aSelectableItems[iSelectedItemIndex];
			}
			return aSelectableItems[iSelectedItemIndex + 1];
		}

		// if the focus is on the value state header, return the first selectable item
		// otherwise focus on the value state header
		if (this.getValueStateActiveState()) {
			this.setValueStateActiveState(false);
			return aSelectableItems[0];
		} else {
			this.setValueStateActiveState(true);
		}
	};

	/**
	 * Handles the list navigation on <code>onsapup</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleArrowUp = function(aSelectableItems, iSelectedItemIndex, bFocusInInput, bHasValueStateHeader) {
		// if the focus is on the input field, do nothing
		if (bFocusInInput) {
			return;
		}

		// if the selected item is not the first one, return the previous item
		if (iSelectedItemIndex > 0) {
			return aSelectableItems[iSelectedItemIndex - 1];
		}

		// if we have a value state header and the above cases are not fullfiled, the VSH state should be toggled since:
		// - we are on the first item in the list - the focus should go to the VSH
		// - the focus is currently on the VSH - the focus should go to the input field
		if (bHasValueStateHeader) {
			this.setValueStateActiveState(!this.getValueStateActiveState());
		}
	};

	/**
	 * Handles the list navigation on <code>onsapend</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleEnd = function(aSelectableItems, bHasValueStateHeader) {
		// if the focus is on the VSH, we should remove the active state
		if (bHasValueStateHeader) {
			this.setValueStateActiveState(false);
		}

		return aSelectableItems.length && aSelectableItems[aSelectableItems.length - 1];
	};

	/**
	 * Handles the list navigation on <code>onsaphome</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleHome = function(aSelectableItems, bHasValueStateHeader) {
		// if a VSH is present, Home key should move the focus to it
		if (bHasValueStateHeader) {
			this.setValueStateActiveState(true);
			return;
		}

		// if no VSH is present, Home key should move the focus to the first item in the list
		return aSelectableItems.length && aSelectableItems[0];
	};

	/**
	 * Handles the list navigation on <code>onsappagedown</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handlePageDown = function(aSelectableItems, iSelectedItemIndex, bHasValueStateHeader) {
		// if the focus is on the VSH, we should remove the active state
		if (bHasValueStateHeader) {
			this.setValueStateActiveState(false);
		}

		return aSelectableItems[Math.min(aSelectableItems.length - 1, iSelectedItemIndex + 10)];
	};

	/**
	 * Handles the list navigation on <code>onsappageup</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handlePageUp = function(aSelectableItems, iSelectedItemIndex, bHasValueStateHeader) {
		// if there is an item one page up, return the item
		if (iSelectedItemIndex - 10 >= 0) {
			return aSelectableItems[iSelectedItemIndex - 10];
		}

		// if there isn't an item one page up and a VSH is present,
		// Page Up should focus the VSH
		if (bHasValueStateHeader) {
			this.setValueStateActiveState(true);
			return;
		}

		// if a VSH is not present, always focus on the first item in the list
		return aSelectableItems[0];
	};

	/**
	 * Updates the pseudo focused element.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param {sap.m.GroupHeaderListItem | sap.m.StandardListItem} oItem The list item to be focused
	 */
	SuggestionsPopover.prototype.updateFocus = function(oParent, oItem) {
		var oList = this.getItemsContainer(),
			oPreviousFocusedItem = this.getFocusedListItem(),
			oValueStateHeader = this._getValueStateHeader(),
			bHasValueStateHeader = oValueStateHeader && oValueStateHeader.getVisible();

		// remove focus from everywhere
		oList && oList.removeStyleClass("sapMListFocus");
		oPreviousFocusedItem && oPreviousFocusedItem.removeStyleClass("sapMLIBFocused");
		oParent.hasStyleClass("sapMFocus") && oParent.removeStyleClass("sapMFocus");
		bHasValueStateHeader && oValueStateHeader.removeStyleClass("sapMPseudoFocus");

		// add it only where necessary
		if (oItem) {
			oItem.addStyleClass("sapMLIBFocused");
			oList.addStyleClass("sapMListFocus");
			this.updateListDataAttributes(oList);
		} else if (this.getValueStateActiveState()) {
			oValueStateHeader.addStyleClass("sapMPseudoFocus");
		} else {
			oParent.addStyleClass("sapMFocus");
		}
	};

	/**
	 * Updates the data-sap-ui-* attributes of the list items.
	 *
	 * @private
	 * @param {sap.m.List} oList The suggestions list.
	 */
	SuggestionsPopover.prototype.updateListDataAttributes = function (oList) {
		if (!oList) {
			return;
		}

		var aVisibleItems = oList.getVisibleItems();

		if (!aVisibleItems) {
			return;
		}

		aVisibleItems.forEach(function (oItem) {
			var oItemDomRef = oItem.getDomRef();

			if (oItemDomRef && oItemDomRef.hasAttribute("data-sap-ui-first-suggestion-item")) {
				oItemDomRef.removeAttribute("data-sap-ui-first-suggestion-item");
			}

			if (oItemDomRef && oItemDomRef.hasAttribute("data-sap-ui-last-suggestion-item")) {
				oItemDomRef.removeAttribute("data-sap-ui-last-suggestion-item");
			}
		});

		if (aVisibleItems[0]) {
			var oFirstVisibleItemDomRef = aVisibleItems[0].getDomRef();

			oFirstVisibleItemDomRef && oFirstVisibleItemDomRef.setAttribute("data-sap-ui-first-suggestion-item", "");
		}

		if (aVisibleItems[aVisibleItems.length - 1]) {
			var oLastVisibleItemDomRef = aVisibleItems[aVisibleItems.length - 1].getDomRef();

			oLastVisibleItemDomRef && oLastVisibleItemDomRef.setAttribute("data-sap-ui-last-suggestion-item", "");
		}
	};

	/**
	 * Handles the navigation inside the list.
	 *
	 * @private
	 * @param {sap.m.GroupHeaderListItem | sap.m.StandardListItem | sap.m.ColumnListItem} oItem The item to be selected.
	 */
	SuggestionsPopover.prototype.handleSelectionFromList = function(oItem) {
		var oList = this.getItemsContainer(),
			oPreviousFocusedItem = this.getFocusedListItem(),
			bItemGroupHeader = oItem && oItem.isA("sap.m.GroupHeaderListItem");

		if (!oItem || bItemGroupHeader) {
			oList.removeSelections(true);
		} else {
			oList.setSelectedItem(oItem, true);
		}

		this.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: oPreviousFocusedItem,
			newItem: oItem
		});
	};

	/**
	 * Updates the aria-activedescendant, depending on the selected item
	 *
	 * @private
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param {sap.m.GroupHeaderListItem | sap.m.StandardListItem | sap.m.ColumnListItem} oItem The selected item
	 */
	SuggestionsPopover.prototype.updateAriaActiveDescendant = function (oParent, oItem) {
		var	oInputDomRef = oParent.getFocusDomRef(),
			oValueStateHeader = this._getValueStateHeader(),
			oFormattedText = oValueStateHeader && oValueStateHeader.getFormattedText(),
			sValueStateId;

		if (oParent.hasStyleClass("sapMFocus")) {
			oInputDomRef.removeAttribute("aria-activedescendant");
			return;
		}

		if (oItem) {
			oInputDomRef.setAttribute("aria-activedescendant", oItem.getId());
			return;
		}

		if (this.getValueStateActiveState()) {
			sValueStateId = oFormattedText ? oFormattedText.getId() : oValueStateHeader.getId();
			oInputDomRef.setAttribute("aria-activedescendant", sValueStateId);
		}
	};

	/**
	 * Gets the currently focused list item, if any.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.getFocusedListItem = function () {
		var oList = this.getItemsContainer(),
			aListItems = oList && oList.getItems() || [];

		for (var i = 0; i < aListItems.length; i++) {
			if (aListItems[i].hasStyleClass("sapMLIBFocused")) {
				return aListItems[i];
			}
		}
	};


	/* =================== Value State Header =================== */

	/**
	 * Sets the Value State Header active state.
	 *
	 * @public
	 */
	SuggestionsPopover.prototype.setValueStateActiveState = function(bActive) {
		this.bMessageValueStateActive = bActive;
	};

	/**
	 * Returns the Value State Header active state.
	 *
	 * @public
	 */
	SuggestionsPopover.prototype.getValueStateActiveState = function() {
		return this.bMessageValueStateActive;
	};

	/**
	 *
	 * Updates the value state displayed in the popover.
	 *
	 * @param {string} sValueState Value state of the control
	 * @param {(string|object)} vValueStateText Value state message text of the control.
	 * @param {boolean} bShowValueStateMessage Whether or not a value state message should be displayed.
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.updateValueState = function(sValueState, vValueStateText, bShowValueStateMessage) {
		var bShow = bShowValueStateMessage && sValueState !== ValueState.None;
		vValueStateText = vValueStateText || ValueStateSupport.getAdditionalText(sValueState);
		if (!this.getPopover()) {
			return this;
		}

		if (this.getInput()) {
			this.getInput().setValueState(sValueState);
		}

		var oValueStateHeader = this._getValueStateHeader();

		oValueStateHeader.setValueState(sValueState);

		// Set the value state text
		if (oValueStateHeader && typeof vValueStateText === "string") {
			oValueStateHeader.setText(vValueStateText);
		} else if (oValueStateHeader && typeof vValueStateText === "object") {
			oValueStateHeader.setFormattedText(vValueStateText);
		}

		// adjust ValueStateHeader visibility
		if (oValueStateHeader) {
			oValueStateHeader.setVisible(bShow);
		}

		this._alignValueStateStyles(sValueState);

		return this;
	};

	/**
	 * Handles value state link navigation
	 *
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	SuggestionsPopover.prototype._handleValueStateLinkNav = function(oParent, oEvent) {
		if (!this.getValueStateActiveState() || (this.getValueStateActiveState() && document.activeElement.tagName === "A")) {
			return;
		}

		var aValueStateLinks = this.getValueStateLinks(),
			oLastValueStateLink = aValueStateLinks[aValueStateLinks.length - 1];

		// Prevent from closing right away
		oEvent.preventDefault();

		// Move the real focus on the first link and remove the pseudo one from the
		// Formatted Text value state header
		aValueStateLinks[0].focus();
		this._getValueStateHeader().removeStyleClass("sapMPseudoFocus");

		aValueStateLinks.forEach(function(oLink) {
			oLink.addDelegate({
				onsapup: function(oEvent) {
					oParent.getFocusDomRef().focus();
					this.handleListNavigation(oParent, oEvent);
				},
				onsapdown: function(oEvent) {
					oParent.getFocusDomRef().focus();
					this.handleListNavigation(oParent, oEvent);
				}
			}, this);
		}, this);

		// If saptabnext is fired on the last link of the value state - close the control
		oLastValueStateLink.addDelegate({
			onsaptabnext: function(oEvent) {
				this.setValueStateActiveState(false);
				oParent.onsapfocusleave(oEvent);
				this.getPopover().close();

				/* By default the value state message popup is opened when the suggestion popover
				is closed. We don't want that in this case because the focus will move on to the next object.
				The popup must be closed with setTimeout() because it is opened with one. */
				setTimeout(function() {
					oParent.closeValueStateMessage();
				}, 0);
			}
		}, this);
		// If saptabprevious is fired on the first link move real focus on the input and the visual one back to the value state header
		aValueStateLinks[0].addDelegate({
			onsaptabprevious: function(oEvent) {
				oEvent.preventDefault();
				oParent.getFocusDomRef().focus();
				this._getValueStateHeader().addStyleClass("sapMPseudoFocus");
				oParent.removeStyleClass("sapMFocus");
			}
		}, this);
	};

	/**
	 * Helper method for keyboard navigation in suggestion items.
	 *
	 * @returns {array} Links in value state <code>sap.m.FormattedText</code> message.
	 * @private
	 */
	SuggestionsPopover.prototype.getValueStateLinks = function() {
		var oHeaderCache = this._getValueStateHeader(),
			oFormattedText = oHeaderCache && typeof oHeaderCache.getFormattedText === "function" && oHeaderCache.getFormattedText(),
			aLinks = oFormattedText && typeof oFormattedText.getControls === "function" && oFormattedText.getControls();

		return aLinks || [];
	};

	/**
	 * Aligns the value state styles
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._alignValueStateStyles = function(sValueState) {
		var sPickerWithState = CSS_CLASS_SUGGESTIONS_POPOVER + "ValueState",
			sOldCssClass = CSS_CLASS_SUGGESTIONS_POPOVER + this._sOldValueState + "State",
			sCssClass = CSS_CLASS_SUGGESTIONS_POPOVER + sValueState + "State",
			oPopover = this.getPopover();

		oPopover.addStyleClass(sPickerWithState);
		oPopover.removeStyleClass(sOldCssClass);
		oPopover.addStyleClass(sCssClass);

		this._sOldValueState = sValueState;
	};

	/**
	 * Decorates parent with necessary event delegates.
	 *
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @public
	 */
	SuggestionsPopover.prototype.decorateParent = function(oParent) {
		oParent.addEventDelegate({
			onsaptabnext: this._handleValueStateLinkNav.bind(this, oParent),
			onsaptabprevious: this._handleValueStateLinkNav.bind(this, oParent)
		}, this);
	};


	/**
	 * =================== Interfaces ===================
	 *
	 * These are the common interfaces between the Dialog and the Popover.
	 * Mixins should overwrite those methods if they need that functionality.
	 */

	/**
	 * Retrieves Popup's input
	 *
	 * @returns {sap.m.Input|null}
	 */
	SuggestionsPopover.prototype.getInput = function () {
		return null;
	};

	/**
	 * Returns a reference to the title inside the dialog
	 *
	 * @return {sap.m.Title} The title
	 * @public
	 */
	SuggestionsPopover.prototype.getPickerTitle = function () {
		return null;
	};

	/**
	 * Returns a reference to the OK button inside the dialog
	 *
	 * @return {sap.m.Button|null} The OK button
	 * @public
	 */
	SuggestionsPopover.prototype.getOkButton = function () {
		return null;
	};

	/**
	 * Returns a reference to the cancel button inside the dialog
	 *
	 * @return {sap.m.Button|null} The cancel button
	 * @public
	 */
	SuggestionsPopover.prototype.getCancelButton = function () {
		return null;
	};

	/**
	 * Returns a reference a button inside the dialog, associated with filtering actions in multi selection scenarios
	 *
	 * @return {sap.m.Button|null} The button
	 * @public
	 */
	SuggestionsPopover.prototype.getFilterSelectedButton = function () {
		return null;
	};

	SuggestionsPopover.prototype.setOkPressHandler = function () {
		return null;
	};

	SuggestionsPopover.prototype.setCancelPressHandler = function () {
		return null;
	};

	SuggestionsPopover.prototype.setShowSelectedPressHandler = function () {
		return null;
	};

	SuggestionsPopover.prototype.resizePopup = function () {
	};

	SuggestionsPopover.prototype._getValueStateHeader = function () {
		return null;
	};

	SuggestionsPopover.prototype._createValueStateHeader = function () {
		return null;
	};


	return SuggestionsPopover;
});
