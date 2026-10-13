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

	function _isPopinTable(oChildCard) {
		const sCardType = oChildCard.getManifestEntry("/sap.card/type");
		const bAutoPopinMode = oChildCard.getManifestEntry("/sap.card/content/autoPopinMode");

		return sCardType === "Table" && bAutoPopinMode;
	}

	function _addAnimationDelegate(oDialog, oParentCard) {
		const oParentRect = oParentCard.getDomRef().getBoundingClientRect();
		const oParentPos = {
			top: Math.round(oParentRect.top) + window.scrollY,
			left: Math.round(oParentRect.left) + window.scrollX
		};

		// Offset placing the dialog over the parent card, as a transform relative to its centered
		// position. The slide animates "transform", not "left"/"top", because sap.m.Dialog keeps
		// rewriting "left"/"top" to re-center the still-settling child - which would drift the slide.
		const fnGetStartOffset = (oDialogRef) => {
			const oRect = oDialogRef.getBoundingClientRect();
			const iDeltaX = oParentPos.left - (Math.round(oRect.left) + window.scrollX);
			const iDeltaY = oParentPos.top - (Math.round(oRect.top) + window.scrollY);

			return `translate(${iDeltaX}px, ${iDeltaY}px)`;
		};

		// Place the dialog over the parent card (without transition), then transition the
		// transform back to its centered position to produce the opening slide.
		const fnSlideFromParent = () => {
			const oDialogRef = oDialog.getDomRef();

			oDialogRef.classList.remove("sapUiIntCardDialogAnimate");
			oDialogRef.style.transform = fnGetStartOffset(oDialogRef);
			oDialogRef.getBoundingClientRect(); // force a reflow so the start offset is applied before the transition
			oDialogRef.classList.add("sapUiIntCardDialogAnimate");
			oDialogRef.style.transform = "";
		};

		// Start the slide exactly when the popup first centers the dialog. Only then does the
		// measured offset reflect the final centered position instead of the pre-open origin.
		const oPopup = oDialog.oPopup;
		const fnOriginalApplyPosition = oPopup._applyPosition;
		let bSlideStarted = false;
		oPopup._applyPosition = function () {
			fnOriginalApplyPosition.apply(this, arguments);

			if (!bSlideStarted) {
				bSlideStarted = true;
				fnSlideFromParent();
			}
		};

		oDialog.attachBeforeClose(() => {
			const oDialogRef = oDialog.getDomRef();

			oDialogRef.classList.add("sapUiIntCardDialogAnimate");
			oDialogRef.style.transform = fnGetStartOffset(oDialogRef);
		});

		oDialog.addEventDelegate({
			onAfterRendering: () => {
				const oDialogRef = oDialog.getDomRef();

				const fnTransitionEnd = (oEvent) => {
					if (oEvent.propertyName === "transform") {
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

		oDialog.setCustomHeader(oHeader);
		oChildCard.setAssociation("dialogHeader", oHeader);

		// Once moved into the dialog, the header's parent is no longer the card,
		// so it can't resolve its heading level from the card. Set it explicitly.
		oHeader.setProperty("headingLevel", "H1");
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
					oChildCard.getCardContent()?.onOpenInDialog();
				},
				afterClose: () => {
					oDialog.destroy();
				}
			});

		// Notify the content when the user starts resizing the dialog so it can
		// release any kept width and let the dialog shrink freely.
		const fnOriginalOnMouseDown = oDialog.onmousedown;
		oDialog.onmousedown = function (oEvent) {
			if (oEvent.target.closest(".sapMDialogResizeHandle")) {
				oChildCard.getCardContent()?.onDialogResize();
			}
			fnOriginalOnMouseDown.apply(this, arguments);
		};

		const fnOriginalKeyboardDragResize = oDialog._handleKeyboardDragResize;
		oDialog._handleKeyboardDragResize = function (oEvent) {
			if (oEvent.shiftKey) {
				oChildCard.getCardContent()?.onDialogResize();
			}
			fnOriginalKeyboardDragResize.apply(this, arguments);
		};

		oDialog.addStyleClass("sapUiIntCardDialog");

		oParentCard.addDependent(oDialog);

		oChildCard.attachEvent("_ready", () => {
			oDialog.bindObject(oChildCard.getBindingContext()?.getPath() ?? "/");
			BindingHelper.propagateModels(oChildCard, oDialog);

			_setAriaAttributes(oDialog, oChildCard);
			_setDialogHeader(oDialog, oChildCard);

			if (!oChildCard._isComponentCard()) {
				oDialog.open();
			}

			_setFocus(oChildCard, oDialog);
		});

		oChildCard.attachManifestReady(() => {
			// Skip animation for table cards with autoPopinMode due to broken combination of animation and resize during opening
			if (!Device.system.phone && !oDialog.isOpen() && !_isPopinTable(oChildCard)) {
				_addAnimationDelegate(oDialog, oParentCard);
			}

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
			oChildCard = oParentCard._createChildCardForDialog(oParameters);
		}

		if (!oChildCard) {
			return null;
		}

		if (oParameters.isPaginationCard) {
			oParentCard.setAssociation("showMoreChildCard", oChildCard);
		}

		return _openDialog(oChildCard, oParentCard, oParameters);
	}

	return openCardDialog;
});