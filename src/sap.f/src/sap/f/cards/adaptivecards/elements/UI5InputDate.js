/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
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
	UI5InputDate.prototype.internalRender = function () {
		this._dateInputElement = document.createElement("ui5-datepicker");

		this._dateInputElement.id = this.id;
		this._dateInputElement.placeholder = this.placeholder;
		this._dateInputElement.formatPattern = "yyyy-MM-dd";
		this._dateInputElement.value = this.defaultValue || "";

		this._dateInputElement.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));

		return this._dateInputElement;

	};
	return UI5InputDate;
});