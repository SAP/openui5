/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/m/Dialog",
	"sap/ui/core/Core"
], function (
	BaseAction,
	Dialog,
	Core
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
			oChildCard;

		if (oParameters._cardId) {
			oChildCard = Core.byId(oParameters._cardId);
		} else {
			oChildCard = oParentCard._createChildCard(oParameters);
		}

		this._openDialog(oChildCard, oParentCard);
	};

	/**
	 * Opens the dialog
	 *
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oChildCard The child card.
	 * @param {sap.ui.integration.widgets.Card} oParentCard The opener card.
	 */
	ShowCardAction.prototype._openDialog = function (oChildCard, oParentCard) {
		var oDialog = new Dialog({
				content: [
					oChildCard
				],
				showHeader: false,
				ariaLabelledBy: oChildCard.getId(),
				escapeHandler: function (oPromise) {
					oChildCard.hide();
					oPromise.resolve();
				}
			});

		oParentCard.addDependent(oDialog);

		oChildCard.startManifestProcessing();

		oChildCard.attachManifestApplied(function () {
			oDialog.open();
		});

		oDialog.attachAfterClose(function () {
			oDialog.destroy();
		});
	};

	return ShowCardAction;
});