/*!
 * ${copyright}
 */

sap.ui.define([
	'./ComboBoxTextField',
	'./ComboBoxBase',
	'./List',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/Item',
	'./StandardListItem',
	'./ComboBoxRenderer',
	'sap/ui/base/ManagedObjectObserver',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"./Toolbar",
	"sap/base/assert",
	"sap/base/security/encodeXML",
	"sap/ui/core/Core",
	"sap/ui/dom/jquery/control" // jQuery Plugin "control"
],
	function(
		ComboBoxTextField,
		ComboBoxBase,
		List,
		library,
		Device,
		Item,
		StandardListItem,
		ComboBoxRenderer,
		ManagedObjectObserver,
		containsOrEquals,
		KeyCodes,
		Toolbar,
		assert,
		encodeXML,
		core,
		jQuery
	) {
		"use strict";

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		// shortcut for sap.m.ListMode
		var ListMode = library.ListMode;

		/**
		 * Constructor for a new ComboBox.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A drop-down list for selecting and filtering values.
		 * <h3>Overview</h3>
		 * The control represents a drop-down menu with a list of the available options and a text input field to narrow down the options.
		 * <h3>Structure</h3>
		 * The combo-box consists of the following elements:
		 * <ul>
		 * <li> Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.</li>
		 * <li> Drop-down arrow - expands\collapses the option list.</li>
		 * <li> Option list - the list of available options.</li>
		 * </ul>
		 * By setting the <code>showSecondaryValues</code> property, the combo box can display an additional value for each option (if there is one).
		 * <h3>Usage</h3>
		 * <h4>When to use:</h4>
		 * <ul>
		 * <li>You need to select only one item in a long list of options (between 13 and 200) or your custom user input.</li>
		 * </ul>
		 * <h4>When not to use:</h4>
		 * <ul>
		 * <li>You need to select between only two options. Use a {@link sap.m.Switch switch} control instead.</li>
		 * <li>You need to select between up to 12 options. Use a {@link sap.m.Select select} control instead.</li>
		 * <li>You need to select between more than 200 options. Use a {@link sap.m.Input input} control with value help instead.</li>
		 * </ul>
		 * <h3>Responsive Behavior</h3>
		 * <ul>
		 * <li>The width of the option list adapts to its content. The minimum width is the input field plus the drop-down arrow.</li>
		 * <li>There is no horizontal scrolling in the option list. Entries in the list that are too long will be truncated.</li>
		 * <li>On phone devices the combo box option list opens a dialog.</li>
		 * </ul>
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @extends sap.m.ComboBoxBase
		 * @public
		 * @since 1.22
		 * @alias sap.m.ComboBox
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/combo-box/ Combo Box}
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var ComboBox = ComboBoxBase.extend("sap.m.ComboBox", /** @lends sap.m.ComboBox.prototype */ {
			metadata: {
				library: "sap.m",
				designtime: "sap/m/designtime/ComboBox.designtime",
				properties: {

					/**
					 * Key of the selected item.
					 *
					 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
					 */
					selectedKey: {
						type: "string",
						group: "Data",
						defaultValue: ""
					},

					/**
					 * ID of the selected item.
					 */
					selectedItemId: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},

					/**
					 * Indicates whether the filter should check in both the <code>text</code> and the <code>additionalText</code> property of the
					 * {@link sap.ui.core.ListItem} for the suggestion.
					 * @since 1.46
					 */
					filterSecondaryValues: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					}
				},
				associations: {

					/**
					 * Sets or retrieves the selected item from the aggregation named items.
					 */
					selectedItem: {
						type: "sap.ui.core.Item",
						multiple: false
					}
				},
				events: {

					/**
					 * This event is fired when the value in the text input field is changed in combination with one of
					 * the following actions:
					 *
					 * <ul>
					 * 	<li>The focus leaves the text input field</li>
					 * 	<li>The <i>Enter</i> key is pressed</li>
					 * 	<li>An item in the list is selected</li>
					 * </ul>
					 *
					 */
					change: {
						parameters: {

							/**
							 * The new <code>value</code> of the <code>control</code>
							 */
							value: {
								type: "string"
							},

							/**
							 * Indicates whether the change event was caused by selecting an item in the list
							 */
							itemPressed: {
								type: "boolean"
							}
						}
					},

					/**
					 * This event is fired when the user types something that matches with an item in the list;
					 * it is also fired when the user presses on a list item, or when navigating via keyboard.
					 */
					selectionChange: {
						parameters: {

							/**
							 * The selected item.
							 */
							selectedItem: {
								type: "sap.ui.core.Item"
							}
						}
					}
				},
				dnd: { draggable: false, droppable: true }
			}
		});

		/* =========================================================== */
		/* Private methods                                             */
		/* =========================================================== */

		function fnHandleKeyboardNavigation(oControl, oItem) {

			if (!oItem) {
				return;
			}

			var oDomRef = oControl.getFocusDomRef(),
				iSelectionStart = oControl._getSelectionRange().start,
				sTypedValue = oDomRef.value.substring(0, oDomRef.selectionStart),
				bShouldResetSelectionStart = oControl._shouldResetSelectionStart(oItem),
				oSelectedItem = oControl.getSelectedItem(),
				bGroupHeaderItem = oItem.isA("sap.ui.core.SeparatorItem"),
				oListItem;

			oControl.setSelection(oItem);

			if (oItem !== oSelectedItem && !bGroupHeaderItem) {
				oControl.updateDomValue(oItem.getText());

				oControl.fireSelectionChange({ selectedItem: oItem });

				// update the selected item after the change event is fired (the selection may change)
				oItem = oControl.getSelectedItem();

				if (bShouldResetSelectionStart) {
					iSelectionStart = 0;
				}

				oControl.selectText(iSelectionStart, oDomRef.value.length);

				oControl._bIsLastFocusedItemHeader = false;
			}

			if (bGroupHeaderItem) {
				// when visual focus moves to the group header item
				// we should deselect and leave only the input typed in by the user
				oControl.setSelectedItem(null);
				oControl.fireSelectionChange({ selectedItem: null });

				oControl.updateDomValue(sTypedValue);
				oControl._bIsLastFocusedItemHeader = true;

				oControl._handleAriaActiveDescendant(oItem);
				oControl._getGroupHeaderInvisibleText().setText(oControl._oRb.getText("LIST_ITEM_GROUP_HEADER") + " " + oItem.getText());
			}

			oListItem = this.getListItem(oItem);
			oControl.handleListItemsVisualFocus(oListItem);

			if (oControl.isOpen()) {
				oControl.removeStyleClass("sapMFocus");
				oControl._getList().addStyleClass("sapMListFocus");
			} else {
				oControl.addStyleClass("sapMFocus");
			}

			oControl.scrollToItem(oItem);
		}

		/**
		 * Scrolls an item into the visual viewport.
		 * @param {object} oItem The item to be scrolled
		 * @private
		 */
		ComboBox.prototype.scrollToItem = function(oItem) {
			var oSuggestionsPopover = this._getSuggestionsPopover(),
				oPickerDomRef = oSuggestionsPopover && oSuggestionsPopover._getScrollableContent(),
				oListItem = this.getListItem(oItem),
				oItemDomRef = oItem && oListItem && oListItem.getDomRef();

			if (!oSuggestionsPopover || !oPickerDomRef || !oItemDomRef) {
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

		function fnSelectTextIfFocused(iStart, iEnd) {
			if (document.activeElement === this.getFocusDomRef()) {
				this.selectText(iStart, iEnd);
			}
		}

		function fnSelectedItemOnViewPort(bIsListHidden) {
			var oItem = this.getSelectedItem(),
				oListItem = this.getListItem(oItem),
				oItemDomRef = oItem && oListItem && oListItem.getDomRef(),
				oItemOffsetTop = oItemDomRef && oItemDomRef.offsetTop,
				oItemOffsetHeight = oItemDomRef && oItemDomRef.offsetHeight,
				oSuggestionsPopover = this._getSuggestionsPopover(),
				oPickerDomRef = oSuggestionsPopover && oSuggestionsPopover._getScrollableContent(),
				oPickerClientHeight = oPickerDomRef.clientHeight;

			//check if the selected item is on the viewport
			if (oItem && ((oItemOffsetTop + oItemOffsetHeight) > (oPickerClientHeight))) {

				// hide the list to scroll to the selected item
				if (!bIsListHidden) {
					this._getList().$().css("visibility", "hidden");
				} else {

					// scroll to the selected item minus half the height of an item showing partly the
					// previous one, to indicate that there are items above and show the list
					oPickerDomRef.scrollTop = oItemOffsetTop - oItemOffsetHeight / 2;
					this._getList().$().css("visibility", "visible");
				}
			}
		}

		/**
		 * Handles the virtual focus of items.
		 *
		 * @param {sap.ui.core.Item | null} vItem The item that should be focused
		 * @private
		 * @since 1.32
		 */
		ComboBox.prototype._handleAriaActiveDescendant = function(vItem) {
			var oDomRef = this.getFocusDomRef(),
				oListItem = this.getListItem(vItem),
				sActivedescendant = "aria-activedescendant";

			if (oDomRef) {

				// the aria-activedescendant attribute is set when the list is rendered
				if (vItem && oListItem && oListItem.getDomRef() && this.isOpen()) {
					oDomRef.setAttribute(sActivedescendant, oListItem.getId());
				} else {
					oDomRef.removeAttribute(sActivedescendant);
				}
			}
		};

		/**
		 * Gets the text of the selected item.
		 *
		 * @param {sap.ui.core.Item | null} vItem The item which text should be taken
		 * @returns {string} Items text or empty string
		 * @private
		 */
		ComboBox.prototype._getSelectedItemText = function(vItem) {
			vItem = vItem || this.getSelectedItem();

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			if (vItem) {
				return vItem.getText();
			}

			return "";
		};

		/**
		 * Sets the item's visibility.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be set visible or not
		 * @param {Boolean} bVisible Should the item be visible or not
		 * @private
		 */
		ComboBox.prototype._setItemVisibility = function(oItem, bVisible) {
			var $OItem = oItem && this.getListItem(oItem).$(),
				CSS_CLASS = "sapMSelectListItemBaseInvisible";

			if (bVisible) {
				oItem.bVisible = true;
				$OItem.length && $OItem.removeClass(CSS_CLASS);
			} else {
				oItem.bVisible = false;
				$OItem.length && $OItem.addClass(CSS_CLASS);
			}
		};

		/**
		 * Sets the selected item by its index.
		 *
		 * @param {int} iIndex The item index
		 * @param {sap.ui.core.Item[]} _aItems The item array
		 * @private
		 */
		ComboBox.prototype.setSelectedIndex = function(iIndex, _aItems /* only for internal usage */) {
			var oItem;
			_aItems = _aItems || this.getItems();

			// constrain the new index
			iIndex = (iIndex > _aItems.length - 1) ? _aItems.length - 1 : Math.max(0, iIndex);
			oItem = _aItems[iIndex];

			if (oItem) {

				this.setSelection(oItem);
			}
		};

		/**
		 * Reverts the selection of the ComboBox to the previously selected item before the picker was opened.
		 *
		 * @private
		 */
		ComboBox.prototype.revertSelection = function() {
			var sPickerTextFieldValue,
				oPickerTextField = this.getPickerTextField();

			this.setSelectedItem(this._oSelectedItemBeforeOpen);
			this.setValue(this._sValueBeforeOpen);

			if (this.getSelectedItem() === null) {
				sPickerTextFieldValue = this._sValueBeforeOpen;
			} else {
				sPickerTextFieldValue = this._oSelectedItemBeforeOpen.getText();
			}

			oPickerTextField && oPickerTextField.setValue(sPickerTextFieldValue);
		};

		/**
		 * Filters the items of the ComboBox
		 *
		 * @param {object} mOptions Settings for filtering
		 * @private
		 * @returns {sap.ui.core.Item[]} Array of filtered items
		 */
		ComboBox.prototype.filterItems = function(mOptions) {
			var aItems = this.getItems(),
				aFilteredItems = [],
				aFilteredItemsByText = [],
				bFilterAdditionalText = mOptions.properties.indexOf("additionalText") > -1,
				fnFilter = this.fnFilter || ComboBoxBase.DEFAULT_TEXT_FILTER,
				aGroups = [],
				bGrouped = false;

			this._oFirstItemTextMatched = null;

			aItems.forEach(function (oItem) {
				if (oItem.isA("sap.ui.core.SeparatorItem")) {
					// --- If the separator item is considered only for visual separation
					// Separator items were not part of the filtering before. So in order to keep
					// the behaviour the same, those items are not shown in the filtered list
					if (!oItem.getText()) {
						this.getListItem(oItem).setVisible(false);
						return;
					}

					// --- If the SeparatorItem is considered a group header
					aGroups.push({
						separator: oItem,
						show: false
					});

					bGrouped = true;
					this.getListItem(oItem).setVisible(false);

					return;
				}

				var bMatchedByText = fnFilter.call(this, mOptions.value, oItem, "getText");
				var bMatchedByAdditionalText = fnFilter.call(this, mOptions.value, oItem, "getAdditionalText");

				if ((bMatchedByText || bMatchedByAdditionalText) && bGrouped) {
					aGroups[aGroups.length - 1].show = true;
					bGrouped = false;
				}

				if (bMatchedByText) {
					aFilteredItemsByText.push(oItem);
					aFilteredItems.push(oItem);
				} else if (bMatchedByAdditionalText && bFilterAdditionalText) {
					aFilteredItems.push(oItem);
				}
			}.bind(this));

			aItems.forEach(function (oItem) {
				if (oItem.isA("sap.ui.core.SeparatorItem")) {
					return;
				}

				var bItemMached = aFilteredItems.indexOf(oItem) > -1;
				var bItemTextMached = aFilteredItemsByText.indexOf(oItem) > -1;

				if (!this._oFirstItemTextMatched && bItemTextMached) {
					this._oFirstItemTextMatched = oItem;
				}

				this.getListItem(oItem).setVisible(bItemMached);
			}, this);

			aGroups.forEach(function (oGroupItem) {
				if (oGroupItem.show) {
					this.getListItem(oGroupItem.separator).setVisible(true);
				}
			}.bind(this));

			return aFilteredItems;
		};


		/**
		 * Filters all items with 'starts with' filter
		 *
		 * @param {string} sInputValue Value to start item
		 * @param {string} sMutator A Method to be called on an item to retrieve its value (could be getText or getAdditionalText)
		 * @private
		 * @returns {sap.ui.core.Item[]} Array of filtered items
		 */
		ComboBox.prototype._filterStartsWithItems = function (sInputValue, sMutator) {
			var sLowerCaseValue = sInputValue.toLowerCase();
			var aItems = this.getItems(),
				aFilteredItems = aItems.filter(function (oItem) {
					return oItem[sMutator] && oItem[sMutator]().toLowerCase().startsWith(sLowerCaseValue);
				});

			return aFilteredItems;
		};

		/**
		 * Gets the fields that will be used for filtering the ComboBox's items.
		 *
		 * @private
		 * @returns {string[]} Array of fields to be filtered
		 */
		ComboBox.prototype._getFilters = function () {
			return this.getFilterSecondaryValues() ? ["text", "additionalText"] : ["text"];
		};

		/**
		 * Returns the next focusable item when keyboard navigation is in place.
		 *
		 * @param {boolean} bDirectionDown The direction of next selected item. <code>true</code> = down, <code>false</code> = up
		 * @returns {sap.ui.core.Item|sap.ui.core.SeparatorItem} The next item to be focused.
		 * @private
		 */
		ComboBox.prototype.getNextFocusableItem = function (bDirectionDown) {
			var aAllSelectableItems = this.getSelectableItems(),
				aSelectableNotSeparatorItems = this.getNonSeparatorSelectableItems(aAllSelectableItems),
				bFocusInInput = this.hasStyleClass("sapMFocus"),
				oItemToUse = this.getSelectedItem() || this._getItemByListItem(this._oLastFocusedListItem),
				oNextSelectableItem;

			if (bFocusInInput && this.isOpen()) {
				// Visual focus on input and the picker is opened
				oNextSelectableItem = aAllSelectableItems[0];
			} else if (bFocusInInput) {
				// Visual focus on input
				oNextSelectableItem = aSelectableNotSeparatorItems[aSelectableNotSeparatorItems.indexOf(oItemToUse) + (bDirectionDown ? 1 : -1)];
			} else {
				// Visual focus is on the list
				oNextSelectableItem = aAllSelectableItems[aAllSelectableItems.indexOf(oItemToUse) + (bDirectionDown ? 1 : -1)];
			}

			return oNextSelectableItem;
		};

		/**
		 * Filters out the separator items form the selectable items of the ComboBox.
		 *
		 * @param {sap.ui.core.Item[]} aItems Array of items to be filtered.
		 * @returns {sap.ui.core.Item[]} Array of non separator items.
		 * @private
		 */
		ComboBox.prototype.getNonSeparatorSelectableItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return !oItem.isA("sap.ui.core.SeparatorItem");
			});
		};

		/**
		 * Checks whether the text of the item starts with the input in the text field of the control.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be checked against.
		 * @param {string} sTypedValue The input from the field.
		 * @returns {boolean} Whether the item starts with the given input.
		 * @private
		 */
		ComboBox.prototype._itemsTextStartsWithTypedValue = function (oItem, sTypedValue) {
			if (!oItem || typeof sTypedValue != "string" || sTypedValue == "") {
				return false;
			}
			return oItem.getText().toLowerCase().startsWith(sTypedValue.toLowerCase());
		};

		/**
		 * Checks whether the starting point of the selection in the input field should be reset.
		 *
		 * @param {sap.m.ComboBox} oControl The control.
		 * @param {sap.ui.core.Item|sap.ui.core.SeparatorItem} oItem The item to be checked.
		 * @returns {boolean} Whether the selection should be reset
		 * @private
		 */
		ComboBox.prototype._shouldResetSelectionStart = function (oItem) {
			var oDomRef = this.getFocusDomRef(),
				oSelectionRange = this._getSelectionRange(),
				bIsTextSelected = oSelectionRange.start !== oSelectionRange.end,
				sTypedValue = oDomRef.value.substring(0, oSelectionRange.start),
				bItemsTextStartsWithTypedValue = this._itemsTextStartsWithTypedValue(oItem, sTypedValue);

			return !(bItemsTextStartsWithTypedValue && (bIsTextSelected || this._bIsLastFocusedItemHeader));
		};

		/**
		 * Returns object containing the 0-based indexes of the first and last selected characters of the ComboBox
		 *
		 * @returns {int} The selection start index
		 * @private
		 */
		ComboBox.prototype._getSelectionRange = function () {
			var oDomRef = this.getFocusDomRef(),
				sValue = this.getValue(),
				iSelectionStart = oDomRef.selectionStart,
				iSelectionEnd = oDomRef.selectionEnd,
				oRange = {start: iSelectionStart, end: iSelectionEnd};

			if (!(Device.browser.msie || Device.browser.edge)) {
				return oRange;
			}

			// IE and Edge
			if (this._bIsLastFocusedItemHeader) {
				oRange.start = sValue.length;
				oRange.end = sValue.length;
			}

			return oRange;
		};

		/**
		 * Handles the change of the visual focus from the previous to the next list item.
		 *
		 * @param {sap.m.ListItemBase} oListItem The list item to be focused.
		 * @private
		 */
		ComboBox.prototype.handleListItemsVisualFocus = function (oListItem) {
			if (this._oLastFocusedListItem) {
				this._oLastFocusedListItem.removeStyleClass("sapMLIBFocused");
				this._oLastFocusedListItem = null;
			}

			if (oListItem) {
				this._oLastFocusedListItem = oListItem;
				oListItem.addStyleClass("sapMLIBFocused");
			}
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * This method will be called when the ComboBox is initially created.
		 *
		 * @protected
		 */
		ComboBox.prototype.init = function() {
			this._oRb = core.getLibraryResourceBundle("sap.m");
			ComboBoxBase.prototype.init.apply(this, arguments);

			this.bOpenValueStateMessage = true;
			this._sValueBeforeOpen = "";

			// stores the value of the input before opening the picker
			this._sInputValueBeforeOpen = "";

			// the last selected item before opening the picker
			this._oSelectedItemBeforeOpen = null;

			// the first item with matching text property if such exists
			this._oFirstItemTextMatched = null;

			// indicated if the ComboBox is already focused
			this.bIsFocused = false;

			if (Device.system.phone) {
				this.attachEvent("_change", this.onPropertyChange, this);
			}

			// holds reference to the last focused GroupHeaderListItem if such exists
			this._oLastFocusedListItem = null;
			this._bIsLastFocusedItemHeader = null;

			this._oItemObserver = new ManagedObjectObserver(this._forwardItemProperties.bind(this));
		};

		/**
		 * This event handler will be called before the ComboBox is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRendering = function() {
			ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
			this.synchronizeSelection();
		};

		/**
		 * Fill the list of items.
		 *
		 * @private
		 */
		ComboBox.prototype._fillList = function() {
			var oList = this._getList(),
				aItems, oListItem, aItemsLength, i, oLastSelectedItem;

			if (!oList) {
				return;
			}

			// As the list items are destroyed, the reference kept here will prevent the item's destruction.
			// Also we need to know the last selected item so that we can determine what will be the next
			// item which should be focused upon navigation.
			if (this._oLastFocusedListItem) {
				oLastSelectedItem = this._getItemByListItem(this._oLastFocusedListItem);
			}

			oList.destroyItems();
			aItems = this.getItems();

			if (this._sInputValueBeforeOpen) {
				aItems = this.filterItems({
					properties: this._getFilters(),
					value: this._sInputValueBeforeOpen
				});
			}

			for (i = 0, aItemsLength = aItems.length; i < aItemsLength; i++) {
				// add a private property to the added item containing a reference
				// to the corresponding mapped item
				oListItem = this._mapItemToListItem(aItems[i]);

				// add the mapped item type of sap.m.StandardListItem to the list
				oList.addAggregation("items", oListItem, true);
			}

			if (oLastSelectedItem) {
				this._oLastFocusedListItem = this.getListItem(oLastSelectedItem);
			}
		};

		/**
		 * This method will be called when the ComboBox is being destroyed.
		 *
		 * @protected
		 */
		ComboBox.prototype.exit = function () {
			ComboBoxBase.prototype.exit.apply(this, arguments);
			this._oRb = null;

			this._oSelectedItemBeforeOpen = null;
			this._oFirstItemTextMatched = null;
			this._oLastFocusedListItem = null;

			if (this._oSuggestionPopover) {
				if (this._oPickerCustomHeader) {
					this._oPickerCustomHeader.destroy();
					this._oPickerCustomHeader = null;
				}
				this._oSuggestionPopover.destroy();
				this._oSuggestionPopover = null;
			}

			if (this._oItemObserver) {
				this._oItemObserver.disconnect();
				this._oItemObserver = null;
			}
		};

		/**
		 * This event handler will be called before the ComboBox's Picker is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		/**
		 * This event handler will be called before the ComboBox' Picker of type <code>sap.m.Popover</code> is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRenderingDropdown = function() {
			var oPopover = this.getPicker(),
				sWidth = (this.$().outerWidth() / parseFloat(library.BaseFontSize)) + "rem";

			if (oPopover) {
				oPopover.setContentMinWidth(sWidth);
			}
		};

		/**
		 * This event handler will be called before the ComboBox Picker's List is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRenderingList = function() {

			if (this.bProcessingLoadItemsEvent) {
				var oList = this._getList(),
					oFocusDomRef = this.getFocusDomRef();

				if (oList) {
					oList.setBusy(true);
				}

				if (oFocusDomRef) {
					oFocusDomRef.setAttribute("aria-busy", "true");
				}
			}
		};

		/**
		 * This event handler will be called after the ComboBox's Picker is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["onAfterRendering" + this.getPickerType()];

			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);

			// hide the list while scrolling to selected item, if necessary
			fnSelectedItemOnViewPort.call(this, false);
		};

		/**
		 * This event handler will be called after the ComboBox Picker's List is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterRenderingList = function() {
			var oSelectedItem = this.getSelectedItem(),
				oSelectedListItem = this.getListItem(oSelectedItem);

			if (this.bProcessingLoadItemsEvent && (this.getItems().length === 0)) {
				return;
			}

			var oList = this._getList(),
				oFocusDomRef = this.getFocusDomRef();

			this._highlightList(this._sInputValueBeforeOpen);

			if (oSelectedItem) {
				oList.setSelectedItem(oSelectedListItem);
				this.handleListItemsVisualFocus(oSelectedListItem);
			}

			if (oList) {
				oList.setBusy(false);
			}

			if (oFocusDomRef) {
				oFocusDomRef.removeAttribute("aria-busy");
			}
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handles the <code>input</code> event on the input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBox.prototype.oninput = function(oEvent) {
			ComboBoxBase.prototype.oninput.apply(this, arguments);

			this.syncPickerContent();

			// notice that the input event can be buggy in some web browsers,
			// @see sap.m.InputBase#oninput
			if (oEvent.isMarked("invalid")) {
				return;
			}

			this.loadItems(function() {
				this.handleInputValidation(oEvent, this.isComposingCharacter());
			}, {
					name: "input",
					busyIndicator: false
				}
			);

			// if the loadItems event is being processed,
			// we need to open the dropdown list to show the busy indicator
			if (this.bProcessingLoadItemsEvent && (this.getPickerType() === "Dropdown")) {
				this.open();
			}

			// always focus input field when typing in it
			this.addStyleClass("sapMFocus");
			this._getList().removeStyleClass("sapMListFocus");

			// if recommendations were shown - add the icon pressed style
			if (this._getItemsShownWithFilter()) {
				this.toggleIconPressedStyle(true);
			}
		};

		/**
		 * Handles the input event on the input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @param {boolean} bCompositionEvent True if the control is in composing state
		 * @private
		 */
		ComboBox.prototype.handleInputValidation = function (oEvent, bCompositionEvent) {
			var oSelectedItem = this.getSelectedItem(),
				sValue = oEvent.target.value,
				bEmptyValue = sValue === "",
				oControl = oEvent.srcControl,
				aVisibleItems,
				bToggleOpenState = (this.getPickerType() === "Dropdown");

			if (bEmptyValue && !this.bOpenedByKeyboardOrButton && !this.isPickerDialog()) {
				aVisibleItems = this.getItems();
			} else {
				aVisibleItems = this.filterItems({
					properties: this._getFilters(),
					value: sValue
				});
			}

			var bItemsVisible = !!aVisibleItems.length;
			var oFirstVisibleItem = aVisibleItems[0]; // first item that matches the value

			if (!bEmptyValue && oFirstVisibleItem && oFirstVisibleItem.getEnabled()) {
				this.handleTypeAhead(oControl, aVisibleItems, sValue, bCompositionEvent);
			}

			if (bEmptyValue || !bItemsVisible ||
				(!oControl._bDoTypeAhead && (this._getSelectedItemText() !== sValue))) {
				this.setSelection(null);

				if (oSelectedItem !== this.getSelectedItem()) {
					this.fireSelectionChange({
						selectedItem: this.getSelectedItem()
					});
				}
			}

			this._sInputValueBeforeOpen = sValue;

			if (this.isOpen()) {
				setTimeout(function () {
						this._highlightList(sValue);
					}.bind(this));
				}

			if (bItemsVisible) {
				if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
					this.close();
				} else if (bToggleOpenState) {
					this.open();
					this.scrollToItem(this.getSelectedItem());
				}
			} else if (this.isOpen()) {
				if (bToggleOpenState && !this.bOpenedByKeyboardOrButton) {
					this.close();
				}
			} else {
				this.clearFilter();
			}
		};

		/**
		 * Handles the type ahead functionality on the input field.
		 *
		 * @param {sap.m.ComboBoxTextField} oInput The input control
		 * @param {sap.ui.core.Item[]} aItems The array of items
		 * @param {string} sValue The input text value
		 * @param {boolean} bCompositionEvent True if the control is in composing state
		 * @private
		 */
		ComboBox.prototype.handleTypeAhead = function (oInput, aItems, sValue, bCompositionEvent) {
			// filtered items intersercted with starts with items by text
			var aCommonStartsWithItems = this.intersectItems(this._filterStartsWithItems(sValue, 'getText'), aItems);
			var bSearchBoth = this.getFilterSecondaryValues();
			var bDesktopPlatform = Device.system.desktop;
			var oSelectedItem = this.getSelectedItem();

			if (oInput._bDoTypeAhead) {
				var aCommonAdditionalTextItems = this.intersectItems(this._filterStartsWithItems(sValue, 'getAdditionalText'), aItems);

				if (bSearchBoth && !aCommonStartsWithItems[0] && aCommonAdditionalTextItems[0]) {

					!bCompositionEvent && oInput.updateDomValue(aCommonAdditionalTextItems[0].getAdditionalText());
					this.setSelection(aCommonAdditionalTextItems[0]);

				} else if (aCommonStartsWithItems[0]) {
					!bCompositionEvent && oInput.updateDomValue(aCommonStartsWithItems[0].getText());
					this.setSelection(aCommonStartsWithItems[0]);
				}
			} else {
				this.setSelection(aCommonStartsWithItems[0]);
			}

			if (oSelectedItem !== this.getSelectedItem()) {
				this.fireSelectionChange({
					selectedItem: this.getSelectedItem()
				});
			}

			if (oInput._bDoTypeAhead) {

				if (bDesktopPlatform) {
					fnSelectTextIfFocused.call(oInput, sValue.length, oInput.getValue().length);
				} else {
					// timeout required for an Android and Windows Phone bug
					setTimeout(fnSelectTextIfFocused.bind(oInput, sValue.length, oInput.getValue().length), 0);
				}
			}

			// always focus input field when typing in it
			this.addStyleClass("sapMFocus");
			this._getList().removeStyleClass("sapMListFocus");
		};

		/**
		 * Handles the <code>selectionChange</code> event on the list.
		 *
		 * @param {sap.ui.base.Event} oControlEvent The control event
		 * @private
		 */
		ComboBox.prototype.onSelectionChange = function(oControlEvent) {
			var oItem = this._getItemByListItem(oControlEvent.getParameter("listItem")),
				mParam = this.getChangeEventParams(),
				bSelectedItemChanged = (oItem !== this.getSelectedItem());

			this.updateDomValue(oItem.getText());
			this.setSelection(oItem);
			this.fireSelectionChange({
				selectedItem: this.getSelectedItem()
			});

			if (bSelectedItemChanged) {
				mParam.itemPressed = true;
				this.onChange(null, mParam);
			}
		};

		/**
		 * Handles the <code>ItemPress</code> event on the list.
		 *
		 * @param {sap.ui.base.Event} oControlEvent The control event
		 * @since 1.32.4
		 * @private
		 */
		ComboBox.prototype.onItemPress = function (oControlEvent) {
			var oListItem = oControlEvent.getParameter("listItem"),
				sText = oListItem.getTitle(),
				mParam = this.getChangeEventParams(),
				bSelectedItemChanged = (oListItem !== this.getListItem(this.getSelectedItem()));

			if (oListItem.isA("sap.m.GroupHeaderListItem")) {
				return;
			}

			this.handleListItemsVisualFocus(oListItem);
			this.updateDomValue(sText);

			// if a highlighted item is pressed fire change event
			if (!bSelectedItemChanged) {
				mParam.itemPressed = true;
				this.onChange(null, mParam);
			}

			this.setProperty("value", sText, true);

			// deselect the text and move the text cursor at the endmost position
			if (this.getPickerType() === "Dropdown" && !this.isPlatformTablet()) {
				this.selectText.bind(this, this.getValue().length, this.getValue().length);
			}

			this.close();
		};

		/**
		 * This event handler is called before the picker popup is opened.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeOpen = function() {
			ComboBoxBase.prototype.onBeforeOpen.apply(this, arguments);
			var fnPickerTypeBeforeOpen = this["onBeforeOpen" + this.getPickerType()],
				oDomRef = this.getFocusDomRef();

			// the dropdown list can be opened by calling the .open() method (without
			// any end user interaction), in this case if items are not already loaded
			// and there is an {@link #loadItems} event listener attached, the items should be loaded
			if (this.hasLoadItemsEventListeners() && !this.bProcessingLoadItemsEvent) {
				this.loadItems();
			}

			if (oDomRef) {

				// expose a parent/child contextual relationship to assistive technologies,
				// notice that the "aria-owns" attribute is set when the list is visible and in view
				this.getRoleComboNodeDomRef().setAttribute("aria-owns", this._getList().getId());

			}

			// call the hook to add additional content to the list
			this.addContent();
			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

		/**
		 * This event handler is called before the picker dialog is opened.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeOpenDialog = function() {
			var oPickerTextField = this.getPickerTextField();

			this._oSelectedItemBeforeOpen = this.getSelectedItem();
			this._sValueBeforeOpen = this.getValue();

			if (this.getSelectedItem()) {
				this.filterItems({
					properties: this._getFilters(),
					value: ""
				});
			}

			oPickerTextField.setValue(this._sValueBeforeOpen);
		};

		/**
		 * This event handler is called after the picker popup is opened.
		 *
		 * @private
		 */
		ComboBox.prototype.onAfterOpen = function() {
			var oDomRef = this.getFocusDomRef(),
				oItem = this.getSelectedItem(),
				oListItem = this.getListItem(oItem),
				oSelectionRange = this._getSelectionRange(),
				isAndroidTablet = (this.isPlatformTablet() && Device.os.android);

			this.closeValueStateMessage();

			if (oDomRef) {
				this.getRoleComboNodeDomRef().setAttribute("aria-expanded", "true");

				// notice that the "aria-activedescendant" attribute is set when the currently active descendant is
				// visible and in view
				oListItem && oDomRef.setAttribute("aria-activedescendant", oListItem.getId());
			}

			// if there is a selected item, scroll and show the list
			fnSelectedItemOnViewPort.call(this, true);

			/**
			 * Some android devices such as Galaxy Tab 3 are not returning the correct selection of text fields
			 */
			if (!isAndroidTablet && oItem && oSelectionRange.start === oSelectionRange.end && oSelectionRange.start > 1) {
				setTimeout(function() {
					this.selectText(0, oSelectionRange.end);
				}.bind(this), 0);
			}
		};

		/**
		 * This event handler is called before the picker popup is closed.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeClose = function() {
			ComboBoxBase.prototype.onBeforeClose.apply(this, arguments);
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				// notice that the "aria-owns" attribute is removed when the list is not visible and in view
				this.getRoleComboNodeDomRef().removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the control's field
			this.toggleIconPressedStyle(false);
		};

		/**
		 * This event handler is called after the picker popup is closed.
		 *
		 * @private
		 */
		ComboBox.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				this.getRoleComboNodeDomRef().setAttribute("aria-expanded", "false");
			}

			// clear the filter to make all items visible,
			// notice that to prevent flickering, the filter is cleared
			// after the close animation is completed
			this.clearFilter();

			this._sInputValueBeforeOpen = "";

			// if the focus is back to the input after closing the picker,
			// the value state message should be reopen
			if (this.shouldValueStateMessageBeOpened() && (document.activeElement === oDomRef)) {
				this.openValueStateMessage();
			}
		};

		/**
		 * Handles properties' changes of items in the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.base.Event} oControlEvent The control event
		 * @since 1.28
		 * @private
		 */
		ComboBox.prototype.onItemChange = function(oControlEvent) {
			var sSelectedItemId = this.getAssociation("selectedItem"),
				sNewValue = oControlEvent.getParameter("newValue"),
				sProperty = oControlEvent.getParameter("name");

			// if the selected item has changed, synchronization is needed
			if (sSelectedItemId === oControlEvent.getParameter("id")) {

				switch (sProperty) {
					case "text":

						if (!this.isBound("value")) {
							this.setValue(sNewValue);
						}

						break;

					case "key":

						if (!this.isBound("selectedKey")) {
							this.setSelectedKey(sNewValue);
						}

						break;

					// no default
				}
			}
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handles the <code>keydown</code> event when any key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onkeydown = function(oEvent) {
			var oControl = oEvent.srcControl;
			ComboBoxBase.prototype.onkeydown.apply(oControl, arguments);

			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			var mKeyCode = KeyCodes;
			oControl._bDoTypeAhead = (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
		};

		/**
		 * Handles the <code>cut</code> event when the CTRL and X keys are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.oncut = function(oEvent) {
			var oControl = oEvent.srcControl;
			ComboBoxBase.prototype.oncut.apply(oControl, arguments);
			oControl._bDoTypeAhead = false;
		};

		/**
		 * Handles the <code>sapenter</code> event when the Enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapenter = function(oEvent) {
			var oControl = oEvent.srcControl,
				oItem = oControl.getSelectedItem();

			if (oItem && this.getFilterSecondaryValues()) {
				oControl.updateDomValue(oItem.getText());
			}

			ComboBoxBase.prototype.onsapenter.apply(oControl, arguments);

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			if (oControl.isOpen() && !this.isComposingCharacter()) {
				oControl.close();
			}
		};

		/**
		 * Handles the <code>sapdown</code> pseudo event when the Down arrow key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapdown = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToNextSelectableItem() {
				fnHandleKeyboardNavigation.call(this, oControl, this.getNextFocusableItem(true /*Direction down*/));
			});
		};

		/**
		 * Handles the <code>sapup</code> pseudo event when the Up arrow key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapup = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToPrevSelectableItem() {
				fnHandleKeyboardNavigation.call(this, oControl, this.getNextFocusableItem(false /*Direction up*/));
			});
		};

		/**
		 * Handles the <code>saphome</code> pseudo event when the Home key is pressed.
		 *
		 * The first selectable item is selected and the input field is updated accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsaphome = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToFirstSelectableItem() {
				var oFirstSelectableItem = this.getSelectableItems()[0];
				fnHandleKeyboardNavigation.call(this, oControl, oFirstSelectableItem);
			});
		};

		/**
		 * Handles the <code>sapend</code> pseudo event when the End key is pressed.
		 *
		 * The last selectable item is selected and the input field is updated accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapend = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when End key is pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToLastSelectableItem() {
				var oLastSelectableItem = this.findLastEnabledItem(this.getSelectableItems());
				fnHandleKeyboardNavigation.call(this, oControl, oLastSelectableItem);
			});
		};

		/**
		 * Handles the <code>sappagedown</code> pseudo event when the Page Down key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappagedown = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			this.loadItems(function() {
				var aSelectableItems = this.getNonSeparatorSelectableItems(this.getSelectableItems()),
					iIndex = aSelectableItems.indexOf(this.getSelectedItem()) + 10,
					oItem;

				// constrain the index
				iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
				oItem = aSelectableItems[iIndex];
				fnHandleKeyboardNavigation.call(this, oControl, oItem);
			});
		};

		/**
		 * Handles the <code>sappageup</code> pseudo event when the Page Up key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappageup = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			this.syncPickerContent();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			this.loadItems(function() {
				var aSelectableItems = this.getNonSeparatorSelectableItems(this.getSelectableItems()),
					iIndex = aSelectableItems.indexOf(this.getSelectedItem()) - 10,
					oItem;

				// constrain the index
				iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
				oItem = aSelectableItems[iIndex];
				fnHandleKeyboardNavigation.call(this, oControl, oItem);
			});
		};

		/**
		 * Handles the <code>onsapshow</code> event when either F4 is pressed or Alt + Down arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapshow = function(oEvent) {
			var aSelectableItems, oItem,
				bEditable = this.getEditable(),
				oListItem;
			ComboBoxBase.prototype.onsapshow.apply(this, arguments);

			this.syncPickerContent();

			if (!this.getValue() && bEditable) {
				aSelectableItems = this.getSelectableItems();
				oItem = this.getNonSeparatorSelectableItems(aSelectableItems)[0];

				if (oItem) {
					oListItem = this.getListItem(oItem);
					this.setSelection(oItem);
					this.updateDomValue(oItem.getText());

					this.fireSelectionChange({
						selectedItem: oItem
					});

					setTimeout(function() {
						this.selectText(0, oItem.getText().length);
					}.bind(this), 0);

					if (this.isOpen()) {
						this.removeStyleClass("sapMFocus");
						this._getList().addStyleClass("sapMListFocus");
						this.handleListItemsVisualFocus(oListItem);
					} else {
						this.addStyleClass("sapMFocus");
					}
				}
			}
		};

		/**
		 * Handles when Alt + Up arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsaphide = ComboBox.prototype.onsapshow;

		/**
		 * Handles the <code>focusin</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onfocusin = function(oEvent) {
			var bDropdownPickerType = this.getPickerType() === "Dropdown";

			// when having an open dialog and destroy is called
			// the popup is destroyed and the focus is return back to the combobox
			// which checks for the presence of an icon which is already destroyed
			if (this._bIsBeingDestroyed) {
				return;
			}

			// the downward-facing arrow button is receiving focus
			if (oEvent.target === this.getOpenArea()) {

				// the value state message can not be opened if click on the open area
				this.bOpenValueStateMessage = false;

				// avoid the text-editing mode popup to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (bDropdownPickerType && !this.isPlatformTablet()) {

					// force the focus to stay in the input field
					this.focus();
				}

			// probably the input field is receiving focus
			} else {

				// avoid the text-editing mode popup to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (bDropdownPickerType) {
					setTimeout(function() {
						if (document.activeElement === this.getFocusDomRef() &&
							!this.bIsFocused &&
							!this.bFocusoutDueRendering &&
							!this.getSelectedText()) {

							this.selectText(0, this.getValue().length);
						}
						this.bIsFocused = true;
					}.bind(this), 0);
				}

				// open the message popup
				if (!this.isOpen() && this.bOpenValueStateMessage && this.shouldValueStateMessageBeOpened()) {
					this.openValueStateMessage();
				}

				this.bOpenValueStateMessage = true;
			}

			if (this.getEnabled() && (!this.isOpen() || !this.getSelectedItem() || !this._getList().hasStyleClass("sapMListFocus"))) {
				this.addStyleClass("sapMFocus");
			}

		};

		/**
		 * Handles the <code>sapfocusleave</code> pseudo event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapfocusleave = function(oEvent) {
			this.bIsFocused = false;
			var bTablet, oPicker,
				oRelatedControl, oFocusDomRef,
				oItem = this.getSelectedItem();

			if (oItem && this.getFilterSecondaryValues()) {
				this.updateDomValue(oItem.getText());
			}

			ComboBoxBase.prototype.onsapfocusleave.apply(this, arguments);

			if (this.isPickerDialog()) {
				return;
			}

			oPicker = this.getPicker();

			if (!oEvent.relatedControlId || !oPicker) {
				return;
			}

			bTablet = this.isPlatformTablet();
			oRelatedControl = core.byId(oEvent.relatedControlId);
			oFocusDomRef = oRelatedControl && oRelatedControl.getFocusDomRef();

			if (containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef) && !bTablet) {

				// force the focus to stay in the input field
				this.focus();
			}
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Updates and synchronizes the <code>selectedItem</code> association, <code>selectedItemId</code>
		 * and <code>selectedKey</code> properties.
		 *
		 * @param {sap.ui.core.Item | null} vItem The selected item
		 * @private
		 */
		ComboBox.prototype.setSelection = function(vItem) {
			var oList = this._getList(),
				oListItem, sKey;

			this.setAssociation("selectedItem", vItem, true);
			this.setProperty("selectedItemId", (vItem instanceof Item) ? vItem.getId() : vItem, true);

			if (typeof vItem === "string") {
				vItem = core.byId(vItem);
			}

			if (oList) {
				oListItem = this.getListItem(vItem);

				if (oListItem) {
					oList.setSelectedItem(oListItem, true);
				} else {
					oList.removeSelections(true);
				}
			}

			sKey = vItem ? vItem.getKey() : "";
			this.setProperty("selectedKey", sKey, true);
			this._handleAriaActiveDescendant(vItem);

			if (this._oSuggestionPopover) {
				this._oSuggestionPopover._iPopupListSelectedIndex = this.getItems().indexOf(vItem);
			}
		};

		/**
		 * Determines whether the <code>selectedItem</code> association and <code>selectedKey</code>
		 * property are synchronized.
		 *
		 * @returns {boolean} Whether the selection is synchronized
		 * @private
		 * @since 1.24.0
		 */
		ComboBox.prototype.isSelectionSynchronized = function() {
			var vItem = this.getSelectedItem();
			return this.getSelectedKey() === (vItem && vItem.getKey());
		};

		/**
		 * Synchronizes the <code>selectedItem</code> association and the <code>selectedItemId</code> property.
		 *
		 * @protected
		 */
		ComboBox.prototype.synchronizeSelection = function() {

			if (this.isSelectionSynchronized()) {
				return;
			}

			var sKey = this.getSelectedKey(),
				vItem = this.getItemByKey("" + sKey);	// find the first item with the given key

			// if there is an item that match with the "selectedKey" property and
			// the "selectedKey" property does not have the default value
			if (vItem && (sKey !== "")) {

				this.setAssociation("selectedItem", vItem, true);
				this.setProperty("selectedItemId", vItem.getId(), true);

				// sets the value if it has not changed
				if (this._sValue === this.getValue()) {
					this.setValue(vItem.getText());
					this._sValue = this.getValue();
				}
			}
		};

		/**
		 * Indicates whether the list is filtered.
		 *
		 * @returns {boolean} True if the list is filtered
		 * @private
		 * @since 1.26.0
		 */
		ComboBox.prototype.isFiltered = function() {
			var oList = this._getList();
			return oList && (oList.getVisibleItems().length !== this.getItems().length);
		};

		/**
		 * Indicates whether an item is visible or not.
		 *
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be checked
		 * @returns {boolean} Whether the item is visible.
		 * @private
		 * @since 1.32.0
		 */
		ComboBox.prototype.isItemVisible = function(oItem) {
			return oItem && (oItem.bVisible === undefined || oItem.bVisible);
		};

		/**
		 * <code>ComboBox</code> picker configuration
		 *
		 * @param {sap.m.Popover | sap.m.Dialog} oPicker Picker instance
		 * @protected
		 */
		ComboBox.prototype.configPicker = function (oPicker) {
			var oRenderer = this.getRenderer(),
				CSS_CLASS = oRenderer.CSS_CLASS_COMBOBOXBASE;

			oPicker.setHorizontalScrolling(false)
				.addStyleClass(CSS_CLASS + "Picker")
				.addStyleClass(CSS_CLASS + "Picker-CTX")
				.attachBeforeOpen(this.onBeforeOpen, this)
				.attachAfterOpen(this.onAfterOpen, this)
				.attachBeforeClose(this.onBeforeClose, this)
				.attachAfterClose(this.onAfterClose, this)
				.addEventDelegate({
					onBeforeRendering: this.onBeforeRenderingPicker,
					onAfterRendering: this.onAfterRenderingPicker
				}, this);
		};

		/**
		 * Configures the SuggestionsPopover's list.
		 *
		 * @param {sap.m.List} oList The list instance to be configured
		 * @protected
		 */
		ComboBox.prototype._configureList = function (oList) {
			var oRenderer = this.getRenderer();

			if (!oList) {
				return;
			}

			// configure the list
			oList.setMode(ListMode.SingleSelectMaster)
				.addStyleClass(oRenderer.CSS_CLASS_COMBOBOXBASE + "List")
				.addStyleClass(oRenderer.CSS_CLASS_COMBOBOX + "List");

			// attach event handlers
			oList
				.attachSelectionChange(this.onSelectionChange, this)
				.attachItemPress(this.onItemPress, this);

			// attach event delegates
			oList.addEventDelegate({
				onBeforeRendering: this.onBeforeRenderingList,
				onAfterRendering: this.onAfterRenderingList
			}, this);
		};

		/**
		 * Destroys all the items in the aggregation named <code>items</code>.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.destroyItems = function() {
			this.destroyAggregation("items");

			if (this._getList()) {
				this._getList().destroyItems();
			}

			return this;
		};

		/**
		 * Maps an item type of sap.ui.core.Item to an item type of sap.m.StandardListItem.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be matched
		 * @returns {sap.m.StandardListItem | null} The matched StandardListItem
		 * @private
		 */
		ComboBox.prototype._mapItemToListItem = function(oItem) {
			var oListItem, sListItem, sListItemSelected, sAdditionalText;
			var oRenderer = this.getRenderer();

			if (!oItem) {
				return null;
			}
			sAdditionalText = (oItem.getAdditionalText && this.getShowSecondaryValues()) ? oItem.getAdditionalText() : "";

			sListItem = oRenderer.CSS_CLASS_COMBOBOXBASE + "Item";
			sListItemSelected = (this.isItemSelected(oItem)) ? sListItem + "Selected" : "";

			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				oListItem = this._mapSeparatorItemToGroupHeader(oItem, oRenderer);
			} else {
				oListItem = new StandardListItem({
					type: ListType.Active,
					info: sAdditionalText,
					visible: oItem.getEnabled()
				}).addStyleClass(sListItem + " " + sListItemSelected);
			}

			oListItem.setTitle(oItem.getText());
			this.setSelectable(oItem, oItem.getEnabled());

			oListItem.setTooltip(oItem.getTooltip());
			oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "ListItem", oListItem);

			oItem.getCustomData().forEach(function(oCustomData){
				oListItem.addCustomData(oCustomData.clone());
			});

			this._oItemObserver.observe(oItem, {properties: ["text", "additionalText", "enabled", "tooltip"]});

			return oListItem;
		};

		ComboBox.prototype._forwardItemProperties = function(oPropertyInfo) {
			var oItem = oPropertyInfo.object,
				oListItem = oItem.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "ListItem"),
				oDirectMapping = {
					text: "title",
					enabled: "visible",
					tooltip: "tooltip"
				},
				sAdditionalText,
				sProperty,
				sSetter;


			if (Object.keys(oDirectMapping).indexOf(oPropertyInfo.name) > -1) {
				sProperty =  oDirectMapping[oPropertyInfo.name];
				sSetter = "set" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

				oListItem[sSetter](oPropertyInfo.current);
			}

			if (oPropertyInfo.name === "additionalText") {
				sAdditionalText = this.getShowSecondaryValues() ? oPropertyInfo.current : "";
				oListItem.setInfo(sAdditionalText);
			}
		};

		/**
		 * Indicates whether the provided item is selected.
		 *
		 * @param {sap.ui.core.Item} vItem The item to be checked
		 * @returns {boolean} True if the item is selected
		 * @private
		 * @since 1.24.0
		 */
		ComboBox.prototype.isItemSelected = function(vItem) {
			return vItem && (vItem.getId() === this.getAssociation("selectedItem"));
		};

		/**
		 * Gets the default selected item from the aggregation named <code>items</code>.
		 *
		 * @returns {null} Null, as there is no default selected item
		 * @protected
		 */
		ComboBox.prototype.getDefaultSelectedItem = function() {
			return null;
		};

		ComboBox.prototype.getChangeEventParams = function() {
			return {
				itemPressed: false
			};
		};

		/**
		 * Clears the selection.
		 *
		 * @protected
		 */
		ComboBox.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/**
		 * Sets the start and end positions of the current text selection.
		 *
		 * @param {int} iSelectionStart The index of the first selected character.
		 * @param {int} iSelectionEnd The index of the character after the last selected character.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining
		 * @protected
		 * @since 1.22.1
		 */
		ComboBox.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
			ComboBoxBase.prototype.selectText.apply(this, arguments);
			this.textSelectionStart = iSelectionStart;
			this.textSelectionEnd = iSelectionEnd;
			return this;
		};

		/**
		 * Sets an association of the ComboBox with given name.
		 *
		 * @param {string} sAssociationName The name of the association.
		 * @param {string} sId The ID which should be set as association.
		 * @param {boolean} bSuppressInvalidate Should the control invalidation be suppressed.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining
		 * @private
		 * @since 1.22.1
		 */
		ComboBox.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
			var oList = this._getList();

			if (oList && (sAssociationName === "selectedItem")) {

				// propagate the value of the "selectedItem" association to the list
				if (!(sId instanceof Item)) {
					sId = this.findItem("id", sId);
				}
				oList.setSelectedItem(this.getListItem(sId), true);
			}

			return ComboBoxBase.prototype.setAssociation.apply(this, arguments);
		};

		/**
		 * Removes all the ids in the association named <code>sAssociationName</code>.
		 *
		 * @param {string} sAssociationName The name of the association.
		 * @param {boolean} bSuppressInvalidate Should the control invalidation be suppressed.
		 * @returns {string[]} An array with the removed IDs
		 * @private
		 * @since 1.22.1
		 */
		ComboBox.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
			var oList = this._getList();

			if (oList && (sAssociationName === "selectedItem")) {
				List.prototype.removeAllAssociation.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.removeAllAssociation.apply(this, arguments);
		};

		/**
		 * Removes all the controls in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea and clears the selection.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 */
		ComboBox.prototype.removeAllItems = function () {
			var aItems = ComboBoxBase.prototype.removeAllItems.apply(this, arguments);

			this._fillList();

			return aItems;
		};

		/**
		 * Clones the <code>sap.m.ComboBox</code> control.
		 *
		 * @param {string} sIdSuffix Suffix to be added to the ids of the new control and its internal objects.
		 * @returns {sap.m.ComboBox} The cloned <code>sap.m.ComboBox</code> control.
		 * @public
		 * @since 1.22.1
		 */
		ComboBox.prototype.clone = function(sIdSuffix) {
			var oComboBoxClone = ComboBoxBase.prototype.clone.apply(this, arguments),
				oList = this._getList();

			if (!this.isBound("items") && oList) {
				oComboBoxClone.syncPickerContent();
				oComboBoxClone.setSelectedIndex(this.indexOfItem(this.getSelectedItem()));
			}

			return oComboBoxClone;
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Opens the control's picker popup.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @protected
		 */
		ComboBox.prototype.open = function() {
			this.syncPickerContent();

			var oList = this._getList();
			ComboBoxBase.prototype.open.call(this);

			if (this.getSelectedItem()) {
				oList.addStyleClass("sapMListFocus");
				this.removeStyleClass("sapMFocus");
			}

			return this;
		};

		/**
		 * Creates picker if doesn't exist yet and sync with Control items
		 *
		 * @protected
		 * @returns {sap.m.Dialog|sap.m.Popover}
		 */
		ComboBox.prototype.syncPickerContent = function () {
			var oPickerTextField,
				oPicker = this.getPicker(),
				aProperties = this.getInputForwardableProperties();

			if (!oPicker) {
				var sSetMutator, sGetMutator;

				oPicker = this.createPicker(this.getPickerType());
				oPickerTextField = this.getPickerTextField();
				this._updateSuggestionsPopoverValueState();

				this._fillList();
				if (oPickerTextField) {
					aProperties.forEach(function (sProp) {
						sProp = sProp.charAt(0).toUpperCase() + sProp.slice(1);

						sSetMutator = "set" + sProp;
						sGetMutator = "get" + sProp;

						if (oPickerTextField[sSetMutator]) {
							oPickerTextField[sSetMutator](this[sGetMutator]());
						}
					}, this);
				}
			}

			this.synchronizeSelection();

			return oPicker;
		};

		/**
		 * Closes the control's picker popup and focus input field.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.close = function() {
			var oList = this._getList();
			ComboBoxBase.prototype.close.call(this);

			this.addStyleClass("sapMFocus");
			//Remove focusing class from the list
			oList && oList.removeStyleClass("sapMListFocus");

			return this;
		};

		/**
		 * Searches and returns all aggregated objects of the internal <code>sap.m.List</code> control.
		 *
		 * @returns {Object[]} An array of all aggregated objects.
		 * @private
		 */
		ComboBox.prototype.findAggregatedObjects = function() {
			var oList = this._getList();

			if (oList) {
				// notice that currently there is only one aggregation
				return List.prototype.findAggregatedObjects.apply(oList, arguments);
			}

			return [];
		};

		/**
		 * Sets the <code>selectedItem</code> association.
		 *
		 * Default value is <code>null</code>.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem New value for the <code>selectedItem</code> association.
		 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
		 * <code>selectedItem</code> association.
		 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
		 * the selection.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				this.setAssociation("selectedItem", vItem, true);
				vItem = core.byId(vItem);
			}

			if (!(vItem instanceof Item) && vItem !== null) {
				return this;
			}

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);
			this.setValue(this._getSelectedItemText(vItem));
			return this;
		};

		/**
		 * Sets the <code>selectedItemId</code> property.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * @param {string | undefined} vItem New value for property <code>selectedItemId</code>.
		 * If the provided <code>vItem</code> is an empty string <code>""</code> or <code>undefined</code>,
		 * the selection is cleared.
		 * If the ID has no corresponding aggregated item, the selected item is not changed.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItemId = function(vItem) {
			vItem = this.validateProperty("selectedItemId", vItem);

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);
			vItem = this.getSelectedItem();
			this.setValue(this._getSelectedItemText(vItem));
			return this;
		};

		/**
		 * Sets the <code>selectedKey</code> property.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * If the provided <code>sKey</code> is an empty string <code>""</code> or <code>undefined</code>,
		 * the selection is cleared.
		 * If duplicate keys exist, the first item matching the key is selected.
		 * If a key is set and no item exists with that key, the visual selection remains the same.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var bDefaultKey = (sKey === ""),
				// the correct solution for tackling the coupling of selectedKey and value should be by using debounce
				// however this makes the API async, which alters the existing behaviour of the control
				// that's why the solution is implemented with skipModelUpdate property
				bSkipModelUpdate = this.isBound("selectedKey") && this.isBound("value") && this.getBindingInfo("selectedKey").skipModelUpdate;

			if (bDefaultKey) {
				this.setSelection(null);

				// if the setSelectedKey in called from ManagedObject's updateProperty
				// on model change the value property should not be changed
				if (!bSkipModelUpdate) {
					this.setValue("");
				}

				return this;
			}

			var oItem = this.getItemByKey(sKey);

			if (oItem) {
				this.setSelection(oItem);

				// if the setSelectedKey in called from ManagedObject's updateProperty
				// on model change the value property should not be changed
				if (!bSkipModelUpdate) {
					this.setValue(this._getSelectedItemText(oItem));
				}

				return this;
			}

			this._sValue = this.getValue();
			return this.setProperty("selectedKey", sKey);
		};

		/**
		 * Gets the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association,
		 * or <code>null</code>.
		 * @public
		 */
		ComboBox.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : core.byId(vSelectedItem) || null;
		};

		/**
		 * Called whenever the binding of the aggregation named <code>items</code> is changed.
		 *
		 * @returns {undefined}
		 * @private
		 */
		ComboBox.prototype.updateItems = function () {
			var vResult,
				oSelectedItem = this.getSelectedItem(), //Get selected item before model update
				vResult = ComboBoxBase.prototype.updateItems.apply(this, arguments); //Update

			//Debounce & emulate onBeforeRendering- all setters are done
			clearTimeout(this._debounceItemsUpdate);
			this._debounceItemsUpdate = setTimeout(this["_syncItemsSelection"].bind(this, oSelectedItem), 0);

			return vResult;
		};

		/**
		 * Synchronizes combobox's model update with selected key.
		 *
		 * @param {sap.ui.core.Item} oSelectedItem The item
		 * @private
		 */
		ComboBox.prototype._syncItemsSelection = function (oSelectedItem) {
			var bHasMatchingElement, aNewItems,
				sSelectedKey  = this.getSelectedKey();

			// The method should be executed only when there's previous selection
			// and that previous selection differs from the current one.
			if (!oSelectedItem || oSelectedItem === this.getSelectedItem()) {
				return;
			}

			// Get the items after model update
			aNewItems = this.getItems();

			// Find out if there's an item with the same key, to select it
			bHasMatchingElement = aNewItems.some(function (oItem) {
				return sSelectedKey === oItem.getKey();
			});

			// Select the item or set null if there's no record with that key
			this.setSelectedItem(bHasMatchingElement && sSelectedKey ? this.getItemByKey(sSelectedKey) : null);
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to be removed or its index or ID.
		 * @returns {sap.ui.core.Item} The removed item or <code>null</code>.
		 * @public
		 */
		ComboBox.prototype.removeItem = function(vItem) {
			vItem = ComboBoxBase.prototype.removeItem.apply(this, arguments);
			var oItem;

			// remove the corresponding mapped item from the List
			if (this._getList()) {
				this._getList().removeItem(vItem && this.getListItem(vItem));
			}

			if (this.isBound("items") && !this.bItemsUpdated) {
				return vItem;
			}

			var sValue = this.getValue();

			if (this.getItems().length === 0) {
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {
				oItem = this.getDefaultSelectedItem();
				this.setSelection(oItem);
				this.setValue(sValue);
			}

			return vItem;
		};

		/**
		 * Modifies the suggestions dialog input
		 * @param {sap.m.Input} oInput The input
		 *
		 * @returns {sap.m.Input} The modified input control
		 * @private
		 * @function
		 */
		ComboBox.prototype._modifyPopupInput = function (oInput) {
			ComboBoxBase.prototype._modifyPopupInput.apply(this, arguments);

			oInput.addEventDelegate({
				onsapenter: function() {
					var sTextFieldValue = oInput.getValue();
					this.updateDomValue(sTextFieldValue);
					this.onChange();
					if (sTextFieldValue) {
						this.updateDomValue(sTextFieldValue);
						this.onChange();
						this.close();
					}
				}
			}, this);
			return oInput;
		};

		/**
		 * Applies Combobox specific filtering over the list items.
		 * Called within showItems method.
		 *
		 * @since 1.64
		 * @experimental Since 1.64
		 * @private
		 * @ui5-restricted
		 */
		ComboBox.prototype.applyShowItemsFilters = function () {
			var oPicker, fnPickerOpenListener;

			this.syncPickerContent();

			oPicker = this.getPicker();
			fnPickerOpenListener = function () {
				oPicker.detachBeforeOpen(fnPickerOpenListener, this);
				oPicker = null;

				this.filterItems({value: this.getValue() || "_", properties: this._getFilters()});
			};

			// Combobox uses onBeforeOpen of the picker in order to sync the items
			// with the SuggestionsPopover. This leads to flickering of the Popover if filtering
			// is applied directly to the list.
			// Attaching to that event here, ensures that showItems filtering would happen
			// after SuggestionsPopover's reset, but before the picker is opened.
			oPicker.attachBeforeOpen(fnPickerOpenListener, this);
		};

		return ComboBox;

	});