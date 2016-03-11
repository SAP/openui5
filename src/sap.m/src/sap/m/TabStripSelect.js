/*!
 * ${copyright}
 */

// Provides control sap.m.TabStripSelect.
sap.ui.define(['jquery.sap.global', './Popover', './TabStripSelectList', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/m/Select', 'sap/m/TabStripItem'],
	function(jQuery, Popover, TabStripSelectList, library, Control, EnabledPropagator, IconPool, Select, TabStripItem) {
		"use strict";

		/**
		 * Constructor for a new <code>TabStripSelect</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>sap.m.TabStripSelect</code> control provides a list of items that allows users to interact with an item.
		 * @extends sap.m.Select
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.34
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.TabStripSelect
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model
		 */
		var TabStripSelect = Select.extend("sap.m.TabStripSelect", /** @lends sap.m.TabStripSelect.prototype */ {
			metadata: {
				library: "sap.m"
			}
		});

		/**
		 * The default CSS class for <code>TabStripSelect</code>.
		 * @type {string}
		 */
		TabStripSelect.CSS_CLASS = 'sapMTSSlt';

		/**
		 * The default CSS class for <code>TabStripItem</code> in context of <code>TabStripSelect</code>.
		 * @type {string}
		 */
		TabStripSelect.CSS_CLASS_INVISIBLE = 'sapMSltInvisible';

		/**
		 * The constant space size (in pixels) between the select button and its popover to be displayed.
		 *
		 * @type {number}
		 */
		TabStripSelect.SPACE_BETWEEN_SELECT_BUTTON_AND_POPOVER = -5;

		TabStripSelect.prototype.init = function() {
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
			// used to prevent the change event from firing when the user scrolls
			// the picker popup (dropdown) list using the mouse
			this._bProcessChange = false;
		};


		/**
		 * Creates the <code>TabStripSelectList</code> instance.
		 *
		 * @override
		 * @private
		 * @returns {*}
		 */
		TabStripSelect.prototype.createList = function() {
			// list to use inside the picker
			this._oList = new TabStripSelectList({
				width: "100%"
			}).attachSelectionChange(this.onSelectionChange, this)
			.addEventDelegate({
				ontap: function(oEvent) {
					this.close();
				}
			}, this);

			return this._oList;
		};

		/**
		 * Proxies the calls of the select methods to the inner <code>TabStripSelectList</code> methods.
		 *
		 * @override
		 * @param {string} sFunctionName The name of the called method
		 * @param {array} aArgs The supplied arguments
		 * @returns {mixed} The result of the called method
		 * @private
		 */
		TabStripSelect.prototype._callMethodInControl = function(sFunctionName, aArgs) {
			var vRes,
			    oList;
			if (aArgs[0] === "items") {
				oList = this.getList();
				if (oList) {
					vRes = TabStripSelectList.prototype[sFunctionName].apply(oList, aArgs);
				}

				// Force the picker control (holding the select list) to re-render as well, in order to have the
				// right position in case the longest item was removed (and picker width is changed)
				if (sFunctionName === 'removeAggregation' && this.isOpen()) {
					this.getPicker().rerender();
				}

			} else {
				vRes = Control.prototype[sFunctionName].apply(this, aArgs);
			}

			return vRes;
		};

		/**
		 * Creates an instance of <code>sap.m.Popover</code>.
		 *
		 * @override
		 * @private
		 * @returns {sap.m.Popover}
		 */
		TabStripSelect.prototype._createPopover = function() {
			var that = this,
			    oPicker = new Popover({
				    showArrow: false,
				    showHeader: false,
				    placement: sap.m.PlacementType.Vertical,
				    offsetX: 0,
				    offsetY: sap.ui.Device.system.phone ? 0 : TabStripSelect.SPACE_BETWEEN_SELECT_BUTTON_AND_POPOVER,
				    initialFocus: this,
				    bounce: false
			    });

			// detect when the scrollbar is pressed
			oPicker.addEventDelegate({
				ontouchstart: function(oEvent) {
					var oPickerDomRef = this.getDomRef("cont");

					if (oEvent.target === oPickerDomRef) {
						that._bProcessChange = false;
					}
				}
			}, oPicker);

			this._decoratePopover(oPicker);
			return oPicker;
		};

		/**
		 * Creates an instance of <code>sap.m.Dialog</code>.
		 *
		 * @override
		 * @private
		 * @returns {sap.m.Dialog}
		 */
		TabStripSelect.prototype._createDialog = function() {
			var CSS_CLASS_PARENT = this.getRenderer().CSS_CLASS;

			// initialize Dialog
			var oDialog = new sap.m.Dialog({
				stretch: true,
				customHeader: new sap.m.Bar({
					contentLeft: new sap.m.InputBase({
						width: "100%",
						editable: false
					})
						.addStyleClass(TabStripSelect.CSS_CLASS + "Input")
						.addStyleClass(CSS_CLASS_PARENT + "Input")
				})
					.addStyleClass(TabStripSelect.CSS_CLASS + "Bar")
					.addStyleClass(CSS_CLASS_PARENT + "Bar")
			});

			oDialog.getAggregation("customHeader").attachBrowserEvent("tap", function() {
				oDialog.close();
			}, this);

			return oDialog;
		};

		/**
		 * This event handler is called after the picker popup is rendered.
		 *
		 * @override
		 * @private
		 */
		TabStripSelect.prototype.onAfterRenderingPicker = function() {
			var iPickerOffsetX,
				bPageRTL = sap.ui.getCore().getConfiguration().getRTL();

			Select.prototype.onAfterRenderingPicker.call(this);
			if (bPageRTL) {
				iPickerOffsetX = this.$().width() - this.getPicker().$().width();
			} else {
				iPickerOffsetX = this.getPicker().$().width() - this.$().width();
			}

			// on phone the picker is a dialog and does not have an offset
			if (this.getPicker() instanceof sap.m.Popover === true) {
				this.getPicker().setOffsetX(-iPickerOffsetX);
				this.getPicker()._calcPlacement(); // needed to apply the new offset after the popup is open
			}
		};

		TabStripSelect.prototype.exit = function() {
			Select.prototype.exit.call(this);
			this._oList.destroy();
			this._oList = null;
		};


		/**
		 * Handles the <code>touchstart<code> event on the <code>TabStripSelect</code>.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		TabStripSelect.prototype.ontouchstart = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled() && this.isOpenArea(oEvent.target)) {

				// add the active state to the TabStripSelect's field
				this.addStyleClass(this.getRenderer().CSS_CLASS + "Pressed");
			}
		};

		/**
		 * Handles the <code>touchend</code> event on the <code>TabStripSelect</code>.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		TabStripSelect.prototype.ontouchend = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled() && (!this.isOpen() || !this.hasContent()) && this.isOpenArea(oEvent.target)) {

				// remove the active state of the Select HTMLDIVElement container
				this.removeStyleClass(this.getRenderer().CSS_CLASS + "Pressed");
			}
		};

		/**
		 * This event handler is called before the picker popup is closed.
		 *
		 * @private
		 */
		TabStripSelect.prototype.onBeforeClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the Select's field
			this.removeStyleClass(this.getRenderer().CSS_CLASS + "Pressed");
		};

		/**
		 * This event handler is called after the picker popup is closed.
		 *
		 * @private
		 */
		TabStripSelect.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");
			}
		};

		/**
		 * Overrides the method in order to turn off default selected item.
		 *
		 * @returns {null}
		 */
		TabStripSelect.prototype.getDefaultSelectedItem = function(aItems) {
			// always need to have default item when viewed on phone
			if (sap.ui.Device.system.phone) {
				return Select.prototype.getDefaultSelectedItem.apply(this, arguments);
			}
			return null;
		};

		/**
		 * Overridden, in order to set proper visibility for the modified state of the <code>Select</code> field.
		 *
		 * @override
		 * @param {string} sValue
		 * @private
		 */
		TabStripSelect.prototype.setValue = function(sValue) {
			var $ModifiedDom = this.$().find(".sapMTabStripSelectListItemModified").eq(0);
			Select.prototype.setValue.apply(this, arguments);
			if (this.getSelectedItem().getProperty('modified')) {
				$ModifiedDom.removeClass(TabStripItem.CSS_CLASS_STATE_INVISIBLE);
			} else {
				$ModifiedDom.addClass(TabStripItem.CSS_CLASS_STATE_INVISIBLE);
			}
		};


		/**
		 * Handles the <code>selectionChange</code> event on the list.
		 *
		 * @param {sap.ui.base.Event} oEvent
		 * @private
		 */
		TabStripSelect.prototype.onSelectionChange = function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (this.fireChange({selectedItem: oItem})) {
				this.close();
				this.setSelection(oItem);
				this.setValue(this._getSelectedItemText());
			} else {
				oEvent.preventDefault();
			}
		};

		/**
		 * Fire a 'change' event that can be prevented although by default it is not preventable
		 * @param {object} mParameters
		 * @returns {sap.ui.core.support.Support|sap.ui.base.EventProvider|boolean|sap.ui.core.Element|*}
		 */
		TabStripSelect.prototype.fireChange = function(mParameters) {
			this._oSelectionOnFocus = mParameters.selectedItem;
			var bAllowPreventDefault = true;
			return this.fireEvent("change", mParameters, bAllowPreventDefault);
		};

		return TabStripSelect;

}, /* bExport= */ false);


