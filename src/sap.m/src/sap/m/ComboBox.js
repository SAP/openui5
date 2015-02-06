/*!
 * ${copyright}
 */

// Provides control sap.m.ComboBox.
sap.ui.define(['jquery.sap.global', './ComboBoxBase', './ComboBoxRenderer', './library'],
	function(jQuery, ComboBoxBase, ComboBoxRenderer, library) {
		"use strict";

		/**
		 * Constructor for a new ComboBox.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ComboBox control provides a list box with items and a text field allowing the user to either type a value directly into the control or choose from the list of existing items.
		 * @extends sap.m.ComboBoxBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.22
		 * @alias sap.m.ComboBox
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ComboBox = ComboBoxBase.extend("sap.m.ComboBox", /** @lends sap.m.ComboBox.prototype */ { metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Key of the selected item. If the key has no corresponding item, no changes will apply. If duplicate keys exist, the first item matching the key is used.
				 */
				selectedKey: { type: "string", group: "Data", defaultValue: "" },

				/**
				 * Identifier of the selected item. If the identifier has no corresponding item, no changes will apply.
				 */
				selectedItemId: { type: "string", group: "Misc", defaultValue: "" }
			},
			associations: {

				/**
				 * Sets or retrieves the selected item from the aggregation named items.
				 */
				selectedItem: { type: "sap.ui.core.Item", multiple: false }
			},
			events: {

				/**
				 * Occurs when the user changes the selected item.
				 */
				selectionChange: {
					parameters: {

						/**
						 * The selected item.
						 */
						selectedItem: { type: "sap.ui.core.Item" }
					}
				}
			}
		}});

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		function fnHandleKeyboardNavigation(oItem) {
			var oDomRef = this.getFocusDomRef(),
				iSelectionStart = oDomRef.selectionStart,
				iSelectionEnd = oDomRef.selectionEnd,
				bIsTextSelected = iSelectionStart !== iSelectionEnd,
				sTypedValue = oDomRef.value.substring(0, oDomRef.selectionStart),
				oSelectedItem = this.getSelectedItem();

			if (oItem && (oItem !== oSelectedItem)) {
				this.updateDomValue(oItem.getText());
				this.setSelection(oItem, { suppressInvalidate: true });
				this.fireSelectionChange({ selectedItem: oItem });

				oItem = this.getSelectedItem();	// note: update the selected item after the change event is fired (the selection may change)

				if (!jQuery.sap.startsWithIgnoreCase(oItem.getText(), sTypedValue) || !bIsTextSelected) {
					iSelectionStart = 0;
				}

				this.selectText(iSelectionStart, oDomRef.value.length);
			}

			this.scrollToItem(this.getList().getSelectedItem());
		}

		/* ----------------------------------------------------------- */
		/* Popover                                                     */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance type of <code>sap.m.Popover</code>.
		 *
		 * @returns {sap.m.Popover}
		 * @private
		 */
		ComboBox.prototype._createPopover = function() {

			// initialize Popover
			var oPicker = new sap.m.Popover({
				showHeader: false,
				placement: sap.m.PlacementType.Vertical,
				offsetX: 0,
				offsetY: 0,
				initialFocus: this,
				bounce: false
			});

			this._decoratePopover(oPicker);
			return oPicker;
		};

		/**
		 * Decorate a Popover instance by adding some private methods.
		 *
		 * @param {sap.m.Popover}
		 * @private
		 */
		ComboBox.prototype._decoratePopover = function(oPopover) {
			var that = this;

			// adding additional capabilities to the Popover
			oPopover._removeArrow = function() {
				this._marginTop = 0;
				this._marginLeft = 0;
				this._marginRight = 0;
				this._marginBottom = 0;
				this._arrowOffset = 0;
				this._offsets = ["0 0", "0 0", "0 0", "0 0"];
			};

			oPopover._setPosition = function() {
				this._myPositions = ["begin bottom", "begin center", "begin top", "end center"];
				this._atPositions = ["begin top", "end center", "begin bottom", "begin center"];
			};

			oPopover._setArrowPosition = function() {};

			oPopover.open = function() {
				return this.openBy(that.getFocusDomRef());
			};
		};

		/**
		 * Required adaptations after rendering of the Popover.
		 *
		 * @private
		 */
		ComboBox.prototype.onAfterRenderingPopover = function() {
			var oPopover = this.getPicker();

			// remove the Popover arrow
			oPopover._removeArrow();

			// position adaptations
			oPopover._setPosition();
		};

		/* ----------------------------------------------------------- */
		/* Dialog                                                      */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance type of <code>sap.m.Dialog</code>.
		 *
		 * @returns {sap.m.Dialog}
		 * @private
		 */
		ComboBox.prototype._createDialog = function() {
			var CSS_CLASS = sap.m.ComboBoxBaseRenderer.CSS_CLASS;

			// initialize Dialog
			var oDialog = new sap.m.Dialog({
				stretchOnPhone: true,
				customHeader: new sap.m.Bar({
					contentLeft: new sap.m.InputBase({
						value: this.getSelectedItem().getText(),
						width: "100%",
						editable: false
					}).addStyleClass(CSS_CLASS + "Input")
				}).addStyleClass(CSS_CLASS + "Bar")
			});

			oDialog.getAggregation("customHeader").attachBrowserEvent("tap", function() {
				oDialog.close();
			}, this);

			return oDialog;
		};

		/**
		 * Called before the Dialog is opened.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeOpenDialog = function() {
			var oHeader = this.getPicker().getCustomHeader();
			oHeader.getContentLeft()[0].setValue(this.getSelectedItem().getText());
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Required adaptations before rendering.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeRendering = function() {
			ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
			this.synchronizeSelection();
			this._clearList();
			this._fillList(this.getItems());
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handle the input event on the control's input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.oninput = function(oEvent) {
			ComboBoxBase.prototype.oninput.apply(this, arguments);

			var oSelectedItem = this.getSelectedItem(),
				aItems = this.getItems(),
				oInputDomRef = oEvent.target,
				sValue = oInputDomRef.value,
				bFirst = true,
				bVisibleItems = false,
				oItem,
				bMatch,
				oListItem,
				i = 0;

			for (; i < aItems.length; i++) {

				// the item match with the value
				oItem = aItems[i];
				bMatch = jQuery.sap.startsWithIgnoreCase(oItem.getText(), sValue);
				oListItem = this.getListItem(oItem);

				if (sValue === "") {
					bMatch = true;
				}

				// toggle the visibility of the items according to the value
				oListItem.setVisible(bMatch);

				if (bMatch && !bVisibleItems) {
					bVisibleItems = true;
				}

				// first match of the value
				if (bFirst && bMatch && sValue !== "") {
					bFirst = false;

					if (this._bDoTypeAhead) {
						this.updateDomValue(oItem.getText());
					}

					this.setSelection(oItem, { suppressInvalidate: true });

					if (oSelectedItem !== this.getSelectedItem()) {
						this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
					}

					if (this._bDoTypeAhead) {
						this.selectText(sValue.length, 9999999);
					}

					this.scrollToItem(this.getList().getSelectedItem());
				}
			}

			if (sValue === "" || !bVisibleItems) {
				this.setSelection(null, { suppressInvalidate: true });

				if (oSelectedItem !== this.getSelectedItem()) {
					this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
				}
			}

			// open the picker on input
			if (bVisibleItems) {
				this.open();
			} else {
				this.isOpen() ? this.close() : this.clearFilter();
			}
		};

		/**
		 * Handle the selection change event on the List.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @private
		 */
		ComboBox.prototype.onSelectionChange = function(oControlEvent) {
			var oListItem = oControlEvent.getParameter("listItem"),
				oNewSelectedItem = this._findMappedItem(oListItem),
				sValue;

			if ((oListItem.getType() === "Inactive") || // workaround: this is needed because the List fires the "selectionChange" event on inactive items

				// a non editable or disabled ComboBox, the selection cannot be modified
				!this.getEnabled() || !this.getEditable()) {

				return;
			}

			// pre-assertion
			jQuery.sap.assert(oNewSelectedItem, "The corresponding mapped item was not found on " + this);

			if (oNewSelectedItem) {

				// set the input value
				this.updateDomValue(oNewSelectedItem.getText());

				// update the selected item
				this.setSelection(oNewSelectedItem, {
					suppressInvalidate: true,
					listItemUpdated: true
				});

				this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
				sValue = this.getValue();

				if (sap.ui.Device.system.desktop) {

					// deselect the text and move the text cursor at the endmost position (only ie)
					jQuery.sap.delayedCall(0, this, "selectText", [sValue.length, sValue.length]);
				}
			}
		};

		/**
		 * Handle the item press event on the List.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @private
		 */
		ComboBox.prototype.onItemPress = function() {
			this.close();
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handle the keydown event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onkeydown = function(oEvent) {
			ComboBoxBase.prototype.onkeydown.apply(this, arguments);

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var mKeyCode = jQuery.sap.KeyCodes;
			this._bDoTypeAhead = (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
		};

		/**
		 * Handle cut event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.oncut = function(oEvent) {
			ComboBoxBase.prototype.oncut.apply(this, arguments);
			this._bDoTypeAhead = false;
		};

		/**
		 * Handle when enter is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapenter = function(oEvent) {
			ComboBoxBase.prototype.onsapenter.apply(this, arguments);

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			var sValue = this.getValue();
			this.setValue(sValue);

			// no text selection
			this.selectText(sValue.length, sValue.length);

			if (this.isOpen()) {
				this.close();
			}
		};

		/**
		 * Handle when keyboard DOWN arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapdown = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			var oNextSelectableItem,
				aSelectableItems = this.getSelectableItems();

			oNextSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) + 1];
			fnHandleKeyboardNavigation.call(this, oNextSelectableItem);
		};

		/**
		 * Handle when keyboard UP arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapup = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			var oPrevSelectableItem,
				aSelectableItems = this.getSelectableItems();

			oPrevSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) - 1];
			fnHandleKeyboardNavigation.call(this, oPrevSelectableItem);
		};

		/**
		 * Handle Home key pressed.
		 * Select the first selectable item and update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsaphome = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			var oFirstSelectableItem = this.getSelectableItems()[0];
			fnHandleKeyboardNavigation.call(this, oFirstSelectableItem);
		};

		/**
		 * Handle End key pressed.
		 * Select the last selectable item and update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapend = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when End key is pressed
			oEvent.preventDefault();

			var oLastSelectableItem = this.findLastEnabledItem(this.getSelectableItems());
			fnHandleKeyboardNavigation.call(this, oLastSelectableItem);
		};

		/**
		 * Handle when page down key is pressed.
		 *
		 * Select the last visible item. If the last visible item is already selected,
		 * scroll one page down and select the then last visible item.
		 * If the last item is selected, do nothing.
		 * Update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappagedown = function(oEvent) {

			// non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				iIndex = aSelectableItems.indexOf(this.getSelectedItem()) + 10,
				oItem;

			// constrain the index
			iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
			oItem = aSelectableItems[iIndex];
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle when page up key is pressed.
		 *
		 * Select the first visible item. If the first visible item is already selected,
		 * scroll one page up and select the then first visible item.
		 * If the first item is selected, do nothing.
		 * Update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappageup = function(oEvent) {

			// a non editable or disabled ComboBox the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				iIndex = aSelectableItems.indexOf(this.getSelectedItem()) - 10,
				oItem;

			// constrain the index
			iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
			oItem = aSelectableItems[iIndex];
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle the focusin event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onfocusin = function(oEvent) {
			this.$().addClass("sapMComboBoxFocused");

			// the arrow is receiving focus
			if (oEvent.target === this.getOpenArea()) {

				// the value state message can not be opened if click on the open area
				this.bCanNotOpenMessage = true;

				// avoid the text-editing mode pop-up to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (sap.ui.Device.system.desktop) {

					// force the focus to stay in the input field
					this.focus();
				}

			// probably the input field is receiving focus
			} else {

				// avoid the text-editing mode pop-up to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (sap.ui.Device.system.desktop) {
					jQuery.sap.delayedCall(0, this, function() {
						if (document.activeElement === this.getFocusDomRef()) {
							this.selectText(0, this.getValue().length);
						}
					});
				}

				// open the message pop-up
				if (!this.isOpen() && !this.bCanNotOpenMessage) {
					this.openValueStateMessage();
				}

				this.bCanNotOpenMessage = false;
			}
		};

		/**
		 * Handle the focus leave event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapfocusleave = function(oEvent) {
			var oPicker = this.getAggregation("picker");

			this.$().removeClass("sapMComboBoxFocused");

			if (!oEvent.relatedControlId || !oPicker) {
				return;
			}

			var oControl = sap.ui.getCore().byId(oEvent.relatedControlId),
				oFocusDomRef = oControl && oControl.getFocusDomRef();

			if (jQuery.sap.containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef)) {

				if (sap.ui.Device.system.desktop) {

					// force the focus to stay in the input field
					this.focus();
				}
			}
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* protected methods                                           */
		/* ----------------------------------------------------------- */

		/*
		 * Update and synchronize "selectedItem" association, "selectedItemId", "selectedKey" properties and
		 * the "selectedItem" in the List.
		 *
		 * @param {sap.ui.core.Item | null} vItem
		 * @param {object} [mOptions]
		 * @param {boolean} [mOptions.suppressInvalidate]
		 * @param {boolean} [mOptions.listItemUpdated]
		 * @protected
		 */
		ComboBox.prototype.setSelection = function(vItem, mOptions) {
			var oListItem,
				oDomRef,
				sActivedescendant = "aria-activedescendant";

			mOptions = mOptions || {};

			this.setAssociation("selectedItem", vItem || null, mOptions.suppressInvalidate);
			this.setProperty("selectedItemId", (vItem instanceof sap.ui.core.Item) ? vItem.getId() : vItem,  mOptions.suppressInvalidate);

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			this.setProperty("selectedKey", vItem ? vItem.getKey() : "", mOptions.suppressInvalidate);

			oListItem = this.getListItem(vItem);
			oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// the aria-activedescendant attribute is set when the list is rendered
				if (vItem && oListItem && oListItem.getDomRef() && this.isOpen()) {
					oDomRef.setAttribute(sActivedescendant, oListItem.getId());
				} else {
					oDomRef.removeAttribute(sActivedescendant);
				}
			}

			// update the selection in the List
			if (!mOptions.listItemUpdated) {

				if (oListItem) {

					// set the selected item of the List
					this.getList().setSelectedItem(oListItem, true);
				} else if (this.getList()) {

					if (this.getDefaultSelectedItem()) {
						this.getList().setSelectedItem(this.getListItem(this.getDefaultSelectedItem()), true);
					} else if (this.getList().getSelectedItem()) {

						this.getList().setSelectedItem(this.getList().getSelectedItem(), false);
					}
				}
			}
		};

		/*
		 * Determines whether the "selectedItem" association and "selectedKey" property are synchronized.
		 *
		 * @returns {boolean}
		 * @protected
		 * @since 1.24.0
		 */
		ComboBox.prototype.isSelectionSynchronized = function() {
			var vItem = this.getSelectedItem();
			return this.getSelectedKey() === (vItem && vItem.getKey());
		};

		/**
		 * Synchronize selected item and key.
		 *
		 * @protected
		 */
		ComboBox.prototype.synchronizeSelection = function() {

			// the "selectedKey" property is synchronized with the "selectedItem" association
			if (this.isSelectionSynchronized()) {
				return;
			}

			var sKey = this.getSelectedKey(),
				vItem = this.getItemByKey("" + sKey);	// find the first item with the given key

			// if there is an item that match with the "selectedKey" property and
			// the "selectedKey" property does not have the default value
			if (vItem && (sKey !== "")) {

				// update and synchronize "selectedItem" association and
				// "selectedKey" property
				this.setAssociation("selectedItem", vItem, true);	// suppress re-rendering
				this.setProperty("selectedItemId", vItem.getId(), true);	// suppress re-rendering

				// update the value if it has not changed
				if (this._sValue === this.getValue()) {
					this.setValue(vItem.getText());
				}
			}
		};

		/*
		 * Determines whether the list is filtered out from the input field.
		 *
		 * @returns {boolean} Whether the list is filtered out.
		 * @protected
		 * @since 1.26.0
		 */
		ComboBox.prototype.isFiltered = function() {
			return this.getVisibleItems().length !== this.getItems().length;
		};

		/**
		 * Creates a picker.
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker pop-up to be used.
		 * @protected
		 */
		ComboBox.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				return oPicker;
			}

			oPicker = this["_create" + sPickerType]();

			// define a parent-child relationship between the control's and the picker pop-up
			this.setAggregation("picker", oPicker, true);

			// configuration
			oPicker.setHorizontalScrolling(false)
					.addStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "Picker")
					.attachBeforeOpen(this.onBeforeOpen, this)
					.attachAfterOpen(this.onAfterOpen, this)
					.attachBeforeClose(this.onBeforeClose, this)
					.attachAfterClose(this.onAfterClose, this)
					.addEventDelegate({
						onBeforeRendering: this.onBeforeRenderingPicker,
						onAfterRendering: this.onAfterRenderingPicker
					}, this)
					.addContent(this.getList());

			return oPicker;
		};

		/*
		 * Create an instance type of <code>sap.m.List</code>.
		 *
		 * @returns {sap.m.List}
		 * @protected
		 */
		ComboBox.prototype.createList = function() {

			// list to use inside the picker
			this._oList = new sap.m.List({
				width: "100%",
				mode: sap.m.ListMode.SingleSelectMaster,
				rememberSelections: false	// list should not remember selection
			}).addStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "List")
			.attachSelectionChange(this.onSelectionChange, this)
			.attachItemPress(this.onItemPress, this);
		};

		/*
		 * This hook method is called before the control's picker pop-up is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		/*
		 * This hook method is called after the control's picker pop-up is rendered.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["onAfterRendering" + this.getPickerType()];
			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);
		};

		/*
		 * This event handler will be called before the control's picker pop-up is opened.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeOpen = function() {
			var fnPickerTypeBeforeOpen = this["onBeforeOpen" + this.getPickerType()],
				oDomRef = this.getFocusDomRef();

			// add the active state to the control field
			this.addStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "Pressed");

			if (oDomRef) {

				// expose a parent/child contextual relationship to assistive technologies
				// note: the "aria-owns" attribute is set when the list is visible and in view
				oDomRef.setAttribute("aria-owns", this.getList().getId());
			}

			// call the hook to add additional content to the List
			this.addContent();

			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

		/*
		 * This event handler will be called before the control's picker popover is opened.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeOpenPopover = function() {
			var oDomRef = this.getDomRef();

			if (oDomRef) {
				this.getPicker().setContentWidth((oDomRef.offsetWidth / parseFloat(sap.m.BaseFontSize)) + "rem");
			}
		};

		/*
		 * This event handler will be called after the control's picker pop-up is opened.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterOpen = function() {
			var oDomRef = this.getFocusDomRef(),
				oItem = this.getSelectedItem();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "true");

				// note: the "aria-activedescendant" attribute is set when the currently active descendant is visible and in view
				oItem && oDomRef.setAttribute("aria-activedescendant", this.getListItem(oItem).getId());
			}
		};

		/*
		 * This event handler will be called before the picker pop-up is closed.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the control's field
			this.removeStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "Pressed");
		};

		/*
		 * This event handler will be called after the picker pop-up is closed.
		 *
		 * @protected
		 */
		ComboBox.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");
			}

			// if the focus is back to the input after close the picker, the message should be open
			if (document.activeElement === oDomRef) {
				this.openValueStateMessage();
			}

			// clear the filter to make all items visible
			// note: to prevent flickering, the filter is cleared
			// after the close animation is completed
			this.clearFilter();
		};

		/*
		 * Check whether an item is selected or not.
		 *
		 * @param {sap.ui.core.Item} vItem
		 * @returns {boolean} Whether the item is selected.
		 * @protected
		 * @since 1.24.0
		 */
		ComboBox.prototype.isItemSelected = function(vItem) {
			return vItem && (vItem.getId() === this.getAssociation("selectedItem"));
		};

		/**
		 * Retrieves the default selected item from the aggregation named <code>items</code>.
		 *
		 * @returns {null}
		 * @protected
		 */
		ComboBox.prototype.getDefaultSelectedItem = function() {
			return null;
		};

		/*
		 * Clear the selection.
		 *
		 * @protected
		 */
		ComboBox.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/**
		 * Sets the start and end positions of the current text selection.
		 *
		 * @param {integer} iSelectionStart The index into the text at which the first selected character is located.
		 * @param {integer} iSelectionEnd The index into the text at which the last selected character is located.
		 * @protected
		 * @since 1.22.1
		 */
		ComboBox.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
			ComboBoxBase.prototype.selectText.apply(this, arguments);
			this.textSelectionStart = iSelectionStart;
			this.textSelectionEnd = iSelectionEnd;
			return this;
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Setter for association <code>selectedItem</code>.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem new value for association <code>selectedItem</code>
		 *    Id of an sap.ui.core.Item which becomes the new target of this <code>selectedItem</code> association.
		 *    Alternatively, an sap.ui.core.Item instance may be given or null.
		 *    If the value of null is provided the first enabled item will be selected (if any).
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			if (!(vItem instanceof sap.ui.core.Item) && vItem !== null) {
				jQuery.sap.log.warning('Warning: setSelectedItem() "vItem" has to be an instance of sap.ui.core.Item, a valid sap.ui.core.Item id, or null on', this);
				return this;
			}

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			// update and synchronize "selectedItem" association,
			// "selectedKey" and "selectedItemId" properties
			this.setSelection(vItem, { suppressInvalidate: true });

			// set the input value
			if (vItem) {
				this.setValue(vItem.getText(), true);
				/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
				/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText(), true);
			} else {
				this.setValue("", true);
			}

			return this;
		};

		/**
		 * Setter for property <code>selectedItemId</code>.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 * If the provided <code>vItem</code> has a default value,
		 * the first enabled item will be selected (if any).
		 *
		 * @param {string | undefined} vItem New value for property <code>selectedItemId</code>.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItemId = function(vItem) {
			vItem = this.validateProperty("selectedItemId", vItem);

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			// update and synchronize "selectedItem" association,
			// "selectedKey" and "selectedItemId" properties
			this.setSelection(vItem, { suppressInvalidate: true	});
			vItem = this.getSelectedItem();

			// set the input value
			if (vItem) {
				this.setValue(vItem.getText(), true);
				/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
				/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText(), true);
			} else {
				this.setValue("", true);
			}

			return this;
		};

		/**
		 * Setter for property <code>selectedKey</code>.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * If the provided <code>sKey</code> has a default value,
		 * the first enabled item will be selected (if any).
		 * In the case that an item has the default key value, it will be selected instead.
		 *
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var oItem = this.getItemByKey(sKey);

			if (oItem || (sKey === "")) {

				// If the "sKey" value is an empty string "" or undefined,
				// the first enabled item will be selected (if any).
				// In the case that an item has the default key value, it will be selected instead.
				if (!oItem && sKey === "") {
					oItem = this.getDefaultSelectedItem();
				}

				// update and synchronize "selectedItem" association,
				// "selectedKey" and "selectedItemId" properties
				this.setSelection(oItem, { suppressInvalidate: true	});

				// set the input value
				if (oItem) {
					this.setValue(oItem.getText(), true);
					/*eslint-disable no-cond-assign */
				} else if (oItem = this.getDefaultSelectedItem()) {
					/*eslint-enable no-cond-assign */
					this.setValue(oItem.getText(), true);
				} else {
					this.setValue("", true);
				}

				return this;
			}

			// note: setSelectedKey() method sometimes is called
			// before the items are added, in this case the "selectedItem" association,
			// "selectedItemId" and the "value" properties need to be updated in onBeforeRendering()
			this._sValue = this.getValue();
			return this.setProperty("selectedKey", sKey);	// update "selectedKey" property, re-rendering is needed
		};

		/**
		 * Retrieves the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association, or null.
		 * @public
		 */
		ComboBox.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : sap.ui.getCore().byId(vSelectedItem) || null;
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or id.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		ComboBox.prototype.removeItem = function(vItem) {
			vItem = ComboBoxBase.prototype.removeItem.call(this, vItem);

			var sValue = this.getValue(),
				oItem;

			// no items, the removed item was the last
			if (this.getItems().length === 0) {

				// clear the selection
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {	// if the removed item is selected

				oItem = this.getDefaultSelectedItem();
				this.setSelection(oItem);
				this.setValue(sValue);
			}

			// return the removed item or null
			return vItem;
		};

		return ComboBox;

	}, /* bExport= */ true);