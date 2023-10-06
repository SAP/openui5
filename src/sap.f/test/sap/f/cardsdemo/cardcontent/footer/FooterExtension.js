sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/Extension",
	"sap/ui/integration/widgets/Card",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/m/Dialog"
], function (
	Core,
	Extension,
	Card,
	Log,
	MessageToast,
	Dialog
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
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters"),
			oButton = oEvent.getParameter("actionSource");

		if (sActionType !== "Custom") {
			return;
		}

		switch (mParams.method) {
			case "approve":

				oCard.request({"url": "./MOCK.json?approve=true"})
					.then(function () {
						this._showMessageToast("Request was approved.");
						oButton.setVisible(false);
					}.bind(this));

			break;
			case "reject":

				oCard.request({"url": "./MOCK.json?reject=true"})
					.then(function () {
						this._closeSnack();
						this._showMessageToast("Request was rejected.");
						oCard.setVisible(false);
					}.bind(this));

			break;
			case "openSnack":
				this._openSnack();
			break;
			case "closeSnack":
				this._closeSnack();
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

	FooterExtension.prototype._openSnack = function () {
		var oCard = this.getCard(),
			sUrl = oCard.getRuntimeUrl("./snack.json"),
			oSnack = new Card({
				manifest: sUrl,
				width: "100%",
				height: "100%"
			});

		// we can reuse the same actions handler if we want
		oSnack.attachAction(this._handleAction.bind(this));

		this._oSnackDialog = new Dialog({
			content: [
				oSnack
			],
			showHeader: false,
			contentWidth: "40%"
		});

		if (Core.byId("cardsplayground---footer--sizeSwitch").getSelectedKey() === "compact") {
			this._oSnackDialog.addStyleClass("sapUiSizeCompact");
		}

		this._oSnackDialog.open();
	};

	FooterExtension.prototype._closeSnack = function () {
		if (this._oSnackDialog) {
			this._oSnackDialog.close();
		}
	};

	return FooterExtension;
});