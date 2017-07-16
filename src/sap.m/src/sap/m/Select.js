/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Dialog', './Popover', './SelectList', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', './Button', './delegate/ValueStateMessage', 'sap/ui/core/message/MessageMixin'],
	function(jQuery, Dialog, Popover, SelectList, library, Control, EnabledPropagator, IconPool, Button, ValueStateMessage, MessageMixin) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.m.Select</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.Select</code> control provides a list of items that allows users to select an item.
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IFormContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.Select
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var Select = Control.extend("sap.m.Select", /** @lends sap.m.Select.prototype */ {
			metadata: {
				interfaces: ["sap.ui.core.IFormContent"],
				library: "sap.m",
				properties: {

					/**
					 * The name to be used in the HTML code (for example, for HTML forms that send data to the server via submit).
					 */
					name: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},

					/**
					 * Indicates whether the user can change the selection.
					 */
					enabled: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					},

					/**
					 * Sets the width of the field. By default, the field width is automatically adjusted to the size
					 * of its content and the default width of the field is calculated based on the widest list item
					 * in the dropdown list.
					 * If the width defined is smaller than its content, only the field width is changed whereas
					 * the dropdown list keeps the width of its content.
					 * If the dropdown list is wider than the visual viewport, it is truncated and an ellipsis is displayed
					 * for each item.
					 * For phones, the width of the dropdown list is always the same as the viewport.
					 *
					 * <b>Note:</b> This property is ignored if the <code>autoAdjustWidth</code> property is set to <code>true</code>.
					 */
					width: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "auto"
					},

					/**
					 * Sets the maximum width of the control.
					 *
					 * <b>Note:</b> This property is ignored if the <code>autoAdjustWidth</code> property is set to <code>true</code>.
					 */
					maxWidth: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%"
					},

					/**
					 * Key of the selected item.
					 *
					 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
					 * @since 1.11
					 */
					selectedKey: {
						type: "string",
						group: "Data",
						defaultValue: ""
					},

					/**
					 * ID of the selected item.
					 * @since 1.12
					 */
					selectedItemId: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},

					/**
					 * The URI to the icon that will be displayed only when using the <code>IconOnly</code> type.
					 * @since 1.16
					 */
					icon: {
						type: "sap.ui.core.URI",
						group: "Appearance",
						defaultValue: ""
					},

					/**
					 * Type of a select. Possible values <code>Default</code>, <code>IconOnly</code>.
					 * @since 1.16
					 */
					type: {
						type: "sap.m.SelectType",
						group: "Appearance",
						defaultValue: sap.m.SelectType.Default
					},

					/**
					 * Indicates whether the width of the input field is determined by the selected item's content.
					 * @since 1.16
					 */
					autoAdjustWidth: {
						type: "boolean",
						group: "Appearance",
						defaultValue: false
					},

					/**
					 * Sets the horizontal alignment of the text within the input field.
					 * @since 1.28
					 */
					textAlign: {
						type: "sap.ui.core.TextAlign",
						group: "Appearance",
						defaultValue: sap.ui.core.TextAlign.Initial
					},

					/**
					 * Specifies the direction of the text within the input field with enumerated options.
					 * By default, the control inherits text direction from the DOM.
					 * @since 1.28
					 */
					textDirection: {
						type: "sap.ui.core.TextDirection",
						group: "Appearance",
						defaultValue: sap.ui.core.TextDirection.Inherit
					},

					/**
					 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>,
					 * <code>Success</code>.
					 * @since 1.40.2
					 */
					valueState: {
						type: "sap.ui.core.ValueState",
						group: "Appearance",
						defaultValue: sap.ui.core.ValueState.None
					},

					/**
					 * Defines the text of the value state message popup.
					 * If this is not specified, a default text is shown from the resource bundle.
					 *
					 * @since 1.40.5
					 */
					valueStateText: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},

					/**
					 * Indicates whether the text values of the <code>additionalText</code> property of a
					 * {@link sap.ui.core.ListItem} are shown.
					 * @since 1.40
					 */
					showSecondaryValues: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					},

					/**
					 * Indicates whether the selection is restricted to one of the items in the list.
					 * <b>Note:</b> We strongly recommend that you always set this property to <code>false</code> and bind
					 * the <code>selectedKey</code> property to the desired value for better interoperability with data binding.
					 * @since 1.34
					 */
					forceSelection: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					}
				},
				defaultAggregation : "items",
				aggregations: {

					/**
					 * Defines the items contained within this control.
					 */
					items: {
						type: "sap.ui.core.Item",
						multiple: true,
						singularName: "item",
						bindable: "bindable"
					},

					/**
					 * Internal aggregation to hold the inner picker popup.
					 */
					picker: {
						type: "sap.ui.core.PopupInterface",
						multiple: false,
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
					},

					/**
					 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
					 * @since 1.27.0
					 */
					ariaLabelledBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "ariaLabelledBy"
					}
				},
				events: {

					/**
					 * This event is fired when the value in the selection field is changed in combination with one of
					 * the following actions:
					 * <ul>
					 * 	<li>The focus leaves the selection field</li>
					 * 	<li>The <i>Enter</i> key is pressed</li>
					 * 	<li>The item is pressed</li>
					 * </ul>
					 */
					change: {
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
				designTime: true
			}
		});

		IconPool.insertFontFaceStyle();
		EnabledPropagator.apply(Select.prototype, [true]);
		// apply the message mixin so all message on the input will get the associated label-texts injected
		MessageMixin.call(Select.prototype);

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
				this.scrollToItem(oItem);
			}
		}

		Select.prototype._handleFocusout = function() {
			this._bFocusoutDueRendering = this.bRenderingPhase;

			if (this._bFocusoutDueRendering) {
				this._bProcessChange = false;
				return;
			}

			if (this._bProcessChange) {
				this._checkSelectionChange();
				this._bProcessChange = false;
			} else {
				this._bProcessChange = true;
			}
		};

		Select.prototype._checkSelectionChange = function() {
			var oItem = this.getSelectedItem();

			if (this._oSelectionOnFocus !== oItem) {
				this.fireChange({ selectedItem: oItem });
			}
		};

		Select.prototype._getSelectedItemText = function(vItem) {
			vItem = vItem || this.getSelectedItem();

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			if (vItem) {
				return vItem.getText();
			}

			return "";
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

				// scroll down, the item is partly below the viewport of the list
				oPickerDomRef.scrollTop = Math.ceil(iItemOffsetTop + iItemHeight - iPickerHeight);
			}
		};

		/**
		 * Sets the text value of the <code>Select</code> field.
		 *
		 * @param {string} sValue
		 * @private
		 */
		Select.prototype.setValue = function(sValue) {
			this.$("label").text(sValue);
		};

		/**
		 * Whether a shadow list should be render inside the HTML content of the select's field, to
		 * automatically size it to fit its content.
		 *
		 * @returns {boolean}
		 * @private
		 */
		Select.prototype._isShadowListRequired = function() {
			if (this.getAutoAdjustWidth()) {
				return false;
			} else if (this.getWidth() === "auto") {
				return true;
			}

			return false;
		};

		/**
		 * Handles the virtual focus of items.
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
		 * Gets the Select's <code>list</code>.
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
		 * Called whenever the binding of the aggregation items is changed.
		 *
		 */
		Select.prototype.updateItems = function(sReason) {
			SelectList.prototype.updateItems.apply(this, arguments);

			// note: after the items are recreated, the selected item association
			// points to the new item
			this._oSelectionOnFocus = this.getSelectedItem();
		};

		/**
		 * Called when the items aggregation needs to be refreshed.
		 *
		 * <b>Note:</b> This method has been overwritten to prevent <code>updateItems()</code>
		 * from being called when the bindings are refreshed.
		 * @see sap.ui.base.ManagedObject#bindAggregation
		 */
		Select.prototype.refreshItems = function() {
			SelectList.prototype.refreshItems.apply(this, arguments);
		};

		/* ----------------------------------------------------------- */
		/* Picker                                                      */
		/* ----------------------------------------------------------- */

		/**
		 * This event handler is called before the picker popup is opened.
		 *
		 * @private
		 */
		Select.prototype.onBeforeOpen = function(oControlEvent) {
			var fnPickerTypeBeforeOpen = this["_onBeforeOpen" + this.getPickerType()],
				CSS_CLASS = this.getRenderer().CSS_CLASS;

			// add the active and expanded states to the field
			this.addStyleClass(CSS_CLASS + "Pressed");
			this.addStyleClass(CSS_CLASS + "Expanded");

			// close value state message before opening the picker
			this.closeValueStateMessage();

			// call the hook to add additional content to the list
			this.addContent();

			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

		/**
		 * This event handler will be called after the picker popup is opened.
		 *
		 * @private
		 */
		Select.prototype.onAfterOpen = function(oControlEvent) {
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
				this.scrollToItem(oItem);
			}
		};

		/**
		 * This event handler is called before the picker popup is closed.
		 *
		 */
		Select.prototype.onBeforeClose = function(oControlEvent) {
			var oDomRef = this.getFocusDomRef(),
				CSS_CLASS = this.getRenderer().CSS_CLASS;

			if (oDomRef) {

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");

				// if the focus is back to the input after closing the picker,
				// the value state message should be reopened
				if (this.shouldValueStateMessageBeOpened() && (document.activeElement === oDomRef)) {
					this.openValueStateMessage();
				}
			}

			// remove the active and expanded states of the field
			this.removeStyleClass(CSS_CLASS + "Pressed");
			this.removeStyleClass(CSS_CLASS + "Expanded");
		};

		/**
		 * This event handler is called after the picker popup is closed.
		 *
		 */
		Select.prototype.onAfterClose = function(oControlEvent) {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");
			}
		};

		/**
		 * Gets the control's picker popup.
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
		 * Creates an instance of <code>sap.m.Popover</code>.
		 *
		 * @returns {sap.m.Popover}
		 * @private
		 */
		Select.prototype._createPopover = function() {

			var that = this;
			var oPicker = new Popover({
				showArrow: false,
				showHeader: false,
				placement: sap.m.PlacementType.VerticalPreferredBottom,
				offsetX: 0,
				offsetY: 0,
				initialFocus: this,
				bounce: false
			});

			// detect when the scrollbar or an item is pressed
			oPicker.addEventDelegate({
				ontouchstart: function(oEvent) {
					var oPickerDomRef = this.getDomRef("cont");

					if ((oEvent.target === oPickerDomRef) || (oEvent.srcControl instanceof sap.ui.core.Item)) {
						that._bProcessChange = false;
					}
				}
			}, oPicker);

			this._decoratePopover(oPicker);
			return oPicker;
		};

		/**
		 * Decorates a <code>sap.m.Popover</code> instance.
		 *
		 * @param {sap.m.Popover} oPopover
		 * @private
		 */
		Select.prototype._decoratePopover = function(oPopover) {
			var that = this;

			oPopover.open = function() {
				return this.openBy(that);
			};
		};

		/**
		 * Required adaptations before rendering of the popover.
		 *
		 * @private
		 */
		Select.prototype._onBeforeRenderingPopover = function() {
			var oPopover = this.getPicker(),
				sWidth = (this.$().outerWidth() / parseFloat(sap.m.BaseFontSize)) + "rem";

			if (oPopover) {
				oPopover.setContentMinWidth(sWidth);
			}
		};

		/* ----------------------------------------------------------- */
		/* Dialog                                                      */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance of <code>sap.m.Dialog</code>.
		 *
		 * @returns {sap.m.Dialog}
		 * @private
		 */
		Select.prototype._createDialog = function() {
			var that = this;
			return new Dialog({
				stretch: true,
				showHeader: false,
				buttons: [
					this.createPickerCloseButton()
				],
				beforeOpen: function() {
					that.updatePickerHeaderTitle();
				}
			});
		};

		Select.prototype.createPickerCloseButton = function() {
			var that = this;
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			return new Button({
				text: oResourceBundle.getText("SELECT_CANCEL_BUTTON"),
				press: function() {
					that.close();
				}
			});
		};

		Select.prototype.updatePickerHeaderTitle = function() {
			var oPicker = this.getPicker();

			if (!oPicker) {
				return;
			}

			var aLabels = this.getLabels();

			if (aLabels.length) {
				var oLabel = aLabels[0];

				if (oLabel && (typeof oLabel.getText === "function")) {
					oPicker.setShowHeader(true);
					oPicker.setTitle(oLabel.getText());
				}
			} else {
				oPicker.setShowHeader(false);
			}
		};

		/**
		 * This event handler is called before the dialog is opened.
		 *
		 * @private
		 */
		Select.prototype._onBeforeOpenDialog = function() {};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		Select.prototype.init = function() {

			// set the picker type
			this.setPickerType(sap.ui.Device.system.phone ? "Dialog" : "Popover");

			// initialize composites
			this.createPicker(this.getPickerType());

			// selected item on focus
			this._oSelectionOnFocus = null;

			// to detect when the control is in the rendering phase
			this.bRenderingPhase = false;

			// to detect if the focusout event is triggered due a re-rendering
			this._bFocusoutDueRendering = false;

			// used to prevent the change event from firing when the user scrolls
			// the picker popup (dropdown) list using the mouse
			this._bProcessChange = false;

			this.sTypedChars = "";
			this.iTypingTimeoutID = -1;

			// delegate object used to open/close value state message popups
			this._oValueStateMessage = new ValueStateMessage(this);
		};

		Select.prototype.onBeforeRendering = function() {

			// rendering phase is started
			this.bRenderingPhase = true;

			// note: in Firefox 38, the focusout event is not fired when the select is removed
			if (sap.ui.Device.browser.firefox && (this.getFocusDomRef() === document.activeElement)) {
				this._handleFocusout();
			}

			this.synchronizeSelection();
		};

		Select.prototype.onAfterRendering = function() {

			// rendering phase is finished
			this.bRenderingPhase = false;
		};

		Select.prototype.exit = function() {
			var oValueStateMessage = this.getValueStateMessage();
			this._oSelectionOnFocus = null;

			if (oValueStateMessage) {
				this.closeValueStateMessage();
				oValueStateMessage.destroy();
			}

			this._oValueStateMessage = null;
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
				this.addStyleClass(this.getRenderer().CSS_CLASS + "Pressed");
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

			if (this.getEnabled() && !this.isOpen() && this.isOpenArea(oEvent.target)) {

				// remove the active state of the Select HTMLDIVElement container
				this.removeStyleClass(this.getRenderer().CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the tap event on the Select.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.ontap = function(oEvent) {
			var CSS_CLASS = this.getRenderer().CSS_CLASS;

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

				this.open();
			}

			if (this.isOpen()) {

				// add the active state to the Select's field
				this.addStyleClass(CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handles the <code>selectionChange</code> event on the list.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @private
		 */
		Select.prototype.onSelectionChange = function(oControlEvent) {
			var oItem = oControlEvent.getParameter("selectedItem");
			this.close();
			this.setSelection(oItem);
			this.fireChange({ selectedItem: oItem });
			this.setValue(this._getSelectedItemText());
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handles the <code>keypress</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onkeypress = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
			var sTypedCharacter = String.fromCharCode(oEvent.which),
				oSelectedItem = this.getSelectedItem(),
				sText = sTypedCharacter,
				oItem = null;

			this.sTypedChars += sTypedCharacter;

			// the typed characters match the text of the selected item
			if ((oSelectedItem && jQuery.sap.startsWithIgnoreCase(oSelectedItem.getText(), this.sTypedChars)) ||

				// one or more characters have been typed (excluding patterns such as "aa" or "bb")
				((this.sTypedChars.length === 1) ||
				((this.sTypedChars.length > 1) &&
				(this.sTypedChars.charAt(0) !== this.sTypedChars.charAt(1))))) {

				sText = this.sTypedChars;
			}

			oItem = this.searchNextItemByText(sText);
			clearTimeout(this.iTypingTimeoutID);
			this.iTypingTimeoutID = setTimeout(function() {
				this.sTypedChars = "";
				this.iTypingTimeoutID = -1;
			}.bind(this), 1000);
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle when F4 or Alt + DOWN arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapshow = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

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

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

			if (this.isOpen()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();

				this.close();
				this._checkSelectionChange();
			}
		};

		/**
		 * Handles the <code>sapenter</code> event when enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapenter = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

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

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

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
		 * Handles the <code>sapdown</code> pseudo event when keyboard DOWN arrow key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapdown = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
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
		 * Handles the <code>sapup</code> pseudo event when keyboard UP arrow key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapup = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
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
		 * Handles the <code>saphome</code> pseudo event when keyboard Home key is pressed.
		 * The first selectable item is selected.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsaphome = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
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
		 * Handles the <code>sapend</code> pseudo event when keyboard End key is pressed.
		 * The first selectable item is selected.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsapend = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
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
		 * Handles the <code>sappagedown</code> pseudo event when keyboard page down key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsappagedown = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

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
		 * Handles the <code>sappageup</code> pseudo event when keyboard page up key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onsappageup = function(oEvent) {

			// prevents actions from occurring when the control is disabled,
			// IE11 browser focus non-focusable elements
			if (!this.getEnabled()) {
				return;
			}

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
		 * Handles the <code>focusin</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onfocusin = function(oEvent) {

			if (!this._bFocusoutDueRendering && !this._bProcessChange) {
				this._oSelectionOnFocus = this.getSelectedItem();
			}

			this._bProcessChange = true;

			// open the value state popup message as long as the dropdown list is closed
			setTimeout(function() {
				if (!this.isOpen() && this.shouldValueStateMessageBeOpened() && (document.activeElement === this.getFocusDomRef())) {
					this.openValueStateMessage();
				}
			}.bind(this), 100);

			// note: in some circumstances IE browsers focus non-focusable elements
			if (oEvent.target !== this.getFocusDomRef()) {	// whether an inner element is receiving the focus

				// force the focus to leave the inner element and set it back to the control's root element
				this.focus();
			}
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Select.prototype.onfocusout = function(oEvent) {
			this._handleFocusout();

			if (this.bRenderingPhase) {
				return;
			}

			// close value state message popup when focus is out of the input
			this.closeValueStateMessage();
		};

		/**
		 * Handles the <code>focusleave</code> pseudo event.
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

		/**
		 * Updates and synchronizes <code>selectedItem</code> association, <code>selectedItemId</code> and <code>selectedKey</code> properties.
		 *
		 * @param {sap.ui.core.Item | null} vItem
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

		/**
		 * Determines whether the <code>selectedItem</code> association and <code>selectedKey</code> property are synchronized.
		 *
		 * @returns {boolean}
		 */
		Select.prototype.isSelectionSynchronized = function() {
			var vItem = this.getSelectedItem();
			return this.getSelectedKey() === (vItem && vItem.getKey());
		};

		/**
		 * Synchronizes the <code>selectedItem</code> association and the <code>selectedItemId</code> property.
		 *
		 * @param {sap.ui.core.Item} vItem
		 * @param {string} sKey
		 * @param {array} [aItems]
		 */
		Select.prototype.synchronizeSelection = function() {
			SelectList.prototype.synchronizeSelection.apply(this, arguments);
		};

		/**
		 * This hook method can be used to add additional content.
		 *
		 * @param {sap.m.Dialog | sap.m.Popover} [oPicker]
		 */
		Select.prototype.addContent = function(oPicker) {};

		/**
		 * Creates a picker popup container where the selection should take place.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog}
		 * @protected
		 */
		Select.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker"),
				CSS_CLASS = this.getRenderer().CSS_CLASS;

			if (oPicker) {
				return oPicker;
			}

			oPicker = this["_create" + sPickerType]();

			// define a parent-child relationship between the control and the picker popup
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

		/**
		 * Retrieves the next item from the aggregation named <code>items</code>
		 * whose text match with the given <code>sText</code>.
		 *
		 * @param {string} sText
		 * @returns {sap.ui.core.Item | null}
		 * @since 1.26.0
		 */
		Select.prototype.searchNextItemByText = function(sText) {
			var aItems = this.getItems(),
				iSelectedIndex = this.getSelectedIndex(),
				aItemsAfterSelection = aItems.splice(iSelectedIndex + 1, aItems.length - iSelectedIndex),
				aItemsBeforeSelection = aItems.splice(0, aItems.length - 1);

			aItems = aItemsAfterSelection.concat(aItemsBeforeSelection);

			for (var i = 0, oItem; i < aItems.length; i++) {
				oItem = aItems[i];

				if (oItem.getEnabled() && !(oItem instanceof sap.ui.core.SeparatorItem) && jQuery.sap.startsWithIgnoreCase(oItem.getText(), sText)) {
					return oItem;
				}
			}

			return null;
		};

		/**
		 * Create an instance type of <code>sap.m.SelectList</code>.
		 *
		 * @returns {sap.m.SelectList}
		 */
		Select.prototype.createList = function() {
			var mListKeyboardNavigationMode = sap.m.SelectListKeyboardNavigationMode,
				sKeyboardNavigationMode = sap.ui.Device.system.phone ? mListKeyboardNavigationMode.Delimited : mListKeyboardNavigationMode.None;

			this._oList = new SelectList({
				width: "100%",
				keyboardNavigationMode: sKeyboardNavigationMode
			}).addStyleClass(this.getRenderer().CSS_CLASS + "List-CTX")
			.addEventDelegate({
				ontap: function(oEvent) {
					this.close();
				}
			}, this)
			.attachSelectionChange(this.onSelectionChange, this);
			return this._oList;
		};

		/**
		 * Determines whether the Select has content or not.
		 *
		 * @returns {boolean}
		 */
		Select.prototype.hasContent = function() {
			return this.getItems().length > 0;
		};

		/**
		 * This event handler is called before the picker popup is rendered.
		 *
		 */
		Select.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["_onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		/**
		 * This event handler is called after the picker popup is rendered.
		 *
		 */
		Select.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["_onAfterRendering" + this.getPickerType()];
			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);
		};

		/**
		 * Open the control's picker popup.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @protected
		 * @since 1.16
		 */
		Select.prototype.open = function() {
			var oPicker = this.getPicker();

			if (oPicker) {
				oPicker.open();
			}

			return this;
		};

		/**
		 * Toggle the open state of the control's picker popup.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @since 1.26
		 */
		Select.prototype.toggleOpenState = function() {
			if (this.isOpen()) {
				this.close();
			} else {
				this.open();
			}

			return this;
		};

		/**
		 * Gets the visible <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]}
		 * @since 1.22.0
		 */
		Select.prototype.getVisibleItems = function() {
			var oList = this.getList();
			return oList ? oList.getVisibleItems() : [];
		};

		/**
		 * Indicates whether the provided item is selected.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean}
		 * @since 1.24.0
		 */
		Select.prototype.isItemSelected = function(oItem) {
			return oItem && (oItem.getId() === this.getAssociation("selectedItem"));
		};

		/**
		 * Retrieves the index of the selected item from the aggregation named <code>items</code>.
		 *
		 * @returns {int} An integer specifying the selected index, or -1 if no item is selected.
		 * @since 1.26.0
		 */
		Select.prototype.getSelectedIndex = function() {
			var oSelectedItem = this.getSelectedItem();
			return oSelectedItem ? this.indexOfItem(this.getSelectedItem()) : -1;
		};

		/**
		 * Gets the default selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null}
		 * @since 1.22.0
		 */
		Select.prototype.getDefaultSelectedItem = function(aItems) {
			return this.getForceSelection() ? this.findFirstEnabledItem() : null;
		};

		/**
		 * Gets the selectable items from the aggregation named <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]} An array containing the selectable items.
		 * @since 1.22.0
		 */
		Select.prototype.getSelectableItems = function() {
			var oList = this.getList();
			return oList ? oList.getSelectableItems() : [];
		};

		/**
		 * Gets the control's picker popup's trigger element.
		 *
		 * @returns {Element | null} Returns the element that is used as trigger to open the control's picker popup.
		 * @since 1.22.0
		 */
		Select.prototype.getOpenArea = function() {
			return this.getDomRef();
		};

		/**
		 * Checks whether the provided element is the open area.
		 *
		 * @param {Element} oDomRef
		 * @returns {boolean}
		 * @since 1.22.0
		 */
		Select.prototype.isOpenArea = function(oDomRef) {
			var oOpenAreaDomRef = this.getOpenArea();
			return oOpenAreaDomRef && oOpenAreaDomRef.contains(oDomRef);
		};

		/**
		 * Retrieves an item by searching for the given property/value from the aggregation named <code>items</code>.
		 *
		 * <b>Note: </b> If duplicate values exists, the first item matching the value is returned.
		 *
		 * @param {string} sProperty An item property.
		 * @param {string} sValue An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @since 1.22.0
		 */
		Select.prototype.findItem = function(sProperty, sValue) {
			var oList = this.getList();
			return oList ? oList.findItem(sProperty, sValue) : null;
		};

		/**
		 * Clear the selection.
		 *
		 * @since 1.22.0
		 */
		Select.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/**
		 * Handles properties' changes of items in the aggregation named <code>items</code>.
		 *
		 * @private
		 * @param {sap.ui.base.Event} oControlEvent
		 * @since 1.30
		 */
		Select.prototype.onItemChange = function(oControlEvent) {
			var sSelectedItemId = this.getAssociation("selectedItem"),
				sNewValue = oControlEvent.getParameter("newValue"),
				sProperty = oControlEvent.getParameter("name");

			// if the selected item has changed, synchronization is needed
			if (sSelectedItemId === oControlEvent.getParameter("id")) {

				switch (sProperty) {
					case "text":
						this.setValue(sNewValue);
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

		Select.prototype.clone = function() {
			var oSelectClone = Control.prototype.clone.apply(this, arguments),
				oList = this.getList(),
				oSelectedItem = this.getSelectedItem(),
				sSelectedKey = this.getSelectedKey();

			// note: clone the items because the select forward its aggregation items
			// to an inner list control. In this case, the standard clone functionality
			// doesn't detect and clone the items that are forwarded to an inner control.
			if (!this.isBound("items") && oList) {
				for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
					oSelectClone.addItem(aItems[i].clone());
				}
			}

			if (!this.isBound("selectedKey") && !oSelectClone.isSelectionSynchronized()) {

				if (oSelectedItem && (sSelectedKey === "")) {
					oSelectClone.setSelectedIndex(this.indexOfItem(oSelectedItem));
				} else {
					oSelectClone.setSelectedKey(sSelectedKey);
				}
			}

			return oSelectClone;
		};

		Select.prototype.updateValueStateClasses = function(sValueState, sOldValueState) {
			var $This = this.$(),
				$Label = this.$("label"),
				$Arrow = this.$("arrow"),
				mValueState = sap.ui.core.ValueState,
				CSS_CLASS = this.getRenderer().CSS_CLASS;

			if (sOldValueState !== mValueState.None) {
				$This.removeClass(CSS_CLASS + "State");
				$This.removeClass(CSS_CLASS + sOldValueState);

				$Label.removeClass(CSS_CLASS + "LabelState");
				$Label.removeClass(CSS_CLASS + "Label" + sOldValueState);

				$Arrow.removeClass(CSS_CLASS + "ArrowState");
			}

			if (sValueState !== mValueState.None) {
				$This.addClass(CSS_CLASS + "State");
				$This.addClass(CSS_CLASS + sValueState);

				$Label.addClass(CSS_CLASS + "LabelState");
				$Label.addClass(CSS_CLASS + "Label" + sValueState);

				$Arrow.addClass(CSS_CLASS + "ArrowState");
			}
		};

		/**
		 * Gets the labels referencing this control.
		 *
		 * @returns {sap.m.Label[]} Array of objects which are the current targets of the <code>ariaLabelledBy</code>
		 * association and the labels referencing this control.
		 * @since 1.40.5
		 */
		Select.prototype.getLabels = function() {
			var aLabelIDs = this.getAriaLabelledBy().map(function(sLabelID) {
				return sap.ui.getCore().byId(sLabelID);
			});

			var oLabelEnablement = sap.ui.require("sap/ui/core/LabelEnablement");

			if (oLabelEnablement) {
				aLabelIDs = aLabelIDs.concat(oLabelEnablement.getReferencingLabels(this).map(function(sLabelID) {
					return sap.ui.getCore().byId(sLabelID);
				}));
			}

			return aLabelIDs;
		};

		/**
		 * Gets the DOM element reference where the message popup is attached.
		 *
		 * @returns {object} The DOM element reference where the message popup is attached.
		 * @since 1.40.5
		 */
		Select.prototype.getDomRefForValueStateMessage = function() {
			return this.getDomRef();
		};

		/**
		 * Gets the ID of the value state message.
		 *
		 * @returns {string} The ID of the value state message
		 * @since 1.40.5
		 */
		Select.prototype.getValueStateMessageId = function() {
			return this.getId() + "-message";
		};

		/**
		 * Gets the value state message delegate object.
		 *
		 * @returns {sap.m.delegate.ValueState} The value state message delegate object.
		 * @since 1.40.5
		 */
		Select.prototype.getValueStateMessage = function() {
			return this._oValueStateMessage;
		};

		/**
		 * Opens value state message popup.
		 *
		 * @since 1.40.5
		 */
		Select.prototype.openValueStateMessage = function() {
			var oValueStateMessage = this.getValueStateMessage();

			if (oValueStateMessage) {
				oValueStateMessage.open();
			}
		};

		/**
		 * Closes value state message popup.
		 *
		 * @since 1.40.5
		 */
		Select.prototype.closeValueStateMessage = function() {
			var oValueStateMessage = this.getValueStateMessage();

			if (oValueStateMessage) {
				oValueStateMessage.close();
			}
		};

		/**
		 * Whether or not the value state message should be opened.
		 *
		 * @returns {boolean} <code>false</true> if the field is disabled or the default value state is set,
		 * otherwise it returns <code>true</code>.
		 * @since 1.40.5
		 */
		Select.prototype.shouldValueStateMessageBeOpened = function() {
			return ((this.getValueState() !== sap.ui.core.ValueState.None) && this.getEnabled());
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		Select.prototype.setShowSecondaryValues = function(bAdditionalText) {

			// invalidate the field only when the width is set to "auto",
			// otherwise invalidate only the dropdown list
			var bSuppressInvalidate = !this._isShadowListRequired();
			this.setProperty("showSecondaryValues", bAdditionalText, bSuppressInvalidate);
			var oList = this.getList();

			if (oList) {
				oList.setShowSecondaryValues(bAdditionalText);
			}

			return this;
		};

		/**
		 * Adds an item to the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be added; if empty, nothing is added.
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
		 * Inserts an item into the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be inserted; if empty, nothing is inserted.
		 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
		 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *             greater than the current size of the aggregation, the item is inserted at the last position.
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
		 * Gets aggregation <code>items</code>.
		 *
		 * <b>Note</b>: This is the default aggregation.
		 * @return {sap.ui.core.Item[]}
		 * @public
		 */
		Select.prototype.getItems = function() {
			var oList = this.getList();
			return oList ? oList.getItems() : [];
		};

		/**
		 * Sets the <code>selectedItem</code> association.
		 *
		 * Default value is <code>null</code>.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem New value for the <code>selectedItem</code> association.
		 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the <code>selectedItem</code> association.
		 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code>.
		 * If the value of <code>null</code> is provided, the first enabled item will be selected (if any items exist).
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 */
		Select.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				this.setAssociation("selectedItem", vItem, true);
				vItem = sap.ui.getCore().byId(vItem);
			}

			if (!(vItem instanceof sap.ui.core.Item) && vItem !== null) {
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
		 * If the provided <code>vItem</code> has a default value, the first enabled item will be selected (if any items exist).
		 *
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
			this.setValue(this._getSelectedItemText());
			return this;
		};

		/**
		 * Sets property <code>selectedKey</code>.
		 *
		 * Default value is an empty string <code>""</code> or <code>undefined</code>.
		 *
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * If the <code>forceSelection</code> property is set to <code>true</code> and the provided <code>sKey</code> is
		 * an empty string <code>""</code> or <code>undefined</code>, the value of <code>sKey</code> is changed to match
		 * the <code>key</code> of the first enabled item and the first enabled item is selected (if any items exist).
		 *
		 * In the case that an item has the default key value, it is selected instead.
		 * If duplicate keys exist, the first item matching the key is selected.
		 *
		 * @returns {sap.m.Select} <code>this</code> to allow method chaining.
		 * @public
		 * @since 1.11
		 */
		Select.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var bDefaultKey = (sKey === "");

			if (!this.getForceSelection() && bDefaultKey) {
				this.setSelection(null);
				this.setValue("");
				return this;
			}

			var oItem = this.getItemByKey(sKey);

			if (oItem || bDefaultKey) {

				// if "sKey" is an empty string "" or undefined,
				// the first enabled item will be selected (if any items exist)
				if (!oItem && bDefaultKey) {
					oItem = this.getDefaultSelectedItem();
				}

				this.setSelection(oItem);
				this.setValue(this._getSelectedItemText(oItem));
				return this;
			}

			return this.setProperty("selectedKey", sKey);
		};

		Select.prototype.setValueState = function(sValueState) {
			var sOldValueState = this.getValueState();

			this.setProperty("valueState", sValueState, true);
			sValueState = this.getValueState();

			if (sValueState === sOldValueState) {
				return this;
			}

			var oDomRef = this.getDomRefForValueState();

			if (!oDomRef) {
				return this;
			}

			var mValueState = sap.ui.core.ValueState;

			if (sValueState === mValueState.Error) {
				oDomRef.setAttribute("aria-invalid", true);
			} else {
				oDomRef.removeAttribute("aria-invalid");
			}

			if (this.shouldValueStateMessageBeOpened() && document.activeElement === oDomRef) {
				this.openValueStateMessage();
			} else {
				this.closeValueStateMessage();
			}

			this.updateValueStateClasses(sValueState, sOldValueState);
			return this;
		};

		/**
		 * Gets the item from the aggregation named <code>items</code> at the given 0-based index.
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
		 * Gets the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association, or null.
		 * @public
		 */
		Select.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : sap.ui.getCore().byId(vSelectedItem) || null;
		};

		/**
		 * Gets the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The first item, or null if there are no items.
		 * @public
		 * @since 1.16
		 */
		Select.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Gets the last item from the aggregation named <code>items</code>.
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
		 * Gets the enabled items from the aggregation named <code>items</code>.
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
		 * Gets the item with the given key from the aggregation named <code>items</code>.
		 *
		 * <b>Note: </b> If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to be retrieved.
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
		 * @param {int | string | sap.ui.core.Item} vItem The item to be removed or its index or ID.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		Select.prototype.removeItem = function(vItem) {
			var oList = this.getList(),
				oItem;

			vItem = oList ? oList.removeItem(vItem) : null;

			if (this.getItems().length === 0) {
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {
				oItem = this.findFirstEnabledItem();

				if (oItem) {
					this.setSelection(oItem);
				}
			}

			this.setValue(this._getSelectedItemText());

			if (vItem) {
				vItem.detachEvent("_change", this.onItemChange, this);
			}

			return vItem;
		};

		/**
		 * Removes all the items in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 */
		Select.prototype.removeAllItems = function() {
			var oList = this.getList(),
				aItems = oList ? oList.removeAllItems() : [];

			this.setValue("");

			if (this._isShadowListRequired()) {
				this.$().find(".sapMSelectListItemBase").remove();
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

			this.setValue("");

			if (this._isShadowListRequired()) {
				this.$().find(".sapMSelectListItemBase").remove();
			}

			return this;
		};

		/**
		 * Indicates whether the control's picker popup is opened.
		 *
		 * @returns {boolean} Indicates whether the picker popup is currently open (this includes opening and closing animations).
		 * @public
		 * @since 1.16
		 */
		Select.prototype.isOpen = function() {
			var oPicker = this.getAggregation("picker");
			return !!(oPicker && oPicker.isOpen());
		};

		/**
		 * Closes the control's picker popup.
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

		/*
		 * Gets the DOM reference for the value state.
		 *
		 * @protected
		 * @return {object}
		 */
		Select.prototype.getDomRefForValueState = function() {
			return this.getDomRef();
		};

		/**
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 * @protected
		 */
		Select.prototype.getAccessibilityInfo = function() {
			var oInfo = {
				role: this.getRenderer().getAriaRole(this),
				focusable: this.getEnabled(),
				enabled: this.getEnabled()
			};

			if (this.getType() === "IconOnly") {
				var sDesc = this.getTooltip_AsString();
				if (!sDesc) {
					var oIconInfo = IconPool.getIconInfo(this.getIcon());
					sDesc = oIconInfo && oIconInfo.text ? oIconInfo.text : "";
				}

				oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON");
				oInfo.description = sDesc;
			} else if (this.getType() === "Default") {
				oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO");
				oInfo.description = this._getSelectedItemText();
			}

			return oInfo;
		};

		return Select;

}, /* bExport= */ true);
