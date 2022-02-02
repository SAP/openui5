	/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
], function (AdaptiveCards, InputsOverwrites) {
	"use strict";
	function UI5InputDate() {
		AdaptiveCards.DateInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputDate</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's Adaptive Card <code>Input.Date</code> element by replacing it with
	 * <code>ui5-datepicker</code> web component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */
	UI5InputDate.prototype = Object.create(AdaptiveCards.DateInput.prototype);


	UI5InputDate.prototype.overrideInternalRender = function () {
		var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

		InputsOverwrites.overwriteLabel(this);
		InputsOverwrites.overwriteRequired(this);

		return oInput;
	};

	UI5InputDate.prototype.internalRender = function () {
		this._dateInputElement = document.createElement("ui5-date-picker");

		this._dateInputElement.id = this.id;
		this._dateInputElement.placeholder = this.placeholder;
		this._dateInputElement.formatPattern = "yyyy-MM-dd";
		this._dateInputElement.value = this.defaultValue || "";
		this._dateInputElement.minDate = this.min || "";
		this._dateInputElement.maxDate = this.max || "";

		InputsOverwrites.createValueStateElement(this, this._dateInputElement);

		this._dateInputElement.addEventListener("input", function () {
			this.valueChanged();
		}.bind(this));

		return this._dateInputElement;

	};

	UI5InputDate.prototype.updateInputControlAriaLabelledBy = function () {
		InputsOverwrites.overwriteAriaLabelling(this, "accessible-name-ref");
	};

	UI5InputDate.prototype.showValidationErrorMessage = function () {
		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "Error";
		}
	};

	UI5InputDate.prototype.resetValidationFailureCue = function () {
		AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

		if (this.renderedInputControlElement) {
			this.renderedInputControlElement.valueState = "None";
		}
	};

	return UI5InputDate;
});