/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/semantic/SemanticButton",
	"sap/m/ToggleButton",
	"sap/m/semantic/SemanticOverflowToolbarToggleButton"
], function(
	SemanticButton,
	ToggleButton,
	SemanticOverflowToolbarToggleButton
) {
	"use strict";

	/**
	 * Constructor for a new SemanticToggleButton.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A SemanticToggleButton is eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticToggleButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var SemanticToggleButton = SemanticButton.extend("sap.m.semantic.SemanticToggleButton", /** @lends sap.m.semantic.SemanticToggleButton.prototype */ {
		metadata : {

			library : "sap.m",

			"abstract": true,

			properties : {

				/**
				 * The property is “true” when the control is toggled. The default state of this property is "false".
				 */
				pressed : {type : "boolean", group : "Data", defaultValue : false}
			}
		}
	});

	/**
	 * @override
	 */
	SemanticToggleButton.prototype._getClass = function(oConfig) {
		return oConfig && oConfig.constraints === "IconOnly" ? SemanticOverflowToolbarToggleButton : ToggleButton;
	};

	/**
	 * Change the toggle state of the button
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	SemanticToggleButton.prototype._onPress = function(oEvent) {
		var bPressed;

		if (this.getEnabled()) {
			bPressed = oEvent.getParameter('pressed');

			this.setPressed(bPressed);
			this.firePress({ pressed: bPressed });
		}
	};

	/**
	 * Applies the property value according to semantic logic
	 * Overwrites to apply toggle-specific logic
	 * @Overwrites
	 * @private
	 */
	SemanticToggleButton.prototype._applyProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (sPropertyName === 'pressed') {
			this._setPressed(oValue, bSuppressInvalidate);
		} else {
			SemanticButton.prototype._applyProperty.apply(this, arguments);
		}
	};

	/**
	 * Sets the 'pressed' property value.
	 * Can be overwritten in child classes to apply semantic-specific logic
	 * @private
	 */
	SemanticToggleButton.prototype._setPressed = function(bValue, bSuppressInvalidate) {
		var oToggleButton = this._getControl(),
			bPressed = Boolean(bValue);

		if (oToggleButton.getPressed() !== bPressed) {
			this._getControl().setPressed(bPressed, bSuppressInvalidate);
		}
	};

	/**
	 * @Overwrites
	 */
	SemanticToggleButton.prototype._createInstance = function(oClass) {
		var oInstance =  new oClass({
			id: this.getId() + "-toggleButton"
		});

		oInstance.attachEvent("press", this._onPress, this);

		return oInstance;
	};

	return SemanticToggleButton;
});