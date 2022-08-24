/*!
 * ${copyright}
 */

sap.ui.define([
	'./InputBase',
	'./library',
	'sap/ui/core/LabelEnablement',
	"./ComboBoxTextFieldRenderer"
],
	function(
		InputBase,
		library,
		LabelEnablement,
		ComboBoxTextFieldRenderer
	) {
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
				}
			}
		});

		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		ComboBoxTextField.prototype.init = function () {
			InputBase.prototype.init.apply(this, arguments);

			this._oArrowIcon = this.addEndIcon({
				id: this.getId() + "-arrow",
				src: "sap-icon://slim-arrow-down",
				noTabStop: true,
				alt: oRb.getText("COMBOBOX_BUTTON"),
				decorative: false
			});
		};

		/**
		 * Returns the arrow icon
		 *
		 * @returns {sap.ui.core.Icon} Icon
		 * @private
		 * @ui5-restricted sap.m.ComboBoxBase,sap.m.ComboBox,sap.m.MultiComboBox
		 */
		ComboBoxTextField.prototype.getArrowIcon = function () {
			return this._oArrowIcon;
		};

		/**
		 * Returns the arrow icon
		 *
		 * Left for backward compatibility.
		 *
		 * @returns {sap.ui.core.Icon} Icon
		 * @protected
		 */
		ComboBoxTextField.prototype.getIcon = ComboBoxTextField.prototype.getArrowIcon;

		/**
		 * Toggles the icon pressed style on or off.
		 *
		 * @param {boolean} [bState] True if the icon pressed class should be applied.
		 * @protected
		 */
		ComboBoxTextField.prototype.toggleIconPressedStyle = function(bState) {
			this.toggleStyleClass(InputBase.ICON_PRESSED_CSS_CLASS, bState);
		};

		ComboBoxTextField.prototype.onBeforeRendering = function () {
			InputBase.prototype.onBeforeRendering.apply(this, arguments);

			var aReferencingLabels = LabelEnablement.getReferencingLabels(this) || [],
				oIcon = this.getArrowIcon();

			oIcon.setVisible(this.getShowButton());

			aReferencingLabels.forEach(function (sLabelId) {
				if (oIcon.getAriaLabelledBy().indexOf(sLabelId) === -1) {
					oIcon.addAssociation("ariaLabelledBy", sLabelId, true);
				}
			}, this);
		};

		/**
		 * Gets the trigger element of the control's picker popup.
		 *
		 * @returns {Element | null} The element that is used as trigger to open the control's picker popup.
		 */
		ComboBoxTextField.prototype.getOpenArea = function() {
			// returns the div wrapping the icon
			var oDomRef = this.getArrowIcon().getDomRef();

			return oDomRef ? oDomRef.parentNode : oDomRef;
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
			this._bCheckDomValue &&  oEvent.setMarked();

			var sValue = this.getValue(),
				iValueLength = sValue.length;

			this.setValue(sValue);

			// deselect text
			this.selectText(iValueLength, iValueLength);
		};

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
		 * @returns {Element} The DOM element reference where the message popup is attached
		 */
		ComboBoxTextField.prototype.getDomRefForValueStateMessage = function() {
			return this.getDomRef();
		};

		ComboBoxTextField.prototype.getAccessibilityInfo = function() {
			var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);
			oInfo.type = oRb.getText("ACC_CTR_TYPE_COMBO");
			return oInfo;
		};

		ComboBoxTextField.prototype.exit = function() {
			InputBase.prototype.exit.apply(this, arguments);

			this._oArrowIcon = null;
		};

		return ComboBoxTextField;
	});