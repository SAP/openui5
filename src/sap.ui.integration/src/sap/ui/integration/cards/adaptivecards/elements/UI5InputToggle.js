/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
], function (AdaptiveCards, InputsOverwrites) {
	"use strict";
	function UI5InputToggle() {
		AdaptiveCards.ToggleInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputToggle</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's AdaptiveCard <code>Input.Toggle</code> element by replacing it with
	 * <code>ui5-checkbox</code> web component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */
	UI5InputToggle.prototype = Object.create(AdaptiveCards.ToggleInput.prototype);

	UI5InputToggle.prototype.overrideInternalRender = function () {
		var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

		InputsOverwrites.overwriteLabel(this);
		InputsOverwrites.overwriteRequired(this);

		return oInput;
	};

	UI5InputToggle.prototype.internalRender = function () {

		this._checkboxInputElement = document.createElement("ui5-checkbox");
		this._checkboxInputElement.id = this.id;
		this._checkboxInputElement.text = this.title || "";
		this._checkboxInputElement.wrappingType = this.wrap ? "Normal" : "None";
		this._checkboxInputElement.checked = false;

		// We have to map Input.Toggle value with the checked property of the ui5-checkbox webcomponent.
		// When the Input.Toggle value is similar to valueOn, then the checkbox should to be checked.
		if (this.defaultValue === this.valueOn) {
			this._checkboxInputElement.checked = true;
		}

		this._checkboxInputElement.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));

		return this._checkboxInputElement;
	};

	UI5InputToggle.prototype.updateInputControlAriaLabelledBy = function () {
		// support for accessible-name-ref is available from 1.1.0, after updating
		// aria-labelledby should be changed to accessible-name-ref
		InputsOverwrites.overwriteAriaLabelling(this, "aria-labelledby");
	};

	UI5InputToggle.prototype.showValidationErrorMessage = function () {
		if (this._checkboxInputElement) {
			this._checkboxInputElement.valueState = "Error";
		}
	};

	UI5InputToggle.prototype.resetValidationFailureCue = function () {
		AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

		if (this._checkboxInputElement) {
			this._checkboxInputElement.valueState = "None";
		}
	};

	return UI5InputToggle;
});