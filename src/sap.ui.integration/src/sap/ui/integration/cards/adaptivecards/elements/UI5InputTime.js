/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
],
	function (
		AdaptiveCards,
		InputsOverwrites
	) {
		"use strict";

		function UI5InputTime() {
			AdaptiveCards.TimeInput.apply(this, arguments);
		}

		var sTimePattern = "HH:mm";

		UI5InputTime.prototype = Object.create(AdaptiveCards.TimeInput.prototype);


		UI5InputTime.prototype.overrideInternalRender = function () {
			var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

			InputsOverwrites.overwriteLabel(this);
			InputsOverwrites.overwriteRequired(this);

			return oInput;
		};

		UI5InputTime.prototype.internalRender = function () {
			var sWCElement = "ui5-time-picker";
			this._timeInputElement = document.createElement(sWCElement);
			this._timeInputElement.id = this.id;
			this._timeInputElement.value = this.defaultValue || "";
			this._timeInputElement.formatPattern = sTimePattern;

			InputsOverwrites.createValueStateElement(this, this._timeInputElement);

			this._timeInputElement.addEventListener("input", function (oEvent) {
				this.valueChanged();
			}.bind(this));

			return this._timeInputElement;
		};

		UI5InputTime.prototype.updateInputControlAriaLabelledBy = function () {
			// when support for accessible-name-ref is implemented for ui5-time-picker, aria-labelledby should be changed
			InputsOverwrites.overwriteAriaLabelling(this, "aria-labelledby");
		};

		UI5InputTime.prototype.showValidationErrorMessage = function () {
			if (this.renderedInputControlElement) {
				this.renderedInputControlElement.valueState = "Error";
			}
		};

		UI5InputTime.prototype.resetValidationFailureCue = function () {
			AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

			if (this.renderedInputControlElement) {
				this.renderedInputControlElement.valueState = "None";
			}
		};

		return UI5InputTime;
	});