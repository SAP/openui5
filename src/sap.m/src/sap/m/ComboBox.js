/*!
 * ${copyright}
 */

sap.ui.define([
	'./InputBase',
	'./ComboBoxTextField',
	'./ComboBoxBase',
	'./Popover',
	'./SelectList',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/Item',
	'./ComboBoxRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/base/security/encodeXML"
],
	function(
		InputBase,
		ComboBoxTextField,
		ComboBoxBase,
		Popover,
		SelectList,
		library,
		Device,
		Item,
		ComboBoxRenderer,
		containsOrEquals,
		KeyCodes,
		encodeXML
	) {
		"use strict";

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
					 * </ul>
					 *
					 * In addition, this event is also fired when an item in the list is selected.
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
				}
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
				iSelectionStart = oDomRef.selectionStart,
				iSelectionEnd = oDomRef.selectionEnd,
				bIsTextSelected = iSelectionStart !== iSelectionEnd,
				sTypedValue = oDomRef.value.substring(0, oDomRef.selectionStart),
				oSelectedItem = this.getSelectedItem();

			this.setSelection(oItem);

			if (oItem !== oSelectedItem) {
				oControl.updateDomValue(oItem.getText());

				this.fireSelectionChange({ selectedItem: oItem });

				// update the selected item after the change event is fired (the selection may change)
				oItem = this.getSelectedItem();

				if (!((typeof sTypedValue == "string" && sTypedValue != "" ? oItem.getText().toLowerCase().startsWith(sTypedValue.toLowerCase()) : false)) || !bIsTextSelected) {
					iSelectionStart = 0;
				}

				oControl.selectText(iSelectionStart, oDomRef.value.length);
			}

			if (this.isOpen()) {
				this.$().removeClass("sapMFocus");
				this.getList().addStyleClass("sapMSelectListFocus");
			} else {
				this.$().addClass("sapMFocus");
			}

			this.scrollToItem(oItem);
		}

		function fnSelectTextIfFocused(iStart, iEnd) {
			if (document.activeElement === this.getFocusDomRef()) {
				this.selectText(iStart, iEnd);
			}
		}

		function fnSelectedItemOnViewPort(bIsListHidden) {
			var oItem = this.getSelectedItem(),
				oItemDomRef = oItem && oItem.getDomRef(),
				oItemOffsetTop = oItem && oItemDomRef.offsetTop,
				oItemOffsetHeight = oItem && oItemDomRef.offsetHeight,
				oPicker = this.getPicker(),
				oPickerDomRef = oPicker.getDomRef("cont"),
				oPickerClientHeight = oPickerDomRef.clientHeight;

			//check if the selected item is on the viewport
			if (oItem && ((oItemOffsetTop + oItemOffsetHeight) > (oPickerClientHeight))) {

				// hide the list to scroll to the selected item
				if (!bIsListHidden) {
					this.getList().$().css("visibility", "hidden");
				} else {

					// scroll to the selected item minus half the height of an item showing partly the
					// previous one, to indicate that there are items above and show the list
					oPickerDomRef.scrollTop = oItemOffsetTop - oItemOffsetHeight / 2;
					this.getList().$().css("visibility", "visible");
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
				sActivedescendant = "aria-activedescendant";

			if (oDomRef) {

				// the aria-activedescendant attribute is set when the list is rendered
				if (vItem && vItem.getDomRef() && this.isOpen()) {
					oDomRef.setAttribute(sActivedescendant, vItem.getId());
				} else {
					oDomRef.removeAttribute(sActivedescendant);
				}
			}
		};

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

		ComboBox.getMetadata().forwardAggregation(
			"items",
			{
				getter: ComboBox.prototype.getList,
				aggregation: "items"
			}
		);

		ComboBox.prototype._setItemVisibility = function(oItem, bVisible) {
			var $OItem = oItem && oItem.$(),
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
		 * Handles highlighting of items after filtering.
		 *
		 * @param {string} sValue The value of the item
		 * @private
		 * @since 1.48
		 */
		ComboBox.prototype._highlightList = function(sValue) {
			var aItems = this.getVisibleItems();
			var aListItemsText = [];
			var aListItemAdditionalText = [];
			var oItemAdditionalTextRef, oItemTextRef;

			aItems.forEach(function (oItem) {
				var oItemDomRef = oItem.getDomRef();

				if (oItemDomRef === null) {
					return;
				}

				oItemAdditionalTextRef = oItemDomRef.children[1];

				oItemTextRef = Array.prototype.filter.call(oItemDomRef.children, function(oChildRef) {
					return oChildRef.tagName.toLowerCase() !== "b";
				})[0] || oItemDomRef;

				// store a DOM and an additional text to be matched
				if (oItemAdditionalTextRef && oItem.getAdditionalText) {
					aListItemAdditionalText.push({
						ref: oItemAdditionalTextRef,
						text: oItem.getAdditionalText()
					});
				}

				// store a DOM and a text to be matched
				oItemTextRef && aListItemsText.push({
					ref: oItemTextRef,
					text: oItem.getText()
				});
			});

			this.highLightList(sValue, aListItemsText);
			this.highLightList(sValue, aListItemAdditionalText);
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
		 * Creates an instance of <code>sap.m.Popover</code>.
		 *
		 * @returns {sap.m.Popover} The popover instance
		 * @private
		 */
		ComboBox.prototype.createDropdown = function() {
			var that = this;
			var oDropdown = new Popover(this.getDropdownSettings());
			oDropdown.setInitialFocus(this);

			oDropdown.open = function() {
				return this.openBy(that);
			};

			return oDropdown;
		};

		/**
		 * Creates an instance of <code>sap.m.ComboBoxTextField</code>.
		 *
		 * @returns {sap.m.ComboBoxTextField} The TextField instance
		 * @private
		 */
		ComboBox.prototype.createPickerTextField = function() {
			var oTextField = new ComboBoxTextField({
				width: "100%",
				showValueStateMessage: false,
				showButton: false
			}).addEventDelegate({
				onsapenter: function() {
					this.updateDomValue(oTextField.getValue());
					this.onChange();
				}
			}, this);

			return oTextField;
		};

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
		 * @returns {sap.ui.core.item[]} Array of filtered items
		 */
		ComboBox.prototype.filterItems = function(mOptions) {
			var aItems = this.getItems(),
				aFilteredItems = [],
				aFilteredItemsByText = [],
				bFilterAdditionalText = mOptions.properties.indexOf("additionalText") > -1,
				fnFilter = this.fnFilter || ComboBoxBase.DEFAULT_TEXT_FILTER;

			this._oFirstItemTextMatched = null;

			aItems.forEach(function (oItem) {
				var bMatchedByText = fnFilter.call(this, mOptions.value, oItem, "getText");
				var bMatchedByAdditionalText = fnFilter.call(this, mOptions.value, oItem, "getAdditionalText");

				if (bMatchedByText) {
					aFilteredItemsByText.push(oItem);
					aFilteredItems.push(oItem);
				} else if (bMatchedByAdditionalText && bFilterAdditionalText) {
					aFilteredItems.push(oItem);
				}
			});

			aItems.forEach(function (oItem) {
				var bItemMached = aFilteredItems.indexOf(oItem) > -1;
				var bItemTextMached = aFilteredItemsByText.indexOf(oItem) > -1;

				if (!this._oFirstItemTextMatched && bItemTextMached) {
					this._oFirstItemTextMatched = oItem;
				}

				this._setItemVisibility(oItem, bItemMached);
			}, this);

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

		ComboBox.prototype._getFilters = function () {
			return this.getFilterSecondaryValues() ? ["text", "additionalText"] : ["text"];
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		ComboBox.prototype.init = function() {
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
		};

		ComboBox.prototype.onBeforeRendering = function() {
			ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
			this.synchronizeSelection();
		};

		ComboBox.prototype.exit = function () {
			ComboBoxBase.prototype.exit.apply(this, arguments);
			this._oSelectedItemBeforeOpen = null;
			this._oFirstItemTextMatched = null;
		};

		ComboBox.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		ComboBox.prototype.onBeforeRenderingDropdown = function() {
			var oPopover = this.getPicker(),
				sWidth = (this.$().outerWidth() / parseFloat(library.BaseFontSize)) + "rem";

			if (oPopover) {
				oPopover.setContentMinWidth(sWidth);
			}
		};

		ComboBox.prototype.onBeforeRenderingList = function() {

			if (this.bProcessingLoadItemsEvent) {
				var oList = this.getList(),
					oFocusDomRef = this.getFocusDomRef();

				if (oList) {
					oList.setBusy(true);
				}

				if (oFocusDomRef) {
					oFocusDomRef.setAttribute("aria-busy", "true");
				}
			}
		};

		ComboBox.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["onAfterRendering" + this.getPickerType()];

			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);

			// hide the list while scrolling to selected item, if necessary
			fnSelectedItemOnViewPort.call(this, false);
		};

		ComboBox.prototype.onAfterRenderingList = function() {

			if (this.bProcessingLoadItemsEvent && (this.getItems().length === 0)) {
				return;
			}

			var oList = this.getList(),
				oFocusDomRef = this.getFocusDomRef();

			this._highlightList(this._sInputValueBeforeOpen);

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

			// notice that the input event can be buggy in some web browsers,
			// @see sap.m.InputBase#oninput
			if (oEvent.isMarked("invalid")) {
				return;
			}

			this.$().addClass("sapMFocus");

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
			this.$().addClass("sapMFocus");
			this.getList().removeStyleClass("sapMSelectListFocus");
		};

		/**
		 * Handles the input event on the input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @param {Boolean} bCompositionEvent True if the control is in composing state
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
			var bCurrentlySelectedItemVisible = aVisibleItems.some(function (oItem) {
				return oItem.getKey() === this.getSelectedKey();
			}, this);

			// In some cases, the filtered items may only be shown because of second,
			// third, etc term matched the typed in by the user value. However, if the ComboBox
			// has selectedKey already, and this key corresponds to an item, which is already not
			// visible after the filtering, the selection does not correspond to the users input.
			// In such cases:
			// - The selectedKey will be cleared so no "hidden" selection is left in the ComboBox
			// - Further validation is required from application side as the ComboBox allows input
			//   that does not match any item from the list.
			if (bItemsVisible && this.getSelectedKey() && !bCurrentlySelectedItemVisible) {
				this.setProperty('selectedKey', null, false);
			}

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
				this._highlightList(sValue);
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
		 * @param {Boolean} bCompositionEvent True if the control is in composing state
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
			this.$().addClass("sapMFocus");
			this.getList().removeStyleClass("sapMSelectListFocus");
		};

		/**
		 * Handles the <code>selectionChange</code> event on the list.
		 *
		 * @param {sap.ui.base.Event} oControlEvent The control event
		 */
		ComboBox.prototype.onSelectionChange = function(oControlEvent) {
			var oItem = oControlEvent.getParameter("selectedItem"),
				mParam = this.getChangeEventParams(),
				bSelectedItemChanged = (oItem !== this.getSelectedItem());

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
		 */
		ComboBox.prototype.onItemPress = function (oControlEvent) {
			var oItem = oControlEvent.getParameter("item"),
				sText = oItem.getText(),
				mParam = this.getChangeEventParams(),
				bSelectedItemChanged = (oItem !== this.getSelectedItem());

			this.updateDomValue(sText);

			// if a highlighted item is pressed fire change event
			if (!bSelectedItemChanged) {
				mParam.itemPressed = true;
				this.onChange(null, mParam);
			}

			this.setProperty("value", oItem.getText(), true);

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
			var fnPickerTypeBeforeOpen = this["onBeforeOpen" + this.getPickerType()],
				oDomRef = this.getFocusDomRef();

			// the dropdown list can be opened by calling the .open() method (without
			// any end user interaction), in this case if items are not already loaded
			// and there is an {@link #loadItems} event listener attached, the items should be loaded
			if (this.hasLoadItemsEventListeners() && !this.bProcessingLoadItemsEvent) {
				this.loadItems();
			}

			// add the active state to the control field
			this.addStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);

			if (oDomRef) {

				// expose a parent/child contextual relationship to assistive technologies,
				// notice that the "aria-owns" attribute is set when the list is visible and in view
				oDomRef.setAttribute("aria-owns", this.getList().getId());
			}

			// call the hook to add additional content to the list
			this.addContent();
			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

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
		 */
		ComboBox.prototype.onAfterOpen = function() {
			var oDomRef = this.getFocusDomRef(),
				oItem = this.getSelectedItem();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "true");

				// notice that the "aria-activedescendant" attribute is set when the currently active descendant is
				// visible and in view
				oItem && oDomRef.setAttribute("aria-activedescendant", oItem.getId());
			}

			// if there is a selected item, scroll and show the list
			fnSelectedItemOnViewPort.call(this, true);
		};

		/**
		 * This event handler is called before the picker popup is closed.
		 *
		 */
		ComboBox.prototype.onBeforeClose = function() {
			ComboBoxBase.prototype.onBeforeClose.apply(this, arguments);
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// notice that the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the control's field
			this.removeStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		};

		/**
		 * This event handler is called after the picker popup is closed.
		 *
		 */
		ComboBox.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");
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
		 */
		ComboBox.prototype.onsapdown = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToNextSelectableItem() {
				var aSelectableItems = this.getSelectableItems(),
					oNextSelectableItem;

				if (this.$().hasClass("sapMFocus") && this.isOpen()) {
					oNextSelectableItem = aSelectableItems[0];
				} else {
					oNextSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) + 1];
				}

				fnHandleKeyboardNavigation.call(this, oControl, oNextSelectableItem);
			});
		};

		/**
		 * Handles the <code>sapup</code> pseudo event when the Up arrow key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBox.prototype.onsapup = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			this.loadItems(function navigateToPrevSelectableItem() {
				var aSelectableItems = this.getSelectableItems();
				var oPrevSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) - 1];
				fnHandleKeyboardNavigation.call(this, oControl, oPrevSelectableItem);
			});
		};

		/**
		 * Handles the <code>saphome</code> pseudo event when the Home key is pressed.
		 *
		 * The first selectable item is selected and the input field is updated accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBox.prototype.onsaphome = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

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
		 */
		ComboBox.prototype.onsapend = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

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
		 */
		ComboBox.prototype.onsappagedown = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			this.loadItems(function() {
				var aSelectableItems = this.getSelectableItems(),
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
		 */
		ComboBox.prototype.onsappageup = function(oEvent) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			this.loadItems(function() {
				var aSelectableItems = this.getSelectableItems(),
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
		 */
		ComboBox.prototype.onsapshow = function(oEvent) {
			var aSelectableItems, oItem;
			ComboBoxBase.prototype.onsapshow.apply(this, arguments);

			if (!this.getValue()) {
				aSelectableItems = this.getSelectableItems();
				oItem = aSelectableItems[0];

				if (oItem) {
					this.setSelection(oItem);
					this.updateDomValue(oItem.getText());

					this.fireSelectionChange({
						selectedItem: oItem
					});

					setTimeout(function() {
						this.selectText(0, oItem.getText().length);
					}.bind(this), 0);
				}
			}
		};

		/**
		 * Handles when Alt + Up arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBox.prototype.onsaphide = ComboBox.prototype.onsapshow;

		/**
		 * Handles the <code>focusin</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
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

			if (!this.isOpen() || !this.getSelectedItem() || !this.getList().hasStyleClass("sapMSelectListFocus")) {
				this.$().addClass("sapMFocus");
			}
		};

		/**
		 * Handles the <code>sapfocusleave</code> pseudo event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
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

			oPicker = this.getAggregation("picker");

			if (!oEvent.relatedControlId || !oPicker) {
				return;
			}

			bTablet = this.isPlatformTablet();
			oRelatedControl = sap.ui.getCore().byId(oEvent.relatedControlId);
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
		 */
		ComboBox.prototype.setSelection = function(vItem) {
			var oList = this.getList(),
				sKey;

			if (oList) {
				oList.setSelection(vItem);
			}

			this.setAssociation("selectedItem", vItem, true);
			this.setProperty("selectedItemId", (vItem instanceof Item) ? vItem.getId() : vItem, true);

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			sKey = vItem ? vItem.getKey() : "";
			this.setProperty("selectedKey", sKey, true);
			this._handleAriaActiveDescendant(vItem);
		};

		/**
		 * Determines whether the <code>selectedItem</code> association and <code>selectedKey</code>
		 * property are synchronized.
		 *
		 * @returns {boolean} Whether the selection is synchronized
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
		 * @since 1.26.0
		 */
		ComboBox.prototype.isFiltered = function() {
			var oList = this.getList();
			return oList && (oList.getVisibleItems().length !== oList.getItems().length);
		};

		/**
		 * Indicates whether an item is visible or not.
		 *
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be checked
		 * @returns {boolean} Whether the item is visible.
		 * @since 1.32.0
		 */
		ComboBox.prototype.isItemVisible = function(oItem) {
			return oItem && (oItem.bVisible === undefined || oItem.bVisible);
		};

		/**
		 * Creates a picker popup container where the selection should take place.
		 *
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType The type of the picker
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker popup to be used.
		 * @protected
		 */
		ComboBox.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				return oPicker;
			}

			oPicker = this["create" + sPickerType]();

			// define a parent-child relationship between the control's and the picker popup
			this.setAggregation("picker", oPicker, true);

			var CSS_CLASS = this.getRenderer().CSS_CLASS_COMBOBOXBASE;

			// configuration
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
					}, this)
					.addContent(this.createList());

			return oPicker;
		};

		/**
		 * Creates an instance of <code>sap.m.SelectList</code>.
		 *
		 * @returns {sap.m.SelectList} The SelectList instance
		 */
		ComboBox.prototype.createList = function() {
			var oRenderer = this.getRenderer();

			this._oList = new SelectList({
				width: "100%",
				busyIndicatorDelay: 0
			}).addStyleClass(oRenderer.CSS_CLASS_COMBOBOXBASE + "List")
			.addStyleClass(oRenderer.CSS_CLASS_COMBOBOX + "List")
			.addEventDelegate({
				onBeforeRendering: this.onBeforeRenderingList,
				onAfterRendering: this.onAfterRenderingList
			}, this)
			.attachSelectionChange(this.onSelectionChange, this)
			.attachItemPress(this.onItemPress, this);

			return this._oList;
		};

		/**
		 * Indicates whether the provided item is selected.
		 *
		 * @param {sap.ui.core.Item} vItem The item to be checked
		 * @returns {boolean} True if the item is selected
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

		ComboBox.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === "items" && !bSuppressInvalidate && !this.isInvalidateSuppressed()) {
				this.invalidate(oObject);
			}
			return ComboBoxBase.prototype.addAggregation.apply(this, arguments);
		};

		ComboBox.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {

				// propagate the value of the "selectedItem" association to the list
				SelectList.prototype.setAssociation.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.setAssociation.apply(this, arguments);
		};

		ComboBox.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {
			var oList = this.getList();

			if (/selectedKey|selectedItemId/.test(sPropertyName)) {

				// propagate the value of the "selectedKey" or "selectedItemId" properties to the list
				oList && SelectList.prototype.setProperty.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.setProperty.apply(this, arguments);
		};

		ComboBox.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {
				SelectList.prototype.removeAllAssociation.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.removeAllAssociation.apply(this, arguments);
		};

		ComboBox.prototype.clone = function(sIdSuffix) {
			var oComboBoxClone = ComboBoxBase.prototype.clone.apply(this, arguments),
				oList = this.getList();

			if (!this.isBound("items") && oList) {
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
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @protected
		 */
		ComboBox.prototype.open = function() {
			var oList = this.getList();

			ComboBoxBase.prototype.open.call(this);

			if (this.getSelectedItem()) {
				oList.addStyleClass("sapMSelectListFocus");
				this.$().removeClass("sapMFocus");
			}

			return this;
		};

		/**
		 * Closes the control's picker popup and focus input field.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.close = function() {
			var oList = this.getList();
			ComboBoxBase.prototype.close.call(this);

			this.$().addClass("sapMFocus");
			//Remove focusing class from the list
			oList && oList.removeStyleClass("sapMSelectListFocus");

			return this;
		};

		ComboBox.prototype.findAggregatedObjects = function() {
			var oList = this.getList();

			if (oList) {

				// notice that currently there is only one aggregation
				return SelectList.prototype.findAggregatedObjects.apply(oList, arguments);
			}

			return [];
		};

		ComboBox.prototype.setShowSecondaryValues = function(bAdditionalText) {
			this.setProperty("showSecondaryValues", bAdditionalText, true);

			var oList = this.getList();

			if (oList) {
				oList.setShowSecondaryValues(bAdditionalText);
			}

			return this;
		};

		/**
		 * Gets aggregation <code>items</code>.
		 *
		 * <b>Note</b>: This is the default aggregation.
		 * @return {sap.ui.core.Item[]} The Item array
		 * @public
		 */
		ComboBox.prototype.getItems = function() {
			var oList = this.getList();
			return oList ? oList.getItems() : [];
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
				vItem = sap.ui.getCore().byId(vItem);
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
			return (vSelectedItem === null) ? null : sap.ui.getCore().byId(vSelectedItem) || null;
		};

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

		return ComboBox;

	});