/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/core/Element",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function (
	BaseAction,
	openCardDialog,
	Element
) {
	"use strict";

	var ShowCardAction = BaseAction.extend("sap.ui.integration.cards.actions.ShowCardAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	/**
	 * @override
	 */
	ShowCardAction.prototype.execute = function () {
		var oParameters = this.getParameters() || {},
			oParentCard = this.getCardInstance(),
			oHost = oParentCard.getHostInstance();

		if (oHost && oHost.onShowCard) {
			let oChildCard;

			if (oParameters._cardId) {
				oChildCard = Element.getElementById(oParameters._cardId);
			} else {
				oChildCard = oParentCard._createChildCard(oParameters);
			}

			oHost.onShowCard(oChildCard, oParameters);
			return;
		}

		openCardDialog(oParentCard, this.getParameters(), this.getSourceInstance());
	};

	return ShowCardAction;
});