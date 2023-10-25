/*!
 * ${copyright}
 */

// Provides control sap.m.ToggleButton.
sap.ui.define([
	'./Button',
	'./library',
	'sap/ui/core/EnabledPropagator',
	'./ToggleButtonRenderer',
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes"
],
	function(Button, library, EnabledPropagator, ToggleButtonRenderer, Library, KeyCodes) {
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
	 */
	var ToggleButton = Button.extend("sap.m.ToggleButton", /** @lends sap.m.ToggleButton.prototype */ {
		metadata : {
			interfaces : [
				"sap.m.IToolbarInteractiveControl"
			],
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
		},

		renderer: ToggleButtonRenderer
	});

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

		if (oEvent.which === KeyCodes.ENTER && !oEvent.ctrlKey && !oEvent.metaKey) {
			this.ontap(oEvent);
		}

		if (oEvent.which === KeyCodes.SPACE) {
			this._bPressedSpace = true;
		}

		if (oEvent.which === KeyCodes.SHIFT && this._bPressedSpace) {
			this._bPressedShift = true;
		}
	};

	/**
	 * Override the keyup event handler of Button.js.
	 * @param {jQuery.Event} oEvent The fired event
	 */
	ToggleButton.prototype.onkeyup = function(oEvent) {
		if (!this._bPressedShift && oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			oEvent.setMarked();
		}

		if (!this._bPressedShift && oEvent.which === KeyCodes.SPACE) {
			this.ontap(oEvent);
		}

		if (oEvent.which === KeyCodes.SPACE) {
			this._bPressedShift = false;
		}
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control.
	 * @protected
	 */
	ToggleButton.prototype.getAccessibilityInfo = function() {
		var oInfo = Button.prototype.getAccessibilityInfo.apply(this, arguments);
		if (this.getPressed()) {
			oInfo.description = ((oInfo.description || "") + " " +
				Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PRESSED")).trim();
		}
		return oInfo;
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	ToggleButton.prototype._getToolbarInteractive = function () {
		return true;
	};

	ToggleButton.prototype._toggleLiveChangeAnnouncement = function() {};

	return ToggleButton;

});
