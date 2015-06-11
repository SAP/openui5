/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton', 'sap/m/ButtonType', 'sap/ui/base/ManagedObject'], function(SemanticButton, ButtonType, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new SemanticToggleButton.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A semantic button is either a {@link sap.m.Button} or {@link sap.m.OverflowButton} ,
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}. Depending on its type,
	 * the semantic button is initialized with specific properties (text, icon etc.).
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

			properties : {

				/**
				 * The property is “true” when the control is toggled. The default state of this property is "false".
				 */
				pressed : {type : "boolean", group : "Data", defaultValue : false}
			}
		}
	});

	SemanticToggleButton.prototype.init = function() {

		this._getControl().addEventDelegate({
			ontap: this._onTap,
			onkeydown: this._onKeydown
		}, this);
	};

	SemanticToggleButton.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if ((sPropertyName === 'pressed') && (oValue !== this.getPressed())) {
			this._setPressed(oValue, bSuppressInvalidate);
			return this;
		}
		return SemanticButton.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
	};

	SemanticToggleButton.prototype.getProperty = function(sPropertyName) {

		if (sPropertyName === 'pressed') {
			return this._getPressed();
		}
		return SemanticButton.prototype.getProperty.call(this, sPropertyName);
	};

	/**
	 * Change the toggle state of the button
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	SemanticToggleButton.prototype._onTap = function(oEvent) {

		// mark the event for components that needs to know if the event was handled by the SemanticToggleButton
		oEvent.setMarked();

		if (this.getEnabled()) {
			this.setPressed(!this.getPressed());
			this.firePress({ pressed: this.getPressed() });
		}
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	SemanticToggleButton.prototype._onKeydown = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this._onTap(oEvent);
		}
	};

	/**
	 * Gets the 'pressed' property value.
	 * Can be overwritten in child classes to apply semantic-specific logic
	 * @private
	 */
	SemanticToggleButton.prototype._getPressed = function() {
		return this._getControl().getType() === ButtonType.Emphasized;
	};

	/**
	 * Sets the 'pressed' property value.
	 * Can be overwritten in child classes to apply semantic-specific logic
	 * @private
	 */
	SemanticToggleButton.prototype._setPressed = function(bPressed, bSuppressInvalidate) {
		var oButtonType = bPressed ? ButtonType.Emphasized : ButtonType.Default;
		this._getControl().setType(oButtonType, bSuppressInvalidate);
	};

	return SemanticToggleButton;
}, /* bExport= */ true);
