sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var CustomActionsExtension = Extension.extend("sap.ui.integration.sample.Progressive.Preview.Extension");
	var oAction = null;
	CustomActionsExtension.prototype.onCardReady = function () {
		var oCard = this.getCard();
		if (oAction) {
			oCard.removeActionDefinition(oAction);
		}
		if (!oAction || oAction.isDestroyed()) {
			oAction = new ActionDefinition({
				type: "Custom",
				text: "Configure",
				icon: "sap-icon://action-settings"
			});
		}
		oCard.addActionDefinition(oAction);
	};

	return CustomActionsExtension;
});