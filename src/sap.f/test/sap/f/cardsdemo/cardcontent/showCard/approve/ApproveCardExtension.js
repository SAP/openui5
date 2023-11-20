sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/m/MessageToast"
], function (Extension, MessageToast) {
	"use strict";

	var ApproveCardExtension = Extension.extend("sap.f.cardsdemo.showCard.approve.Extension");

	ApproveCardExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	ApproveCardExtension.prototype._handleAction = function (oEvent) {
		var sStatus = oEvent.getParameters().parameters.status;
		if (!sStatus) {
			return;
		}
		if (sStatus === "denied") {
			var oCard = this.getCard();

			this._submit(oEvent);
			oCard.hide();
		}
		if (sStatus === "approved") {
			this._submit(oEvent);
		}
	};

	ApproveCardExtension.prototype._submit = function (oEvent) {
			var sMessage = "Custom Action",
			mParameters = oEvent.getParameter("parameters");

			if (mParameters) {
				sMessage += "\n" + JSON.stringify(mParameters);
			}

			MessageToast.show(sMessage, {
				at: "center center",
				width: "25rem"
			});
	};

	return ApproveCardExtension;
});
