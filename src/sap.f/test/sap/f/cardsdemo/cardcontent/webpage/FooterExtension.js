sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/base/Log",
	"sap/m/MessageToast"
], function (
	Extension,
	Log,
	MessageToast
) {
	"use strict";

	var FooterExtension = Extension.extend("cardsdemo.footer.FooterExtension");

	FooterExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	FooterExtension.prototype.exit = function () {
		if (this._oSnackDialog) {
			this._oSnackDialog.destroy();
		}

		Extension.prototype.exit.apply(this, arguments);
	};

	FooterExtension.prototype._handleAction = function (oEvent) {
		var	sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters");

		if (sActionType !== "Custom") {
			return;
		}

		switch (mParams.method) {
			case "info":
				this._showMessageToast("This is a WebPage Card.");
			break;
			default:
				Log.error("Action not recognized.");

		}
	};

	FooterExtension.prototype._showMessageToast = function (sMessage) {
		MessageToast.show(sMessage, {
			of: this.getCard().getDomRef(),
			at: "center center",
			my: "center center"
		});
	};

	return FooterExtension;
});