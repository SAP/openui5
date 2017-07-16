/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ToggleButton.
sap.ui.define(['jquery.sap.global', './Button'],
	function(jQuery, Button) {
	"use strict";



	/**
	 * Constructor for a new ToggleButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The ToggleButton Control is a Button that can be toggled between pressed and normal state
	 * @extends sap.ui.commons.Button
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.ToggleButton</code> control.
	 * @alias sap.ui.commons.ToggleButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ToggleButton = Button.extend("sap.ui.commons.ToggleButton", /** @lends sap.ui.commons.ToggleButton.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * The property is “true” when the control is toggled. The default state of this property is "false".
			 */
			pressed : {type : "boolean", group : "Data", defaultValue : false}
		}
	}});

	/**
	 * Function is called when ToggleButton is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ToggleButton.prototype.onclick = function(oEvent) {
		if (this.getEnabled()) {
			this.setPressed(!this.getPressed());
			if (this.$().is(":visible")) {
				this.firePress({pressed: this.getPressed()});
			}
		}
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};


	ToggleButton.prototype.setPressed = function(bPressed) {
		var oRenderer;
		if (bPressed !== this.getProperty("pressed")) {
			oRenderer = this.getRenderer();
			this.setProperty("pressed", bPressed, true);
			if (!this.getPressed()) {
				oRenderer.ondeactivePressed(this);
			} else {
				oRenderer.onactivePressed(this);
			}
			oRenderer.updateImage(this);
		}
		return this;
	};


	ToggleButton.prototype.onAfterRendering = function() {
		var oRenderer = this.getRenderer();
		if (!this.getPressed()) {
			oRenderer.ondeactivePressed(this);
		} else {
			oRenderer.onactivePressed(this);
		}
	};


	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	ToggleButton.prototype.getAccessibilityInfo = function() {
		var oInfo = Button.prototype.getAccessibilityInfo.apply(this, arguments);
		if (this.getPressed()) {
			oInfo.description = ((oInfo.description || "") + " " +
				sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons").getText("ACC_CTR_STATE_PRESSED")).trim();
		}
		return oInfo;
	};


	return ToggleButton;

}, /* bExport= */ true);
