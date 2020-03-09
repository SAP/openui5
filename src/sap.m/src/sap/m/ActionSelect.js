/*!
 * ${copyright}
 */

// Provides control sap.m.ActionSelect.
sap.ui.define(['./Select', 'sap/ui/core/InvisibleText', 'sap/ui/core/Core', './ActionSelectRenderer'],
	function(Select, InvisibleText, Core, ActionSelectRenderer) {
		"use strict";

		/**
		 * Constructor for a new ActionSelect.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ActionSelect control provides a list of predefined items that allows end users to choose options and additionally trigger some actions.
		 * @extends sap.m.Select
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.16
		 * @alias sap.m.ActionSelect
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ActionSelect = Select.extend("sap.m.ActionSelect", /** @lends sap.m.ActionSelect.prototype */ { metadata : {

			library : "sap.m",
			associations : {

				/**
				 * Buttons to be added to the ActionSelect content.
				 */
				buttons : {type : "sap.m.Button", multiple : true, singularName : "button"}
			}
		}});

		ActionSelect.prototype.init = function() {
			Select.prototype.init.call(this);
			this.getList().addEventDelegate({
				onfocusin: this.onfocusinList
			}, this);
		};
		/* =========================================================== */
		/* Internal methods and properties                             */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		/**
		 * Determines whether the ActionSelect has content or not.
		 *
		 * @return {boolean} Whether the ActionSelect has content
		 * @override
		 * @private
		 */
		ActionSelect.prototype.hasContent = function() {
			return Select.prototype.hasContent.call(this) || !!this.getButtons().length;
		};

		/**
		 * Add additional content to Select's SimpleFixFlex flexContent aggregation.
		 *
		 * @override
		 * @private
		 */
		ActionSelect.prototype.addContentToFlex = function() {
			var oSimpleFixFlex = this.getSimpleFixFlex();

			this.getButtons().forEach(function(sButtonId) {
				oSimpleFixFlex.addFlexContent(Core.byId(sButtonId));
			});
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		ActionSelect.prototype._onBeforeRenderingPopover = function () {
			Select.prototype._onBeforeRenderingPopover.call(this);
			var oPicker = this.getPicker();
			oPicker && oPicker._setAriaRoleApplication(true);

			this._updateTutorMessage();
		};

		ActionSelect.prototype.onAfterRenderingPicker = function() {
			Select.prototype.onAfterRenderingPicker.call(this);
			var oPicker = this.getPicker(),
				oRenderer = this.getRenderer();

			oPicker.addStyleClass(oRenderer.CSS_CLASS + "Picker");
			oPicker.addStyleClass(oRenderer.ACTION_SELECT_CSS_CLASS + "Picker");
			oPicker.addStyleClass(oRenderer.ACTION_SELECT_CSS_CLASS + "Picker-CTX");
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		ActionSelect.prototype.createPickerCloseButton = function() {};

		/* ----------------------------------------------------------- */
		/* Public methods                                              */
		/* ----------------------------------------------------------- */

		/**
		 * Button to be removed from the ActionSelect content.
		 *
		 * @param {int | string | sap.m.Button} vButton The button to remove or its index or id.
		 * @returns {string} The id of the removed button or null.
		 * @public
		 */
		ActionSelect.prototype.removeButton = function(vButton) {
			var oSimpleFixFlex = this.getSimpleFixFlex();

			if (oSimpleFixFlex) {

				if (typeof vButton === "number") {
					vButton = this.getButtons()[vButton];
				}

				oSimpleFixFlex.removeFlexContent(vButton);
			}

			return this.removeAssociation("buttons", vButton);
		};

		/**
		 * Remove all buttons from the ActionSelect.
		 *
		 * @returns {string[]} An array with the ids of the removed elements (might be empty).
		 * @public
		 */
		ActionSelect.prototype.removeAllButtons = function() {
			var oSimpleFixFlex = this.getSimpleFixFlex();

			if (oSimpleFixFlex) {
				this.getButtons().forEach(function(sButtonId) {
					oSimpleFixFlex.removeFlexContent(Core.byId(sButtonId));
				});
			}

			return this.removeAllAssociation("buttons");
		};

		// Keyboard Navigation for Action buttons

		/**
		 * Handler for SHIFT-TAB key  - 'tab previous' key event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 *
		 */
		ActionSelect.prototype.onsaptabprevious = function(oEvent) {
			var aButtons = this.getButtons(),
				oPicker = this.getPicker(),
				i;

			// check whether event is marked or not
			if ( oEvent.isMarked() || !this.getEnabled()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (oPicker && oPicker.isOpen() && aButtons.length > 0) {
				for (i = aButtons.length - 1; i >= 0; i--) {
					if (Core.byId(aButtons[i]).getEnabled()) {
						Core.byId(aButtons[i]).focus();
						oEvent.preventDefault();
						break;
					}
				}
			}
		};

		/**
		 * Handler for TAB key - sap 'tab next' key event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 *
		 */
		ActionSelect.prototype.onsaptabnext = function(oEvent) {
			var aButtons = this.getButtons(),
				oPicker = this.getPicker(),
				i;
				this._bProcessChange = false;

			// check whether event is marked or not
			if ( oEvent.isMarked() || !this.getEnabled()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (oPicker && oPicker.isOpen() && aButtons.length > 0) {
				for (i = 0; i < aButtons.length; i++) {
					if (Core.byId(aButtons[i]).getEnabled()) {
						Core.byId(aButtons[i]).focus();
						oEvent.preventDefault();
						break;
					}
				}
			}
		};

		/**
		 * Handle the focus leave event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ActionSelect.prototype.onsapfocusleave = function(oEvent) {

			// Keep focus on Action Select's input field if does not go to
			// the buttons in Action sheet part of the ActionSelect
			var aButtons = this.getButtons();
			var bKeepFocus = (aButtons.indexOf(oEvent.relatedControlId) === -1);

			if (bKeepFocus) {
				Select.prototype.onsapfocusleave.apply(this, arguments);
			}

			this._toggleListFocusIndication(true);
		};

		/**
		 * Handler for focus in event on The Selection List.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ActionSelect.prototype.onfocusinList = function(oEvent) {
			if (document.activeElement !== this.getList().getDomRef()) {
				this.focus();
			}
		};

		ActionSelect.prototype.onfocusin = function() {
			Select.prototype.onfocusin.apply(this, arguments);
			this._toggleListFocusIndication(false);
		};

		/**
		 * Handles toggling of focus indication from the list items.
		 * If drop down is open and there is a selected item focus indication will be toggled.
		 *
		 * @param {boolean} bRemove - defines whether the focus indication should be removed or not.
		 * @private
		 */
		ActionSelect.prototype._toggleListFocusIndication = function(bRemove) {
			var oSelecteditem = this.getSelectedItem();

			if (this.isOpen() && oSelecteditem) {
				oSelecteditem.$().toggleClass("sapMActionSelectItemWithoutFocus", bRemove);
			}
		};

		/**
		 * Handles the creating and setting of a tutor message when the control has buttons.
		 *
		 * @private
		 */
		ActionSelect.prototype._updateTutorMessage = function() {
			var oPicker = this.getPicker(),
				aAriaLabels = oPicker.getAriaLabelledBy(),
				bHasButtons = !!this.getButtons().length,
				bTutorMessageNotReferenced;

			if (!this._sTutorMessageId) {
				this._sTutorMessageId = this._getTutorMessageId();
				this._oTutorMessageText = new InvisibleText(this._sTutorMessageId, {
					text: Core.getLibraryResourceBundle("sap.m").getText("ACTION_SELECT_TUTOR_MESSAGE")
				}).toStatic();
			}

			bTutorMessageNotReferenced = (aAriaLabels.indexOf(this._sTutorMessageId) === -1);

			if (bTutorMessageNotReferenced && bHasButtons) {
				oPicker.addAriaLabelledBy(this._sTutorMessageId);
			} else {
				if (!bHasButtons) {
					oPicker.removeAriaLabelledBy(this._sTutorMessageId);
				}
			}
		};

		/**
		 * Gets the tutor message id.
		 *
		 * @returns {string} The id of the tutor message.
		 * @private
		 */
		ActionSelect.prototype._getTutorMessageId = function() {
			return this.getId() + "-tutorMessage";
		};

		/**
		 * Called when the control is destroyed
		 *
		 * @private
		 */
		ActionSelect.prototype.exit = function () {
			if (this._oTutorMessageText) {
				this._oTutorMessageText.destroy();
				this._oTutorMessageText = null;
			}
		};

		return ActionSelect;

	});