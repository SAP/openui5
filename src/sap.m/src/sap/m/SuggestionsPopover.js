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

			this._sAreaDescribedById = null;

			this._bLinkDelegateInitialised = false;

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

		this._sAreaDescribedById = oParent.getValueStateLinksShortcutsId();
		if (oParent.getValueStateLinksForAcc().length > 0){
			oPopover.addAriaDescribedBy(this._sAreaDescribedById);
		}

		if (oList) {
			this.addContent(oList);
		}

		this.setValueStateLinksDelegateInitialized(false);
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

			oList.applyAriaRole("listbox");
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
	 * @param {boolean} bTypeAhead Indicates whether the autocomplete is switch on or not.
	 * @param {jQuery.Event} oEvent Arrow key event.
	 */
	SuggestionsPopover.prototype.handleListNavigation = function(oParent, oEvent, bTypeAhead) {
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
			bFocusInInput = oParent.hasStyleClass("sapMFocus"),
			aSelectableItems = oList && oList.getItems().filter(function (oItem) {
				return oItem.getVisible && oItem.getVisible();
			}),
			oNewItem;

		const iSelectedItemIndex = this.getSelectedListItemIndex();

		switch (oEvent.type) {
			case "sapdown":
				oNewItem = this.handleArrowDown(aSelectableItems, iSelectedItemIndex, bFocusInInput, bTypeAhead);
				break;
			case "sapup":
				oNewItem = this.handleArrowUp(aSelectableItems, iSelectedItemIndex, bFocusInInput);
				break;
			case "sapend":
				oNewItem = this.handleEnd(aSelectableItems);
				break;
			case "saphome":
				oNewItem = this.handleHome(aSelectableItems);
				break;
			case "sappagedown":
				oNewItem = this.handlePageDown(aSelectableItems, iSelectedItemIndex);
				break;
			case "sappageup":
				oNewItem = this.handlePageUp(aSelectableItems, iSelectedItemIndex);
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
	SuggestionsPopover.prototype.handleArrowDown = function (aSelectableItems, iSelectedItemIndex, bFocusInInput, bTypeAhead) {
		// if the focus is on the input and there is no VSH available, return the first selectable item
		if (bFocusInInput && !bTypeAhead) {
			return aSelectableItems[0];
		}

		// if the focus is on the list, return the next item
		if (!bFocusInInput && !bTypeAhead) {
			// if the focus is on the last item, it should remain there
			if (iSelectedItemIndex === aSelectableItems.length - 1) {
				return aSelectableItems[iSelectedItemIndex];
			}
			return aSelectableItems[iSelectedItemIndex + 1];
		}


		// if the focus is on the last item, it should remain there
		if (iSelectedItemIndex === aSelectableItems.length - 1 && bTypeAhead) {
			return aSelectableItems[iSelectedItemIndex];
		}
		// if the focus is on the list, return the next item
		return aSelectableItems[iSelectedItemIndex + 1];
	};

	/**
	 * Handles the list navigation on <code>onsapup</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleArrowUp = function (aSelectableItems, iSelectedItemIndex, bFocusInInput) {
		// if the focus is on the input field, do nothing
		if (bFocusInInput) {
			return;
		}

		// if the selected item is not the first one, return the previous item
		if (iSelectedItemIndex > 0) {
			return aSelectableItems[iSelectedItemIndex - 1];
		}
	};

	/**
	 * Handles the list navigation on <code>onsapend</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleEnd = function(aSelectableItems) {

		return aSelectableItems.length && aSelectableItems[aSelectableItems.length - 1];
	};

	/**
	 * Handles the list navigation on <code>onsaphome</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handleHome = function(aSelectableItems) {

		// if no VSH is present, Home key should move the focus to the first item in the list
		return aSelectableItems.length && aSelectableItems[0];
	};

	/**
	 * Handles the list navigation on <code>onsappagedown</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handlePageDown = function(aSelectableItems, iSelectedItemIndex) {

		return aSelectableItems[Math.min(aSelectableItems.length - 1, iSelectedItemIndex + 10)];
	};

	/**
	 * Handles the list navigation on <code>onsappageup</code>.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.handlePageUp = function(aSelectableItems, iSelectedItemIndex) {
		// if there is an item one page up, return the item
		if (iSelectedItemIndex - 10 >= 0) {
			return aSelectableItems[iSelectedItemIndex - 10];
		}

		// always focus on the first item in the list
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
			bHasTabularSuggestions = oParent._hasTabularSuggestions?.() ?? false;

		// remove focus from everywhere
		oList && oList.removeStyleClass("sapMListFocus");
		oPreviousFocusedItem && oPreviousFocusedItem.removeStyleClass("sapMLIBFocused");
		oParent.hasStyleClass("sapMFocus") && oParent.removeStyleClass("sapMFocus");

		// add it only where necessary
		if (oItem) {
			!bHasTabularSuggestions && oItem.addStyleClass("sapMLIBFocused");
			bHasTabularSuggestions && oList.setFakeFocus(oItem);
			oList.addStyleClass("sapMListFocus");
			this.updateListDataAttributes(oList);
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
		var	oInputDomRef = oParent.getFocusDomRef();

		if (oParent.hasStyleClass("sapMFocus")) {
			oInputDomRef.removeAttribute("aria-activedescendant");
			return;
		}

		if (oItem) {
			oInputDomRef.setAttribute("aria-activedescendant", oItem.getId());
			return;
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

	/**
	 * Gets the index of currently selected list item, if any, or the currently focused group header item
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.getSelectedListItemIndex = function () {
		const oList = this.getItemsContainer();
		const aListItems = oList && oList.getItems() || [];
		const aVisibleItems = aListItems.filter((item) => item.getVisible && item.getVisible());

		if (aListItems.filter((item) => item.getSelected()).length) {
			return aVisibleItems.findIndex((item) => item.getSelected());
		}

		return aVisibleItems.findIndex((groupItem) => groupItem.hasStyleClass("sapMLIBFocused"));
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
	 * Creates delegate object that will be attached to value state links in the value state header
	 * @param {*} oParent the input control that opens the suggestions popover
	 * @param {*} oValueStateHeader value state header of the suggestions popover
	 * @param {*} aValueStateLinks links in the formatted text of the value state header
	 * @returns Delegate object for the value state links
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.fnValueStateLinkDelegate = function(oParent, oValueStateHeader, aValueStateLinks) {
		return {
			onsapup: function(oEvent) {
				oParent.getFocusDomRef().focus();
				this.handleListNavigation(oParent, oEvent);
			},
			onsapdown: function(oEvent) {
				oParent.getFocusDomRef().focus();
				this.handleListNavigation(oParent, oEvent);
			},
			onfocusout: function(oEvent) {
				// Check if the element getting the focus is outside the value state header
				if (!oValueStateHeader.getDomRef().contains(oEvent.relatedTarget)) {
					aValueStateLinks.forEach(function(oLink) {
						oLink.getDomRef().setAttribute("tabindex", "-1");
					});
				}
				this.setValueStateActiveState(false);
			},
			onfocusin: function() {
				aValueStateLinks.forEach(function(oLink) {
					oLink.getDomRef().setAttribute("tabindex", "0");
				});
				this.setValueStateActiveState(true);
			}
		};
	};

	/**
	 *
	 * Updates the value state displayed in the popover.
	 *
	 * @param {string} sValueState Value state of the control
	 * @param {(string|object)} vValueStateText Value state message text of the control.
	 * @param {boolean} bShowValueStateMessage Whether or not a value state message should be displayed.
	 * @param {boolean} bUpdateValueStateLinkDelagate Whether or not the value state link delegate should be updated.
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @private
	 */
	SuggestionsPopover.prototype.updateValueState = function(sValueState, vValueStateText, bShowValueStateMessage, bUpdateValueStateLinkDelagate = false) {
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
			this.updateAriaDescribedBy();
		} else if (oValueStateHeader && typeof vValueStateText === "object") {
			oValueStateHeader.setFormattedText(vValueStateText);
			const aLinks = vValueStateText !== null ? oValueStateHeader.getFormattedText().getControls() : [];
			this.updateAriaDescribedBy(aLinks);
		}

		// adjust ValueStateHeader visibility
		if (oValueStateHeader) {
			oValueStateHeader.setValueState(bShowValueStateMessage ? sValueState : ValueState.None);
		}

		if (bUpdateValueStateLinkDelagate){
			this.setValueStateLinksDelegateInitialized(false);
		}

		this._alignValueStateStyles(sValueState);

		return this;
	};

	SuggestionsPopover.prototype.updateAriaDescribedBy = function (aControls) {
		if (!this.getPopover()) {
			return;
		}

		const aAriaDescribedBy = this.getPopover().getAriaDescribedBy();
		const aLinks = aControls || [];

		if (aAriaDescribedBy.some((id) => id === this._sAreaDescribedById) && aLinks.length === 0) {
			// remove aria-describedby if there are no value state links
			this.getPopover().removeAriaDescribedBy(this._sAreaDescribedById);
		} else if (!aAriaDescribedBy.some((id) => id === this._sAreaDescribedById) && aLinks.length > 0) {
			// add aria-describedby if there are value state links
			this.getPopover().addAriaDescribedBy(this._sAreaDescribedById);
		}
	};

	/**
	 * Handles value state link navigation
	 *
	 * @param {sap.ui.core.Control} oParent The input control that instantiates this suggestions popover
	 * @param {jQuery.Event} oEvent The event object
	 * @protected
	 */
	SuggestionsPopover.prototype._handleValueStateLinkNav = function(oParent, oEvent) {
		if (!this.getValueStateActiveState()
				|| (this.getValueStateActiveState() && document.activeElement.tagName === "A")
				|| this.getValueStateLinks().length === 0) {
			return;
		}

		var aValueStateLinks = this.getValueStateLinks(),
			oValueStateHeader = this._getValueStateHeader(),
			oLastValueStateLink = aValueStateLinks[aValueStateLinks.length - 1],
			oFirstValueStateLink = aValueStateLinks[0];

		// Prevent from closing right away
		oEvent.preventDefault();

		if (this.getFocusedListItem()) {
			this.getFocusedListItem().removeStyleClass("sapMLIBFocused");
		}

		// Move the real focus on the first link
		oFirstValueStateLink.focus();

		if (!this.getValueStateLinksDelegateInitialized()) {
			aValueStateLinks.forEach(function(oLink) {
				oLink.removeEventDelegate(this.fnValueStateLinkDelegate(oParent, oValueStateHeader, aValueStateLinks), this);
			}, this);

			aValueStateLinks.forEach(function(oLink) {
				oLink.addEventDelegate(this.fnValueStateLinkDelegate(oParent, oValueStateHeader, aValueStateLinks), this);
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
			oFirstValueStateLink.addDelegate({
				onsaptabprevious: function(oEvent) {
					oEvent.preventDefault();
					oParent.getFocusDomRef().focus();
					this.setValueStateActiveState(false);
					oParent.removeStyleClass("sapMFocus");
				}
			}, this);

			this.setValueStateLinksDelegateInitialized(true);
		}
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
	 * Gets the status of value state link delegates initialization
	 *
	 * @returns {boolean} Returns if value state links have attached delegates
	 * @protected
	 */
	SuggestionsPopover.prototype.getValueStateLinksDelegateInitialized = function() {
		return this._bLinkDelegateInitialised;
	};


	/**
	 * Sets whether value state link delegates should be attached or not
	 * @param {boolean} bValue The value to be set
	 * @protected
	 */
	SuggestionsPopover.prototype.setValueStateLinksDelegateInitialized = function(bValue) {
		this._bLinkDelegateInitialised = bValue;
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
