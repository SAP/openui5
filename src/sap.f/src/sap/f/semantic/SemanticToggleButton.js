/*!
 * ${copyright}
 */

sap.ui.define([
	'./SemanticButton',
	'sap/m/library',
	'jquery.sap.keycodes'
], function(SemanticButton, mobileLibrary, jQuery) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	* Constructor for a new <code>SemanticToggleButton</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* A base class for the {@link sap.f.semantic.FavoriteAction} and {@link sap.f.semantic.FlagAction}.
	*
	* @extends sap.f.semantic.SemanticButton
	* @abstract
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticToggleButton
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticToggleButton = SemanticButton.extend("sap.f.semantic.SemanticToggleButton", /** @lends sap.f.semantic.SemanticToggleButton.prototype */ {
		metadata : {
			library : "sap.f",
			"abstract" : true,
			properties : {

				/**
				 * Defines the <code>SemanticToggleButton</code> pressed state.
				 *
				 * The property is set to <code>true</code> when the control is toggled (default is <code>false</code>).
				 */
				pressed : {type : "boolean", group : "Data", defaultValue : false}
			}
		}
	});

	/**
	* Changes the toggle state of the button.
	*
	* @param {jQuery.Event} oEvent - the keyboard event.
	* @private
	*/
	SemanticToggleButton.prototype._onTap = function(oEvent) {

		// mark the event for components that needs to know,
		// if the event was handled by the <code>SemanticToggleButton</code>
		oEvent.setMarked();

		if (this.getEnabled()) {
			this.setPressed(!this.getPressed());
			this.firePress({ pressed: this.getPressed() });
		}
	};

	/**
	* Handles the key down event for SPACE and ENTER.
	* @param {jQuery.Event} oEvent - the keyboard event.
	* @private
	*/
	SemanticToggleButton.prototype._onKeydown = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this._onTap(oEvent);
		}
	};

	/**
	* Applies the property value according to semantic logic.
	* Overrides to apply toggle-specific logic.
	*
	* @override
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
	* Sets the value of the <code>pressed</code> property.
	* Can be overwritten in child classes to apply semantic-specific logic.
	*
	* @private
	*/
	SemanticToggleButton.prototype._setPressed = function(bPressed, bSuppressInvalidate) {
		var oButtonType = bPressed ? ButtonType.Emphasized : ButtonType.Transparent;
		this._getControl().setType(oButtonType, bSuppressInvalidate);
	};

	/**
	* @override
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

});
