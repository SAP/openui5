/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
	], function (AdaptiveCards, InputsOverwrites) {
	"use strict";
	function UI5InputText() {
		AdaptiveCards.TextInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputText</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's Adaptive Card <code>Input.Text</code> element by replacing it with
	 * <code>ui5-input</code> or <code>ui5-textarea<code> UI5 web component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */
	UI5InputText.prototype = Object.create(AdaptiveCards.TextInput.prototype);

	UI5InputText.prototype.overrideInternalRender = function () {
		var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

		InputsOverwrites.overwriteLabel(this);
		InputsOverwrites.overwriteRequired(this);

		return oInput;
	};

	UI5InputText.prototype.internalRender = function () {
		//when this.isMultiline is true, we have to render an ui5-textarea instead of ui5-input
		if (this.isMultiline) {
			var oTextArea = document.createElement("ui5-textarea");
			oTextArea.id = this.id;
			oTextArea.placeholder = this.placeholder || "";
			oTextArea.value = this.defaultValue || "";
			oTextArea.maxlength = this.maxLength || null;

			InputsOverwrites.createValueStateElement(this, oTextArea);

			oTextArea.addEventListener("input", function () {
				this.valueChanged();
			}.bind(this));
			return oTextArea;
		}
		var oInput = document.createElement("ui5-input");
		switch (this.style) {
			case 1:
				oInput.type = "Tel";
				break;
			case 2:
				oInput.type = "URL";
				break;
			case 3:
				oInput.type = "Email";
				break;
			default:
				oInput.type = "Text";
			}
		oInput.id = this.id;
		oInput.placeholder = this.placeholder || "";
		oInput.value = this.defaultValue || "";
		oInput.maxlength = this.maxLength || null;

		InputsOverwrites.createValueStateElement(this, oInput);

		oInput.addEventListener("input", function () {
			this.valueChanged();
		}.bind(this));
		return oInput;
	};

	UI5InputText.prototype.updateInputControlAriaLabelledBy = function () {
		InputsOverwrites.overwriteAriaLabelling(this, "accessible-name-ref");
	};

	UI5InputText.prototype.showValidationErrorMessage = function () {
		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "Error";
		}
	};

	UI5InputText.prototype.resetValidationFailureCue = function () {
		AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "None";
		}
	};

	return UI5InputText;
});