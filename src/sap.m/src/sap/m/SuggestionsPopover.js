/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/EventProvider',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ListItem',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/ValueStateSupport',
	'sap/m/library',
	'sap/ui/core/library',
	'sap/m/Bar',
	'sap/m/Toolbar',
	'sap/m/Button',
	'sap/m/ToggleButton',
	'sap/m/ColumnListItem',
	'sap/m/GroupHeaderListItem',
	'sap/ui/core/SeparatorItem',
	'sap/m/Dialog',
	'sap/m/DisplayListItem',
	'sap/m/List',
	'sap/m/Popover',
	'sap/m/StandardListItem',
	'sap/m/Table',
	'sap/m/Title',
	'sap/ui/core/IconPool',
	"sap/base/security/encodeXML",
	"sap/ui/events/KeyCodes",
	"sap/m/ValueStateHeader"
], function (
	Device,
	EventProvider,
	InvisibleText,
	ListItem,
	ResizeHandler,
	ValueStateSupport,
	library,
	coreLibrary,
	Bar,
	Toolbar,
	Button,
	ToggleButton,
	ColumnListItem,
	GroupHeaderListItem,
	SeparatorItem,
	Dialog,
	DisplayListItem,
	List,
	Popover,
	StandardListItem,
	Table,
	Title,
	IconPool,
	encodeXML,
	KeyCodes,
	ValueStateHeader
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

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

		constructor: function (oInput) {
			EventProvider.apply(this, arguments);

			// stores a reference to the input control that instantiates the popover
			this._oInput = oInput;

			this._bHasTabularSuggestions = false;

			// show suggestions in a dialog on phones
			this._bUseDialog = Device.system.phone;

			// stores the selected index inside the popover list or table
			this._iPopupListSelectedIndex = -1;

			// specifies the width of the suggestion list
			this._sPopoverContentWidth = null;

			// specifies whether the suggestions highlighting is enabled
			this._bEnableHighlighting = true;

			// is the input incremental type
			this._bIsInputIncrementalType = false;

			// specifies whether autocomplete is enabled
			this._bAutocompleteEnabled = false;

			// stores currently typed value
			this._sTypedInValue = '';

			this._sOldValueState = ValueState.None;

			// adds event delegate for the arrow keys
			this._oInput.addEventDelegate({
				onsapup: function(oEvent) {
					this._onsaparrowkey(oEvent, "up", 1);
				},
				onsapdown: function(oEvent) {
					this._onsaparrowkey(oEvent, "down", 1);
				},
				onsappageup: function(oEvent) {
					this._onsaparrowkey(oEvent, "up", 5);
				},
				onsappagedown: function(oEvent) {
					this._onsaparrowkey(oEvent, "down", 5);
				},
				onsaphome: function(oEvent) {
					if (this._oList) {
						this._onsaparrowkey(oEvent, "up", this._oList.getItems().length);
					}
				},
				onsapend: function(oEvent) {
					if (this._oList) {
						this._onsaparrowkey(oEvent, "down", this._oList.getItems().length);
					}
				},
				onsapright: this._onsapright
			}, this);
		},

		destroy: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}

			// CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
			if (this._oList) {
				this._oList.destroy();
				this._oList = null;
			}

			this._oProposedItem = null;
			this._oInputDelegate = null;
			this._oValueStateHeader = null; // The value state header is destroyed by the Popover

			if (this._oPickerValueStateText) {
				this._oPickerValueStateText.destroy();
				this._oPickerValueStateText = null;
			}
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
	 * Returns true if some word from the text starts with specific value.
	 *
	 * @private
	 * @param {string} sText The text of the word.
	 * @param {string} sValue The value which must be compared to the word.
	 * @returns {boolean} Indication if the word starts with the passed value.
	 */
	SuggestionsPopover._wordStartsWithValue = function (sText, sValue) {
		var index;

		if (!sText || !sValue ||
			typeof sText !== "string" || typeof sValue !== "string") {
			return false;
		}

		while (sText) {
			if (typeof sValue === "string" && sValue !== "" && sText.toLowerCase().indexOf(sValue.toLowerCase()) === 0 /* startsWith */) {
				return true;
			}

			index = sText.indexOf(' ');
			if (index === -1) {
				break;
			}

			sText = sText.substring(index + 1);
		}

		return false;
	};

	/**
	 * The default filter function for one and two-value. It checks whether the item text begins with the typed value.
	 *
	 * @private
	 * @param {string} sValue the current filter string.
	 * @param {sap.ui.core.Item} oItem the filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	SuggestionsPopover._DEFAULTFILTER = function(sValue, oItem) {

		if (oItem instanceof ListItem && SuggestionsPopover._wordStartsWithValue(oItem.getAdditionalText(), sValue)) {
			return true;
		}

		return SuggestionsPopover._wordStartsWithValue(oItem.getText(), sValue);
	};

	/**
	 * Checks if the suggestions popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @public
	 */
	SuggestionsPopover.prototype.isOpen = function () {
		return this._oPopover && this._oPopover.isOpen();
	};

	/**
	 * Sets a function, which return the labels associated with the parent input
	 *
	 * @public
	 */
	SuggestionsPopover.prototype.setInputLabels = function (fnGetLabels) {
		this._fnInputLabels = fnGetLabels;
	};

	/**
	 * Gets the labels associated with the parent input
	 *
	 * @return {Array} Array of labels
	 * @private
	 */
	SuggestionsPopover.prototype._getInputLabels = function () {
		return this._fnInputLabels();
	};

	/**
	 * Gets the scrollable content of the SimpleFixFlex
	 *
	 * @return {Element} The DOM element of the scrollable content
	 * @private
	 */
	SuggestionsPopover.prototype._getScrollableContent = function () {
		return this._oPopover && this._oPopover.getDomRef("scroll");
	};

	/**
	 * Updated the dialog title based on the labels of the parent input
	 *
	 * @return {sap.m.Title} The title control
	 * @private
	 */
	SuggestionsPopover.prototype.updatePickerHeaderTitle = function() {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oPickerTitle = this.getPickerTitle(),
			oLabel, aLabels;

		if (!oPickerTitle) {
			return;
		}

		aLabels = this._getInputLabels();

		if (aLabels.length) {
			oLabel = aLabels[0];

			if (oLabel && (typeof oLabel.getText === "function")) {
				oPickerTitle.setText(oLabel.getText());
			}
		} else {
			oPickerTitle.setText(oResourceBundle.getText("COMBOBOX_PICKER_TITLE"));
		}

		return oPickerTitle;
	};

	/**
	 * Returns a reference to the title inside the dialog
	 *
	 * @return {sap.m.Title} The title
	 * @public
	 */
	SuggestionsPopover.prototype.getPickerTitle = function () {
		return this._oPopover.getCustomHeader().getContentMiddle()[0];
	};

	/**
	 * Returns a reference to the OK button inside the dialog
	 *
	 * @return {sap.m.Button|null} The OK button
	 * @public
	 */
	SuggestionsPopover.prototype.getOkButton = function() {
		var oButton = this._oPopover
			&& this._oPopover.getBeginButton();

		return oButton || null;
	};

	/**
	 * Returns a reference to the cancel button inside the dialog
	 *
	 * @return {sap.m.Button|null} The cancel button
	 * @public
	 */
	SuggestionsPopover.prototype.getCancelButton = function() {
		var oButton = this._oPopover
			&& this._oPopover.getCustomHeader()
			&& this._oPopover.getCustomHeader().getContentRight
			&& this._oPopover.getCustomHeader().getContentRight()[0];

		return oButton || null;
	};

	/**
	 * Returns a reference a button inside the dialog, associated with filtering actions in multi selection scenarios
	 *
	 * @return {sap.m.Button|null} The button
	 * @public
	 */
	SuggestionsPopover.prototype.getFilterSelectedButton = function() {
		var oButton = this._oPopover
			&& this._oPopover.getSubHeader()
			&& this._oPopover.getSubHeader().getContent()[1];

		return oButton || null;
	};

	/**
	 * Returns a reference a button inside the dialog, associated with filtering actions in multi selection scenarios
	 *
	 * @return {sap.m.Button} The button
	 * @private
	 */
	SuggestionsPopover.prototype._createFilterSelectedButton = function () {
		var sIconURI = IconPool.getIconURI("multiselect-all");

		return new ToggleButton({
			icon: sIconURI
		});
	};

	/**
	 * Helper function that creates suggestion popup.
	 */
	SuggestionsPopover.prototype._createSuggestionPopup = function (mOptions) {
		mOptions = mOptions || [];
		var oInput = this._oInput,
			that = this,
			oMessageBundle = oInput._oRb; // TODO create own message bundle

		this._oPopover = !this._bUseDialog ?
			(new Popover(oInput.getId() + "-popup", {
				showArrow: false,
				placement: PlacementType.VerticalPreferredBottom,
				showHeader: true,
				initialFocus: oInput,
				horizontalScrolling: true
			}))
			:
			(new Dialog(oInput.getId() + "-popup", {
				beginButton : new Button(oInput.getId()
					+ "-popup-closeButton", {
					text : oMessageBundle.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON")
				}),
				stretch : true,
				customHeader : new Bar(oInput.getId()
					+ "-popup-header", {
					contentMiddle : new Title(),
					contentRight: new Button({
						icon: IconPool.getIconURI("decline")
					})
				}),
				subHeader: this.createSubHeaderContent(mOptions),
				horizontalScrolling : false,
				initialFocus : this._oPopupInput,
				beforeOpen: function() {
					that.updatePickerHeaderTitle();
				},
				afterClose: function() {
					oInput.focus();
					library.closeKeyboard();
				}
			}));

		this._registerAutocomplete();
		this._oPopover.addStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER);
		this._oPopover.addStyleClass(CSS_CLASS_NO_CONTENT_PADDING);
		this._oPopover.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"));

		if (!this._bUseDialog) {
			this._overwritePopover();
		}

		if (this._oList) {
			this._oPopover.addContent(this._oList);
		}
	};

	SuggestionsPopover.prototype.createSubHeaderContent = function (mOptions) {
		var aContent = [this._oPopupInput];

		if (mOptions.showSelectedButton) {
			aContent.push(this._createFilterSelectedButton());
		}
		return new Toolbar({
			content: aContent
		});
	};

	/**
	 * Helper function that creates content for the suggestion popup.
	 *
	 * @param {boolean | null } bTabular Determines whether the popup content is a table or a list.
	 */
	SuggestionsPopover.prototype._createSuggestionPopupContent = function (bTabular) {
		var oInput = this._oInput;

		this._bHasTabularSuggestions = bTabular;

		if (!bTabular) {
			this._oList = new List(oInput.getId() + "-popup-list", {
				showNoData : false,
				mode : ListMode.SingleSelectMaster,
				rememberSelections : false,
				width: "100%",
				showSeparators: ListSeparators.None,
				busyIndicatorDelay: 0
			});

			this._oList.addEventDelegate({
				onAfterRendering: function () {
					var aListItemsDomRef, sInputValue;

					if (!this._bEnableHighlighting) {
						return;
					}

					aListItemsDomRef = this._oList.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');
					sInputValue = (this._sTypedInValue || this._oInput.getValue()).toLowerCase();

					this.highlightSuggestionItems(aListItemsDomRef, sInputValue);
				}.bind(this)
			});

		} else {
			// tabular suggestions
			this._oList = this._oInput._getSuggestionsTable();
		}

		if (this._oPopover) {
			if (this._bUseDialog) {
				// this._oList needs to be manually rendered otherwise it triggers a rerendering of the whole
				// dialog and may close the opened on screen keyboard
				this._oPopover.addAggregation("content", this._oList, true);
				var oRenderTarget = this._oPopover.$("scrollCont")[0];
				if (oRenderTarget) {
					var rm = sap.ui.getCore().createRenderManager();
					rm.renderControl(this._oList);
					rm.flush(oRenderTarget);
					rm.destroy();
				}
			} else {
				this._oPopover.addContent(this._oList);
			}
		}
	};

	SuggestionsPopover.prototype._getValueStateHeader = function () {
		if (!this._oValueStateHeader) {
			this._oValueStateHeader = new ValueStateHeader();

			if (this._oPopover.isA("sap.m.Popover")) {
				// when we are using the Popover the value state header is shown in the header of the Popover
				this._oPopover.setCustomHeader(this._oValueStateHeader);
			} else {
				// on mobile the content is used and sticky position is set on the header
				this._oPopover.insertContent(this._oValueStateHeader, 0);
			}

			this._oValueStateHeader.setPopup(this._oPopover);
		}

		return this._oValueStateHeader;
	};

	/**
	 * Helper function that destroys suggestion popup.
	 */
	SuggestionsPopover.prototype._destroySuggestionPopup = function () {
		if (this._oPopover) {

			// if the table is not removed before destroying the popup the table is also destroyed (table needs to stay because we forward the column and row aggregations to the table directly, they would be destroyed as well)
			if (this._oList instanceof Table) {
				this._oPopover.removeAllContent();
			}

			this._oPopover.destroy();
			this._oPopover = null;
		}
		// CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
		if (this._oList instanceof List) {
			this._oList.destroy();
			this._oList = null;
		}

		if (this._oPickerValueStateText) {
			this._oPickerValueStateText.destroy();
			this._oPickerValueStateText = null;
		}

		if (this._oValueStateHeader) {
			this._oValueStateHeader.destroy();
			this._oValueStateHeader = null;
		}

		this._getInput().removeEventDelegate(this._oInputDelegate, this);
	};

	/**
	 * Helper function that overwrites popover in the Input.
	 */
	SuggestionsPopover.prototype._overwritePopover = function () {
		var oInput = this._oInput;
		this._oPopover.open = function () {
			this.openBy(oInput, false, true);
		};

		// remove animation from popover
		this._oPopover.oPopup.setAnimations(function ($Ref, iRealDuration, fnOpened) {
			fnOpened();
		}, function($Ref, iRealDuration, fnClosed) {
			fnClosed();
		});
	};

	/**
	 * Resize the popup to the input width and makes sure that the input is never bigger than the popup.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._resizePopup = function() {
		var oInput = this._oInput;

		if (this._oList && this._oPopover) {

			if (this._sPopoverContentWidth) {
				this._oPopover.setContentWidth(this._sPopoverContentWidth);
			} else {
				this._oPopover.setContentWidth((oInput.$().outerWidth()) + "px");
			}

			// resize suggestion popup to minimum size of the input field
			setTimeout(function() {
				if (this._oPopover && this._oPopover.isOpen() && this._oPopover.$().outerWidth() < oInput.$().outerWidth()) {
					this._oPopover.setContentWidth((oInput.$().outerWidth()) + "px");
				}
			}.bind(this), 0);
		}
	};

	/**
	 * Registers resize handler
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._registerResize = function() {
		if (!this._bUseDialog) {
			this._sPopupResizeHandler = ResizeHandler.register(this._oInput, this._resizePopup.bind(this));
		}
	};

	/**
	 * Removes resize handler
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._deregisterResize = function() {
		if (this._sPopupResizeHandler) {
			this._sPopupResizeHandler = ResizeHandler.deregister(this._sPopupResizeHandler);
		}
	};

	/**
	 * Keyboard handler helper.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Arrow key event.
	 * @param {string} sDir Arrow direction.
	 * @param {int} iItems Items to be changed.
	 */
	SuggestionsPopover.prototype._onsaparrowkey = function(oEvent, sDir, iItems) {
		var oInput = this._oInput,
			oListItem,
			oInnerRef = oInput.$("inner");

		if (oEvent.isMarked()) {
			return;
		}

		if (oEvent.isMarked()) {
			return;
		}

		if (!oInput.getEnabled() || !oInput.getEditable()) {
			return;
		}
		if (sDir !== "up" && sDir !== "down") {
			return;
		}
		if (this._bIsInputIncrementalType) {
			oEvent.setMarked();
		}

		if (!this._oPopover || !this._oPopover.isOpen()) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		var bFirst = false,
			oList = this._oList,
			aListItems = oList.getItems(),
			iSelectedIndex = this._iPopupListSelectedIndex,
			sNewValue,
			iOldIndex = iSelectedIndex;

		if (sDir === "up" && iSelectedIndex === 0) {
			// if key is 'up' and selected Item is first -> do nothing
			return;
		}
		if (sDir == "down" && iSelectedIndex === aListItems.length - 1) {
			//if key is 'down' and selected Item is last -> do nothing
			return;
		}

		var iStopIndex;
		if (iItems > 1) {
			// if iItems would go over the borders, search for valid item in other direction
			if (sDir == "down" && iSelectedIndex + iItems >= aListItems.length) {
				sDir = "up";
				iItems = 1;
				aListItems[iSelectedIndex].setSelected(false);
				iStopIndex = iSelectedIndex;
				iSelectedIndex = aListItems.length - 1;
				bFirst = true;
			} else if (sDir == "up" && iSelectedIndex - iItems < 0){
				sDir = "down";
				iItems = 1;
				aListItems[iSelectedIndex].setSelected(false);
				iStopIndex = iSelectedIndex;
				iSelectedIndex = 0;
				bFirst = true;
			}
		}

		// always select the first item from top when nothing is selected so far
		if (iSelectedIndex === -1) {
			iSelectedIndex = 0;
			if (this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
				// if first item is visible, don't go into while loop
				iOldIndex = iSelectedIndex;
				bFirst = true;
			} else {
				// detect first visible item with while loop
				sDir = "down";
			}
		}

		if (sDir === "down") {
			while (iSelectedIndex < aListItems.length - 1 && (!bFirst || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex + iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		} else {
			while (iSelectedIndex > 0 && (!bFirst || !aListItems[iSelectedIndex].getVisible() || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex - iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		}

		if (!this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
			// if no further visible item can be found -> do nothing (e.g. set the old item as selected again)
			if (iOldIndex >= 0) {
				aListItems[iOldIndex].setSelected(true).updateAccessibilityState();
				oInnerRef.attr("aria-activedescendant", aListItems[iOldIndex].getId());
			}
			return;
		} else {
			oListItem = aListItems[iSelectedIndex];
			oListItem.setSelected(true).updateAccessibilityState();

			if (oListItem.isA("sap.m.GroupHeaderListItem")) {
				oInnerRef.removeAttr("aria-activedescendant");
			} else {
				oInnerRef.attr("aria-activedescendant", aListItems[iSelectedIndex].getId());
			}
		}

		if (Device.system.desktop) {
			this._scrollToItem(iSelectedIndex);
		}

		// make sure the value doesn't exceed the maxLength
		this._oLastSelectedHeader && this._oLastSelectedHeader.removeStyleClass("sapMInputFocusedHeaderGroup");
		if (ColumnListItem && aListItems[iSelectedIndex] instanceof ColumnListItem) {
			// for tabular suggestions we call a result filter function
			sNewValue = oInput._getInputValue(oInput._fnRowResultFilter(aListItems[iSelectedIndex]));
		} else {
			if (aListItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) {
				sNewValue = "";
				aListItems[iSelectedIndex].addStyleClass("sapMInputFocusedHeaderGroup");
				this._oLastSelectedHeader = aListItems[iSelectedIndex];
			} else if (aListItems[iSelectedIndex] instanceof DisplayListItem) {
				// for two value suggestions we use the item label
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getLabel());
			} else {
				// otherwise we use the item title
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getTitle());
			}
		}

		this._iPopupListSelectedIndex = iSelectedIndex;

		this._bSuggestionItemChanged = true;

		this.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {newValue: sNewValue});
	};

	/**
	 * Helper method for keyboard navigation in suggestion items.
	 *
	 * @private
	 * @param {sap.ui.core.Item} oItem Suggestion item.
	 * @returns {boolean} Is the suggestion item selectable.
	 */
	SuggestionsPopover.prototype._isSuggestionItemSelectable = function(oItem) {
		// CSN# 1390866/2014: The default for ListItemBase type is "Inactive", therefore disabled entries are only supported for single and two-value suggestions
		// for tabular suggestions: only check visible
		// for two-value and single suggestions: check also if item is not inactive
		var bSelectionAllowed = this._bHasTabularSuggestions
			|| oItem.getType() !== ListType.Inactive
			|| oItem.isA("sap.m.GroupHeaderListItem");

		return oItem.getVisible() && bSelectionAllowed;
	};

	SuggestionsPopover.prototype.setOkPressHandler = function(fnHandler){
		var oOkButton = this.getOkButton();
		oOkButton && oOkButton.attachPress(fnHandler);

		return oOkButton;
	};

	SuggestionsPopover.prototype.setCancelPressHandler = function(fnHandler){
		var oCancelButton = this.getCancelButton();
		oCancelButton && oCancelButton.attachPress(fnHandler);
	};

	SuggestionsPopover.prototype.setShowSelectedPressHandler = function(fnHandler){
		var oFilterSelectedButton = this.getFilterSelectedButton();
		oFilterSelectedButton && oFilterSelectedButton.attachPress(fnHandler);

		return oFilterSelectedButton;
	};

	/**
	 * Scrolls to item.
	 *
	 * @private
	 * @param {int} iIndex Index of the item to scroll to.
	 */
	SuggestionsPopover.prototype._scrollToItem = function(iIndex) {
		var oPopup = this._oPopover,
			oList = this._oList,
			oScrollDelegate,
			oPopupRect,
			oItemRect,
			iTop,
			iBottom;

		if (!(oPopup instanceof Popover) || !oList) {
			return;
		}
		oScrollDelegate = oPopup.getScrollDelegate();
		if (!oScrollDelegate) {
			return;
		}
		var oListItem = oList.getItems()[iIndex],
			oListItemDom = oListItem && oListItem.getDomRef();
		if (!oListItemDom) {
			return;
		}
		oPopupRect = oPopup.getDomRef("cont").getBoundingClientRect();
		oItemRect = oListItemDom.getBoundingClientRect();

		iTop = oPopupRect.top - oItemRect.top;
		iBottom = oItemRect.bottom - oPopupRect.bottom;
		if (iTop > 0) {
			oScrollDelegate.scrollTo(oScrollDelegate._scrollX, Math.max(oScrollDelegate._scrollY - iTop, 0));
		} else if (iBottom > 0) {
			oScrollDelegate.scrollTo(oScrollDelegate._scrollX, oScrollDelegate._scrollY + iBottom);
		}
	};

	/**
	 * Creates highlighted text.
	 *
	 * @private
	 * @param {sap.m.Label} oItemDomRef Label within the input.
	 * @param {string} sInputValue Text to highlight
	 * @param {boolean} bWordMode Whether to highlight single string or to highlight each string that starts with space + sInputValue
	 * @returns {string} newText Created text.
	 */
	SuggestionsPopover.prototype._createHighlightedText = function (oItemDomRef, sInputValue, bWordMode) {
		var sDomRefLowerText, iStartHighlightingIndex, iInputLength, iNextSpaceIndex, sChunk,
			sText = oItemDomRef ? oItemDomRef.innerText : "",
			sFormattedText = "";

		if (!SuggestionsPopover._wordStartsWithValue(sText, sInputValue)) {
			return encodeXML(sText);
		}

		sInputValue = sInputValue.toLowerCase();
		iInputLength = sInputValue.length;

		while (SuggestionsPopover._wordStartsWithValue(sText, sInputValue)) {
			sDomRefLowerText = sText.toLowerCase();
			iStartHighlightingIndex = sDomRefLowerText.indexOf(sInputValue);
			// search for the first word which starts with these characters
			iStartHighlightingIndex = (iStartHighlightingIndex > 0) ?
				sDomRefLowerText.indexOf(' ' + sInputValue) + 1 : iStartHighlightingIndex;


			// Chunk before highlighting
			sChunk = sText.substring(0, iStartHighlightingIndex);
			sText = sText.substring(iStartHighlightingIndex);
			sFormattedText += encodeXML(sChunk);

			// Highlighting chunk
			sChunk = sText.substring(0, iInputLength);
			sText = sText.substring(iInputLength);
			sFormattedText += '<span class="sapMInputHighlight">' + encodeXML(sChunk) + '</span>';


			// Check for repetitive patterns. For example: "prodProdProd prod" should highlight only
			// the starting of every word, but not the whole string when tested with "prod" input.
			iNextSpaceIndex = sText.indexOf(" ");
			iNextSpaceIndex = iNextSpaceIndex === -1 ? sText.length : iNextSpaceIndex;

			// The rest
			sChunk = sText.substring(0, iNextSpaceIndex);
			sText = sText.substring(iNextSpaceIndex);
			sFormattedText += encodeXML(sChunk);

			// Run only for the first occurrence when highlighting for the Input for example
			if (!bWordMode) {
				break;
			}
		}

		if (sText) {
			sFormattedText += encodeXML(sText);
		}

		return sFormattedText;
	};

	/**
	 * Highlights text in DOM items.
	 *
	 * @param {Array<HTMLElement>} aItemsDomRef DOM elements on which formatting would be applied
	 * @param {string} sInputValue Text to highlight
	 * @param {boolean} bWordMode Whether to highlight single string or to highlight each string that starts with space + sInputValue
	 * @ui5-restricted
	 * @protected
	 */
	SuggestionsPopover.prototype.highlightSuggestionItems = function (aItemsDomRef, sInputValue, bWordMode) {
		var i;

		if (!this._bEnableHighlighting || (!aItemsDomRef && !aItemsDomRef.length)) {
			return;
		}

		for (i = 0; i < aItemsDomRef.length; i++) {
			aItemsDomRef[i].innerHTML = this._createHighlightedText(aItemsDomRef[i], sInputValue, bWordMode);
		}
	};

	/**
	 * Registers event handlers required for
	 * the autocomplete functionality.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._registerAutocomplete = function () {
		var oPopover = this._oPopover,
			oUsedInput = this._getInput(),
			bUseDialog = this._bUseDialog;

		if (bUseDialog) {
			oPopover.addEventDelegate({
				ontap: function () {
					// used when clicking outside the suggestions list
					if (!this._bSuggestionItemTapped && this._sProposedItemText) {
						oUsedInput.setValue(this._sProposedItemText);
						this._sProposedItemText = null;
					}
				}
			}, this);
		} else {
			oPopover.attachAfterOpen(this._handleTypeAhead, this);
		}

		oPopover.attachAfterOpen(this._setSelectedSuggestionItem, this);
		oPopover.attachAfterClose(this._finalizeAutocomplete, this);

		this._oInputDelegate = {
			onkeydown: function (oEvent) {
				// disable the typeahead feature for android devices due to an issue on android soft keyboard, which always returns keyCode 229
				this._bDoTypeAhead = !Device.os.android && this._bAutocompleteEnabled && (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
			},
			oninput: this._handleTypeAhead
		};

		oUsedInput.addEventDelegate(this._oInputDelegate, this);
	};

	/**
	 * Autocompletes input.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._handleTypeAhead = function() {
		var oInput = this._getInput(),
			sValue = oInput.getValue();

		this._oProposedItem = null;
		this._sProposedItemText = null;
		this._sTypedInValue = sValue;

		if (!this._bDoTypeAhead || sValue === "") {
			return;
		}

		if (!this._oPopover.isOpen() || sValue.length < this._oInput.getStartSuggestion()) {
			return;
		}

		if (document.activeElement !== oInput.getFocusDomRef()) {
			return;
		}

		var sValueLowerCase = sValue.toLowerCase(),
			aItems = this._bHasTabularSuggestions ? this._oInput.getSuggestionRows() : this._oInput.getSuggestionItems(),
			iLength,
			sNewValue,
			sItemText,
			i;

		aItems = aItems.filter(function(oItem){
			return !(oItem.isA("sap.ui.core.SeparatorItem") || oItem.isA("sap.m.GroupHeaderListItem"));
		});

		iLength = aItems.length;

		for (i = 0; i < iLength; i++) {
			sItemText =  this._bHasTabularSuggestions ? this._oInput._fnRowResultFilter(aItems[i]) : aItems[i].getText();

			if (sItemText.toLowerCase().indexOf(sValueLowerCase) === 0) { // startsWith
				this._oProposedItem = aItems[i];
				sNewValue = sItemText;
				break;
			}
		}

		this._sProposedItemText = sNewValue;

		if (sNewValue) {
			sNewValue = this._formatTypedAheadValue(sNewValue);

			if (!oInput.isComposingCharacter()) {
				oInput.updateDomValue(sNewValue);
			}

			if (Device.system.desktop) {
				oInput.selectText(sValue.length, sNewValue.length);
			} else {
				// needed when user types too fast
				setTimeout(function () {
					oInput.selectText(sValue.length, sNewValue.length);
				}, 0);
			}
		}
	};

	/**
	 * Sets matched selected item in the suggestion popover
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._setSelectedSuggestionItem = function () {
		var aFilteredItems;

		if (this._oList) {
			aFilteredItems = this._oList.getItems();
			for (var i = 0; i < aFilteredItems.length; i++) {
				if ((aFilteredItems[i]._oItem || aFilteredItems[i]) === this._oProposedItem) { // for list || for table
					aFilteredItems[i].setSelected(true);
					break;
				}
			}
		}
	};

	/**
	 * Returns the Input control
	 * depending on the device (mobile or desktop).
	 *
	 * @private
	 * @returns {sap.m.Input} Reference to the corresponding control
	 */
	SuggestionsPopover.prototype._getInput = function () {
		return this._bUseDialog ? this._oPopupInput : this._oInput;
	};

	/**
	 * Sets the selected item (if it exists) from the autocomplete when pressing Enter.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._finalizeAutocomplete = function () {
		if (this._oInput.isComposingCharacter()) {
			return;
		}

		if (!this._bAutocompleteEnabled) {
			return;
		}

		if (!this._bSuggestionItemTapped && !this._bSuggestionItemChanged && this._oProposedItem) {
			if (this._bHasTabularSuggestions) {
				this._oInput.setSelectionRow(this._oProposedItem, true);
			} else {
				this._oInput.setSelectionItem(this._oProposedItem, true);
			}
		}

		if (this._oProposedItem && document.activeElement === this._oInput.getFocusDomRef()) {
			var iLength = this._oInput.getValue().length;
			this._oInput.selectText(iLength, iLength);
		}

		this._resetTypeAhead();
	};

	/**
	 * Resets properties, that are related to autocomplete, to their initial state.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._resetTypeAhead = function () {
		this._oProposedItem = null;
		this._sProposedItemText = null;
		this._sTypedInValue = '';
		this._bSuggestionItemTapped = false;
		this._bSuggestionItemChanged = false;
	};

	/**
	 * Formats the input value
	 * in a way that it preserves character casings typed by the user
	 * and appends suggested value with casings as they are in the
	 * corresponding suggestion item.
	 *
	 * @private
	 * @param {string} sNewValue Value which will be formatted.
	 * @returns {string} The new formatted value.
	 */
	SuggestionsPopover.prototype._formatTypedAheadValue = function (sNewValue) {
		return this._sTypedInValue.concat(sNewValue.substring(this._sTypedInValue.length, sNewValue.length));
	};

	/**
	 * Event delegate for right arrow key press
	 * on the input control.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._onsapright = function () {
		var oInput = this._oInput,
			sValue = oInput.getValue();

		if (!this._bAutocompleteEnabled) {
			return;
		}

		if (this._sTypedInValue !== sValue) {
			this._sTypedInValue = sValue;

			oInput.fireLiveChange({
				value: sValue,
				// backwards compatibility
				newValue: sValue
			});
		}
	};

	/*
	* Updates the value state displayed in the popover.
	*
	* @internal
	*/
	SuggestionsPopover.prototype.updateValueState = function(sValueState, sValueStateText, bShowValueStateMessage) {
		var bShow = bShowValueStateMessage && sValueState !== ValueState.None;
		sValueStateText = sValueStateText || ValueStateSupport.getAdditionalText(sValueState);

		if (!this._oPopover) {
			return this;
		}

		if (this._oPopupInput) {
			this._oPopupInput.setValueState(sValueState);
		}

		this._getValueStateHeader().setValueState(sValueState);
		this._setValueStateHeaderText(sValueStateText);
		this._showValueStateHeader(bShow);
		this._alignValueStateStyles(sValueState);

		return this;
	};

	/**
	 * Shows/hides the value state text
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._showValueStateHeader = function(bShow) {
		if (this._oValueStateHeader) {
			this._oValueStateHeader.setVisible(bShow);
		}
	};

	/**
	 * Sets the value state text
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._setValueStateHeaderText = function(sText) {
		if (this._oValueStateHeader) {
			this._oValueStateHeader.setText(sText);
		}
	};

	/**
	 * Aligns the value state styles
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._alignValueStateStyles = function(sValueState) {
		var sPickerWithState = CSS_CLASS_SUGGESTIONS_POPOVER + "ValueState",
			sOldCssClass = CSS_CLASS_SUGGESTIONS_POPOVER + this._sOldValueState + "State",
			sCssClass = CSS_CLASS_SUGGESTIONS_POPOVER + sValueState + "State";

		this._oPopover.addStyleClass(sPickerWithState);
		this._oPopover.removeStyleClass(sOldCssClass);
		this._oPopover.addStyleClass(sCssClass);

		this._sOldValueState = sValueState;
	};

	/**
	 * Adds flex content.
	 *
	 * @param {sap.m.Control} oControl Control to be added
	 * @protected
	 */
	SuggestionsPopover.prototype.addContent = function(oControl) {
		this._oPopover.addContent(oControl);
	};

	return SuggestionsPopover;
});
