/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";

	function UI5InputTime() {
		AdaptiveCards.TimeInput.apply(this, arguments);
	}

	UI5InputTime.prototype = Object.create(AdaptiveCards.TimeInput.prototype);

	UI5InputTime.prototype.internalRender = function () {
		AdaptiveCards.TimeInput.prototype.internalRender.apply(this, arguments);

		this._timeInputElement.id = this.id;
		this._timeInputElement.classList.add("sapMInputBaseInner");
		this._timeInputElement.classList.add("sapMInputBaseContentWrapper");
		this._inputControlContainerElement.classList.add("sapMInputBase");

		return this._timeInputElement;
	};

	return UI5InputTime;
});