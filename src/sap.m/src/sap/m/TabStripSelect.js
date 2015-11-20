/*!
 * ${copyright}
 */

// Provides control sap.m.TabStripSelect.
sap.ui.define(['jquery.sap.global', './Popover', './TabStripSelectList', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/m/Select'],
	function(jQuery, Popover, TabStripSelectList, library, Control, EnabledPropagator, IconPool, Select) {
		"use strict";

		/**
		 * Constructor for a new TabStripSelect.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
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
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var TabStripSelect = Select.extend("sap.m.TabStripSelect", /** @lends sap.m.TabStripSelect.prototype */ {
			metadata: {
				library: "sap.m"

			},
			aggregations: {
				/**
				 * Holds the items contained within this control.
				 */
				items: { type: "sap.m.TabStripItem", multiple: true, singularName: "item", bindable: "bindable" },
				list: { type: "sap.m.TabStripSelectList", multiple: false, bindable: "bindable" }
			},
			properties: {
				/*
				 * Altering this property hides/shows the control in the DOM
				 * // ToDo: remove this todo comment when it is confirmed this property will be used
				 */
				visible: { type: "boolean", group : "Misc", defaultValue : true }
			}
		});


		TabStripSelect.CSS_CLASS_INVISIBLE = 'sapMSltInvisible';
		TabStripSelect.SPACE_BETWEEN_SELECT_BUTTON_AND_POPOVER = 5;

		/**
		 * Initialization hook.
		 * @override
		 * @private
		 */
		TabStripSelect.prototype.init = function() {
			// set the picker type
			this.setPickerType("Popover");

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
		 * Create the select list instance
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
		 * Method for proxying calls of the select methods to the inner select list methods.
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
				    offsetY: TabStripSelect.SPACE_BETWEEN_SELECT_BUTTON_AND_POPOVER,
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
		 * This event handler is called after the picker popup is rendered.
		 * @override
		 * @private
		 */
		TabStripSelect.prototype.onAfterRenderingPicker = function() {
			Select.prototype.onAfterRenderingPicker.call(this);
			var iPickerOffsetX = this.getPicker().$().width() - this.$().width();
			this.getPicker().setOffsetX(-iPickerOffsetX);
			this.getPicker()._calcPlacement(); // needed to apply the new offset after the popup is open
		};


		/**
		 * Cleans up before destruction.
		 * @override
		 * @private
		 */
		TabStripSelect.prototype.exit = function() {
			Select.prototype.exit.call(this);
			this._oList.destroy();
			this._oList = null;
		};


		/**
		 * Handle the touch start event on the TabStripSelect.
		 *
		 * @param {jQuery.Event} oEvent The event object.
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
		 * Handle the touch end event on the TabStripSelect.
		 *
		 * @param {jQuery.Event} oEvent The event object.
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

		return TabStripSelect;

}, /* bExport= */ false);


