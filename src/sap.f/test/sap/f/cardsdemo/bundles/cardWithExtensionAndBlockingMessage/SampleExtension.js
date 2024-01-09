sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/library",
	"sap/m/IllustratedMessageType",
	"sap/m/MessageToast"
], function (Extension, library, IllustratedMessageType, MessageToast) {
		"use strict";

		const CardBlockingMessageType = library.CardBlockingMessageType;

		const SampleExtension = Extension.extend("card.explorer.extension.showMessage.ShowMessageExtension");

		SampleExtension.prototype.init = function () {
			Extension.prototype.init.apply(this, arguments);
			this.attachAction(this._handleAction.bind(this));
		};

		SampleExtension.prototype._handleAction = function (oEvent) {
			this.getCard().showBlockingMessage({
				type: CardBlockingMessageType.Information,
				title: "Custom blocking message",
				illustrationType: IllustratedMessageType.SimpleBalloon,
				additionalContent: [
					{
						text: "Do something",
						buttonType: "Emphasized",
						press: () => {
							MessageToast.show("Button is pressed");
						}
					}
				]
			});
		};

		return SampleExtension;
	});
