/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/m/Dialog",
	"sap/ui/core/Core",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
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
			oHost = oParentCard.getHostInstance(),
			oChildCard;

		if (oParameters._cardId) {
			oChildCard = Core.byId(oParameters._cardId);
		} else {
			oChildCard = oParentCard._createChildCard(oParameters);
		}

		if (oHost && oHost.onShowCard) {
			oHost.onShowCard(oChildCard, oParameters);
			return;
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

		oDialog.addStyleClass("sapUiIntCardDialog");

		oParentCard.addDependent(oDialog);

		oChildCard.startManifestProcessing();

		oChildCard.attachManifestApplied(function () {
			oDialog.open();
		});

		oChildCard.attachEvent("_ready", function () {
			setTimeout(function () {
				this._setFocus(oChildCard, oDialog);
			}.bind(this), 0); // wait for loading animation to stop
		}.bind(this));

		oDialog.attachAfterClose(function () {
			oDialog.destroy();
		});
	};

	ShowCardAction.prototype._setFocus = function (oCard, oDialog) {
		var oFilters = oCard.getAggregation("_filter"),
			oContent = oCard.getAggregation("_content"),
			oFooter = oCard.getAggregation("_footer"),
			oFirstFocusable;

		oFirstFocusable = oFilters && oFilters.$().firstFocusableDomRef()
			|| oContent && oContent.$().firstFocusableDomRef()
			|| oFooter && oFooter.$().firstFocusableDomRef();

		if (oFirstFocusable) {
			oDialog.setInitialFocus(oFirstFocusable.id);
			oFirstFocusable.focus();
		}
	};

	return ShowCardAction;
});