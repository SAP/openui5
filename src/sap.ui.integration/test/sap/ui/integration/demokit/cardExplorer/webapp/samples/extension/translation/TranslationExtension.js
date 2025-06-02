sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition", "sap/ui/core/library"], function (Extension, ActionDefinition, CoreLibrary) {
	"use strict";

	const ValueState = CoreLibrary.ValueState;

	const TranslationExtension = Extension.extend("card.explorer.extension.customFormatters.TranslationExtension");

	TranslationExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			getState: function (isOnline) {
				return isOnline ? ValueState.Information : ValueState.Success;
			},
			getStateText: function (isOnline) {
				const oCard = this.getCard();
				const sText = isOnline ? oCard.getTranslatedText("INFO_ONLINE") : oCard.getTranslatedText("INFO_CLASSROOM");

				return sText;
			}.bind(this)
		});
	};

	TranslationExtension.prototype.onCardReady = function () {
		const oCard = this.getCard();

		oCard.addActionDefinition(new ActionDefinition({
			type: "Custom",
			text: "{i18n>reportActionText}",
			icon: "sap-icon://learning-assistant",
			press: function (oEvent) {
				// execute the action
			}
		}));
	};

	return TranslationExtension;
});
