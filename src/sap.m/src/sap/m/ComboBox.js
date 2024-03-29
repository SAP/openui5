/*!
 * ${copyright}
 */

sap.ui.define([
	'./ComboBoxTextField',
	'./ComboBoxBase',
	'./List',
	'./library',
	'sap/ui/Device',
	"sap/ui/core/Element",
	'sap/ui/core/Item',
	'./ComboBoxRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/m/inputUtils/scrollToItem",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/typeAhead",
	"sap/m/inputUtils/filterItems",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/itemsVisibilityHandler",
	"sap/m/inputUtils/selectionRange",
	"sap/m/inputUtils/calculateSelectionStart",
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
],
	function(
		ComboBoxTextField,
		ComboBoxBase,
		List,
		library,
		Device,
		Element,
		Item,
		ComboBoxRenderer,
		containsOrEquals,
		scrollToItem,
		inputsDefaultFilter,
		typeAhead,
		filterItems,
		ListHelpers,
		itemsVisibilityHandler,
		selectionRange,
		calculateSelectionStart,
		KeyCodes,
		Log
	) {
		"use strict";

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
		 * <li> Option list - the list of available options. <b>Note:</b> Disabled items are not visualized in the list with the available options, however they can still be accessed through the <code>items</code> aggregation.</li>
		 * </ul>
		 * By setting the <code>showSecondaryValues</code> property, the combo box can display an additional value for each option (if there is one).
		 * <b>Note:</b> The typeahead feature is not available on Android devices due to a OS specific issue.
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
		 *
		 * <h4>Note:</h4>
		 * The control has the following behavior regarding the <code>selectedKey</code> and <code>value</code> properties:
		 * <ul>
		 * <li> On initial loading, if the control has a <code>selectedKey</code> set which corresponds to a matching item, and a set <code>value</code>, the <code>value</code> will be updated to the matching item's text. </li>
		 * <li> If a <code>selectedKey</code> is set and the user types an input which corresponds to an item's text, the <code>selectedKey</code> will be updated with the matching item's key. </li>
		 * <li> If a <code>selectedKey</code> is set and the user types an input which does not correspond to any item's text, the <code>selectedKey</code> will be set to an empty string ("") </li>
		 * <li> If a <code>selectedKey</code> is set and the user selects an item, the <code>selectedKey</code> will be updated to match the selected item's key. </li>
		 * <li> If a <code>selectedKey</code> is bound and the user types before the data is loaded, the user's input will be overwritten by the binding update. </li>
		 * </ul>
		 *
		 * <h3>Responsive Behavior</h3>
		 * <ul>
		 * <li>As the <code>sap.m.ComboBox</code> control allows free text, as well as has <code>selectedKey</code> / <code>selectedItem</code> properties, here is brief explanation of how they are updated during model change:</li>
		 * <ul>
		 * <li>If the ComboBox has <code>selectedKey</code> and <code>selectedItem</code> set, the model changes and the item key is no longer amongst the newly added items, the value of the ComboBox will remain the same and the <code>selectedKey</code> and <code>selectedItem</code> properties <strong>will not</strong> be changed.</li>
		 * <li>If the ComboBox has <code>selectedKey</code> and <code>selectedItem</code> set, the model changes and the item key corresponds to newly added item, with different text, the value of the ComboBox <strong>will</strong> be updated with the text of the newly corresponding item.</li>
		 * <li>If the ComboBox has only value, but no <code>selectedKey</code> and <code>selectedItem</code> set, the model changes, the value <strong>will</strong> remain the same and the <code>selectedKey</code> and <code>selectedItem</code> properties <strong>will not</strong> be changed.</li>
		 * </ul>
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
		 */
		var ComboBox = ComboBoxBase.extend("sap.m.ComboBox", /** @lends sap.m.ComboBox.prototype */ {
			metadata: {
				interfaces : [
					"sap.m.IToolbarInteractiveControl"
				],
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
					},

					/**
					 * Indicates whether the picker is opened.
					 * @private
					 */
					 _open: {
						type: "boolean",
						defaultValue: false,
						visibility: "hidden"
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
			},

			renderer: ComboBoxRenderer
		});

		/* =========================================================== */
		/* Private methods                                             */
		/* =========================================================== */
		function fnSelectedItemOnViewPort(bIsListHidden) {
			var oItem = this.getSelectedItem(),
				oListItem = ListHelpers.getListItem(oItem),
				oItemDomRef = oItem && oListItem && oListItem.getDomRef(),
				oItemOffsetTop = oItemDomRef && oItemDomRef.offsetTop,
				oItemOffsetHeight = oItemDomRef && oItemDomRef.offsetHeight,
				oPicker = this.getPicker(),
				oPickerDomRef = oPicker.getDomRef("cont"),
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
		 * Updates and synchronizes the <code>selectedItem</code> association, <code>selectedItemId</code>
		 * and <code>selectedKey</code> properties.
		 *
		 * @param {sap.ui.core.Item | null} vItem The selected item
		 * @private
		 */
		ComboBox.prototype.setSelection = function(vItem) {
			var oList = this._getList(),
				oListItem, sKey;

			this.setAssociation("selectedItem", vItem);
			this._setPropertyProtected("selectedItemId", (vItem instanceof Item) ? vItem.getId() : vItem, true);

			if (typeof vItem === "string") {
				vItem = Element.getElementById(vItem);
			}

			if (oList) {
				oListItem = ListHelpers.getListItem(vItem);

				if (oListItem) {
					oList.setSelectedItem(oListItem, true);
				} else {
					oList.removeSelections(true);
				}
			}

			sKey = vItem ? vItem.getKey() : this.getMetadata().getProperty("selectedKey").defaultValue;
			this._setPropertyProtected("selectedKey", sKey);
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
		 * Sets an association of the ComboBox with given name.
		 *
		 * @param {string} sAssociationName The name of the association.
		 * @param {string} sId The ID which should be set as association.
		 * @param {boolean} bSuppressInvalidate Should the control invalidation be suppressed.
		 * @returns {this} <code>this</code> to allow method chaining
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
				oList.setSelectedItem(ListHelpers.getListItem(sId), true);
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

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * This method will be called when the ComboBox is initially created.
		 *
		 * @protected
		 */
		ComboBox.prototype.init = function() {
			ComboBoxBase.prototype.init.apply(this, arguments);

			this.bOpenValueStateMessage = true;
			this._sValueBeforeOpen = "";

			// stores the value of the input before opening the picker
			this._sInputValueBeforeOpen = "";

			// the last selected item before opening the picker
			this._oSelectedItemBeforeOpen = null;

			if (Device.system.phone) {
				this.attachEvent("_change", this.onPropertyChange, this);
			}

			// holds reference to the last focused GroupHeaderListItem if such exists
			this.setLastFocusedListItem(null);
		};

		/**
		 * This event handler will be called before the ComboBox is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRendering = function() {
			ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
			var aItems = this.getItems();

			if (this.getRecreateItems()) {
				ListHelpers.fillList(aItems, this._getList(), this._mapItemToListItem.bind(this));
				this.setRecreateItems(false);
			}

			this.synchronizeSelection();

			if (!this.isOpen() && document.activeElement === this.getFocusDomRef() && this.getEnabled()) {
				this.addStyleClass("sapMFocus");
			}

			// if selected item is not among items => select default item
			if (this.getSelectedItem() && aItems.indexOf(this.getSelectedItem()) === -1) {
				var sValue = this.getValue();

				this.clearSelection();
				this.setValue(sValue);
			}

			if (this.getShowClearIcon()) {
				this._getClearIcon().setVisible(this.shouldShowClearIcon());
			} else if (this._oClearIcon) {
				this._getClearIcon().setVisible(false);
			}
		};

		/**
		 * This method will be called when the ComboBox is being destroyed.
		 *
		 * @protected
		 */
		ComboBox.prototype.exit = function () {
			ComboBoxBase.prototype.exit.apply(this, arguments);

			this._oSelectedItemBeforeOpen = null;
			this._bInputFired = null;
			this.setLastFocusedListItem(null);

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
			var iInputWidth = this.getDomRef().getBoundingClientRect().width;
			var sPopoverMaxWidth = getComputedStyle(this.getDomRef()).getPropertyValue("--sPopoverMaxWidth");

			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);

			// hide the list while scrolling to selected item, if necessary
			fnSelectedItemOnViewPort.call(this, false);

			if (iInputWidth <= parseInt(sPopoverMaxWidth) && !Device.system.phone) {
				this.getPicker().addStyleClass("sapMSuggestionPopoverDefaultWidth");
			} else {
				this.getPicker().getDomRef().style.setProperty("max-width", iInputWidth + "px");
				this.getPicker().addStyleClass("sapMSuggestionPopoverInputWidth");
			}
		};

		/**
		 * This event handler will be called after the ComboBox Picker's List is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterRenderingList = function() {
			var oSelectedItem = this.getSelectedItem(),
				oSelectedListItem = ListHelpers.getListItem(oSelectedItem);

			if (this.bProcessingLoadItemsEvent && !this.bItemsUpdated && (this.getItems().length === 0)) {
				return;
			}

			var oList = this._getList(),
				oFocusDomRef = this.getFocusDomRef();

			this.highlightList(this._sInputValueBeforeOpen);

			if (oSelectedItem) {
				oList.setSelectedItem(oSelectedListItem);
				this.setLastFocusedListItem(oSelectedListItem);
			}

			if (oList) {
				oList.setBusy(false);
			}

			if (oFocusDomRef) {
				oFocusDomRef.removeAttribute("aria-busy");
			}
		};


		/* =========================================================== */
		/* Filtering                                                   */
		/* =========================================================== */

		/**
		 * Filters the items of the ComboBox, using the <code>filterItems</code> module.
		 *
		 * @param {string} sValue The value, to be used as a filter
		 * @returns {Object} A result object, containing the matching items and list groups
		 * @private
		 */
		ComboBox.prototype.filterItems = function(sValue) {
			return filterItems(this, this.getItems(), sValue, true, this.getFilterSecondaryValues(), this.fnFilter || inputsDefaultFilter);
		};

		/**
		 * Maps items of <code>sap.ui.core.Item</code> type to <code>sap.m.StandardListItem</code> items.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be matched
		 * @returns {sap.m.StandardListItem | sap.m.GroupHeaderListItem | null} The matched StandardListItem
		 * @private
		 */
		ComboBox.prototype._mapItemToListItem = function (oItem) {
			var oListItem = ListHelpers.createListItemFromCoreItem(oItem, this.getShowSecondaryValues());

			if (oItem.isA("sap.ui.core.Item")) {
				this.setSelectable(oItem, oItem.getEnabled());
			}

			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				oListItem.addAriaLabelledBy(this._getGroupHeaderInvisibleText().getId());
			}

			oListItem.addStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "NonInteractiveItem");

			return oListItem;
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

			this._bInputFired = true;

			this.loadItems(function() {
				this.handleInputValidation(oEvent);
			}, {
					name: "input",
					busyIndicator: false
				}
			);

			// if the loadItems event is being processed,
			// we need to open the dropdown list to show the busy indicator
			if (this.bProcessingLoadItemsEvent && (this.getPickerType() === "Dropdown")) {

				if (this.isOpen() && !this.getValue()) {
					this.close();
				} else {
					this.open();
				}
			}

			if (this.getLastFocusedListItem()) {
				this.getLastFocusedListItem().removeStyleClass("sapMLIBFocused");
				this.setLastFocusedListItem(null);
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
		 * @private
		 */
		ComboBox.prototype.handleInputValidation = function (oEvent) {
			var aVisibleItems, aCommonStartsWithItems, oFirstVisibleItem, bCurrentlySelectedItemVisible,
				oSelectedItem = this.getSelectedItem(),
				sValue = oEvent.target.value,
				bEmptyValue = sValue === "",
				oControl = oEvent.srcControl,
				bToggleOpenState = (this.getPickerType() === "Dropdown"),
				oListItem = ListHelpers.getListItem(oSelectedItem),
				oFilterResults = this.filterItems(sValue);

			if (bEmptyValue && !this.bOpenedByKeyboardOrButton && !this.isPickerDialog()) {
				aVisibleItems = this.getItems();
			} else {
				aVisibleItems = oFilterResults.items;
				itemsVisibilityHandler(this.getItems(), oFilterResults);
			}

			oFirstVisibleItem = aVisibleItems[0]; // first item that matches the value
			bCurrentlySelectedItemVisible = aVisibleItems.some(function (oItem) {
				return oItem.getKey() === this.getSelectedKey();
			}, this);
			aCommonStartsWithItems = this.intersectItems(this._filterStartsWithItems(sValue, 'getText'), aVisibleItems);

			// In some cases, the filtered items may only be shown because of second,
			// third, etc term matched the typed in by the user value. However, if the ComboBox
			// has selectedKey already, and this key corresponds to an item, which is already not
			// visible after the filtering, the selection does not correspond to the users input.
			// In such cases:
			// - The selectedKey will be cleared so no "hidden" selection is left in the ComboBox
			// - Further validation is required from application side as the ComboBox allows input
			//   that does not match any item from the list.
			if (oFirstVisibleItem && this.getSelectedKey() && !bCurrentlySelectedItemVisible) {
				this.setSelection(null);
			}

			const bExactMatch = aCommonStartsWithItems.some((item) => item.getText() === sValue);

			if (!bEmptyValue && oControl && (oControl._bDoTypeAhead || bExactMatch)) {
				this.handleTypeAhead(oControl, aVisibleItems, sValue);
			} else if (!bEmptyValue && aCommonStartsWithItems[0] && sValue === aCommonStartsWithItems[0].getText()) {
				this.setSelection(aCommonStartsWithItems[0]);
			} else {
				this.setSelection(null);
			}

			if (oSelectedItem !== this.getSelectedItem()) {
				this.fireSelectionChange({
					selectedItem: this.getSelectedItem()
				});

				oListItem = ListHelpers.getListItem(this.getSelectedItem());
			}

			this._sInputValueBeforeOpen = sValue;

			if (this.isOpen()) {
				setTimeout(function () {
						this.highlightList(sValue);
					}.bind(this));
				}

			if (oFirstVisibleItem) {
				if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
					this.close();
				} else if (bToggleOpenState) {
					this.open();
					scrollToItem(oListItem, this.getPicker());
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
		 * @param {sap.m.Input} oInput The input control
		 * @param {sap.ui.core.Item[]} aItems The array of items
		 * @param {string} sValue The input text value
		 * @private
		 */
		ComboBox.prototype.handleTypeAhead = function (oInput, aItems, sValue) {
			var aItemTexts,
				bSearchBoth = this.getFilterSecondaryValues(),
				aMatchingItems = typeAhead(sValue, oInput, aItems, function (oItem) {
					aItemTexts = [oItem.getText()];
					if (bSearchBoth) {
						aItemTexts.push(oItem.getAdditionalText());
					}
					return aItemTexts;
				});

			this.setSelection(aMatchingItems[0]);

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
			var oItem = ListHelpers.getItemByListItem(this.getItems(), oControlEvent.getParameter("listItem")),
				mParam = this.getChangeEventParams(),
				bSelectedItemChanged = (oItem !== this.getSelectedItem());

			oItem && this.updateDomValue(oItem.getText());
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
				bSelectedItemChanged = (oListItem !== ListHelpers.getListItem(this.getSelectedItem()));

			if (oListItem.isA("sap.m.GroupHeaderListItem")) {
				return;
			}

			this.setLastFocusedListItem(oListItem);
			this.updateDomValue(sText);

			// if a highlighted item is pressed fire change event
			if (!bSelectedItemChanged) {
				mParam.itemPressed = true;
				this.onChange(null, mParam);
			}

			this._setPropertyProtected("value", sText, true);

			// deselect the text and move the text cursor at the endmost position
			if (this.getPickerType() === "Dropdown" && !this.isPlatformTablet()) {
				this.selectText(this.getValue().length, this.getValue().length);
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
			var oSuggestionsPopover = this._getSuggestionsPopover();
			var fnPickerTypeBeforeOpen = this["onBeforeOpen" + this.getPickerType()];

			this.setProperty("_open", true);

			// the dropdown list can be opened by calling the .open() method (without
			// any end user interaction), in this case if items are not already loaded
			// and there is an {@link #loadItems} event listener attached, the items should be loaded
			if (this.hasLoadItemsEventListeners() && !this.bProcessingLoadItemsEvent) {
				this.loadItems();
			}

			// call the hook to add additional content to the list
			this.addContent();
			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
			oSuggestionsPopover.resizePopup(this);
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

			this.getSelectedItem() && itemsVisibilityHandler(this.getItems(), this.filterItems(""));

			oPickerTextField.setValue(this._sValueBeforeOpen);
		};

		/**
		 * This event handler is called after the picker popup is opened.
		 *
		 * @private
		 */
		ComboBox.prototype.onAfterOpen = function() {
			var oItem = this.getSelectedItem(),
				oSelectionRange = selectionRange(this.getFocusDomRef()),
				bTablet = this.isPlatformTablet();

			this.closeValueStateMessage();

			// if there is a selected item, scroll and show the list
			fnSelectedItemOnViewPort.call(this, true);

			/**
			 * Some android devices such as Galaxy Tab 3 are not returning the correct selection of text fields
			 */
			if (!bTablet && oItem && oSelectionRange.start === oSelectionRange.end && oSelectionRange.start > 1) {
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

			this.setProperty("_open", false);

			if (document.activeElement === oDomRef) {
				this.updateFocusOnClose();
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
			// clear the filter to make all items visible,
			// notice that to prevent flickering, the filter is cleared
			// after the close animation is completed
			this.clearFilter();
			this._sInputValueBeforeOpen = "";

			if (this.isPickerDialog()) {
				ComboBoxBase.prototype.closeValueStateMessage.apply(this, arguments);
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

			return ComboBoxBase.prototype.onItemChange.call(this, oControlEvent, this.getShowSecondaryValues());
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

			// disable the typeahead feature for android devices due to an issue on android soft keyboard, which always returns keyCode 229
			oControl._bDoTypeAhead = !Device.os.android && (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
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
				oItem = oControl.getSelectedItem(),
				oSuggestionPopover = oControl._getSuggestionsPopover(),
				oFocusedItem = oSuggestionPopover && oSuggestionPopover.getFocusedListItem();

			if (oItem && this.getFilterSecondaryValues()) {
				oControl.updateDomValue(oItem.getText());
			}

			ComboBoxBase.prototype.onsapenter.apply(oControl, arguments);

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// prevent closing of popover, when Enter is pressed on a group header
			if (oFocusedItem && oFocusedItem.isA("sap.m.GroupHeaderListItem")) {
				return;
			}

			if (oControl.isOpen() && !this.isComposingCharacter()) {
				oControl.close();
			}
		};

		/**
		 * Handles the <code>sapup</code>, <code>sapdown</code>, <code>sappageup</code>, <code>sappagedown</code>,
		 * <code>saphome</code>, <code>sapend</code> pseudo events when the Up/Down/Page Up/Page Down/Home/End key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		["onsapup", "onsapdown", "onsappageup", "onsappagedown", "onsaphome", "onsapend"].forEach(function(sName) {
			ComboBox.prototype[sName] = function (oEvent) {
				this.handleListNavigation(oEvent, sName);
			};
		});

		/**
		 * Handles the list navigation
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @param {string} sName The event name.
		 * @private
		 */
		ComboBox.prototype.handleListNavigation = function (oEvent, sName) {
			var oControl = oEvent.srcControl;

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!oControl.getEnabled() || !oControl.getEditable()) {
				return;
			}

			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			this.loadItems(function() {
				this.syncPickerContent();

				if (!this.isOpen()) {
					this.handleInlineListNavigation(sName);
				} else {
					var oSuggestionsPopover = this._getSuggestionsPopover();
					oSuggestionsPopover && oSuggestionsPopover.handleListNavigation(this, oEvent, sName);
				}

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();
			});
		};

		/**
		 * Handles the list navigation, when the picker is closed.
		 *
		 * @param {string} sName The event name.
		 * @private
		 */
		ComboBox.prototype.handleInlineListNavigation = function (sName) {
			var aItems = this.getItems(),
				aSelectableItems = ListHelpers.getSelectableItems(aItems),
				oSelectedItem = this.getSelectedItem(),
				iIndex;

			// calculates the index of the next item, depending on the pressed key
			switch (sName) {
				case "onsapdown":
					iIndex = aSelectableItems.indexOf(oSelectedItem) + 1;
					break;
				case "onsapup":
					iIndex = oSelectedItem ? aSelectableItems.indexOf(oSelectedItem) - 1 : aSelectableItems.length - 1;
					break;
				case "onsapend":
					iIndex = aSelectableItems.length - 1;
					break;
				case "onsaphome":
					iIndex = 0;
					break;
				case "onsappagedown":
					iIndex = Math.min(aSelectableItems.length - 1,  aSelectableItems.indexOf(oSelectedItem) + 10);
					break;
				case "onsappageup":
					iIndex = Math.max(0, aSelectableItems.indexOf(oSelectedItem) - 10);
					break;
			}

			this.handleSelectionFromList(aSelectableItems[iIndex]);
		};

		/**
		 * Handles the list selection.
		 *
		 * @param {sap.ui.core.Item | sap.m.StandardListItem | sap.m.GroupHeaderListItem} oItem The item to be selected
		 * @private
		 */
		ComboBox.prototype.handleSelectionFromList = function (oItem) {
			if (!oItem) {
				return;
			}

			var oDomRef = this.getFocusDomRef(),
				sTypedValue = oDomRef.value.substring(0, oDomRef.selectionStart),
				oSelectedItem = this.getSelectedItem(),
				oLastFocusedItem = this.getLastFocusedListItem(),
				oListItem, sItemText, iSelectionStart, bLastFocusOnGroup;

			// if the navigation is inline, the passed item will be a core item,
			// otherwise it is a list item
			if (oItem.isA("sap.m.StandardListItem") || oItem.isA("sap.m.GroupHeaderListItem")) {
				oListItem = oItem;
				oItem = ListHelpers.getItemByListItem(this.getItems(), oItem);
			} else {
				oListItem = ListHelpers.getListItem(oItem);
			}

			this.setSelection(oItem);
			this.setLastFocusedListItem(oListItem);

			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				// when visual focus moves to the group header item
				// we should deselect and leave only the input typed in by the user
				this.setSelectedItem(null);

				this.updateDomValue(sTypedValue);
				this.fireSelectionChange({ selectedItem: null });

				this._getGroupHeaderInvisibleText().setText(this._oRb.getText("LIST_ITEM_GROUP_HEADER") + " " + oItem.getText());
				return;
			}

			if (oItem !== oSelectedItem) {
				sItemText = oItem.getText();
				bLastFocusOnGroup = oLastFocusedItem && oLastFocusedItem.isA("sap.m.GroupHeaderListItem");
				iSelectionStart = calculateSelectionStart(selectionRange(oDomRef, bLastFocusOnGroup) , sItemText, sTypedValue, bLastFocusOnGroup);

				this.updateDomValue(sItemText);
				this.fireSelectionChange({ selectedItem: oItem });

				// update the selected item after the change event is fired (the selection may change)
				oItem = this.getSelectedItem();

				this.selectText(iSelectionStart, oDomRef.value.length);
			}
		};

		/**
		 * Sets the last focused list item.
		 *
		 * @param {sap.m.StandardListItem | sap.m.GroupHeaderListItem} oListItem The item that is focused.
		 * @private
		 */
		ComboBox.prototype.setLastFocusedListItem = function(oListItem) {
			this._oLastFocusedListItem = oListItem;
		};

		/**
		 * Gets the last focused list item.
		 *
		 * @private
		 */
		ComboBox.prototype.getLastFocusedListItem = function() {
			return this._oLastFocusedListItem;
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
				aSelectableItems = ListHelpers.getSelectableItems(this.getItems());
				oItem = aSelectableItems[0];

				if (oItem) {
					oListItem = ListHelpers.getListItem(oItem);

					if (this.isOpen()) {
						this._getSuggestionsPopover().updateFocus(this, oListItem);
						this.setLastFocusedListItem(oListItem);
					} else {
						this.addStyleClass("sapMFocus");
					}

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
		 * @private
		 */
		ComboBox.prototype.onsaphide = ComboBox.prototype.onsapshow;

		/**
	 	* Called when the <code>ComboBox</code> is clicked or tapped.
	 	*
		* @public
		* @param {jQuery.Event} oEvent The event object.
		*/
		ComboBox.prototype.ontap = function(oEvent) {
			if (!this.getEnabled()) {
				return;
			}

			if (!this.isMobileDevice()) {
				this.openValueStateMessage();
			}

			this.updateFocusOnClose();
		};


		ComboBox.prototype.updateFocusOnClose = function() {
			var oDomRef = this.getFocusDomRef(),
				oSuggestionsPopover = this._getSuggestionsPopover();

			this.setLastFocusedListItem(null);

			if (oSuggestionsPopover) {
				oSuggestionsPopover.setValueStateActiveState(false);
				oSuggestionsPopover.updateFocus(this);
			}

			oDomRef.removeAttribute( "aria-activedescendant");
		};

		ComboBox.prototype.onmouseup = function () {
			if (this.getPickerType() === "Dropdown" &&
				document.activeElement === this.getFocusDomRef() &&
				!this.getSelectedText()) {

				this.selectText(0, this.getValue().length);
			}
		};

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
			oRelatedControl = Element.getElementById(oEvent.relatedControlId);
			oFocusDomRef = oRelatedControl && oRelatedControl.getFocusDomRef();

			if (containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef) && !bTablet && !(this._getSuggestionsPopover().getValueStateActiveState())) {

				// force the focus to stay in the input field
				this.focus();
			}
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

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
				this._setPropertyProtected("selectedItemId", vItem.getId(), true);

				this.setValue(vItem.getText());
				this._sValue = this.getValue();
			}
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

			// apply aria role="listbox" to List control
			oList.applyAriaRole("listbox");

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
			this.setAssociation("selectedItem", null);
			this.setSelectedItemId("");
			this.setSelectedKey("");
		};

		/**
		 * Sets the start and end positions of the current text selection.
		 *
		 * @param {int} iSelectionStart The index of the first selected character.
		 * @param {int} iSelectionEnd The index of the character after the last selected character.
		 * @returns {this} <code>this</code> to allow method chaining
		 * @protected
		 * @since 1.22.1
		 */
		ComboBox.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
			ComboBoxBase.prototype.selectText.apply(this, arguments);
			return this;
		};

		/**
		 * Clones the <code>sap.m.ComboBox</code> control.
		 *
		 * @param {string} [sIdSuffix] Suffix to be added to the IDs of the new control and its internal objects.
		 * @returns {this} The cloned <code>sap.m.ComboBox</code> control.
		 * @public
		 * @since 1.22.1
		 */
		ComboBox.prototype.clone = function(sIdSuffix) {
			var oComboBoxClone = ComboBoxBase.prototype.clone.apply(this, arguments),
				oList = this._getList();

			// ensure that selected item is cleared, but keep key
			// cloning can't have a reference to an item of other ComboBox
			oComboBoxClone.setAssociation("selectedItem", null);

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
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @protected
		 */
		ComboBox.prototype.open = function() {
			this.syncPickerContent();
			ComboBoxBase.prototype.open.call(this);

			var oSelectedItem = ListHelpers.getListItem(this.getSelectedItem());

			if (!this._bInputFired) {
				this._getSuggestionsPopover() && this._getSuggestionsPopover().updateFocus(this, oSelectedItem);
			}

			this._bInputFired = false;

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

				ListHelpers.fillList(this.getItems(), this._getList(), this._mapItemToListItem.bind(this));
				itemsVisibilityHandler(this.getItems(), this.filterItems(""));

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

				/* Forward the value state data to the newly created suggestions popover
				except the FormattedText aggregation. At this point we don't know if the
				sugg. popover will get opened afterwards, so we don't want to switch it's
				parent to ValueStateHeader yet, allowing the InputBase to still be able
				to render it in a ValueStateMessage popup if needed. */
				this._getSuggestionsPopover().updateValueState(this.getValueState(), this.getValueStateText(), this.getShowValueStateMessage());
			}

			this.synchronizeSelection();
			return oPicker;
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
		 * @param {sap.ui.core.ID | sap.ui.core.Item | null} vItem New value for the <code>selectedItem</code> association.
		 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
		 * <code>selectedItem</code> association.
		 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
		 * the selection.
		 *
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				this.setAssociation("selectedItem", vItem, true);
				vItem = Element.getElementById(vItem);
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
		 * @returns {this} <code>this</code> to allow method chaining.
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
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var bShouldResetSelection = this.shouldResetSelection(sKey),
				// the correct solution for tackling the coupling of selectedKey and value should be by using debounce
				// however this makes the API async, which alters the existing behaviour of the control
				// that's why the solution is implemented with skipModelUpdate property
				bSkipModelUpdate = this.isBound("selectedKey") && this.isBound("value") && this.getBindingInfo("selectedKey").skipModelUpdate;

			if (bShouldResetSelection) {
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
			return this._setPropertyProtected("selectedKey", sKey);
		};

		/**
		 * Determines if the Control's selection should get reset.
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * @returns {boolean} If the Control's has to be reset
		 * @private,
		 * @ui5-restricted sap.ui.comp.smartfield.ComboBox
		 */
		ComboBox.prototype.shouldResetSelection = function(sKey) {
			return (sKey === this.getMetadata().getProperty("selectedKey").defaultValue);
		};

		/**
		 * Sets property avoiding model exceptions
		 *
		 * A temporary fix for OData v4 exception, until a better solution is found or the exception there is removed.
		 *
		 * @param sPropertyName
		 * @param sValue
		 * @param bSuppressInvalidate
		 * @returns {*}
		 * @private
		 */
		ComboBox.prototype._setPropertyProtected = function (sPropertyName, sValue, bSuppressInvalidate) {
			try {
				return this.setProperty(sPropertyName, sValue, bSuppressInvalidate);
			} catch (e) {
				Log.warning("setSelectedKey update failed due to exception. Loggable in support mode log", null, null, function () {
					return {exception: e};
				});
			}
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
			return (vSelectedItem === null) ? null : Element.getElementById(vSelectedItem) || null;
		};

		/**
		 * Modifies the suggestions dialog input
		 * @param {sap.m.Input} oInput The input
		 *
		 * @returns {sap.m.Input} The modified input control
		 * @private
		 * @ui5-restricted
		 * @function
		 */
		ComboBox.prototype._decoratePopupInput = function (oInput) {
			ComboBoxBase.prototype._decoratePopupInput.apply(this, arguments);

			if (!oInput || !oInput.isA(["sap.m.InputBase"])) {
				return;
			}

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

			oInput.attachChange(this._handleInnerInputChange.bind(this));

			return oInput;
		};

		/**
		 * Handles the picker input change.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		ComboBox.prototype._handleInnerInputChange = function (oEvent) {
			if (oEvent.getParameter("value") === "") {
				this.clearSelection();
				this.clearFilter();
			}
		};

		/**
		 * Applies Combobox specific filtering over the list items.
		 * Called within showItems method.
		 *
		 * @since 1.64
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

				itemsVisibilityHandler(this.getItems(), this.filterItems(this.getValue() || "_"));
			};

			// Combobox uses onBeforeOpen of the picker in order to sync the items
			// with the SuggestionsPopover. This leads to flickering of the Popover if filtering
			// is applied directly to the list.
			// Attaching to that event here, ensures that showItems filtering would happen
			// after SuggestionsPopover's reset, but before the picker is opened.
			oPicker.attachBeforeOpen(fnPickerOpenListener, this);
		};

		/**
		 * Opens the <code>SuggestionsPopover</code> with the available items.
		 *
		 * @param {function} fnFilter Function to filter the items shown in the SuggestionsPopover
		 * @returns {void}
		 *
		 * @override
		 */
		ComboBox.prototype.showItems = function (fnFilter) {
			var aFilteredItems, oFilterResults,
				args = Array.prototype.slice.call(arguments),
				fnFilterRestore = this.fnFilter,
				fnLoadItemsListener = function () {
					// Get filtered items and open the popover only when the items array is not empty.
					this.setFilterFunction(fnFilter || function () { return true; });
					oFilterResults = this.filterItems(this.getValue() || "_");
					itemsVisibilityHandler(this.getItems(), oFilterResults);
					this.setFilterFunction(fnFilterRestore);

					aFilteredItems = oFilterResults.items;
					if (aFilteredItems && aFilteredItems.length) {
						ComboBoxBase.prototype.showItems.apply(this, args);
					}
				}.bind(this);

			this.attachLoadItems(fnLoadItemsListener);
			this.loadItems(fnLoadItemsListener);
		};

		/**
		 * Gets <code>sap.m.FormattedText</code> aggregation based on its current parent.
		 * If the SuggestionPopover is open that is the <code>sap.m.ValueStateHeader</code>, otherwise is the InputBase itself.
		 *
		 * @private
		 * @returns {sap.m.FormattedText} Aggregation used for value state message that can contain links.
		 * @since 1.78
		 */
		ComboBox.prototype._getFormattedValueStateText = function() {
			if (this.isOpen()) {
				return this._getSuggestionsPopover()._getValueStateHeader().getFormattedText();
			} else {
				return ComboBoxTextField.prototype.getFormattedValueStateText.call(this);
			}
		};

		/**
		 * Handles the clear icon press.
		 *
		 * @param {sap.ui.base.Event} oEvent The press event object
		 * @returns {void}
		 *
		 * @override
		 * @private
		 */
		ComboBox.prototype.handleClearIconPress = function (oEvent) {
			var oPreviouslySelectedItem = this.getSelectedItem(),
				mParam = this.getChangeEventParams();

			if (!(this.getEnabled() && this.getEditable())) {
				return;
			}

			if (this.getValue() !== "") {
				this.clearSelection();
				this.bOpenedByKeyboardOrButton ? this.clearFilter() : this.close();
				this.setProperty("effectiveShowClearIcon", false);
			}

			if (oPreviouslySelectedItem) {
				this.fireSelectionChange({
					selectedItem: null
				});

				this.fireChangeEvent(null, mParam);
			}
		};

		/**
		 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
		 * Determines if the Control is interactive.
		 *
		 * @returns {boolean} If it is an interactive Control
		 *
		 * @private
		 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
		 */
		ComboBox.prototype._getToolbarInteractive = function () {
			return true;
		};

		return ComboBox;

	});
