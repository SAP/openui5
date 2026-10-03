/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

// Provides helper sap.m.PopoverResize
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/i18n/Localization",
	"sap/ui/core/popover/Positioning",
	"sap/ui/dom/units/Rem",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/base/util/clamp",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Lib",
	"sap/m/library"
],
	function (
		BaseObject,
		Localization,
		Positioning,
		Rem,
		jQuery,
		KeyCodes,
		clamp,
		InvisibleText,
		Library,
		mLibrary
	) {
		"use strict";

		// shortcut for sap.m.PlacementType
		const PlacementType = mLibrary.PlacementType;

		// Possible placements of the resize handle relative to the popover.
		const ResizeHandlePlacement = {
			TopLeft: "TopLeft",
			TopRight: "TopRight",
			BottomLeft: "BottomLeft",
			BottomRight: "BottomRight"
		};

		// Keyboard resize step in px (matches sap.m.Dialog).
		const RESIZE_STEP = Rem.toPx(1);

		/**
		 * Handles the mouse and keyboard resizing behavior of a {@link sap.m.Popover}.
		 *
		 * The instance keeps a reference to the owning popover and holds all resize
		 * related state (resized dimensions/offsets, current handle placement, ...).
		 *
		 * @param {sap.m.Popover} oPopover The popover that owns this resize helper
		 *
		 * @class
		 * @extends sap.ui.base.Object
		 * @alias sap.m.PopoverResize
		 * @private
		 */
		const PopoverResize = BaseObject.extend("sap.m.PopoverResize", /** @lends sap.m.PopoverResize.prototype */ {
			constructor: function (oPopover) {
				BaseObject.call(this);

				this._oPopover = oPopover;

				// By design Popover's min sizes are:
				// min-width: 6.25rem;
				// min-height: 2rem;
				// This property is used to limit the resizing
				this._minDimensions = {
					width: 100,
					height: 32
				};

				// Invisible description announcing the keyboard resize shortcut (aria-describedby target).
				this._oResizeHandleDescribedByText = new InvisibleText({
					text: Library.getResourceBundleFor("sap.m").getText("POPOVER_RESIZE_HANDLE_ARIA_DESCRIBEDBY")
				});
			}
		});

		PopoverResize.prototype.destroy = function () {
			if (this._oResizeHandleDescribedByText) {
				this._oResizeHandleDescribedByText.destroy();
				this._oResizeHandleDescribedByText = null;
			}

			this._sResizeHandleClass = null;
			this._oPopover = null;

			BaseObject.prototype.destroy.apply(this, arguments);
		};

		PopoverResize.prototype._getResizeHandlePlacement = function () {
			if (this._resizeHandlePlacement) {
				return this._resizeHandlePlacement;
			}

			const oPopover = this._oPopover;
			const popoverWrapper = oPopover.getDomRef().querySelector(".sapMPopoverWrapper");
			const opener = oPopover._getOpenByDomRef();
			const offset = 2;

			const openerRect = opener.getBoundingClientRect();
			const popoverWrapperRect = popoverWrapper.getBoundingClientRect();

			let openerCX = Math.floor(openerRect.x + openerRect.width / 2);
			const openerCY = Math.floor(openerRect.y + openerRect.height / 2);

			let popoverCX = Math.floor(popoverWrapperRect.x + popoverWrapperRect.width / 2);
			const popoverCY = Math.floor(popoverWrapperRect.y + popoverWrapperRect.height / 2);

			if (Localization.getRTL()) {
				openerCX = -openerCX;
				popoverCX = -popoverCX;
			}

			switch (oPopover._getCalculatedPlacement()) {
				case PlacementType.Left:
					if (popoverCY > openerCY + offset) {
						return ResizeHandlePlacement.BottomLeft;
					}

					return ResizeHandlePlacement.TopLeft;
				case PlacementType.Right:
					if (popoverCY + offset < openerCY) {
						return ResizeHandlePlacement.TopRight;
					}

					return ResizeHandlePlacement.BottomRight;
				case PlacementType.Bottom:
					if (!oPopover.getShowArrow()) {
						return ResizeHandlePlacement.BottomRight;
					}

					if (popoverCX + offset < openerCX) {
						return ResizeHandlePlacement.BottomLeft;
					}

					return ResizeHandlePlacement.BottomRight;
				case PlacementType.Top:
				default:
					if (!oPopover.getShowArrow()) {
						return ResizeHandlePlacement.TopRight;
					}

					if (popoverCX + offset < openerCX) {
						return ResizeHandlePlacement.TopLeft;
					}

					return ResizeHandlePlacement.TopRight;
			}
		};

		/**
		 * Takes care of resizing the popover
		 * @param {jQuery.Event} oEvent The event object
		 */
		PopoverResize.prototype.onmousedown = function (oEvent) {
			if (!oEvent.target.closest(".sapMPopoverResizeHandle")) {
				return;
			}

			const oPopover = this._oPopover;
			const $document = jQuery(document);
			const $popover = oPopover.$();

			$popover.addClass('sapMPopoverResizing');

			oEvent.preventDefault();
			oEvent.stopPropagation();

			const initial = this._getInitial(oEvent.pageX, oEvent.pageY);

			// prevent autoclose during resizing
			const isAutoClose = oPopover.oPopup.getAutoClose();
			oPopover.oPopup.setAutoClose(false);

			this._resizeHandlePlacement = this._getResizeHandlePlacement();

			$document.on("mousemove.sapMPopover", (e) => {
				const dx = e.pageX - initial.x;
				const dy = initial.y - e.pageY;

				this._resize(initial, dx, dy);
			});

			$document.on("mouseup.sapMPopover", () => {
				$popover.removeClass("sapMPopoverResizing");
				$document.off("mouseup.sapMPopover, mousemove.sapMPopover");
				delete this._resizeHandlePlacement;

				if (oPopover.oPopup) {
					oPopover.oPopup.setAutoClose(isAutoClose);
				}
			});
		};

		PopoverResize.prototype._getInitial = function (x, y) {
			const oPopover = this._oPopover;
			const $popover = oPopover.$();
			const $popoverContent = oPopover.$("cont");
			const contentHeight = $popoverContent.outerHeight();
			const $arrow = oPopover.$("arrow");
			const $scrollArea = oPopover.$("scroll");
			const calculatedPlacement = oPopover._getCalculatedPlacement();
			const posParams = oPopover._getPositionParams($popover, $arrow, $popoverContent, $scrollArea);
			const contentDimensions = oPopover._getContentDimensionsCss(calculatedPlacement, posParams);

			// Consider user-defined maxHeight if set
			const userMaxHeight = oPopover.getMaxHeight();
			let maxContentHeight = parseFloat(contentDimensions["max-height"]);

			if (userMaxHeight) {
				// Convert user's maxHeight to pixels if needed and subtract header/footer height
				const footerHeaderHeight = $popover.height() - contentHeight;
				let userMaxHeightPx;

				if (userMaxHeight.endsWith('%')) {
					userMaxHeightPx = (parseFloat(userMaxHeight) / 100) * posParams._fDocumentHeight;
				} else if (userMaxHeight.endsWith('rem')) {
					userMaxHeightPx = Rem.toPx(userMaxHeight);
				} else {
					userMaxHeightPx = parseFloat(userMaxHeight);
				}

				const userMaxContentHeight = userMaxHeightPx - footerHeaderHeight;
				maxContentHeight = Math.min(maxContentHeight, userMaxContentHeight);
			}

			return {
				x: x,
				y: y,
				width: $popover.width(),
				height: contentHeight,
				maxWidth: parseFloat(contentDimensions["max-width"]),
				maxHeight: maxContentHeight,
				footerHeaderHeight: $popover.height() - contentHeight,
				offsetX: oPopover._getActualOffsetX(),
				offsetY: oPopover._getActualOffsetY(),
				left: parseFloat($popover.css("left")),
				top: parseFloat($popover.css("top")),
				posParams: posParams,
				// Snapshot the margins now so the drag uses fixed bounds — the opener
				// does not move during a resize, so its reserved margins stay constant.
				margins: Positioning.getEffectiveMargins(oPopover._getMarginFoldParams(calculatedPlacement))
			};
		};

		PopoverResize.prototype._resize = function (initial, dx, dy) {
			const oPopover = this._oPopover;

			this._resized = true;

			const placement = oPopover._getCalculatedPlacement();
			const resizeHandlePlacement = this._getResizeHandlePlacement();
			const posParams = initial.posParams;
			const withinAreaWidth = posParams._fWithinAreaWidth;
			const withinAreaHeight = posParams._fWithinAreaHeight;
			const isRTL = Localization.getRTL();

			let width;
			let height;
			let offsetX;
			let offsetY;

			if (isRTL) {
				dx = -dx;
			}

			let maxWidthLeftSide;
			let maxWidthRightSide;

			if (isRTL) {
				maxWidthRightSide = initial.width + initial.left - initial.margins.left;
				maxWidthLeftSide = withinAreaWidth - initial.left - initial.margins.right;
			} else {
				maxWidthLeftSide = initial.width + initial.left - initial.margins.left;
				maxWidthRightSide = withinAreaWidth - initial.left - initial.margins.right;
			}

			const maxHeightTopSide = initial.height + initial.top - initial.margins.top;
			const maxHeightBottomSide = withinAreaHeight - initial.footerHeaderHeight - initial.top - initial.margins.bottom;

			if (!oPopover.getShowArrow() && (placement === PlacementType.Top || placement === PlacementType.Bottom)) {
				let noArrowMaxHeight = maxHeightTopSide;

				if (placement === PlacementType.Bottom) {
					dy = -dy;
					noArrowMaxHeight = maxHeightBottomSide;
				}

				// When the arrow is not shown, the right margin is not calculated correct and the popover can be resized outside the screen.
				// To avoid this, we subtract 18px from the maxWidthRightSide.
				this.resizedWidth = clamp(initial.width + dx, this._minDimensions.width, maxWidthRightSide - 18) + 'px';
				this.resizedHeight = clamp(initial.height + dy, this._minDimensions.height, Math.min(noArrowMaxHeight, initial.maxHeight)) + 'px';

				oPopover._calcPlacement();
				return;
			}

			switch (placement) {
				case PlacementType.Top:
					height = clamp(initial.height + dy, this._minDimensions.height, Math.min(maxHeightTopSide, initial.maxHeight));

					if (resizeHandlePlacement === ResizeHandlePlacement.TopRight) {
						width = clamp(initial.width + dx, this._minDimensions.width, maxWidthRightSide);
						offsetX = Math.max(0, initial.offsetX + (width - initial.width) / 2);
					} else { // TopLeft
						width = clamp(initial.width - dx, this._minDimensions.width, maxWidthLeftSide);
						offsetX = Math.min(-1, initial.offsetX + (initial.width - width) / 2);
					}

					this.resizedOffsetX = Math.round(offsetX);
					break;
				case PlacementType.Bottom:
					height = clamp(initial.height - dy, this._minDimensions.height, Math.min(maxHeightBottomSide, initial.maxHeight));

					if (resizeHandlePlacement === ResizeHandlePlacement.BottomRight) {
						width = clamp(initial.width + dx, this._minDimensions.width, maxWidthRightSide);
						offsetX = Math.max(0, initial.offsetX + (width - initial.width) / 2);
					} else { // TopLeft
						width = clamp(initial.width - dx, this._minDimensions.width, maxWidthLeftSide);
						offsetX = Math.min(-1, initial.offsetX + (initial.width - width) / 2);
					}

					this.resizedOffsetX = Math.round(offsetX);
					break;
				case PlacementType.Left:
					width = clamp(initial.width - dx, this._minDimensions.width, maxWidthLeftSide);

					if (resizeHandlePlacement === ResizeHandlePlacement.TopLeft) {
						height = clamp(initial.height + dy, this._minDimensions.height, Math.min(maxHeightTopSide, initial.maxHeight));
						offsetY = Math.min(0, initial.offsetY + (initial.height - height) / 2);
					} else { // BottomLeft
						height = clamp(initial.height - dy, this._minDimensions.height, Math.min(maxHeightBottomSide, initial.maxHeight));
						offsetY = Math.max(1, initial.offsetY + (height - initial.height) / 2);
					}

					this.resizedOffsetY = Math.round(offsetY);
					break;
				case PlacementType.Right:
					width = clamp(initial.width + dx, this._minDimensions.width, maxWidthRightSide);

					if (resizeHandlePlacement === ResizeHandlePlacement.TopRight) {
						height = clamp(initial.height + dy, this._minDimensions.height, Math.min(maxHeightTopSide, initial.maxHeight));
						offsetY = Math.min(-1, initial.offsetY + (initial.height - height) / 2);
					}	else { // BottomRight
						height = clamp(initial.height - dy, this._minDimensions.height, Math.min(maxHeightBottomSide, initial.maxHeight));
						offsetY = Math.max(0, initial.offsetY + (height - initial.height) / 2);
					}

					this.resizedOffsetY = Math.round(offsetY);
					break;
			}

			this.resizedWidth = `${width}px`;
			this.resizedHeight = `${height}px`;

			oPopover._calcPlacement();
		};

		PopoverResize.prototype._keyboardResize = function (oEvent) {
			const oPopover = this._oPopover;
			const oKC = KeyCodes,
				iKC = oEvent.which || oEvent.keyCode,
				aArrows = [oKC.ARROW_LEFT, oKC.ARROW_RIGHT, oKC.ARROW_UP, oKC.ARROW_DOWN];

			if (!oPopover.getResizable() ||
				!oEvent.shiftKey ||
				oEvent.target !== oPopover.getDomRef("keyboardHandle") ||
				aArrows.indexOf(iKC) === -1) {
				return;
			}

			let iDx = 0;
			if (iKC === oKC.ARROW_RIGHT) {
				iDx = RESIZE_STEP;
			} else if (iKC === oKC.ARROW_LEFT) {
				iDx = -RESIZE_STEP;
			}

			let iDy = 0;
			if (iKC === oKC.ARROW_UP) {
				iDy = RESIZE_STEP;
			} else if (iKC === oKC.ARROW_DOWN) {
				iDy = -RESIZE_STEP;
			}

			// the resize handle placement should stay the same during the keyboard resize,
			// so we store it in a property and use it for all subsequent resize events.
			this._resizeHandlePlacement = this._getResizeHandlePlacement();

			const oInitial = this._getInitial(0, 0);
			this._resize(oInitial, iDx, iDy);
		};

		/**
		 * @private
		 */
		PopoverResize.prototype.isResized = function () {
			return this._resized;
		};

		PopoverResize.prototype._reset = function () {
			this._resized = false;
			delete this.resizedOffsetX;
			delete this.resizedOffsetY;
			delete this.resizedWidth;
			delete this.resizedHeight;

			delete this._resizeHandlePlacement;
		};

		PopoverResize.prototype._getActualContentWidth = function () {
			return this.resizedWidth !== undefined ? this.resizedWidth : this._oPopover.getContentWidth();
		};

		PopoverResize.prototype._getActualContentHeight = function () {
			return this.resizedHeight !== undefined ? this.resizedHeight : this._oPopover.getContentHeight();
		};

		PopoverResize.prototype._getActualOffsetX = function () {
			return this.resizedOffsetX !== undefined ? this.resizedOffsetX : this._oPopover.getOffsetX();
		};

		PopoverResize.prototype._getActualOffsetY = function () {
			return this.resizedOffsetY !== undefined ? this.resizedOffsetY : this._oPopover.getOffsetY();
		};

		PopoverResize.prototype._updateResizeHandlePlacement = function () {
			const oPopover = this._oPopover;

			if (!oPopover.getResizable()) {
				return;
			}

			const oDomRef = oPopover.getDomRef();
			const sResizeHandleClass = `sapMPopoverResizeHandle${this._getResizeHandlePlacement()}`;

			if (this._sResizeHandleClass) {
				oDomRef.classList.remove(this._sResizeHandleClass);
			}

			oDomRef.classList.add(sResizeHandleClass);
			this._sResizeHandleClass = sResizeHandleClass;
		};

		return PopoverResize;
	});
