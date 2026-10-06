/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/base/Log",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/integration/util/CardMerger",
	"sap/ui/core/Element"
], function (
	BaseAction,
	Log,
	openCardDialog,
	CardMerger,
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
			oModifiedParameters =  { ...oParameters },
			oParentCard = this.getCardInstance(),
			oHost = oParentCard.getHostInstance();

		if (oParameters.manifest) {
			Log.warning(
				"'ShowCard' action uses deprecated 'manifest' property. Use 'childCardKey' instead. It must refer to a child card registered in sap.card/configuration/childCards.",
				null,
				"sap.ui.integration.widgets.Card"
			);
		}

		if (oParameters.childCardKey) {
			const aOwnManifestChanges = oParentCard.getManifestEntry(`/sap.card/configuration/childCards/${oParameters.childCardKey}/_manifestChanges`);
			const aParentManifestChanges = oParentCard.getManifestChanges();

			if (aOwnManifestChanges) {
				oModifiedParameters.manifestChanges = aOwnManifestChanges;
			} else {
				oModifiedParameters.manifestChanges = CardMerger.extractChildCardChanges(aParentManifestChanges, oParameters.childCardKey);
			}
		}

		if (oHost && oHost.onShowCard) {
			let oChildCard;

			if (oParameters._cardId) {
				oChildCard = Element.getElementById(oParameters._cardId);
			} else {
				oChildCard = oParentCard._createChildCard(oModifiedParameters);
			}

			if (!oChildCard) {
				return;
			}

			oHost.onShowCard(oChildCard, oParameters);
			return;
		}

		openCardDialog(oParentCard, oModifiedParameters);
	};

	return ShowCardAction;
});