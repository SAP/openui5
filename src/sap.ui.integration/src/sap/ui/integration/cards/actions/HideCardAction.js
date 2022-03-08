/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/m/Dialog"
], function (
	BaseAction,
	Dialog
) {
	"use strict";

	var HideCardAction = BaseAction.extend("sap.ui.integration.cards.actions.HideCardAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	/**
	 * @override
	 */
	HideCardAction.prototype.execute = function () {
		var oCard = this.getCardInstance(),
			oDialog = oCard.getParent();

		if (oDialog instanceof Dialog) {
			oDialog.close();
		}

		oCard.destroy();
	};

	return HideCardAction;
});