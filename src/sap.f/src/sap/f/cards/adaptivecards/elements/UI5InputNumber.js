/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";
	function UI5InputNumber() {
		AdaptiveCards.NumberInput.apply(this, arguments);
	}

	UI5InputNumber.prototype = Object.create(AdaptiveCards.NumberInput.prototype);
	UI5InputNumber.prototype.internalRender = function () {
		this._numberInputElement = document.createElement("ui5-input");

		this._numberInputElement.type = "Number";
		this._numberInputElement.id = this.id;
		this._numberInputElement.placeholder = this.placeholder || "";
		this._numberInputElement.value = this.defaultValue || "";

		this._numberInputElement.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));

		this._numberInputElement.addEventListener("input", function (oEvent) {
			if (oEvent.target.value > this._max) {
				oEvent.target.value = this._max;
			}
			if (oEvent.target.value < this._min) {
				oEvent.target.value = this._min;
			}
		}.bind(this));

		return this._numberInputElement;

	};
	return UI5InputNumber;
});
