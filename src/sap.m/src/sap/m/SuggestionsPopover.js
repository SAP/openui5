/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/Object',
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
	'sap/m/Toolbar',
	'sap/m/ToolbarSpacer',
	"sap/base/security/encodeXML"
], function (
	Device,
	BaseObject,
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
	Toolbar,
	ToolbarSpacer,
	encodeXML
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
	 * @extends sap.ui.base.Object
	 *
	 * @param {sap.ui.core.Control} oControl The input control that instantiates this suggestions popover
	 * @constructor
	 * @private
	 * @alias sap.m.SuggestionsPopover
	 *
	 * @author SAP SE
	 * @version ${version}
	 */
	var SuggestionsPopover = BaseObject.extend("sap.m.SuggestionsPopover", /** @lends sap.m.SuggestionsPopover.prototype */ {

		constructor: function (oInput) {
			BaseObject.apply(this, arguments);

			// stores a reference to the input control that instantiates the popover
			this._oInput = oInput;

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
				}
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

			if (this._oButtonToolbar) {
				this._oButtonToolbar.destroy();
				this._oButtonToolbar = null;
			}

			if (this._oShowMoreButton) {
				this._oShowMoreButton.destroy();
				this._oShowMoreButton = null;
			}
		}
	});

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
	 * Checks if the suggestions popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @public
	 */
	SuggestionsPopover.prototype.isOpen = function () {
		return this._oPopover && this._oPopover.isOpen();
	};

	/**
	 * Helper function that creates suggestion popup.
	 */
		SuggestionsPopover.prototype._createSuggestionPopup = function () {
		var oInput = this._oInput;
		var oMessageBundle = oInput._oRb;

		if (oInput._bUseDialog) {
			this._oPopupInput = new sap.m.Input(oInput.getId() + "-popup-input", {
				width : "100%",
				valueLiveUpdate: true,
				showValueHelp: oInput.getShowValueHelp(),
				valueHelpRequest: function(oEvent) {
					// it is the same behavior as by ShowMoreButton:
					oInput.fireValueHelpRequest({fromSuggestions: true});
					oInput._iPopupListSelectedIndex = -1;
					oInput._closeSuggestionPopup();
				},
				liveChange : function(oEvent) {
					var sValue = oEvent.getParameter("newValue");
					// call _getInputValue to apply the maxLength to the typed value
					oInput.setDOMValue(oInput
						._getInputValue(this._oPopupInput
							.getValue()));

					oInput._triggerSuggest(sValue);

					// make sure the live change handler on the original input is also called
					oInput.fireLiveChange({
						value: sValue,

						// backwards compatibility
						newValue: sValue
					});
				}.bind(this)
			}).addStyleClass("sapMInputSuggInDialog");
		}

		this._oPopover = !oInput._bUseDialog ?
			(new Popover(oInput.getId() + "-popup", {
				showArrow: false,
				showHeader: false,
				placement: PlacementType.Vertical,
				initialFocus: oInput,
				horizontalScrolling: true
			}).attachAfterClose(function() {

				oInput._updateSelectionFromList();

				// only destroy items in simple suggestion mode
				if (this._oList instanceof Table) {
					this._oList.removeSelections(true);
				} else {
					this._oList.destroyItems();
				}
				this._deregisterResize();
			}.bind(this)).attachBeforeOpen(function () {
				oInput._sBeforeSuggest = oInput.getValue();
				this._resizePopup();
				this._registerResize();
			}.bind(this)))
			:
			(new Dialog(oInput.getId() + "-popup", {
				beginButton : new Button(oInput.getId()
					+ "-popup-closeButton", {
					text : oMessageBundle.getText("MSGBOX_CLOSE"),
					press : function() {
						oInput._closeSuggestionPopup();
					}
				}),
				stretch : oInput._bFullScreen,
				contentHeight : oInput._bFullScreen ? undefined : "20rem",
				customHeader : new Bar(oInput.getId()
					+ "-popup-header", {
					contentMiddle : this._oPopupInput.addEventDelegate({onsapenter: function(){
							if (!(sap.m.MultiInput && oInput instanceof sap.m.MultiInput)) {
								oInput._closeSuggestionPopup();
							}
						}}, this)
				}),
				horizontalScrolling : false,
				initialFocus : this._oPopupInput
			}).attachBeforeOpen(function() {
				// set the same placeholder and maxLength as the original input
				this._oPopupInput.setPlaceholder(oInput.getPlaceholder());
				this._oPopupInput.setMaxLength(oInput.getMaxLength());
			}.bind(this)).attachBeforeClose(function () {
				// call _getInputValue to apply the maxLength to the typed value
				oInput.setDOMValue(oInput
					._getInputValue(this._oPopupInput
						.getValue()));
				oInput.onChange();

				if (oInput instanceof sap.m.MultiInput && oInput._bUseDialog) {
					oInput._onDialogClose();
				}

			}.bind(this)).attachAfterClose(function() {

				// only destroy items in simple suggestion mode
				if (this._oList) {
					if (Table && !(this._oList instanceof Table)) {
						this._oList.destroyItems();
					} else {
						this._oList.removeSelections(true);
					}
				}
			}.bind(this)).attachAfterOpen(function () {
				var sValue = oInput.getValue();

				this._oPopupInput.setValue(sValue);
				oInput._triggerSuggest(sValue);
				oInput._oSuggPopover._refreshListItems();
			}.bind(this)));

		this._oPopover.addStyleClass("sapMInputSuggestionPopup");
		this._oPopover.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"));

		// add popup to a hidden aggregation to also propagate the model and bindings to the content of the popover
		oInput.setAggregation("_suggestionPopup", this._oPopover);
		if (!oInput._bUseDialog) {
			this._overwritePopover();
		}

		if (this._oList) {
			this._oPopover.addContent(this._oList);
		}

		if (oInput.getShowTableSuggestionValueHelp()) {
			this._addShowMoreButton();
		}
	};

	/**
	 * Helper function that creates content for the suggestion popup.
	 *
	 * @param {boolean | null } bTabular Content for the popup.
	 */
	SuggestionsPopover.prototype._createSuggestionPopupContent = function (bTabular) {
		var oInput = this._oInput;

		// only initialize the content once
		if (oInput._bIsBeingDestroyed || this._oList) {
			return;
		}

		if (!oInput._hasTabularSuggestions() && !bTabular) {
			this._oList = new List(oInput.getId() + "-popup-list", {
				showNoData : false,
				mode : ListMode.SingleSelectMaster,
				rememberSelections : false,
				itemPress : function(oEvent) {
					var oListItem = oEvent.getParameter("listItem");
					oInput.setSelectionItem(oListItem._oItem, true);
				}
			});

			this._oList.addEventDelegate({
				onAfterRendering: function () {
					if (!oInput.getEnableSuggestionsHighlighting()) {
						return;
					}
					this._highlightListText(oInput.getValue());
				}.bind(this)
			});

		} else {
			// tabular suggestions
			// if no custom filter is set we replace the default filter function here
			if (oInput._fnFilter === SuggestionsPopover._DEFAULTFILTER) {
				oInput._fnFilter = SuggestionsPopover._DEFAULTFILTER_TABULAR;
			}

			// if not custom row result function is set we set the default one
			if (!oInput._fnRowResultFilter) {
				oInput._fnRowResultFilter = SuggestionsPopover._DEFAULTRESULT_TABULAR;
			}

			this._oList = this._getSuggestionsTable();

			if (oInput.getShowTableSuggestionValueHelp()) {
				this._addShowMoreButton(bTabular);
			}
		}

		if (this._oPopover) {
			if (oInput._bUseDialog) {
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
				// also remove the button/toolbar aggregation
				this._removeShowMoreButton();
			}

			this._oPopover.destroy();
			this._oPopover = null;
		}
		// CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
		if (this._oList instanceof List) {
			this._oList.destroy();
			this._oList = null;
		}
	};

	/**
	 * Adds a show more button to the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 * @param{boolean} [bTabular] optional parameter to force override the tabular suggestions check
	 */
	SuggestionsPopover.prototype._addShowMoreButton = function(bTabular) {
		if (!this._oPopover || !bTabular && !this._oInput._hasTabularSuggestions()) {
			return;
		}

		if (this._oPopover instanceof Dialog) {
			// phone variant, use endButton (beginButton is close)
			var oShowMoreButton = this._getShowMoreButton();
			this._oPopover.setEndButton(oShowMoreButton);
		} else {
			var oButtonToolbar = this._getButtonToolbar();
			// desktop/tablet variant, use popover footer
			this._oPopover.setFooter(oButtonToolbar);
		}
	};

	/**
	 * Removes the show more button from the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 */
	SuggestionsPopover.prototype._removeShowMoreButton = function() {
		if (!this._oPopover || !this._oInput._hasTabularSuggestions()) {
			return;
		}

		if (this._oPopover instanceof Dialog) {
			this._oPopover.setEndButton(null);
		} else {
			this._oPopover.setFooter(null);
		}
	};

	/**
	 * Gets show more button.
	 *
	 * @private
	 * @return {sap.m.Button} Show more button.
	 */
	SuggestionsPopover.prototype._getShowMoreButton = function() {
		var oInput = this._oInput,
			oMessageBundle = oInput._oRb;
		return this._oShowMoreButton || (this._oShowMoreButton = new sap.m.Button({
			text : oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
			press : function() {
				if (oInput.getShowTableSuggestionValueHelp()) {
					oInput.fireValueHelpRequest({fromSuggestions: true});
					oInput._iPopupListSelectedIndex = -1;
					oInput._closeSuggestionPopup();
				}
			}
		}));
	};

	/**
	 * Gets button toolbar.
	 *
	 * @private
	 * @return {sap.m.Toolbar} Button toolbar.
	 */
	SuggestionsPopover.prototype._getButtonToolbar = function() {
		var oShowMoreButton = this._getShowMoreButton();

		return this._oButtonToolbar || (this._oButtonToolbar = new Toolbar({
			content: [
				new ToolbarSpacer(),
				oShowMoreButton
			]
		}));
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

			if (oInput.getMaxSuggestionWidth()) {
				this._oPopover.setContentWidth(oInput.getMaxSuggestionWidth());
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
		if (!this._oInput._bFullScreen) {
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
	 * Helper function that refreshes list all items.
	 */
	SuggestionsPopover.prototype._refreshListItems = function () {
		var oInput = this._oInput;
		var bShowSuggestion = oInput.getShowSuggestion();
		var oRb = oInput._oRb;
		oInput._iPopupListSelectedIndex = -1;

		if (!bShowSuggestion ||
			!oInput._bShouldRefreshListItems ||
			!oInput.getDomRef() ||
			(!oInput._bUseDialog && !oInput.$().hasClass("sapMInputFocused"))) {
			return false;
		}

		var oItem,
			aItems = oInput.getSuggestionItems(),
			aTabularRows = oInput.getSuggestionRows(),
			sTypedChars = oInput.getDOMValue() || "",
			oList = this._oList,
			bFilter = oInput.getFilterSuggests(),
			aHitItems = [],
			iItemsLength = 0,
			oPopup = this._oPopover,
			oListItemDelegate = {
				ontouchstart : function(oEvent) {
					(oEvent.originalEvent || oEvent)._sapui_cancelAutoClose = true;
				}
			},
			oListItem,
			i;

		// only destroy items in simple suggestion mode
		if (this._oList) {
			if (this._oList instanceof Table) {
				oList.removeSelections(true);
			} else {
				//TODO: avoid flickering when !bFilter
				oList.destroyItems();
			}
		}

		// hide suggestions list/table if the number of characters is smaller than limit
		if (sTypedChars.length < oInput.getStartSuggestion()) {
			// when the input has no value, close the Popup when not runs on the phone because the opened dialog on phone shouldn't be closed.
			if (!oInput._bUseDialog) {
				oInput._iPopupListSelectedIndex = -1;
				oInput.cancelPendingSuggest();
				oPopup.close();
			} else {
				// hide table on phone when value is empty
				if (oInput._hasTabularSuggestions() && this._oList) {
					this._oList.addStyleClass("sapMInputSuggestionTableHidden");
				}
			}

			oInput.$("SuggDescr").text(""); // clear suggestion text
			oInput.$("inner").removeAttr("aria-haspopup");
			oInput.$("inner").removeAttr("aria-activedescendant");
			return false;
		}

		if (oInput._hasTabularSuggestions()) {
			// show list on phone (is hidden when search string is empty)
			if (oInput._bUseDialog && this._oList) {
				this._oList.removeStyleClass("sapMInputSuggestionTableHidden");
			}

			// filter tabular items
			for (i = 0; i < aTabularRows.length; i++) {
				if (!bFilter || oInput._fnFilter(sTypedChars, aTabularRows[i])) {
					aTabularRows[i].setVisible(true);
					aHitItems.push(aTabularRows[i]);
				} else {
					aTabularRows[i].setVisible(false);
				}
			}
			this._oSuggestionTable.invalidate();
		} else {
			// filter standard items
			var bListItem = (aItems[0] instanceof ListItem ? true : false);
			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				if (!bFilter || oInput._fnFilter(sTypedChars, oItem)) {
					if (bListItem) {
						oListItem = new DisplayListItem(oItem.getId() + "-dli");
						oListItem.setLabel(oItem.getText());
						oListItem.setValue(oItem.getAdditionalText());
					} else {
						oListItem = new StandardListItem(oItem.getId() + "-sli");
						oListItem.setTitle(oItem.getText());
					}

					oListItem.setType(oItem.getEnabled() ? ListType.Active : ListType.Inactive);
					oListItem._oItem = oItem;
					oListItem.addEventDelegate(oListItemDelegate);
					aHitItems.push(oListItem);
				}
			}
		}

		iItemsLength = aHitItems.length;
		var sAriaText = "";
		if (iItemsLength > 0) {
			// add items to list
			if (iItemsLength == 1) {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_ONE_HIT");
			} else {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_MORE_HITS", iItemsLength);
			}
			oInput.$("inner").attr("aria-haspopup", "true");

			if (!oInput._hasTabularSuggestions()) {
				for (i = 0; i < iItemsLength; i++) {
					oList.addItem(aHitItems[i]);
				}
			}

			if (!oInput._bUseDialog) {
				if (oInput._sCloseTimer) {
					clearTimeout(oInput._sCloseTimer);
					oInput._sCloseTimer = null;
				}
				if (!oPopup.isOpen() && !oInput._sOpenTimer && (oInput.getValue().length >= oInput.getStartSuggestion())) {
					oInput._sOpenTimer = setTimeout(function() {
						oInput._sOpenTimer = null;
						oPopup.open();
					}, 0);
				}
			}
		} else {
			sAriaText = oRb.getText("INPUT_SUGGESTIONS_NO_HIT");
			oInput.$("inner").removeAttr("aria-haspopup");
			oInput.$("inner").removeAttr("aria-activedescendant");

			if (!oInput._bUseDialog) {
				if (oPopup.isOpen()) {
					oInput._sCloseTimer = setTimeout(function() {
						oInput._iPopupListSelectedIndex = -1;
						oInput.cancelPendingSuggest();
						oPopup.close();
					}, 0);
				}
			} else {
				// hide table on phone when there are no items to display
				if (oInput._hasTabularSuggestions() && this._oList) {
					this._oList.addStyleClass("sapMInputSuggestionTableHidden");
				}
			}
		}

		// update Accessibility text for suggestion
		oInput.$("SuggDescr").text(sAriaText);
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
		if (oInput._isIncrementalType()){
			oEvent.setMarked();
		}

		if (!this._oPopover || !this._oPopover.isOpen()) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		var bFirst = false,
			oList = this._oList,
			aItems = oInput.getSuggestionItems(),
			aListItems = oList.getItems(),
			iSelectedIndex = oInput._iPopupListSelectedIndex,
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
			if (oInput._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
				// if first item is visible, don't go into while loop
				iOldIndex = iSelectedIndex;
				bFirst = true;
			} else {
				// detect first visible item with while loop
				sDir = "down";
			}
		}

		if (sDir === "down") {
			while (iSelectedIndex < aListItems.length - 1 && (!bFirst || !oInput._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex + iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		} else {
			while (iSelectedIndex > 0 && (!bFirst || !aListItems[iSelectedIndex].getVisible() || !oInput._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex - iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		}

		if (!oInput._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
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
			var bListItem = (aItems[0] instanceof ListItem ? true : false);
			if (bListItem) {
				// for two value suggestions we use the item label
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getLabel());
			} else {
				// otherwise we use the item title
				sNewValue = oInput._getInputValue(aListItems[iSelectedIndex].getTitle());
			}
		}

		// setValue isn't used because here is too early to modify the lastValue of input
		oInput.setDOMValue(sNewValue);

		// memorize the value set by calling jQuery.val, because browser doesn't fire a change event when the value is set programmatically.
		oInput._sSelectedSuggViaKeyboard = sNewValue;

		oInput._doSelect();
		oInput._iPopupListSelectedIndex = iSelectedIndex;
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
			return;
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
					var oSelectedListItem = oEvent.getParameter("listItem");
					oInput.setSelectionRow(oSelectedListItem, true);
				}
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
			value = this._oInput.getValue().toLowerCase(),
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

		if (!this._oInput.getEnableSuggestionsHighlighting()) {
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

		if (!this._oInput.getEnableSuggestionsHighlighting()) {
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

	return SuggestionsPopover;
});