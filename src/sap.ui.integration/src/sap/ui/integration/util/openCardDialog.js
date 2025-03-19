/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingHelper",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], (
	Dialog,
	Device,
	Element,
	library,
	BindingHelper
) => {
	"use strict";

	const CardDataMode = library.CardDataMode;

	function _addAnimationDelegate(oDialog, oParentCard) {
		const oParentRect = oParentCard.getDomRef().getBoundingClientRect();
		const oParentPos = {
			top: Math.round(oParentRect.top) + window.scrollX,
			left: Math.round(oParentRect.left) + window.scrollX,
			width: Math.round(oParentRect.width),
			height: Math.round(oParentRect.height)
		};

		oDialog.attachBeforeClose(() => {
			const oDialogRef = oDialog.getDomRef();

			oDialogRef.classList.add("sapUiIntCardDialogAnimate");
			oDialogRef.style.top = oParentPos.top + "px";
			oDialogRef.style.left = oParentPos.left + "px";
		});

		oDialog.addEventDelegate({
			onAfterRendering: () => {
				const oDialogRef = oDialog.getDomRef();

				if (!oDialog.isOpen()) {
					oDialogRef.classList.add("sapUiIntCardDialogAnimate");
					oDialogRef.style.top = oParentPos.top + "px";
					oDialogRef.style.left = oParentPos.left + "px";
				}

				const fnTransitionEnd = (oEvent) => {
					if (["left", "right"].includes(oEvent.propertyName)) {
						oDialogRef.classList.remove("sapUiIntCardDialogAnimate");
						oDialogRef.removeEventListener("transitionend", fnTransitionEnd);
					}
				};

				oDialogRef.addEventListener("transitionend", fnTransitionEnd);
			}
		});
	}

	function _setDialogHeader(oDialog, oChildCard) {
		const oHeader = oChildCard.getCardHeader();
		if (!oHeader) {
			return;
		}

		// propagetes any inherited models from the card before move
		BindingHelper.propagateModels(oHeader, oHeader);

		oDialog.setCustomHeader(oHeader);
		oChildCard.setAssociation("dialogHeader", oHeader);

		oHeader.setProperty("headingLevel", "1");
		oHeader.setProperty("focusable", false);
		oHeader.setVisible(true);
	}

	function _setAriaAttributes(oDialog, oChildCard) {
		// Adjust accessibility
		oChildCard.addEventDelegate({
			onAfterRendering: () => {
				// the card shouldn't be a region with aria-labelledby, otherwise the header is read two times.
				oChildCard.getDomRef().removeAttribute("role");
				oChildCard.getDomRef().removeAttribute("aria-labelledby");
			}
		});

		oDialog.addEventDelegate({
			onAfterRendering: () => {
				// The dialog has no good API to set the title aria-labelledby.
				// You can only add one to the header. Therefore we need to override it.
				const oHeader = oDialog.getCustomHeader();
				if (!oHeader) {
					return;
				}
				oDialog.getDomRef().setAttribute("aria-labelledby", oHeader.getTitleId());
			}
		});
	}

	function _openDialog(oChildCard, oParentCard, oParameters) {
		oChildCard.setDisplayVariant("Large"); // always use large variant for dialog, scrolling content is possible
		oChildCard.setDataMode(CardDataMode.Active); // the opened card is processed before the dialog is opened and should be active
		oChildCard.addStyleClass("sapUiIntCardDialogCard");

		oParentCard.setBusy(true).setBusyIndicatorDelay(750);

		const oDialog = new Dialog({
				content: [
					oChildCard
				],
				contentWidth: oParameters.width,
				verticalScrolling: false,
				horizontalScrolling: false,
				draggable: true,
				resizable: true,
				escapeHandler: function (oPromise) {
					oChildCard.hide();
					oPromise.resolve();
				},
				afterOpen: () => {
					oParentCard.setBusy(false);
				},
				afterClose: () => {
					oDialog.destroy();
				}
			});

		oDialog.addStyleClass("sapUiIntCardDialog");

		oParentCard.addDependent(oDialog);

		oChildCard.attachEvent("_ready", () => {
			_setDialogHeader(oDialog, oChildCard);
			_setAriaAttributes(oDialog, oChildCard);
			if (!oChildCard._isComponentCard()) {
				oDialog.open();
			}
			_setFocus(oChildCard, oDialog);
		});

		if (!Device.system.phone) {
			_addAnimationDelegate(oDialog, oParentCard);
		}

		oChildCard.attachManifestReady(() => {
			// component card does not trigger the ready event if it hasn't been rendered yet
			if (oChildCard._isComponentCard()) {
				oDialog.open();
			}
		});

		oChildCard.startManifestProcessing();
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