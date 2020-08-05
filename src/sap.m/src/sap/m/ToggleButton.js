/*!
 * ${copyright}
 */

// Provides control sap.m.ToggleButton.
sap.ui.define([
	'./Button',
	'./library',
	'sap/ui/core/EnabledPropagator',
	'./ToggleButtonRenderer',
	"sap/ui/events/KeyCodes"
],
	function(Button, library, EnabledPropagator, ToggleButtonRenderer, KeyCodes) {
	"use strict";



	/**
	 * Constructor for a new <code>ToggleButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An enhanced {@link sap.m.Button} that can be toggled between pressed and normal state.
	 *
	 * Clicking or tapping a <code>ToggleButton</code> changes its state to <code>pressed</code>. The button returns to
	 * its initial state when the user clicks or taps it again.
	 *
	 * @extends sap.m.Button
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.ToggleButton
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/button/ Toggle Button}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ToggleButton = Button.extend("sap.m.ToggleButton", /** @lends sap.m.ToggleButton.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/ToggleButton.designtime",
		properties : {

			/**
			 * The property is “true” when the control is toggled. The default state of this property is "false".
			 */
			pressed : {type : "boolean", group : "Data", defaultValue : false}
		},
		events: {
			/**
			 * Fired when the user clicks or taps on the control.
			 */
			press: {
				parameters: {

					/**
					 * The current pressed state of the control.
					 */
					pressed: { type: "boolean" }
				}
			}
		}
	}});

	EnabledPropagator.call(ToggleButton.prototype);

	/**
	 * Function is called when ToggleButton is clicked.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	ToggleButton.prototype.ontap = function(oEvent) {
	// mark the event for components that needs to know if the event was handled by the ToggleButton
		oEvent.setMarked();
		if (this.getEnabled()) {
			this.setPressed(!this.getPressed());
			this.firePress({ pressed: this.getPressed() });
		}
	};

	ToggleButton.prototype.setPressed = function(bPressed) {
		bPressed = !!bPressed;
		if (bPressed != this.getPressed()) {
			this.setProperty("pressed", bPressed);
			this.$().attr("aria-pressed", bPressed);
			this.$("inner").toggleClass("sapMToggleBtnPressed",bPressed && !this._isUnstyled());
		}
		return this;
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	ToggleButton.prototype.onkeydown = function(oEvent) {

		if (oEvent.which === KeyCodes.ENTER) {
			this.ontap(oEvent);
		}
	};

	/**
	 * Override the keyup event handler of Button.js.
	 * @param {jQuery.Event} oEvent The fired event
	 */
	ToggleButton.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			oEvent.setMarked();
		}

		if (oEvent.which === KeyCodes.SPACE) {
			this.ontap(oEvent);
		}
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control.
	 * @protected
	 */
	ToggleButton.prototype.getAccessibilityInfo = function() {
		var oInfo = Button.prototype.getAccessibilityInfo.apply(this, arguments);
		if (this.getPressed()) {
			oInfo.description = ((oInfo.description || "") + " " +
				sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_PRESSED")).trim();
		}
		return oInfo;
	};


	return ToggleButton;

});
