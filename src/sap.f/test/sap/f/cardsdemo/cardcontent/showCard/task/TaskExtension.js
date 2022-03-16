sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";

	var TaskExtension = Extension.extend("sap.f.cardsdemo.showCard.task.Extension");

	TaskExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	TaskExtension.prototype._handleAction = function (oEvent) {
		if (oEvent.getParameter("type") !== "Custom") {
			return;
		}

		var oActionParams = oEvent.getParameter("parameters");

		switch (oActionParams.method) {
			case "approve":
				this._approve();
			break;
			case "reject":
				this._reject();
			break;
			case "confirmReject":
				this._confirmReject();
			break;
			case "review":
			default:
				this._review();
			break;
		}

	};

	TaskExtension.prototype._review = function () {
		this.getCard().showCard({
			manifest: "./details.json",
			width: "480px"
		});
	};

	TaskExtension.prototype._approve = function () {
		setTimeout(function () { // send http request
			var oCard = this.getCard();
			oCard.hide();
			oCard.getOpener().hide();
		}.bind(this), 500);
	};

	TaskExtension.prototype._reject = function () {
		this.getCard().showCard({
			manifest: "./reject.json",
			width: "480px"
		});
	};

	TaskExtension.prototype._confirmReject = function () {
		setTimeout(function () { // send http request
			var oCard = this.getCard(),
				oDetailsCard = oCard.getOpener(),
				oMainCard = oDetailsCard.getOpener();
			oCard.hide();
			oDetailsCard.hide();
			oMainCard.hide();
		}.bind(this), 500);
	};

	return TaskExtension;
});
