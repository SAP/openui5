/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/library",
	"sap/m/Popover"
], function (library, Popover) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	return function () {
		/**
		 * Instrantiates the Popover
		 *
		 * @override
		 * @param oInput
		 * @param oPopupInput
		 * @param mOptions
		 * @returns {sap.m.Popover}
		 */
		this.createPopover = function (oInput, oPopupInput, mOptions) {
			var that = this,
				oPopover = new Popover(oInput.getId() + "-popup", {
					showArrow: false,
					placement: PlacementType.VerticalPreferredBottom,
					showHeader: true,
					initialFocus: oInput,
					horizontalScrolling: true,
					beforeClose: function () {
						// If the popover is closed while the pseudo focus is on value state header containing links
						if (that.bMessageValueStateActive) {
							that._getValueStateHeader().removeStyleClass("sapMPseudoFocus");
							that.bMessageValueStateActive = false;
						}
					}
				});

			return _patchPopover(oPopover, oInput);
		};

		/**
		 * Resizes the popup to the input width and makes sure that the input is never bigger than the popup.
		 *
		 * @override
		 * @public
		 */
		this.resizePopup = function (oInput) {
			var oPopover = this.getPopover();

			if (this.getItemsContainer() && oPopover) {

				if (this._sPopoverContentWidth) {
					oPopover.setContentWidth(this._sPopoverContentWidth);
				} else {
					oPopover.setContentWidth((oInput.$().outerWidth()) + "px");
				}

				// resize suggestion popup to minimum size of the input field
				setTimeout(function () {
					if (oPopover && oPopover.isOpen() && oPopover.$().outerWidth() < oInput.$().outerWidth()) {
						oPopover.setContentWidth((oInput.$().outerWidth()) + "px");
					}
				}, 0);
			}
		};

		/**
		 * Helper function that overwrites popover in the Input.
		 */
		function _patchPopover(oPopover, oInput) {
			oPopover.open = function () {
				this.openBy(oInput, false, true);
			};

			// remove animation from popover
			oPopover.oPopup.setAnimations(function ($Ref, iRealDuration, fnOpened) {
				fnOpened();
			}, function ($Ref, iRealDuration, fnClosed) {
				fnClosed();
			});

			return oPopover;
		}
	};
});