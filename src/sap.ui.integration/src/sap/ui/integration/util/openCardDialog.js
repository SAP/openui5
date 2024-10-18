/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/integration/library",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], (
	Dialog,
	Device,
	Element,
	library
) => {
	"use strict";

	const CardDataMode = library.CardDataMode;

	function _addDimensionsDelegate(oDialog, oParentCard, bSetMinSize) {
		const oChildCard = oDialog.getContent()[0];
		let bSetMaxDimensions = true;

		oChildCard.addEventDelegate({
			onAfterRendering: () => {
				const oChildCardDomRef = oChildCard.getDomRef();

				if (bSetMinSize) {
					oChildCardDomRef.style.minHeight = oParentCard.getDomRef().offsetHeight + "px";
					oChildCardDomRef.style.minWidth = oParentCard.getDomRef().offsetWidth + "px";
				}

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

	function _addResizeDelegate(oDialog, oChildCard) {
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

		oDialog.addEventDelegate(oDelegate);
	}

	function _openDialog(oChildCard, oParentCard, oParameters, bSetMinSize) {
		oChildCard.setDisplayVariant("Large"); // always use large variant for dialog, scrolling content is possible
		oParentCard.setBusy(true).setBusyIndicatorDelay(750);

		const oDialog = new Dialog({
				content: [
					oChildCard
				],
				contentWidth: oParameters.width,
				verticalScrolling: false,
				horizontalScrolling: false,
				draggable: true,
				showHeader: false,
				ariaLabelledBy: oChildCard.getId(),
				escapeHandler: function (oPromise) {
					oChildCard.hide();
					oPromise.resolve();
				},
				resizable: oParameters.resizable,
				afterOpen: () => {
					oParentCard.setBusy(false);
				},
				afterClose: () => {
					oDialog.destroy();
				}
			});

		oDialog.addStyleClass("sapUiIntCardDialog");

		oParentCard.addDependent(oDialog);
		oChildCard.attachEventOnce("_ready", () => {
			oDialog.open();
			_setFocus(oChildCard, oDialog);
		});

		if (!Device.system.phone) {
			_addDimensionsDelegate(oDialog, oParentCard, bSetMinSize);
			_addAnimationDelegate(oDialog, oParentCard);
			_addResizeDelegate(oDialog, oChildCard);
		}

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

	function openCardDialog(oParentCard, oParameters, bSetMinSize = false) {
		let oChildCard;

		if (oParameters._cardId) {
			oChildCard = Element.getElementById(oParameters._cardId);
		} else {
			oChildCard = oParentCard._createChildCard({
				dataMode: CardDataMode.Active,
				...oParameters
			});
		}

		return _openDialog(oChildCard, oParentCard, oParameters, bSetMinSize);
	}

	return openCardDialog;
});