sap.ui.define([
	"sap/base/Log",
	"sap/ui/integration/Extension"
], function (
	Log,
	Extension
) {
	"use strict";

	var HideCardExtension = Extension.extend("card.explorer.footer.HideCardExtension");

	HideCardExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	HideCardExtension.prototype.exit = function () {
		if (this._oSnackDialog) {
			this._oSnackDialog.destroy();
		}

		Extension.prototype.exit.apply(this, arguments);
	};

	HideCardExtension.prototype._handleAction = function (oEvent) {
		var sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters");

		if (sActionType !== "Custom") {
			return;
		}

		switch (mParams.method) {
			case "accept":
				this._accept();
				break;
			case "reject":
				this._reject();
				break;
			default:
				Log.error("Method" + mParams.method + " not recognized");
		}
	};

	HideCardExtension.prototype._accept = function () {
		// here you can mark the request as accepted in the backend for example,
		// then visually hide the card
		this._hideCard();
	};

	HideCardExtension.prototype._reject = function () {
		// here you can mark the request as reject in the backend for example,
		// then visually hide the card
		this._hideCard();
	};

	HideCardExtension.prototype._hideCard = function () {
		// visually hide the card
		this.getCard().setVisible(false);
	};

	return HideCardExtension;
});