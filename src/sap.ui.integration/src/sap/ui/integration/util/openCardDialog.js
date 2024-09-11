/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/Element",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], (
	Dialog,
	Device,
	Element
) => {
	"use strict";

	function _addDimensionsDelegate(oDialog, oParentCard) {
		const oChildCard = oDialog.getContent()[0];
		let bSetMaxDimensions = true;

		oChildCard.addEventDelegate({
			onAfterRendering: () => {
				const oChildCardDomRef = oChildCard.getDomRef();
				oChildCardDomRef.style.minHeight = oParentCard.getDomRef().offsetHeight + "px";
				oChildCardDomRef.style.minWidth = oParentCard.getDomRef().offsetWidth + "px";

				if (bSetMaxDimensions) {
					oChildCardDomRef.style.maxHeight = oDialog._getAreaDimensions().height * 70 / 100 + "px";
					oChildCardDomRef.style.maxWidth = oDialog._getAreaDimensions().width * 70 / 100 + "px";
				} else {
					oChildCardDomRef.style.maxHeight = "";
					oChildCardDomRef.style.maxWidth = "";
				}
			}
		});

		oDialog.addEventDelegate({
			onmousedown: (e) => {
				if (e.target.closest(".sapMDialogResizeHandle")) {
					bSetMaxDimensions = false;
				}
			},
			onAfterRendering: () => {
				oDialog.getDomRef().style.minHeight = "8.25rem";
			}
		});
	}

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

		if (!Device.system.phone) {
			_addDimensionsDelegate(oDialog, oParentCard);
		}

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