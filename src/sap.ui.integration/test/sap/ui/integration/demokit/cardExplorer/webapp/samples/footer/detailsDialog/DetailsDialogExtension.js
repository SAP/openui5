sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/syncStyleClass",
	"sap/ui/integration/Extension",
	"sap/ui/integration/widgets/Card",
	"sap/ui/thirdparty/jquery",
	"sap/m/Dialog"
], function (
	Log,
	syncStyleClass,
	Extension,
	Card,
	jQuery,
	Dialog
) {
	"use strict";

	var FooterExtension = Extension.extend("card.explorer.footer.detailsDialog.Extension");

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
		var sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters");

		if (sActionType !== "Custom") {
			return;
		}

		switch (mParams.method) {
			case "CloseDetailsDialog":
				this._oDetailsDialog.close();
				break;
			case "OpenDetailsDialog":
				this._openSnack();
				break;
			default:
				Log.error("Method" + mParams.method + " not recognized");
		}
	};

	FooterExtension.prototype._openSnack = function () {
		var oCard = this.getCard(),
			sUrl = oCard.getRuntimeUrl("./detailsCard.json"),
			oDetailsCard = new Card({
				manifest: sUrl,
				width: "100%",
				height: "100%"
			});

		// we can reuse the same actions handler if we want
		oDetailsCard.attachAction(this._handleAction.bind(this));

		this._oDetailsDialog = new Dialog({
			content: [
				oDetailsCard
			],
			showHeader: false,
			contentWidth: "40%"
		});

		syncStyleClass("sapUiSizeCompact", jQuery(oCard.getDomRef()), this._oDetailsDialog);
		this._oDetailsDialog.open();
	};

	return FooterExtension;
});