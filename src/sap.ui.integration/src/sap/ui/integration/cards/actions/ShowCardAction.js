/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/m/Dialog",
	"sap/ui/core/Element",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function (
	BaseAction,
	Dialog,
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
			oHost = oParentCard.getHostInstance(),
			oChildCard;

		if (oParameters._cardId) {
			oChildCard = Element.getElementById(oParameters._cardId);
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

		oChildCard.setDisplayVariant("Large"); // always use large variant for dialog, scrolling content is possible

		const oDialog = new Dialog({
				content: [
					oChildCard
				],
				contentWidth: this.getParameters().width,
				verticalScrolling: false,
				showHeader: false,
				ariaLabelledBy: oChildCard.getId(),
				escapeHandler: function (oPromise) {
					oChildCard.hide();
					oPromise.resolve();
				},
				resizable: this.getParameters().resizable
			});

		const oDelegate = {
			onmousedown: (e) => {
				if (e.target.classList.contains("sapMDialogResizeHandler")) {
					oChildCard.setHeight("100%");
					oDialog.setContentHeight(oDialog.getDomRef("cont").offsetHeight + "px");
					oDialog.setVerticalScrolling(false);
					oDialog.removeEventDelegate(oDelegate);
				}
			}
		};

		oDialog.addStyleClass("sapUiIntCardDialog");
		oDialog.addEventDelegate(oDelegate);
		oDialog.attachAfterClose(() => {
			oDialog.destroy();
		});

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