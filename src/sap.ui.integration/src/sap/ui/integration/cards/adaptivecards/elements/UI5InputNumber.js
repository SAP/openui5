/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
], function (AdaptiveCards, InputsOverwrites) {
	"use strict";
	function UI5InputNumber() {
		AdaptiveCards.NumberInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputNumber</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's AdaptiveCard <code>Input.Number</code> element by replacing it with
	 * <code>ui5-step-input</code> web component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */
	UI5InputNumber.prototype = Object.create(AdaptiveCards.NumberInput.prototype);

	UI5InputNumber.prototype.overrideInternalRender = function () {
		var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

		InputsOverwrites.overwriteLabel(this);
		InputsOverwrites.overwriteRequired(this);

		return oInput;
	};

	UI5InputNumber.prototype.internalRender = function () {
		this._numberInputElement = document.createElement("ui5-step-input");

		this._numberInputElement.id = this.id;
		this._numberInputElement.placeholder = this.placeholder || "";
		this._numberInputElement.value = this.defaultValue || "";
		this._numberInputElement.min = this.min;
		this._numberInputElement.max = this.max;
		this._numberInputElement.style.width = "13.125rem"; // the default width of the ui5-input web component

		InputsOverwrites.createValueStateElement(this, this._numberInputElement);

		this._numberInputElement.addEventListener("input", function (oEvent) {
			this.valueChanged();
		}.bind(this));

		return this._numberInputElement;

	};

	Object.defineProperty(UI5InputNumber.prototype, "value", {
		get: function () {
			return this._numberInputElement ? this._numberInputElement.value : undefined;
		}
	});

	UI5InputNumber.prototype.updateInputControlAriaLabelledBy = function () {
		InputsOverwrites.overwriteAriaLabelling(this, "accessible-name-ref");
	};

	UI5InputNumber.prototype.showValidationErrorMessage = function () {
		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "Error";
		}
	};

	UI5InputNumber.prototype.resetValidationFailureCue = function () {
		AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "None";
		}
	};

	return UI5InputNumber;
});
