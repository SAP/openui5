/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";
	function UI5InputDate() {
		AdaptiveCards.NumberInput.apply(this, arguments);
	}

	UI5InputDate.prototype = Object.create(AdaptiveCards.DateInput.prototype);
	UI5InputDate.prototype.internalRender = function () {
		this._dateInputElement = document.createElement("ui5-datepicker");

		this._dateInputElement.id = this.id;
		this._dateInputElement.placeholder = this.placeholder || "";
		this._dateInputElement.formatPattern = "yyyy-MM-dd";
		this._dateInputElement.value = this.defaultValue || "";

		this._dateInputElement.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));

		return this._dateInputElement;

	};
	return UI5InputDate;
});