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
		var oElement = AdaptiveCards.TimeInput.prototype.internalRender.apply(this, arguments);

		oElement.classList.add("sapMInputBaseInner");
        oElement.classList.add("sapMInputBaseContentWrapper");
        this._inputControlContainerElement.classList.add("sapMInputBase");

		return oElement;
	};

	return UI5InputTime;
});