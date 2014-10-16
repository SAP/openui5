/*!
 * ${copyright}
 */

// Provides control sap.m.ComboBoxBase.
sap.ui.define(['jquery.sap.global', './Bar', './ComboBoxBaseRenderer', './Dialog', './InputBase', './List', './Popover', './library', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool'],
	function(jQuery, Bar, ComboBoxBaseRenderer, Dialog, InputBase, List, Popover, library, EnabledPropagator, IconPool) {
		"use strict";

		/**
		 * Constructor for a new ComboBoxBase.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * An abstract class for ComboBoxes.
		 * @extends sap.m.InputBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.22.0
		 * @name sap.m.ComboBoxBase
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ComboBoxBase = InputBase.extend("sap.m.ComboBoxBase", /** @lends sap.m.ComboBoxBase.prototype */ { metadata : {

			"abstract" : true,
			library : "sap.m",
			properties : {

				/**
				 * Defines the maximum width of the text field. This value can be provided in %, em, px… and all CSS units.
				 */
				maxWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'}
			},
			defaultAggregation : "items",
			aggregations : {

				/**
				 * Aggregation of items to be displayed.
				 */
				items : {type : "sap.ui.core.Item", multiple : true, singularName : "item", bindable : "bindable"}, 

				/**
				 * Internal aggregation to hold the inner picker pop-up.
				 */
				picker : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
			}
		}});

		/**
		 * Whether the control's picker pop-up is open. It returns true when the control's picker pop-up is currently open, this includes opening and closing animations.
		 *
		 * @name sap.m.ComboBoxBase#isOpen
		 * @function
		 * @type boolean
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Closes the control's picker pop-up.
		 *
		 * @name sap.m.ComboBoxBase#close
		 * @function
		 * @type sap.m.ComboBoxBase
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Retrieves the item with the given key from the aggregation named items.
		 * If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @name sap.m.ComboBoxBase#getItemByKey
		 * @function
		 * @param {string} sKey
		 *         An item key that identifies the item to retrieve.
		 * @type sap.ui.core.Item
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Retrieves the first item from the aggregation named items.
		 *
		 * @name sap.m.ComboBoxBase#getFirstItem
		 * @function
		 * @type sap.ui.core.Item
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Retrieves the last item from the aggregation named items.
		 *
		 * @name sap.m.ComboBoxBase#getLastItem
		 * @function
		 * @type sap.ui.core.Item
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Retrieves the item from the aggregation named items at the given 0-based index.
		 *
		 * @name sap.m.ComboBoxBase#getItemAt
		 * @function
		 * @param {int} iIndex
		 *         Index of the item to return.
		 * @type sap.ui.core.Item
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Retrieves enabled items from the aggregation named items.
		 *
		 * @name sap.m.ComboBoxBase#getEnabledItems
		 * @function
		 * @type sap.ui.core.Item[]
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */

		IconPool.insertFontFaceStyle();
		EnabledPropagator.apply(ComboBoxBase.prototype, [true]);

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		/**
		 * Map an item type of sap.ui.core.Item to an item type of sap.m.StandardListItem.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {sap.m.StandardListItem | null}
		 * @private
		 * @name sap.m.ComboBoxBase#_mapItemToListItem
		 * @function
		 */
		ComboBoxBase.prototype._mapItemToListItem = function(oItem) {

			if (!oItem) {
				return null;
			}

			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS,
				sListItem = CSS_CLASS + "Item",
				sListItemEnabled = oItem.getEnabled() ? "Enabled" : "Disabled",
				sListItemSelected = (oItem === this.getSelectedItem()) ? sListItem + "Selected" : "",
				oListItem = oItem.data(CSS_CLASS + "ListItem"),
				bItemVisible = oListItem ? oListItem.getVisible() : true;

			oListItem = new sap.m.StandardListItem().addStyleClass(sListItem + " " + sListItem + sListItemEnabled + " " + sListItemSelected);
			oListItem.setVisible(bItemVisible);
			oListItem.setTitle(oItem.getText());
			oListItem.setType(oItem.getEnabled() ? sap.m.ListType.Active : sap.m.ListType.Inactive);
			oListItem.setTooltip(oItem.getTooltip());
			oItem.data(CSS_CLASS + "ListItem", oListItem);

			return oListItem;
		};

		/**
		 * Given an item type of sap.m.StandardListItem, find the corresponding item type of sap.ui.core.Item.
		 *
		 * @param {sap.m.StandardListItem} oListItem
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @private
		 * @name sap.m.ComboBoxBase#_findMappedItem
		 * @function
		 */
		ComboBoxBase.prototype._findMappedItem = function(oListItem, aItems) {
			for (var i = 0, aItems = aItems || this.getItems(), aItemsLength = aItems.length; i < aItemsLength; i++) {
				if (aItems[i].data(ComboBoxBaseRenderer.CSS_CLASS + "ListItem") === oListItem) {
					return aItems[i];
				}
			}

			return null;
		};

		/**
		 * Fill the List.
		 *
		 * @param {sap.ui.core.Item[]} aItems
		 * @private
		 * @name sap.m.ComboBoxBase#_fillList
		 * @function
		 */
		ComboBoxBase.prototype._fillList = function(aItems) {
			var oSelectedItem = this.getSelectedItem();

			for (var i = 0, oListItem, oItem; i < aItems.length; i++) {
				oItem = aItems[i];

				// add a private property to the added item containing a reference
				// to the corresponding mapped item
				oListItem = this._mapItemToListItem(oItem);

				// add the mapped item type of sap.m.StandardListItem to the List
				this.getList().addAggregation("items", oListItem, true);	// note: suppress re-rendering

				// add active state to the selected item
				if (oItem === oSelectedItem) {
					this.getList().setSelectedItem(oListItem, true);
				}
			}
		};

		/**
		 * Destroy the items in the List.
		 *
		 * @private
		 * @name sap.m.ComboBoxBase#_clearList
		 * @function
		 */
		ComboBoxBase.prototype._clearList = function() {

			if (this.getList()) {
				this.getList().destroyAggregation("items", true);	// note: suppress re-rendering
			}
		};

		/**
		 * Getter for the control's List.
		 *
		 * @returns {sap.m.List}
		 * @private
		 * @name sap.m.ComboBoxBase#getList
		 * @function
		 */
		ComboBoxBase.prototype.getList = function() {
			return this._oList;
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Initialization hook.
		 *
		 * @private
		 * @name sap.m.ComboBoxBase#init
		 * @function
		 */
		ComboBoxBase.prototype.init = function() {
			InputBase.prototype.init.apply(this, arguments);

			// set the picker pop-up type
			this.setPickerType("Popover");

			// initialize list
			this.createList();
		};

		/**
		 * Cleans up before destruction.
		 *
		 * @private
		 * @name sap.m.ComboBoxBase#exit
		 * @function
		 */
		ComboBoxBase.prototype.exit = function() {
			InputBase.prototype.exit.apply(this, arguments);

			if (this.getList()) {
				this.getList().destroy();
				this._oList = null;
			}
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handle the touch start event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#ontouchstart
		 * @function
		 */
		ComboBoxBase.prototype.ontouchstart = function(oEvent) {

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.isOpenArea(oEvent.target)) {

				// add the active state to the control's field
				this.addStyleClass(ComboBoxBaseRenderer.CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the touch end event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#ontouchend
		 * @function
		 */
		ComboBoxBase.prototype.ontouchend = function(oEvent) {

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if ((!this.isOpen() || !this.hasContent()) && this.isOpenArea(oEvent.target)) {

				// remove the active state of the control's field
				this.removeStyleClass(ComboBoxBaseRenderer.CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handle the tap event on the control.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#ontap
		 * @function
		 */
		ComboBoxBase.prototype.ontap = function(oEvent) {
			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;

			// a non editable or disabled ComboBox, the picker pop-up cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.isOpenArea(oEvent.target)) {

				if (this.isOpen()) {
					this.close();
					this.removeStyleClass(CSS_CLASS + "Pressed");
					return;
				}

				if (this.hasContent()) {

					// clear the filter to make all items visible before the picker pop-up is opened
					this.clearFilter();
					this.open();
				}
			}

			if (this.isOpen()) {

				// add the active state to the control's field
				this.addStyleClass(CSS_CLASS + "Pressed");
			}
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handle when F4 or Alt + DOWN arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#onsapshow
		 * @function
		 */
		ComboBoxBase.prototype.onsapshow = function(oEvent) {

			// a non editable or disabled ComboBox, the picker pop-up cannot be opened
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent browser address bar to be open in ie9, when F4 is pressed
			if (oEvent.keyCode === jQuery.sap.KeyCodes.F4) {
				oEvent.preventDefault();
			}

			if (this.isOpen()) {
				this.close();
				return;
			}

			// select all text
			this.selectText(0, this.getValue().length);

			// open only if the combobox has items
			if (this.hasContent()) {

				// clear the filter to make all items visible before the picker pop-up is opened
				this.clearFilter();
				this.open();
			}
		};

		/**
		 * Handle when escape is pressed.
		 *
		 * If picker pop-up is closed, cancel changes and revert to the value which
		 * the input field had when it got the focus.
		 * If List is open, close list.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#onsapescape
		 * @function
		 */
		ComboBoxBase.prototype.onsapescape = function(oEvent) {

			// a non editable or disabled ComboBox, the value cannot be changed
			if (this.getEnabled() && this.getEditable() && this.isOpen()) {

				// mark the event for components that needs to know if the event was handled
				oEvent.setMarked();

				// note: fix for Firefox
				oEvent.preventDefault();

				this.close();
			} else {	// the picker is closed

				// cancel changes and revert to the value which the Input field had when it got the focus
				InputBase.prototype.onsapescape.apply(this, arguments);
			}
		};

		/**
		 * Handle when Alt + UP arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 * @name sap.m.ComboBoxBase#onsaphide
		 * @function
		 */
		ComboBoxBase.prototype.onsaphide = ComboBoxBase.prototype.onsapshow;

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* protected methods                                           */
		/* ----------------------------------------------------------- */

		/*
		 * Hook method, can be used to add additional content to the control's picker pop-up.
		 *
		 * @param {sap.m.Dialog | sap.m.Popover} [oPicker]
		 * @protected
		 * @name sap.m.ComboBoxBase#addContent
		 * @function
		 */
		ComboBoxBase.prototype.addContent = function(oPicker) {};

		/**
		 * Setter for property <code>_sPickerType</code>.
		 *
		 * @param {string} sPickerType
		 * @protected
		 * @name sap.m.ComboBoxBase#setPickerType
		 * @function
		 */
		ComboBoxBase.prototype.setPickerType = function(sPickerType) {
			this._sPickerType = sPickerType;
		};

		/**
		 * Getter for property <code>_sPickerType</code>
		 *
		 * @returns {string}
		 * @protected
		 * @name sap.m.ComboBoxBase#getPickerType
		 * @function
		 */
		ComboBoxBase.prototype.getPickerType = function() {
			return this._sPickerType;
		};

		/**
		 * Creates a picker.
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker pop-up to be used.
		 * @protected
		 * @name sap.m.ComboBoxBase#createPicker
		 * @function
		 */
		ComboBoxBase.prototype.createPicker = function() {};

		/**
		 * Getter for the control's picker pop-up.
		 *
		 * @returns {sap.m.Dialog | sap.m.Popover | null} The picker instance, creating it if necessary by calling <code>createPicker()</code> method.
		 * @protected
		 * @name sap.m.ComboBoxBase#getPicker
		 * @function
		 */
		ComboBoxBase.prototype.getPicker = function() {

			if (this.bIsDestroyed) {
				return null;
			}

			// initialize the control's picker
			return this.createPicker(this.getPickerType());
		};

		/*
		 * Determines whether the control has content or not.
		 *
		 * @returns {boolean}
		 * @protected
		 * @name sap.m.ComboBoxBase#hasContent
		 * @function
		 */
		ComboBoxBase.prototype.hasContent = function() {
			return !!this.getItems().length;
		};

		/*
		 * Retrieves the first enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 * @name sap.m.ComboBoxBase#findFirstEnabledItem
		 * @function
		 */
		ComboBoxBase.prototype.findFirstEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getEnabled()) {
					return aItems[i];
				}
			}

			return null;
		};

		/*
		 * Retrieves the last enabled item from the aggregation named <code>items</code>.
		 *
		 * @param {array} [aItems]
		 * @returns {sap.ui.core.Item | null}
		 * @protected
		 * @name sap.m.ComboBoxBase#findLastEnabledItem
		 * @function
		 */
		ComboBoxBase.prototype.findLastEnabledItem = function(aItems) {
			aItems = aItems || this.getItems();
			return this.findFirstEnabledItem(aItems.reverse());
		};

		/*
		 * Open the control's picker pop-up.
		 *
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @protected
		 * @name sap.m.ComboBoxBase#open
		 * @function
		 */
		ComboBoxBase.prototype.open = function() {
			var oPicker = this.getPicker();

			if (oPicker) {
				oPicker.open();
			}

			return this;
		};

		/*
		 * Getter for visible <code>items</code>.
		 *
		 * @return {sap.ui.core.Item[]}
		 * @protected
		 * @name sap.m.ComboBoxBase#getVisibleItems
		 * @function
		 */
		ComboBoxBase.prototype.getVisibleItems = function() {
			for (var i = 0, oListItem, aItems = this.getItems(), aVisibleItems = []; i < aItems.length; i++) {
				oListItem = aItems[i].data(ComboBoxBaseRenderer.CSS_CLASS + "ListItem");

				if (oListItem && oListItem.getVisible()) {
					aVisibleItems.push(aItems[i]);
				}
			}

			return aVisibleItems;
		};

		/*
		 * Check whether an item is selected or not.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean} Whether the item is selected.
		 * @protected
		 * @since 1.24.0
		 * @name sap.m.ComboBoxBase#isItemSelected
		 * @function
		 */
		ComboBoxBase.prototype.isItemSelected = function() {};

		/*
		 * Get key of each item from the aggregation named items.
		 *
		 * @param {sap.ui.core.Item[]} [aItems]
		 * @return {string[]}
		 * @protected
		 * @since 1.24.0
		 * @name sap.m.ComboBoxBase#getKeys
		 * @function
		 */
		ComboBoxBase.prototype.getKeys = function(aItems) {
			for (var i = 0, aKeys = [], aItems = aItems || this.getItems(); i < aItems.length; i++) {
				aKeys[i] = aItems[i].getKey();
			}

			return aKeys;
		};

		/*
		 * Retrieves the selectables items from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item[]} An array containing the selectables items.
		 * @protected
		 * @name sap.m.ComboBoxBase#getSelectableItems
		 * @function
		 */
		ComboBoxBase.prototype.getSelectableItems = function() {
			return this.getEnabledItems(this.getVisibleItems());
		};

		/*
		 * Getter for the control's picker pop-up open area element.
		 *
		 * @returns {Element | null} Returns the element that is used as trigger to open the control's picker pop-up.
		 * @protected
		 * @name sap.m.ComboBoxBase#getOpenArea
		 * @function
		 */
		ComboBoxBase.prototype.getOpenArea = function() {
			return this.getDomRef("arrow");
		};

		/*
		 * Checks whether the provided element is the open area.
		 *
		 * @param {Element} oDomRef
		 * @returns {boolean}
		 * @protected
		 * @name sap.m.ComboBoxBase#isOpenArea
		 * @function
		 */
		ComboBoxBase.prototype.isOpenArea = function(oDomRef) {
			var oOpenAreaDomRef = this.getOpenArea();
			return oOpenAreaDomRef && oOpenAreaDomRef.contains(oDomRef);
		};

		/*
		 * Retrieves a item by searching for the given property/value from the aggregation named <code>items</code>.
		 * If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sProperty An item property.
		 * @param {string} sValue An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @protected
		 * @name sap.m.ComboBoxBase#findItem
		 * @function
		 */
		ComboBoxBase.prototype.findItem = function(sProperty, sValue) {
			var sMethod = "get" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

			for (var i = 0, aItems = this.getItems(); i < aItems.length; i++) {
				if (aItems[i][sMethod]() === sValue) {
					return aItems[i];
				}
			}

			return null;
		};

		/*
		 * Retrieves the item with the given value from the aggregation named <code>items</code>.
		 * If duplicate values exist, the first item matching the value is returned.
		 *
		 * @param {string} sText An item value that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null} The matched item or null.
		 * @protected
		 * @name sap.m.ComboBoxBase#getItemByText
		 * @function
		 */
		ComboBoxBase.prototype.getItemByText = function(sText) {
			return this.findItem("text", sText);
		};

		/*
		 * Scrolls an item into the visual viewport.
		 *
		 * @protected
		 * @name sap.m.ComboBoxBase#scrollToItem
		 * @function
		 */
		ComboBoxBase.prototype.scrollToItem = function(oListItem) {
			var oPicker = this.getPicker(),
				oPickerDomRef = oPicker.$().children(".sapMPopoverCont")[0],
				oListItemDomRef = oListItem && oListItem.getDomRef();

			if (!oPicker || !oPickerDomRef || !oListItemDomRef) {
				return;
			}

			var iPickerScrollTop = oPickerDomRef.scrollTop,
				iListItemOffsetTop = oListItemDomRef.offsetTop,
				iPickerHeight = jQuery(oPickerDomRef).height(),
				iListItemHeight = jQuery(oListItemDomRef).height();

			if (iPickerScrollTop > iListItemOffsetTop) {

				// scroll up
				oPickerDomRef.scrollTop = iListItemOffsetTop;

			// bottom edge of item > bottom edge of viewport
			} else if ((iListItemOffsetTop + iListItemHeight) > (iPickerScrollTop + iPickerHeight)) {

				// scroll down, the item is partly below the viewport of the List
				oPickerDomRef.scrollTop = Math.ceil(iListItemOffsetTop + iListItemHeight - iPickerHeight);
			}
		};

		/*
		 * Clear the filter
		 *
		 * @protected
		 * @name sap.m.ComboBoxBase#clearFilter
		 * @function
		 */
		ComboBoxBase.prototype.clearFilter = function() {
			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;

			for (var i = 0, oListItem, aItems = this.getItems(); i < aItems.length; i++) {
				oListItem = aItems[i].data(CSS_CLASS + "ListItem");
				oListItem.setVisible(true);
			}
		};

		/*
		 * Clear the selection.
		 * To be overwritten by subclasses.
		 *
		 * @protected
		 * @name sap.m.ComboBox#clearSelection
		 * @function
		 */
		ComboBoxBase.prototype.clearSelection = function() {};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Getter for property <code>value</code>.
		 * Defines the value of the control's input field.
		 *
		 * Default value is empty/<code>undefined</code>
		 *
		 * @return {string} the value of property <code>value</code>
		 * @public
		 * @name sap.m.ComboBoxBase#getValue
		 * @function
		 */
		ComboBoxBase.prototype.getValue = function() {
			var oDomRef = this.getFocusDomRef();

			// if the input field is rendered
			if (oDomRef) {

				// return the live value
				return oDomRef.value;
			}

			// else return the value from the model
			return this.getProperty("value");
		};

		/**
		 * Adds some item <code>oItem</code> to the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to add; if empty, nothing is added.
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 * @name sap.m.ComboBoxBase#addItem
		 * @function
		 */
		ComboBoxBase.prototype.addItem = function(oItem) {
			this.addAggregation("items", oItem);

			if (this.getList()) {
				this.getList().addItem(this._mapItemToListItem(oItem));
			}

			return this;
		};

		/**
		 * Inserts an item into the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item} oItem The item to insert; if empty, nothing is inserted.
		 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
		 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *             greater than the current size of the aggregation, the item is inserted at
		 *             the last position.
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 * @name sap.m.ComboBoxBase#insertItem
		 * @function
		 */
		ComboBoxBase.prototype.insertItem = function(oItem, iIndex) {
			this.insertAggregation("items", oItem, iIndex);

			if (this.getList()) {
				this.getList().insertItem(this._mapItemToListItem(oItem), iIndex);
			}

			return this;
		};

		/**
		 * Retrieves the item from the aggregation named <code>items</code> at the given 0-based index.
		 *
		 * @param {int} iIndex Index of the item to return.
		 * @returns {sap.ui.core.Item | null} Item at the given index, or null if none.
		 * @public
		 * @name sap.m.ComboBoxBase#getItemAt
		 * @function
		 */
		ComboBoxBase.prototype.getItemAt = function(iIndex) {
			return this.getItems()[ +iIndex] || null;
		};

		/**
		 * Retrieves the first item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The first item, or null if there are no items.
		 * @public
		 * @name sap.m.ComboBoxBase#getFirstItem
		 * @function
		 */
		ComboBoxBase.prototype.getFirstItem = function() {
			return this.getItems()[0] || null;
		};

		/**
		 * Retrieves the last item from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The last item, or null if there are no items.
		 * @public
		 * @name sap.m.ComboBoxBase#getLastItem
		 * @function
		 */
		ComboBoxBase.prototype.getLastItem = function() {
			var aItems = this.getItems();
			return aItems[aItems.length - 1] || null;
		};

		/**
		 * Retrieves the enabled items from the given array of items or from
		 * this control's aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.core.Item[]} [aItems=getItems()] Items to filter.
		 * @return {sap.ui.core.Item[]} An array containing the enabled items.
		 * @public
		 * @name sap.m.ComboBoxBase#getEnabledItems
		 * @function
		 */
		ComboBoxBase.prototype.getEnabledItems = function(aItems) {
			aItems = aItems || this.getItems();

			return aItems.filter(function(oItem) {
				return oItem.getEnabled();
			});
		};

		/**
		 * Retrieves the item with the given key from the aggregation named <code>items</code>.
		 * If duplicate keys exist, the first item matching the key is returned.
		 *
		 * @param {string} sKey An item key that specifies the item to retrieve.
		 * @returns {sap.ui.core.Item | null}
		 * @public
		 * @name sap.m.ComboBoxBase#getItemByKey
		 * @function
		 */
		ComboBoxBase.prototype.getItemByKey = function(sKey) {
			return this.findItem("key", sKey);
		};

		/**
		 * Whether the control's picker pop-up is open. It returns true when the control's picker pop-up is currently open,
		 * this includes opening and closing animations.
		 *
		 * @returns {boolean} Determines whether the control's picker pop-up is currently open (this includes opening and closing animations).
		 * @public
		 * @name sap.m.ComboBoxBase#isOpen
		 * @function
		 */
		ComboBoxBase.prototype.isOpen = function() {
			var oPicker = this.getAggregation("picker");
			return !!(oPicker && oPicker.isOpen());
		};

		/**
		 * Closes the control's picker pop-up.
		 *
		 * @returns {sap.m.ComboBoxBase} <code>this</code> to allow method chaining.
		 * @public
		 * @name sap.m.ComboBoxBase#close
		 * @function
		 */
		ComboBoxBase.prototype.close = function() {
			var oPicker = this.getAggregation("picker");

			if (oPicker) {
				oPicker.close();
			}

			return this;
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or id.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 * @name sap.m.ComboBoxBase#removeItem
		 * @function
		 */
		ComboBoxBase.prototype.removeItem = function(vItem) {
			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;

			// remove the item from the aggregation items
			vItem = this.removeAggregation("items", vItem);

			// remove the corresponding mapped item from the List
			if (this.getList()) {
				this.getList().removeItem(vItem && vItem.data(CSS_CLASS + "ListItem"));
			}

			// return the removed item or null
			return vItem;
		};

		/**
		 * Removes all the controls in the aggregation named <code>items</code>.
		 * Additionally unregisters them from the hosting UIArea and clears the selection.
		 *
		 * @returns {sap.ui.core.Item[]} An array of the removed items (might be empty).
		 * @public
		 * @name sap.m.ComboBoxBase#removeAllItems
		 * @function
		 */
		ComboBoxBase.prototype.removeAllItems = function() {
			var aItems = this.removeAllAggregation("items");

			// clear the selection
			this.clearSelection();

			if (this.getList()) {
				this.getList().removeAllItems();
			}

			return aItems;
		};

		/**
		 * Destroys all the items in the aggregation named <code>items</code>.
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 * @name sap.m.ComboBoxBase#destroyItems
		 * @function
		 */
		ComboBoxBase.prototype.destroyItems = function() {
			this.destroyAggregation("items");

			if (this.getList()) {
				this.getList().destroyItems();
			}

			return this;
		};

		return ComboBoxBase;

	}, /* bExport= */ true);