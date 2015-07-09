/*!
 * ${copyright}
 */

// Provides control sap.m.Select.
sap.ui.define(['jquery.sap.global', './Bar', './Dialog', './InputBase', './Popover', './SelectList', './SelectRenderer', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool'],
	function(jQuery, Bar, Dialog, InputBase, Popover, SelectList, SelectRenderer, library, Control, EnabledPropagator, IconPool) {
		"use strict";

		/**
		 * Constructor for a new Select.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The select control provides a menu of predefined items that allows users to select an item.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.Select
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Select = Control.extend("sap.m.Select", /** @lends sap.m.Select.prototype */ { metadata: {

			library: "sap.m",
			properties: {

				/**
				 * The name to be used in the HTML code (e.g. for HTML forms that send data to the server via submit).
				 */
				name: { type : "string", group : "Misc", defaultValue : "" },

				/**
				 * Determines whether the user can change the selected value.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * Defines the width of the select input. The default width of a select control depends on the width of the widest option/item in the list. This value can be provided in %, em, px… and all CSS units.
				 * Note: The width will be ignored if the "autoAdjustWidth" property is set to true.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "auto" },

				/**
				 * Defines the maximum width. This value can be provided in %, em, px… and all CSS units
				 */
				maxWidth: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },

				/**
				 * Key of the selected item. If the key has no corresponding aggregated item, no changes will apply. If duplicate keys exist, the first item matching the key is used.
				 * @since 1.11
				 */
				selectedKey: { type: "string", group: "Data", defaultValue: "" },

				/**
				 * Id of the selected item. If the id has no corresponding aggregated item, no changes will apply.
				 * @since 1.12
				 */
				selectedItemId: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * The URI to the icon that will be displayed only when using the “IconOnly” type.
				 * @since 1.16
				 */
				icon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: "" },

				/**
				 * Type of a select. Possibles values "Default", "IconOnly".
				 * @since 1.16
				 */
				type: { type: "sap.m.SelectType", group: "Appearance", defaultValue: sap.m.SelectType.Default },

				/**
				 * If set to true, the width of the select input is determined by the selected item’s content.
				 * @since 1.16
				 */
				autoAdjustWidth: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Sets the horizontal alignment of the text within the input field.
				 * @since 1.28
				 */
				textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: sap.ui.core.TextAlign.Initial },

				/**
				 * Specifies the direction of the text within the input field with enumerated options. By default, the control inherits text direction from the DOM.
				 * @since 1.28
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: sap.ui.core.TextDirection.Inherit }
			},
			defaultAggregation : "items",
			aggregations: {

				/**
				 * Items of the Item control.
				 */
				items: { type: "sap.ui.core.Item", multiple: true, singularName: "item", bindable: "bindable" },

				/**
				 * Internal aggregation to hold the inner picker pop-up.
				 */
				picker: { type : "sap.ui.core.Control", multiple: false, visibility: "hidden" }
			},
			associations: {

				/**
				 * Sets or retrieves the selected item from the aggregation named items.
				 */
				selectedItem: { type: "sap.ui.core.Item", multiple: false },

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 * @since 1.27.0
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {

				/**
				 * Occurs when the user changes the selected item.
				 */
				change: {
					parameters: {

						/**
						 * The selected item.
						 */
						selectedItem: { type : "sap.ui.core.Item" }
					}
				}
			}
		}});

		IconPool.insertFontFaceStyle();
		EnabledPropagator.apply(Select.prototype, [true]);

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		function fnHandleKeyboardNavigation(oItem) {

			if (oItem) {

				this.setSelection(oItem);
				this.setValue(oItem.getText());
			}

			this.scrollToItem(oItem);
		}

		Select.prototype._handleFocusout = function() {

			if (this._bRenderingPhase) {
				this._bFocusoutDueRendering = true;
			} else {
				this._bFocusoutDueRendering = false;
				this._checkSelectionChange();
			}
		};

		Select.prototype._checkSelectionChange = function() {
			var oItem = this.getSelectedItem();

			if (this._oSelectionOnFocus !== oItem) {
				this.fireChange({ selectedItem: oItem });
			}
		};

		Select.prototype._callMethodInControl = function(sFunctionName, aArgs) {
			var oList = this.getList();

			if (aArgs[0] === "items") {

				if (oList) {
					return SelectList.prototype[sFunctionName].apply(oList, aArgs);
				}
			} else {
				return Control.prototype[sFunctionName].apply(this, aArgs);
			}
		};

		/**
		 * Retrieves the first enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @private
		 */
		Select.prototype.findFirstEnabledItem = function(aItems) {
			var oList = this.getList();
			return oList ? oList.findFirstEnabledItem(aItems) : null;
		};

		/**
		 * Retrieves the last enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @private
		 */
		Select.prototype.findLastEnabledItem = function(aItems) {
			var oList = this.getList();
			return oList ? oList.findLastEnabledItem(aItems) : null;
		};

		/**
		 * Sets the selected item by its index.
		 *
		 * @param {int} iIndex
		 * @private
		 */
		Select.prototype.setSelectedIndex = function(iIndex, _aItems /* only for internal usage */) {
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
		 * Scrolls an item into the visual viewport.
		 *
		 * @private
		 */
		Select.prototype.scrollToItem = function(oItem) {
			var oPicker = this.getPicker(),
				oPickerDomRef = oPicker.getDomRef("cont"),
				oItemDomRef = oItem && oItem.getDomRef();

			if (!oPicker || !oPickerDomRef || !oItemDomRef) {
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

				// scroll down, the item is partly below the viewport of the List
				oPickerDomRef.scrollTop = Math.ceil(iItemOffsetTop + iItemHeight - iPickerHeight);
			}
		};

		/**
		 * Sets the text value of the Select field.
		 *
		 * @param {string} sValue
		 * @private
		 */
		Select.prototype.setValue = function(sValue) {
			var $Label = this.$().children("." + SelectRenderer.CSS_CLASS + "Label");

			// change the label text
			if ($Label && $Label.length) {
				$Label.text(sValue);
			}
		};

		/**
		 * Whether the native HTML Select Element is required.
		 *
		 * @returns {boolean}
		 * @private
		 */
		Select.prototype._isRequiredSelectElement = function() {
			if (this.getAutoAdjustWidth()) {
				return false;
			} else if (this.getWidth() === "auto") {
				return true;
			}
		};

		/**
		 * Handle the virtual focus of items.
		 *
		 * @param {sap.ui.core.Item | null} vItem
		 * @private
		 * @since 1.30
		 */
		Select.prototype._handleAriaActiveDescendant = function(vItem) {
			var oDomRef = this.getDomRef(),
				oItemDomRef = vItem && vItem.getDomRef(),
				sActivedescendant = "aria-activedescendant";

			if (!oDomRef) {
				return;
			}

			// the aria-activedescendant attribute is set when the item is rendered
			if (oItemDomRef && this.isOpen()) {
				oDomRef.setAttribute(sActivedescendant, vItem.getId());
			} else {
				oDomRef.removeAttribute(sActivedescendant);
			}
		};

		/**
		 * Getter for the Select's List.
		 *
		 * @returns {sap.m.List}
		 * @private
		 * @since 1.22.0
		 */
		Select.prototype.getList = function() {
			if (this.bIsDestroyed) {
				return null;
			}

			return this._oList;
		};

		/**
		 * Called, whenever the binding of the aggregation items is changed.
		 * This method deletes all items in this aggregation and recreates them
		 * according to the data model.
		 *
		 * @private
		 */
		Select.prototype.updateItems = function(sReason) {
			SelectList.prototype.updateItems.apply(this, arguments);

			// note: after the items are recreated, the selected item association
			// points to the new item
			this._oSelectionOnFocus = this.getSelectedItem();
		};

		/**
		 * Called, when an aggregation needs to be refreshed.
		 * This method does not make any change on the items aggregation, but just calls the
		 * getContexts method to trigger fetching of new data.
		 *
		 * note: This method has been overwritten to prevent .updateItems()
		 * from being called when the bindings are refreshed.
		 * @see sap.ui.base.ManagedObject#bindAggregation
		 *
		 * @private
		 */
		Select.prototype.refreshItems = function() {
			SelectList.prototype.refreshItems.apply(this, arguments);
		};

		/* ----------------------------------------------------------- */
		/* Picker                                                      */
		/* ----------------------------------------------------------- */

		/**
		 * This event handler will be called before the Select Picker is opened.
		 *
		 * @private
		 */
		Select.prototype.onBeforeOpen = function() {
			var fnPickerTypeBeforeOpen = this["_onBeforeOpen" + this.getPickerType()];

			// add the active state to the Select's field
			this.addStyleClass(SelectRenderer.CSS_CLASS + "Pressed");

			// call the hook to add additional content to the List
			this.addContent();

			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

		/**
		 * This event handler will be called after the control's picker pop-up is opened.
		 *
		 * @private
		 */
		Select.prototype.onAfterOpen = function() {
			var oDomRef = this.getFocusDomRef(),
				oItem = null;

			if (!oDomRef) {
				return;
			}

			oItem = this.getSelectedItem();
			oDomRef.setAttribute("aria-expanded", "true");

			// expose a parent/child contextual relationship to assistive technologies
			// note: the "aria-owns" attribute is set when the list is visible and in view
			oDomRef.setAttribute("aria-owns", this.getList().getId());

			if (oItem) {

				// note: the "aria-activedescendant" attribute is set
				// when the currently active descendant is visible and in view
				oDomRef.setAttribute("aria-activedescendant", oItem.getId());
			}
		};

		/**
		 * This event handler will be called before the picker pop-up is closed.
		 *
		 * @private
		 */
		Select.prototype.onBeforeClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the Select's field
			this.removeStyleClass(SelectRenderer.CSS_CLASS + "Pressed");
		};

		/**
		 * This event handler will be called after the picker pop-up is closed.
		 *
		 * @private
		 */
		Select.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");
			}
		};

		/**
		 * Getter for the control's picker pop-up.
		 *
		 * @returns {sap.m.Dialog | sap.m.Popover | null} The picker instance, creating it if necessary by calling <code>createPicker()</code> method.
		 * @private
		 */
		Select.prototype.getPicker = function() {
			if (this.bIsDestroyed) {
				return null;
			}

			// initialize the control's picker
			return this.createPicker(this.getPickerType());
		};

		/**
		 * Setter for property <code>_sPickerType</code>.
		 *
		 * @private
		 */
		Select.prototype.setPickerType = function(sPickerType) {
			this._sPickerType = sPickerType;
		};

		/**
		 * Getter for property <code>_sPickerType</code>
		 *
		 * @returns {string}
		 * @private
		 */
		Select.prototype.getPickerType = function() {
			return this._sPickerType;
		};

		/* ----------------------------------------------------------- */
		/* Popover                                                     */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance type of <code>sap.m.Popover</code>.
		 *
		 * @returns {sap.m.Popover}
		 * @private
		 */
		Select.prototype._createPopover = function() {

			// initialize Popover
			var oPicker = new Popover({
				showArrow: false,
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
		Select.prototype._decoratePopover = function(oPopover) {
			var that = this;

			oPopover._setMinWidth = function(sWidth) {
				var oPickerDomRef = this.getDomRef();

				if (oPickerDomRef) {
					oPickerDomRef.style.minWidth = sWidth;
				}
			};

			oPopover.open = function() {
				return this.openBy(that);
			};
		};

		/**
		 * Required adaptations after rendering of the Popover.
		 *
		 * @private
		 */
		Select.prototype._onAfterRenderingPopover = function() {
			var oPopover = this.getPicker(),
				sWidth = (this.$().outerWidth() / parseFloat(sap.m.BaseFontSize)) + "rem";

			oPopover._setMinWidth(sWidth);
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
		Select.prototype._createDialog = function() {
			var CSS_CLASS = SelectRenderer.CSS_CLASS;

			// initialize Dialog
			var oDialog = new Dialog({
				stretchOnPhone: true,
				customHeader: new Bar({
					contentLeft: new InputBase({
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
		Select.prototype._onBeforeOpenDialog = function() {
			var oInput = this.getPicker().getCustomHeader().getContentLeft()[0];
			oInput.setValue(this.getSelectedItem().getText());
			oInput.setTextDirection(this.getTextDirection());
			oInput.setTextAlign(this.getTextAlign());
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Initialization hook for the Select.
		 *
		 * @private
		 */
		Select.prototype.init = function() {

			// set the picker type
			this.setPickerType(sap.ui.Device.system.phone ? "Dialog" : "Popover");

			// initialize composites
			this.createPicker(this.getPickerType());

			// selected item on focus
			this._oSelectionOnFocus = null;

			// to detect when the control is in the rendering phase
			this._bRenderingPhase = false;

			// to detect if the focusout event is triggered due a rendering
			this._bFocusoutDueRendering = false;
		};

		/**
		 * Required adaptations before rendering.
		 *
		 * @private
		 */
		Select.prototype.onBeforeRendering = function() {

			// rendering phase is started
			this._bRenderingPhase = true;

			// note: in IE11 and Firefox 38, the focusout event is not fired when the select is removed
			if (this.getFocusDomRef() === document.activeElement) {
				this._handleFocusout();
			}

			this.synchronizeSelection();
		};

		/**
		 * Required adaptations after rendering.
		 *
		 * @private
		 */
		Select.prototype.onAfterRendering = function() {

			// rendering phase is finished
			this._bRenderingPhase = false;
		};

		/**
		 * Cleans up before destruction.
		 *
		 * @private
		 */
		Select.prototype.exit = function() {
			this._oSelectionOnFocus = null;
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handle the touch start event on the Select.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.ontouchstart = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled() && this.isOpenArea(oEvent.target)) {

				// add the active state to the Select's field
				this.addStyleClass(SelectRenderer.CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the touch end event on the Select.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.ontouchend = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled() && (!this.isOpen() || !this.hasContent()) && this.isOpenArea(oEvent.target)) {

				// remove the active state of the Select HTMLDIVElement container
				this.removeStyleClass(SelectRenderer.CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the tap event on the Select.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.ontap = function(oEvent) {
			var CSS_CLASS = SelectRenderer.CSS_CLASS;

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (!this.getEnabled()) {
				return;
			}

			if (this.isOpenArea(oEvent.target)) {

				if (this.isOpen()) {
					this.close();
					this.removeStyleClass(CSS_CLASS + "Pressed");
					return;
				}

				if (this.hasContent()) {
					this.open();
				}
			}

			if (this.isOpen()) {

				// add the active state to the Select's field
				this.addStyleClass(CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the selection change event on the List.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @private
		 */
		Select.prototype.onSelectionChange = function(oControlEvent) {
			var oItem = oControlEvent.getParameter("selectedItem");

			this.close();
			this.setSelection(oItem);
			this.fireChange({ selectedItem: oItem });
			oItem = this.getSelectedItem();

			// update the label text
			// note: if, due to invalid databinding, the selectedKey cannot be changed and is reset to null,
			// oNewSelectedItem does not match getSelectedItem() and a wrong text is displayed in the Select field
			if (oItem) {
				this.setValue(oItem.getText());
			/*eslint-disable no-cond-assign */
			} else if (oItem = this.getDefaultSelectedItem()) {
			/*eslint-enable no-cond-assign */
				this.setValue(oItem.getText());
			} else {
				this.setValue("");
			}
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handle the keypress event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onkeypress = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (!this.getEnabled()) {
				return;
			}

			var oItem = this.findNextItemByFirstCharacter(String.fromCharCode(oEvent.which));	// note: jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle when F4 or Alt + DOWN arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapshow = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent browser address bar to be open in ie9, when F4 is pressed
			if (oEvent.which === jQuery.sap.KeyCodes.F4) {
				oEvent.preventDefault();
			}

			this.toggleOpenState();
		};

		/**
		 * Handle when Alt + UP arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @function
		 */
		Select.prototype.onsaphide = Select.prototype.onsapshow;

		/**
		 * Handle when escape is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapescape = function(oEvent) {

			if (this.isOpen()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();

				this.close();
				this._checkSelectionChange();
			}
		};

		/**
		 * Handle when enter is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapenter = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			this.close();
			this._checkSelectionChange();
		};

		/**
		 * Handle when the spacebar key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapspace = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when the spacebar key is pressed
			oEvent.preventDefault();

			if (this.isOpen()) {
				this._checkSelectionChange();
			}

			this.toggleOpenState();
		};

		/**
		 * Handle when keyboard DOWN arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapdown = function(oEvent) {

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
		Select.prototype.onsapup = function(oEvent) {

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
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsaphome = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			var oFirstSelectableItem = this.getSelectableItems()[0];
			fnHandleKeyboardNavigation.call(this, oFirstSelectableItem);
		};

		/**
		 * Handle End key pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapend = function(oEvent) {

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
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsappagedown = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				oSelectedItem = this.getSelectedItem();

			this.setSelectedIndex(aSelectableItems.indexOf(oSelectedItem) + 10, aSelectableItems);
			oSelectedItem = this.getSelectedItem();

			if (oSelectedItem) {
				this.setValue(oSelectedItem.getText());
			}

			this.scrollToItem(oSelectedItem);
		};

		/**
		 * Handle when page up key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsappageup = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				oSelectedItem = this.getSelectedItem();

			this.setSelectedIndex(aSelectableItems.indexOf(oSelectedItem) - 10, aSelectableItems);
			oSelectedItem = this.getSelectedItem();

			if (oSelectedItem) {
				this.setValue(oSelectedItem.getText());
			}

			this.scrollToItem(oSelectedItem);
		};

		/**
		 * Handle the focusin event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.Select#onfocusin
		 * @function
		 */
		Select.prototype.onfocusin = function(oEvent) {

			if (!this._bFocusoutDueRendering) {
				this._oSelectionOnFocus = this.getSelectedItem();
			}

			// note: in some circumstances IE browsers focus non-focusable elements
			if (oEvent.target !== this.getFocusDomRef()) {	// whether an inner element is receiving the focus

				// force the focus to leave the inner element and set it back to the control's root element
				this.focus();
			}
		};

		/**
		 * Handle the focusout event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.Select#onfocusout
		 * @function
		 */
		Select.prototype.onfocusout = function() {
			this._handleFocusout();
		};

		/**
		 * Handle the focus leave event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapfocusleave = function(oEvent) {
			var oPicker = this.getAggregation("picker");

			if (!oEvent.relatedControlId || !oPicker) {
				return;
			}

			var oControl = sap.ui.getCore().byId(oEvent.relatedControlId),
				oFocusDomRef = oControl && oControl.getFocusDomRef();

			if (sap.ui.Device.system.desktop && jQuery.sap.containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef)) {

				// force the focus to stay in the input field
				this.focus();
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
		 * @protected
		 * @name sap.m.Select#setSelection
		 * @function
		 */
		Select.prototype.setSelection = function(vItem) {
			var oList = this.getList(),
				sKey;

			if (oList) {
				oList.setSelection(vItem);
			}

			this.setAssociation("selectedItem", vItem, true);
			this.setProperty("selectedItemId", (vItem instanceof sap.ui.core.Item) ? vItem.getId() : vItem, true);

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			sKey = vItem ? vItem.getKey() : "";
			this.setProperty("selectedKey", sKey, true);
			this._handleAriaActiveDescendant(vItem);
		};

		/*
		 * Determines whether the "selectedItem" association and "selectedKey" property are synchronized.
		 *
		 * @returns {boolean}
		 * @protected
		 * @name sap.m.Select#isSelectionSynchronized
		 * @function
		 */
		Select.prototype.isSelectionSynchronized = function() {
			var vItem = this.getSelectedItem();
			return this.getSelectedKey() === (vItem && vItem.getKey());
		};

		/*
		 * Synchronize selected item and key.
		 *
		 * @param {sap.ui.core.Item} vItem
		 * @param {string} sKey
		 * @param {array} [aItems]
		 * @protected
		 * @name sap.m.Select#synchronizeSelection
		 * @function
		 */
		Select.prototype.synchronizeSelection = function() {
			SelectList.prototype.synchronizeSelection.call(this);
		};

		/*
		 * This hook method can be used to add additional content.
		 *
		 * @param {sap.m.Dialog | sap.m.Popover} [oPicker]
		 * @protected
		 * @name sap.m.Select#addContent
		 * @function
		 */
		Select.prototype.addContent = function(oPicker) {};

		/**
		 * Creates a picker.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog}
		 * @protected
		 */
		Select.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker"),
				CSS_CLASS = SelectRenderer.CSS_CLASS;

			if (oPicker) {
				return oPicker;
			}

			oPicker = this["_create" + sPickerType]();

			// define a parent-child relationship between the control's and the picker pop-up
			this.setAggregation("picker", oPicker, true);

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

		/*
		 * Retrieves the next item from the aggregation named <code>items</code>
		 * whose first character match with the given <code>sChar</code>.
		 *
		 * @param {string} sChar
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 * @since 1.26.0
		 * @name sap.m.Select#findNextItemByFirstCharacter
		 * @function
		 */
		Select.prototype.findNextItemByFirstCharacter = function(sChar) {
			var aItems = this.getItems(),
				iSelectedIndex = this.getSelectedIndex(),
				aItemsAfterSelection = aItems.splice(iSelectedIndex + 1, aItems.length - iSelectedIndex),
				aItemsBeforeSelection = aItems.splice(0, aItems.length - 1);

			aItems = aItemsAfterSelection.concat(aItemsBeforeSelection);

			for (var i = 0, oItem; i < aItems.length; i++) {
				oItem = aItems[i];

				if (oItem.getEnabled() && !(oItem instanceof sap.ui.core.SeparatorItem) && jQuery.sap.startsWithIgnoreCase(oItem.getText(), sChar)) {
					return oItem;
				}
			}

			return null;
		};

		/*
		 * Create an instance type of <code>sap.m.SelectList</code>.
		 *
		 * @returns {sap.m.SelectList}
		 * @protected
		 * @name sap.m.Select#createList
		 * @function
		 */
		Select.prototype.createList = function() {

			// list to use inside the picker
			this._oList = new SelectList({
				width: "100%"
			}).addEventDelegate({
				ontap: function(oEvent) {
					this.close();
				}
			}, this)
			.attachSelectionChange(this.onSelectionChange, this);

			return this._oList;
		};

		/*
		 * Determines whether the Select has content or not.
		 *
		 * @returns {boolean}
		 * @protected
		 * @name sap.m.Select#hasContent
		 * @function
		 */
		Select.prototype.hasContent = function() {
			return !!this.getItems().length;
		};

		/*
		 * This hook method is called before the control's picker pop-up is rendered.
		 *
		 * @protected
		 * @name sap.m.Select#onBeforeRenderingPicker
		 * @function
		 */
		Select.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["_onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		/*
		 * This hook method is called after the control's picker pop-up is rendered.
		 *
		 * @protected
		 * @name sap.m.Select#onAfterRenderingPicker
		 * @function
		 */
		Select.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["_onAfterRendering" + this.getPickerType()];
			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);
		};

		/*
		 * Open the control's picker pop-up.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @protected
		 * @since 1.16
		 * @name sap.m.Select#open
		 * @function
		 */
		Select.prototype.open = function() {
			var oPicker = this.getPicker();

			if (oPicker) {
				oPicker.open();
			}

			return this;
		};

		/*
		 * Toggle the open state of the control's picker pop-up.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @protected
		 * @since 1.26
		 * @name sap.m.Select#toggleOpenState
		 * @function
		 */
		Select.prototype.toggleOpenState = function() {
			if (this.isOpen()) {
				this.close();
			} else if (this.hasContent()) {
				this.open();
			}

			return this;
		};

		/*
		 * Getter for visible <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]}
		 * protected
		 * @since 1.22.0
		 * @name sap.m.Select#getVisibleItems
		 * @function
		 */
		Select.prototype.getVisibleItems = function() {
			var oList = this.getList();
			return oList ? oList.getVisibleItems() : [];
		};

		/*
		 * Determines whether the provided item is selected.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean}
		 * @protected
		 * @since 1.24.0
		 * @name sap.m.Select#isItemSelected
		 * @function
		 */
		Select.prototype.isItemSelected = function(oItem) {
			return oItem && (oItem.getId() === this.getAssociation("selectedItem"));
		};

		/*
		 * Retrieves the index of the selected item from the aggregation named <code>items</code>.
		 *
		 * @returns {int} An integer specifying the selected index, or -1 if no item is selected.
		 * @protected
		 * @since 1.26.0
		 * @name sap.m.Select#getSelectedIndex
		 * @function
		 */
		Select.prototype.getSelectedIndex = function() {
			var oSelectedItem = this.getSelectedItem();
			return oSelectedItem ? this.indexOfItem(this.getSelectedItem()) : -1;
		};

		/*
		 * Retrieves the default selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null}
		 * protected
		 * @since 1.22.0
		 * @name sap.m.Select#getDefaultSelectedItem
		 * @function
		 */
		Select.prototype.getDefaultSelectedItem = function(aItems) {
			return this.findFirstEnabledItem();
		};

		/*
		 * Retrieves the selectables items from the aggregation named <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]} An array containing the selectables items.
		 * @protected
		 * @since 1.22.0
		 * @name sap.m.Select#getSelectableItems
		 * @function
		 */
		Select.prototype.getSelectableItems = function() {
			var oList = this.getList();
			return oList ? oList.getSelectableItems() : [];
		};

		/*
		 * Getter for the control's picker pop-up open area element.
		 *
		 * @returns {Element | null} Returns the element that is used as trigger to open the control's picker pop-up.
		 * @protected
		 * @since 1.22.0
		 * @name sap.m.Select#getOpenArea
		 * @function
		 */
		Select.prototype.getOpenArea = function() {
			return this.getDomRef();
		};

		/*
		 * Checks whether the provided element is the open area.
		 *
		 * @param {Element} oDomRef
		 * @returns {boolean}
		 * @protected
		 * @since 1.22.0
		 * @name sap.m.Select#isOpenArea
		 * @function
		 */
		Select.prototype.isOpenArea = function(oDomRef) {
			var oOpenAreaDomRef = this.getOpenArea();
			return oOpenAreaDomRef && oOpenAreaDomRef.contains(oDomRef);
		};

		/*
		 * Retrieves a item by searching for the given property/value from the aggregation named <code>items</code>.
		 * If duplicate values exists the first item matching the value is returned.
		 *
		 * @param {string} sProperty An item property.
		 * @param {string} sValue An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @protected
		 * @since 1.22.0
		 * @name sap.m.Select#findItem
		 * @function
		 */
		Select.prototype.findItem = function(sProperty, sValue) {
			var oList = this.getList();
			return oList ? oList.findItem(sProperty, sValue) : null;
		};

		/*
		 * Clear the selection.
		 *
		 * @protected
		 * @since 1.22.0
		 * @name sap.m.Select#clearSelection
		 * @function
		 */
		Select.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/**
		 * Handle properties changes of items in the aggregation named <code>items</code>.
		 *
		 * @private
		 * @param {sap.ui.base.Event} oControlEvent
		 * @since 1.30
		 */
		Select.prototype.onItemChange = function(oControlEvent) {
			var sSelectedItemId = this.getAssociation("selectedItem"),
				sNewValue = oControlEvent.getParameter("newValue"),
				sProperty = oControlEvent.getParameter("name");

			// if the selected item has not changed, no synchronization is needed
			if (sSelectedItemId !== oControlEvent.getParameter("id")) {
				return;
			}

			// synchronize properties
			switch (sProperty) {
				case "text":
					this.setValue(sNewValue);
					break;

				case "key":
					this.setSelectedKey(sNewValue);
					break;

				// no default
			}
		};

		Select.prototype.fireChange = function(mParameters) {
			this._oSelectionOnFocus = mParameters.selectedItem;
			return this.fireEvent("change", mParameters);
		};

		Select.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			this._callMethodInControl("addAggregation", arguments);

			if (sAggregationName === "items" && !bSuppressInvalidate && !this.isInvalidateSuppressed()) {
				this.invalidate(oObject);
			}

			return this;
		};

		Select.prototype.getAggregation = function() {
			return this._callMethodInControl("getAggregation", arguments);
		};

		Select.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {

				// propagate the value of the "selectedItem" association to the list
				SelectList.prototype.setAssociation.apply(oList, arguments);
			}

			return Control.prototype.setAssociation.apply(this, arguments);
		};

		Select.prototype.indexOfAggregation = function() {
			return this._callMethodInControl("indexOfAggregation", arguments);
		};

		Select.prototype.insertAggregation = function() {
			this._callMethodInControl("insertAggregation", arguments);
			return this;
		};

		Select.prototype.removeAggregation = function() {
			return this._callMethodInControl("removeAggregation", arguments);
		};

		Select.prototype.removeAllAggregation = function() {
			return this._callMethodInControl("removeAllAggregation", arguments);
		};

		Select.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			this._callMethodInControl("destroyAggregation", arguments);

			if (!bSuppressInvalidate && !this.isInvalidateSuppressed()) {
				this.invalidate();
			}

			return this;
		};

		Select.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {
			var oList = this.getList();

			if ((sPropertyName === "selectedKey") || (sPropertyName === "selectedItemId")) {

				// propagate the value of the "selectedKey" or "selectedItemId" properties to the list
				oList && SelectList.prototype.setProperty.apply(oList, arguments);
			}

			return Control.prototype.setProperty.apply(this, arguments);
		};

		Select.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {
				SelectList.prototype.removeAllAssociation.apply(oList, arguments);
			}

			return Control.prototype.removeAllAssociation.apply(this, arguments);
		};

		Select.prototype.clone = function(sIdSuffix) {
			var oSelectClone = Control.prototype.clone.apply(this, arguments),
				oList = this.getList();

			if (!this.isBound("items") && oList) {
				for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
					oSelectClone.addItem(aItems[i].clone());
				}

				oSelectClone.setSelectedIndex(this.indexOfItem(this.getSelectedItem()));
			}

			return oSelectClone;
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Adds a item to the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to add; if empty, nothing is inserted.
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 */
		Select.prototype.addItem = function(oItem) {
			this.addAggregation("items", oItem);

			if (oItem) {
				oItem.attachEvent("_change", this.onItemChange, this);
			}

			return this;
		};

		/**
		 * Inserts a item into the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to insert; if empty, nothing is inserted.
		 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
		 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *             greater than the current size of the aggregation, the item is inserted at
		 *             the last position.
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 */
		Select.prototype.insertItem = function(oItem, iIndex) {
			this.insertAggregation("items", oItem, iIndex);

			if (oItem) {
				oItem.attachEvent("_change", this.onItemChange, this);
			}

			return this;
		};

		Select.prototype.findAggregatedObjects = function() {
			var oList = this.getList();

			if (oList) {

				// note: currently there is only one aggregation
				return SelectList.prototype.findAggregatedObjects.apply(oList, arguments);
			}

			return [];
		};

		/**
		 * Getter for aggregation <code>items</code>.
		 * Items of the Item control.
		 *
		 * <strong>Note</strong>: this is the default aggregation for Select.
		 * @return {sap.ui.core.Item[]}
		 * @public
		 */
		Select.prototype.getItems = function() {
			var oList = this.getList();
			return oList ? oList.getItems() : [];
		};

		/**
		 * Setter for association <code>selectedItem</code>.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem New value for association <code>selectedItem</code>
		 *    Id of an sap.ui.core.Item which becomes the new target of this <code>selectedItem</code> association.
		 *    Alternatively, an sap.ui.core.Item instance may be given or null.
		 *    If the value of null is provided the first enabled item will be selected (if any).
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 */
		Select.prototype.setSelectedItem = function(vItem) {

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
			this.setSelection(vItem);

			// update the label text
			if (vItem) {
				this.setValue(vItem.getText());
			/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
			/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText());
			} else {
				this.setValue("");
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
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.12
		 */
		Select.prototype.setSelectedItemId = function(vItem) {
			vItem = this.validateProperty("selectedItemId", vItem);

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);
			vItem = this.getSelectedItem();

			// update the label text
			if (vItem) {
				this.setValue(vItem.getText());
			/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
			/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText());
			} else {
				this.setValue("");
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
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.11
		 */
		Select.prototype.setSelectedKey = function(sKey) {
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
				this.setSelection(oItem);

				// update the label text
				if (oItem) {
					this.setValue(oItem.getText());
				/*eslint-disable no-cond-assign */
				} else if (oItem = this.getDefaultSelectedItem()) {
				/*eslint-enable no-cond-assign */
					this.setValue(oItem.getText());
				} else {
					this.setValue("");
				}

				return this;
			}

			// note: setSelectedKey() method sometimes is called
			// before the items are added, in this case the "selectedItem" association
			// and "selectedItemId" property need to be updated in onBeforeRendering()
			return this.setProperty("selectedKey", sKey);	// update "selectedKey" property, re-rendering is needed
		};

		/**
		 * Setter for property <code>textAlign</code>.
		 *
		 * Default value is an sap.ui.core.TextAlign.Initial <code>"Initial"</code>.
		 * If the provided <code>sValue</code> has a default value,
		 * the browser default is used.
		 *
		 * @param {sap.ui.core.TextAlign} sValue New value for property <code>textAlign</code>.
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.28
		 */

		/**
		 * Setter for property <code>textDirection</code>.
		 *
		 * Default value is an sap.ui.core.TextDirection.Inherit <code>"Inherit"</code>.
		 * If the provided <code>sValue</code> has a default value,
		 * the inherited direction from the DOM is used.
		 *
		 * @param {sap.ui.core.TextDirection} sValue New value for property <code>textDirection</code>.
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.28
		 */

		/**
		 * Retrieves the item from the aggregation named <code>items</code> at the given 0-based index.
		 *
		 * @param {int} iIndex Index of the item to return.
		 * @returns {sap.ui.core.Item | null} Item at the given index, or null if none.
		 * @public
		 * @since 1.16
		 */
		Select.prototype.getItemAt = function(iIndex) {
			return this.getItems()[ +iIndex] || null;
		};

		/**
		 * Retrieves the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association, or null.
		 * @public
		 */
		Select.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : sap.ui.getCore().byId(vSelectedItem) || null;
		};

		/**
		 * Retrieves the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The first item, or null if there are no items.
		 * @public
		 * @since 1.16
		 */
		Select.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Retrieves the last item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The last item, or null if there are no items.
		 * @public
		 * @since 1.16
		 */
		Select.prototype.getLastItem = function() {
			var aItems = this.getItems();
			return aItems[aItems.length - 1] || null;
		};

		/**
		 * Retrieves the enabled items from the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item[]} [aItems=getItems()] Items to filter.
		 * @return {sap.ui.core.Item[]} An array containing the enabled items.
		 * @public
		 * @since 1.22.0
		 */
		Select.prototype.getEnabledItems = function(aItems) {
			var oList = this.getList();
			return oList ? oList.getEnabledItems(aItems) : [];
		};

		/**
		 * Retrieves the item with the given key from the aggregation named <code>items</code>.
		 * If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null}
		 * @public
		 * @since 1.16
		 */
		Select.prototype.getItemByKey = function(sKey) {
			var oList = this.getList();
			return oList ? oList.getItemByKey(sKey) : null;
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or id.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		Select.prototype.removeItem = function(vItem) {
			var oList = this.getList(),
				oItem;

			vItem = oList ? oList.removeItem(vItem) : null;

			if (this.getItems().length === 0) {

				// clear the selection
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {
				oItem = this.findFirstEnabledItem();

				if (oItem) {
					this.setSelection(oItem);
				}
			}

			oItem = this.getSelectedItem();

			// update the label text
			if (oItem) {
				this.setValue(oItem.getText());
			/*eslint-disable no-cond-assign */
			} else if (oItem = this.getDefaultSelectedItem()) {
			/*eslint-enable no-cond-assign */
				this.setValue(oItem.getText());
			} else {
				this.setValue("");
			}

			if (vItem) {
				vItem.detachEvent("_change", this.onItemChange, this);
			}

			return vItem;
		};

		/**
		 * Removes all the controls in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea and clears the selection.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 */
		Select.prototype.removeAllItems = function() {
			var oList = this.getList(),
				aItems = oList ? oList.removeAllItems() : [];

			// clear the selection
			this.clearSelection();

			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
			}

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].detachEvent("_change", this.onItemChange, this);
			}

			return aItems;
		};

		/**
		 * Destroys all the items in the aggregation named <code>items</code>.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 */
		Select.prototype.destroyItems = function() {
			var oList = this.getList();

			if (oList) {
				oList.destroyItems();
			}

			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
			}

			return this;
		};

		/**
		 * Whether the control's picker pop-up is open. It returns true when the control's picker pop-up is currently open,
		 * this includes opening and closing animations.
		 *
		 * @returns {boolean} Determines whether the Select is currently open (this includes opening and closing animations).
		 * @public
		 * @since 1.16
		 */
		Select.prototype.isOpen = function() {
			var oPicker = this.getAggregation("picker");
			return !!(oPicker && oPicker.isOpen());
		};

		/**
		 * Closes the control's picker pop-up.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.16
		 */
		Select.prototype.close = function() {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				oPicker.close();
			}

			return this;
		};

		return Select;

}, /* bExport= */ true);