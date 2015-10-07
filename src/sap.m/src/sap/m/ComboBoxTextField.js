/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './InputBase', './library'],
	function(jQuery, InputBase, library) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.m.ComboBoxTextField</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.ComboBoxTextField</code>.
		 * @extends sap.m.InputBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.m.ComboBoxTextField
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var ComboBoxTextField = InputBase.extend("sap.m.ComboBoxTextField", /** @lends sap.m.ComboBoxTextField.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Sets the maximum width of the text field.
					 */
					maxWidth: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%"
					},

					/**
					 * Indicates whether the dropdown arrow button is shown.
					 * @since 1.38
					 */
					showButton: {
						type: "boolean",
						group: "Appearance",
						defaultValue: true
					}
				}
			}
		});

		ComboBoxTextField.prototype.updateValueStateClasses = function(sValueState, sOldValueState) {
			InputBase.prototype.updateValueStateClasses.apply(this, arguments);

			var mValueState = sap.ui.core.ValueState,
				CSS_CLASS = this.getRenderer().CSS_CLASS_COMBOBOXTEXTFIELD,
				$DomRef = this.$();

			if (sOldValueState !== mValueState.None) {
				$DomRef.removeClass(CSS_CLASS + "State " + CSS_CLASS + sOldValueState);
			}

			if (sValueState !== mValueState.None) {
				$DomRef.addClass(CSS_CLASS + "State " + CSS_CLASS + sValueState);
			}
		};

		/**
		 * Gets the trigger element of the control's picker popup.
		 *
		 * @returns {Element | null} The element that is used as trigger to open the control's picker popup.
		 */
		ComboBoxTextField.prototype.getOpenArea = function() {
			return this.getDomRef("arrow");
		};

		/**
		 * Checks whether the provided element is the open area.
		 *
		 * @param {Element} oDomRef
		 * @returns {boolean}
		 */
		ComboBoxTextField.prototype.isOpenArea = function(oDomRef) {
			var oOpenAreaDomRef = this.getOpenArea();
			return oOpenAreaDomRef && oOpenAreaDomRef.contains(oDomRef);
		};

		/**
		 * Handles the <code>sapenter</code> event when enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		ComboBoxTextField.prototype.onsapenter = function(oEvent) {
			InputBase.prototype.onsapenter.apply(this, arguments);

			// in case of a non-editable or disabled combo box, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var sValue = this.getValue(),
				iValueLength = sValue.length;

			this.setValue(sValue);

			// deselect text
			this.selectText(iValueLength, iValueLength);
		};

		/**
		 * Indicates whether the custom placeholder is used.
		 *
		 * IE9 does not have a native placeholder support.
		 * IE10+ fires the input event when an input field with a native placeholder is focused.
		 */
		ComboBoxTextField.prototype.bShowLabelAsPlaceholder = sap.ui.Device.browser.msie;

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Gets the <code>value</code>.
		 *
		 * Default value is an empty string.
		 *
		 * @return {string} The value of property <code>value</code>.
		 * @public
		 */
		ComboBoxTextField.prototype.getValue = function() {
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
		 * Gets the labels referencing this control.
		 *
		 * @returns {sap.m.Label[]} Array of objects which are the current targets of the <code>ariaLabelledBy</code>
		 * association and the labels referencing this control.
		 * @since 1.38
		 */
		ComboBoxTextField.prototype.getLabels = function() {
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
		 * Gets the DOM reference the message popup should be docked.
		 *
		 * @return {object}
		 */
		ComboBoxTextField.prototype.getDomRefForValueStateMessage = function() {
			return this.getDomRef();
		};

		/**
		 * @see {sap.ui.core.Control#getAccessibilityInfo}
		 * @protected
		 */
		ComboBoxTextField.prototype.getAccessibilityInfo = function() {
			var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);
			oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO");
			return oInfo;
		};

		return ComboBoxTextField;
	}, true);