/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/EventProvider',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ListItem',
	'sap/ui/core/ResizeHandler',
	'sap/m/library',
	'sap/m/Bar',
	'sap/m/Button',
	'sap/m/ColumnListItem',
	'sap/m/Dialog',
	'sap/m/DisplayListItem',
	'sap/m/List',
	'sap/m/Popover',
	'sap/m/StandardListItem',
	'sap/m/Table',
	"sap/base/security/encodeXML",
	"sap/ui/events/KeyCodes"
], function (
	Device,
	EventProvider,
	InvisibleText,
	ListItem,
	ResizeHandler,
	library,
	Bar,
	Button,
	ColumnListItem,
	Dialog,
	DisplayListItem,
	List,
	Popover,
	StandardListItem,
	Table,
	encodeXML,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

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
			this._bAutocompleEnabled = false;

			// stores currently typed value
			this._sTypedInValue = '';

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

			if (this._oSuggestionTable) {
				this._oSuggestionTable.destroy();
				this._oSuggestionTable = null;
			}

			this._oProposedItem = null;
			this._oInputDelegate = null;
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
	SuggestionsPopover._wordStartsWithValue = function(sText, sValue) {

		var index;

		while (sText) {
			if (typeof sValue === "string" && sValue !== "" && sText.toLowerCase().startsWith(sValue.toLowerCase())) {
				return true;
			}

			index = sText.indexOf(' ');
			if (index == -1) {
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
	 * The default filter function for tabular suggestions. It checks whether some item text begins with the typed value.
	 *
	 * @private
	 * @param {string} sValue the current filter string.
	 * @param {sap.m.ColumnListItem} oColumnListItem The filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	SuggestionsPopover._DEFAULTFILTER_TABULAR = function(sValue, oColumnListItem) {
		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {

			if (aCells[i].getText) {
				if (SuggestionsPopover._wordStartsWithValue(aCells[i].getText(), sValue)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * The default result function for tabular suggestions. It returns the value of the first cell with a "text" property.
	 *
	 * @private
	 * @param {sap.m.ColumnListItem} oColumnListItem The selected list item.
	 * @returns {string} The value to be displayed in the input field.
	 */
	SuggestionsPopover._DEFAULTRESULT_TABULAR = function (oColumnListItem) {
		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {
			// take first cell with a text method and compare value
			if (aCells[i].getText) {
				return aCells[i].getText();
			}
		}
		return "";
	};

	/**
	 * Helper function that creates suggestion popup.
	 */
	SuggestionsPopover.prototype._createSuggestionPopup = function () {
		var oInput = this._oInput;
		var oMessageBundle = oInput._oRb; // TODO create own message bundle

		this._oPopover = !this._bUseDialog ?
			(new Popover(oInput.getId() + "-popup", {
				showArrow: false,
				showHeader: false,
				placement: PlacementType.Vertical,
				initialFocus: oInput,
				horizontalScrolling: true
			}).attachAfterClose(function() {
				// only destroy items in simple suggestion mode
				if (this._oList instanceof Table) {
					this._oList.removeSelections(true);
				} else {
					this._oList.destroyItems();
				}
				this._deregisterResize();
			}.bind(this)).attachBeforeOpen(function () {
				this._resizePopup();
				this._registerResize();
			}.bind(this)))
			:
			(new Dialog(oInput.getId() + "-popup", {
				beginButton : new Button(oInput.getId()
					+ "-popup-closeButton", {
					text : oMessageBundle.getText("MSGBOX_CLOSE")
				}),
				stretch : true,
				customHeader : new Bar(oInput.getId()
					+ "-popup-header", {
					contentMiddle : this._oPopupInput
				}),
				horizontalScrolling : false,
				initialFocus : this._oPopupInput
			}).attachAfterClose(function() {
				// only destroy items in simple suggestion mode
				if (this._oList) {
					if (Table && !(this._oList instanceof Table)) {
						this._oList.destroyItems();
					} else {
						this._oList.removeSelections(true);
					}
				}
			}.bind(this)));

		this._registerAutocomplete();
		this._oPopover.addStyleClass("sapMInputSuggestionPopup");
		this._oPopover.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"));

		if (!this._bUseDialog) {
			this._overwritePopover();
		}

		if (this._oList) {
			this._oPopover.addContent(this._oList);
		}
	};

	/**
	 * Helper function that creates content for the suggestion popup.
	 *
	 * @param {boolean | null } bTabular Content for the popup.
	 * @param hasTabularSuggestions {boolean} Determines if the Input has tabular suggestions.
	 */
	SuggestionsPopover.prototype._createSuggestionPopupContent = function (bTabular, hasTabularSuggestions) {
		var oInput = this._oInput;

		if (!hasTabularSuggestions && !bTabular) {
			this._oList = new List(oInput.getId() + "-popup-list", {
				showNoData : false,
				mode : ListMode.SingleSelectMaster,
				rememberSelections : false
			});

			this._oList.addEventDelegate({
				onAfterRendering: function () {
					if (!this._bEnableHighlighting) {
						return;
					}
					this._highlightListText(oInput.getValue());
				}.bind(this)
			});

		} else {
			// tabular suggestions
			this._oList = this._getSuggestionsTable();
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
		var oInput = this._oInput;

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
				oInput.$("inner").attr("aria-activedescendant", aListItems[iOldIndex].getId());
			}
			return;
		} else {
			aListItems[iSelectedIndex].setSelected(true).updateAccessibilityState();
			oInput.$("inner").attr("aria-activedescendant", aListItems[iSelectedIndex].getId());
		}

		if (Device.system.desktop) {
			this._scrollToItem(iSelectedIndex);
		}

		// make sure the value doesn't exceed the maxLength
		if (ColumnListItem && aListItems[iSelectedIndex] instanceof ColumnListItem) {
			// for tabular suggestions we call a result filter function
			sNewValue = oInput._getInputValue(oInput._fnRowResultFilter(aListItems[iSelectedIndex]));
		} else {
			if (aListItems[0] instanceof DisplayListItem) {
				// for two value suggestions we use the item label
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getLabel());
			} else {
				// otherwise we use the item title
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getTitle());
			}
		}

		this._iPopupListSelectedIndex = iSelectedIndex;

		this._oProposedItem = null;

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
		return oItem.getVisible() && (this._hasTabularSuggestions() || oItem.getType() !== ListType.Inactive);
	};

	/**
	 * Check for tabular suggestions in the input.
	 *
	 * @private
	 * @returns {boolean} Determines if the Input has tabular suggestions.
	 */
	SuggestionsPopover.prototype._hasTabularSuggestions = function() {
		return !!(this._oSuggestionTable.getColumns() && this._oSuggestionTable.getColumns().length);
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
	 * Gets suggestion table with lazy loading.
	 *
	 * @private
	 * @returns {sap.m.Table} Suggestion table.
	 */
	SuggestionsPopover.prototype._getSuggestionsTable = function() {
		var oInput = this._oInput;

		if (oInput._bIsBeingDestroyed) {
			return this._oSuggestionTable;
		}

		if (!this._oSuggestionTable) {
			this._oSuggestionTable = new Table(oInput.getId() + "-popup-table", {
				mode: ListMode.SingleSelectMaster,
				showNoData: false,
				showSeparators: "All",
				width: "100%",
				enableBusyIndicator: false,
				rememberSelections : false,
				selectionChange: function (oEvent) {
					this._bSuggestionItemTapped = true;
					var oSelectedListItem = oEvent.getParameter("listItem");
					oInput.setSelectionRow(oSelectedListItem, true);
				}.bind(this)
			});

			this._oSuggestionTable.addEventDelegate({
				onAfterRendering: function () {
					if (!oInput.getEnableSuggestionsHighlighting()) {
						return;
					}
					this._highlightTableText(oInput.getValue());
				}.bind(this)
			});

			// initially hide the table on phone
			if (this._bUseDialog) {
				this._oSuggestionTable.addStyleClass("sapMInputSuggestionTableHidden");
			}

			this._oSuggestionTable.updateItems = function() {
				Table.prototype.updateItems.apply(oInput, arguments);
				oInput._refreshItemsDelayed();
				return oInput;
			};
		}

		oInput._oSuggestionTable = this._oSuggestionTable; // for backward compatibility (used in some other controls)

		return this._oSuggestionTable;
	};

	/**
	 * Creates highlighted text.
	 *
	 * @private
	 * @param {sap.m.Label} label Label within the input.
	 * @returns {string} newText Created text.
	 */
	SuggestionsPopover.prototype._createHighlightedText = function (label) {
		var text = label.innerText,
			value = (this._sTypedInValue || this._oInput.getValue()).toLowerCase(),
			count = value.length,
			lowerText = text.toLowerCase(),
			subString,
			newText = '';

		if (!SuggestionsPopover._wordStartsWithValue(text, value)) {
			return encodeXML(text);
		}

		var index = lowerText.indexOf(value);

		// search for the first word which starts with these characters
		if (index > 0) {
			index = lowerText.indexOf(' ' + value) + 1;
		}

		if (index > -1) {
			newText += encodeXML(text.substring(0, index));
			subString = text.substring(index, index + count);
			newText += '<span class="sapMInputHighlight">' + encodeXML(subString) + '</span>';
			newText += encodeXML(text.substring(index + count));
		} else {
			newText = encodeXML(text);
		}

		return newText;
	};

	/**
	 * Highlights matched text in the suggestion list.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._highlightListText = function () {

		if (!this._bEnableHighlighting) {
			return;
		}

		var i,
			label,
			labels = this._oList.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');

		for (i = 0; i < labels.length; i++) {
			label = labels[i];
			label.innerHTML = this._createHighlightedText(label);
		}
	};

	/**
	 * Highlights matched text in the suggestion table.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._highlightTableText = function () {

		if (!this._bEnableHighlighting) {
			return;
		}

		var i,
			label,
			labels = this._oSuggestionTable.$().find('tbody .sapMLabel');

		for (i = 0; i < labels.length; i++) {
			label = labels[i];
			label.innerHTML = this._createHighlightedText(label);
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

		oPopover.attachAfterClose(this._finalizeAutocomplete, this);

		this._oInputDelegate = {
			onkeydown: function (oEvent) {
				this._bDoTypeAhead = this._bAutocompleEnabled && (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
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
			bSearchSuggestionRows = this._hasTabularSuggestions(),
			aItems = bSearchSuggestionRows ? this._oInput.getSuggestionRows() : this._oInput.getSuggestionItems(),
			iLength = aItems.length,
			sNewValue,
			sItemText,
			i;

		for (i = 0; i < iLength; i++) {
			sItemText =  bSearchSuggestionRows ? this._oInput._fnRowResultFilter(aItems[i]) : aItems[i].getText();

			if (sItemText.toLowerCase().startsWith(sValueLowerCase)) {
				this._oProposedItem = aItems[i];
				sNewValue = sItemText;
				break;
			}
		}

		this._sProposedItemText = sNewValue;

		if (sNewValue) {
			sNewValue = this._formatTypedAheadValue(sNewValue);
			oInput.updateDomValue(sNewValue);

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
		if (!this._bSuggestionItemTapped && this._oProposedItem) {
			if (this._hasTabularSuggestions()) {
				this._oInput.setSelectionRow(this._oProposedItem, true);
			} else {
				this._oInput.setSelectionItem(this._oProposedItem, true);
			}
		}

		if (document.activeElement === this._oInput.getFocusDomRef()) {
			var iLength = this._oInput.getValue().length;
			this._oInput.selectText(iLength, iLength);
		}

		this._oProposedItem = null;
		this._sProposedItemText = null;
		this._sTypedInValue = '';
		this._bSuggestionItemTapped = false;
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

		if (!this._bAutocompleEnabled) {
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

	return SuggestionsPopover;
});