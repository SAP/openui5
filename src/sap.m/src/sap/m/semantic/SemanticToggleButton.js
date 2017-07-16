/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton', 'sap/m/semantic/SemanticControl', 'sap/m/ButtonType', 'sap/ui/base/ManagedObject'], function(SemanticButton, SemanticControl, ButtonType, ManagedObject) {
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

			properties : {

				/**
				 * The property is “true” when the control is toggled. The default state of this property is "false".
				 */
				pressed : {type : "boolean", group : "Data", defaultValue : false}
			}
		}
	});

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
	SemanticToggleButton.prototype._setPressed = function(bPressed, bSuppressInvalidate) {
		var oButtonType = bPressed ? ButtonType.Emphasized : ButtonType.Default;
		this._getControl().setType(oButtonType, bSuppressInvalidate);
	};

	/**
	 * @Overwrites
	 */
	SemanticToggleButton.prototype._createInstance = function(oClass) {
		var oInstance =  new oClass({
			id: this.getId() + "-toggleButton"
		});

		oInstance.addEventDelegate({
			ontap: this._onTap,
			onkeydown: this._onKeydown
		}, this);

		return oInstance;
	};

	return SemanticToggleButton;
}, /* bExport= */ true);
