/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ToggleButton.
sap.ui.define(['jquery.sap.global', './Button', './library'],
	function(jQuery, Button, library) {
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
	 * @name sap.ui.commons.ToggleButton
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
		if (bPressed != this.getProperty("pressed")) {
			this.setProperty("pressed", bPressed, true);
			if (!this.getPressed()) {
				this.getRenderer().ondeactivePressed(this);
			} else {
				this.getRenderer().onactivePressed(this);
			}
			this.getRenderer().updateImage(this);
		}
		return this;
	};
	
	
	ToggleButton.prototype.onAfterRendering = function() {
		if (!this.getPressed()) {
			this.getRenderer().ondeactivePressed(this);
		} else {
			this.getRenderer().onactivePressed(this);
		}
	};
	

	return ToggleButton;

}, /* bExport= */ true);
