/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Dialog",
	"sap/ui/core/Element",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], (
	Dialog,
	Element
) => {
	"use strict";

	function _openDialog(oChildCard, oParentCard, oParameters) {
		oChildCard.setDisplayVariant("Large"); // always use large variant for dialog, scrolling content is possible

		const oDialog = new Dialog({
				content: [
					oChildCard
				],
				contentWidth: oParameters.width,
				verticalScrolling: false,
				showHeader: false,
				ariaLabelledBy: oChildCard.getId(),
				escapeHandler: function (oPromise) {
					oChildCard.hide();
					oPromise.resolve();
				},
				resizable: oParameters.resizable
			});

		const oDelegate = {
			onmousedown: (e) => {
				if (e.target.closest(".sapMDialogResizeHandle")) {
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
		oChildCard.attachManifestApplied(() => {
			oDialog.open();
		});
		oChildCard.attachEvent("_ready", () => {
			setTimeout(() => {
				_setFocus(oChildCard, oDialog);
			}, 0); // wait for loading animation to stop
		});

		return oDialog;
	}

	function _setFocus(oCard, oDialog) {
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
	}

	function openCardDialog(oParentCard, oParameters) {
		let oChildCard;

		if (oParameters._cardId) {
			oChildCard = Element.getElementById(oParameters._cardId);
		} else {
			oChildCard = oParentCard._createChildCard(oParameters);
		}

		return _openDialog(oChildCard, oParentCard, oParameters);
	}

	return openCardDialog;
});