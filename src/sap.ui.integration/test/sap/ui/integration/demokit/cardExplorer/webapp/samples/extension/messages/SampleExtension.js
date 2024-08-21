sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var SampleExtension = Extension.extend("card.explorer.object.formWithExtension.SampleExtension");

	SampleExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	SampleExtension.prototype._handleAction = function (oEvent) {
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters");

		if (sActionType === "Custom") {
			var sCustomType = mParams.type;
			var sCustomMessage = mParams.message;
			oCard.showMessage(sCustomMessage, sCustomType, mParams.autoClose);
			return;
		}
	};
	return SampleExtension;
});
