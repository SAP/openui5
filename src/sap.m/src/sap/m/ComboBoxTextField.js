/*!
 * ${copyright}
 */

sap.ui.define([
	'./InputBase',
	'./library',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/library',
	'sap/ui/Device',
	"./ComboBoxTextFieldRenderer"
],
	function(
		InputBase,
		library,
		InvisibleText,
		coreLibrary,
		Device,
		ComboBoxTextFieldRenderer
	) {
		"use strict";

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

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
					 * Indicates whether the dropdown downward-facing arrow button is shown.
					 * @since 1.38
					 */
					showButton: {
						type: "boolean",
						group: "Appearance",
						defaultValue: true
					}
				},
				aggregations: {
					_buttonLabelText: {type : "sap.ui.core.InvisibleText", multiple : false, visibility : "hidden"}
				}
			}
		});

		ComboBoxTextField.prototype.init = function() {
			InputBase.prototype.init.apply(this, arguments);
			var oRb, oArrowDownInvisibleLabel;

			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
				oArrowDownInvisibleLabel = new InvisibleText({
					text: oRb.getText("COMBOBOX_BUTTON")
				});

				this.setAggregation("_buttonLabelText", oArrowDownInvisibleLabel, true);
			}
		};

		ComboBoxTextField.prototype.updateValueStateClasses = function(sValueState, sOldValueState) {
			InputBase.prototype.updateValueStateClasses.apply(this, arguments);

			var mValueState = ValueState,
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
		ComboBoxTextField.prototype.bShowLabelAsPlaceholder = Device.browser.msie;

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Gets the <code>value</code>.
		 *
		 * Default value is an empty string.
		 *
		 * @returns {string} The value of property <code>value</code>
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
		 * Gets the DOM element reference where the message popup is attached.
		 *
		 * @returns {object} The DOM element reference where the message popup is attached
		 */
		ComboBoxTextField.prototype.getDomRefForValueStateMessage = function() {
			return this.getDomRef();
		};

		ComboBoxTextField.prototype.getAccessibilityInfo = function() {
			var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);
			oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO");
			return oInfo;
		};

		return ComboBoxTextField;
	});