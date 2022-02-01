sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', 'sap/ui/webc/common/thirdparty/base/util/clamp', './Popup', './types/PopoverPlacementType', './types/PopoverVerticalAlign', './types/PopoverHorizontalAlign', './popup-utils/PopoverRegistry', './generated/templates/PopoverTemplate.lit', './generated/themes/BrowserScrollbar.css', './generated/themes/PopupsCommon.css', './generated/themes/Popover.css'], function (Integer, Device, ResizeHandler, PopupUtils, clamp, Popup, PopoverPlacementType, PopoverVerticalAlign, PopoverHorizontalAlign, PopoverRegistry, PopoverTemplate_lit, BrowserScrollbar_css, PopupsCommon_css, Popover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var clamp__default = /*#__PURE__*/_interopDefaultLegacy(clamp);

	const arrowSize = 8;
	const metadata = {
		tag: "ui5-popover",
		properties:  {
			headerText: {
				type: String,
			},
			placementType: {
				type: PopoverPlacementType,
				defaultValue: PopoverPlacementType.Right,
			},
			horizontalAlign: {
				type: PopoverHorizontalAlign,
				defaultValue: PopoverHorizontalAlign.Center,
			},
			verticalAlign: {
				type: PopoverVerticalAlign,
				defaultValue: PopoverVerticalAlign.Center,
			},
			modal: {
				type: Boolean,
			},
			hideBackdrop: {
				type: Boolean,
			},
			hideArrow: {
				type: Boolean,
			},
			allowTargetOverlap: {
				type: Boolean,
			},
			disableScrolling: {
				type: Boolean,
			},
			arrowTranslateX: {
				type: Integer__default,
				defaultValue: 0,
				noAttribute: true,
			},
			arrowTranslateY: {
				type: Integer__default,
				defaultValue: 0,
				noAttribute: true,
			},
			actualPlacementType: {
				type: PopoverPlacementType,
				defaultValue: PopoverPlacementType.Right,
			},
			_maxHeight: {
				type: Integer__default,
				noAttribute: true,
			},
			_maxWidth: {
				type: Integer__default,
				noAttribute: true,
			},
		},
		managedSlots: true,
		slots:  {
			header: {
				type: HTMLElement,
			},
			footer: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class Popover extends Popup {
		constructor() {
			super();
			this._handleResize = this.handleResize.bind(this);
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [BrowserScrollbar_css, PopupsCommon_css, Popover_css];
		}
		static get template() {
			return PopoverTemplate_lit;
		}
		static get VIEWPORT_MARGIN() {
			return 10;
		}
		static get ARROW_MARGIN() {
			return 6;
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResize);
		}
		isOpenerClicked(event) {
			const target = event.target;
			return target === this._opener || (target.getFocusDomRef && target.getFocusDomRef() === this._opener) || event.composedPath().indexOf(this._opener) > -1;
		}
		async showAt(opener, preventInitialFocus = false) {
			if (!opener || this.opened) {
				return;
			}
			this._opener = opener;
			this._openerRect = opener.getBoundingClientRect();
			await super._open(preventInitialFocus);
		}
		_addOpenedPopup() {
			PopoverRegistry.addOpenedPopover(this);
		}
		_removeOpenedPopup() {
			PopoverRegistry.removeOpenedPopover(this);
		}
		shouldCloseDueToOverflow(placement, openerRect) {
			const threshold = 32;
			const limits = {
				"Right": openerRect.right,
				"Left": openerRect.left,
				"Top": openerRect.top,
				"Bottom": openerRect.bottom,
			};
			const closedPopupParent = PopupUtils.getClosedPopupParent(this._opener);
			let overflowsBottom = false;
			let overflowsTop = false;
			if (closedPopupParent.showAt) {
				const contentRect = closedPopupParent.contentDOM.getBoundingClientRect();
				overflowsBottom = openerRect.top > (contentRect.top + contentRect.height);
				overflowsTop = (openerRect.top + openerRect.height) < contentRect.top;
			}
			return (limits[placement] < 0 || (limits[placement] + threshold > closedPopupParent.innerHeight)) || overflowsBottom || overflowsTop;
		}
		shouldCloseDueToNoOpener(openerRect) {
			return openerRect.top === 0
				&& openerRect.bottom === 0
				&& openerRect.left === 0
				&& openerRect.right === 0;
		}
		handleResize() {
			if (this.opened) {
				this.reposition();
			}
		}
		reposition() {
			this._show();
		}
		_show() {
			let placement;
			const popoverSize = this.getPopoverSize();
			if (popoverSize.width === 0 || popoverSize.height === 0) {
				return;
			}
			if (this.isOpen()) {
				this._openerRect = this._opener.getBoundingClientRect();
			}
			if (this.shouldCloseDueToNoOpener(this._openerRect) && this.isFocusWithin()) {
				placement = this._oldPlacement;
			} else {
				placement = this.calcPlacement(this._openerRect, popoverSize);
			}
			const stretching = this.horizontalAlign === PopoverHorizontalAlign.Stretch;
			if (this._preventRepositionAndClose) {
				return this.close();
			}
			this._oldPlacement = placement;
			this.actualPlacementType = placement.placementType;
			let left = clamp__default(
				this._left,
				Popover.VIEWPORT_MARGIN,
				document.documentElement.clientWidth - popoverSize.width - Popover.VIEWPORT_MARGIN,
			);
			if (this.actualPlacementType === PopoverPlacementType.Right) {
				left = Math.max(left, this._left);
			}
			let top = clamp__default(
				this._top,
				Popover.VIEWPORT_MARGIN,
				document.documentElement.clientHeight - popoverSize.height - Popover.VIEWPORT_MARGIN,
			);
			if (this.actualPlacementType === PopoverPlacementType.Bottom) {
				top = Math.max(top, this._top);
			}
			const isVertical = this.actualPlacementType === PopoverPlacementType.Top || this.actualPlacementType === PopoverPlacementType.Bottom;
			const borderRadius = Number.parseInt(window.getComputedStyle(this).getPropertyValue("border-radius"));
			const arrow = this._clampArrowPlacement(placement.arrow, isVertical, this._top, this._left, popoverSize, borderRadius);
			this.arrowTranslateX = arrow.x;
			this.arrowTranslateY = arrow.y;
			top = this._adjustForIOSKeyboard(top);
			Object.assign(this.style, {
				top: `${top}px`,
				left: `${left}px`,
			});
			super._show();
			if (stretching && this._width) {
				this.style.width = this._width;
			}
		}
		_clampArrowPlacement({ x, y }, isVertical, top, left, { width, height }, borderRadius) {
			const maxY = this._getArrowRange(height, borderRadius);
			const maxX = this._getArrowRange(width, borderRadius);
			if (isVertical) {
				const popoverOnLeftBorderOffset = Popover.VIEWPORT_MARGIN - left;
				const popoverOnRightBorderOffset = left + width + Popover.VIEWPORT_MARGIN - document.documentElement.clientWidth;
				if (popoverOnLeftBorderOffset > 0) {
					x = Math.max(x - popoverOnLeftBorderOffset, -maxX);
				} else if (popoverOnRightBorderOffset > 0) {
					x = Math.min(x + popoverOnRightBorderOffset, maxX);
				}
			}
			if (!isVertical) {
				const popoverOnTopBorderOffset = Popover.VIEWPORT_MARGIN - top;
				const popoverOnBottomBorderOffset = top + height + Popover.VIEWPORT_MARGIN - document.documentElement.clientHeight;
				if (popoverOnTopBorderOffset > 0) {
					y = Math.max(y - popoverOnTopBorderOffset, -maxY);
				} else if (popoverOnBottomBorderOffset > 0) {
					y = Math.min(y + popoverOnBottomBorderOffset, maxY);
				}
			}
			return {
				x: Math.round(x),
				y: Math.round(y),
			};
		}
		_getArrowRange(dimension, borderRadius) {
			return Math.floor((dimension / 2) - (borderRadius + Popover.ARROW_MARGIN));
		}
		_adjustForIOSKeyboard(top) {
			if (!Device.isIOS()) {
				return top;
			}
			const actualTop = Math.ceil(this.getBoundingClientRect().top);
			return top + (Number.parseInt(this.style.top || "0") - actualTop);
		}
		getPopoverSize() {
			if (!this.opened) {
				Object.assign(this.style, {
					display: "block",
					top: "-10000px",
					left: "-10000px",
				});
			}
			const rect = this.getBoundingClientRect(),
				width = rect.width,
				height = rect.height;
			return { width, height };
		}
		get contentDOM() {
			return this.shadowRoot.querySelector(".ui5-popup-content");
		}
		get arrowDOM() {
			return this.shadowRoot.querySelector(".ui5-popover-arrow");
		}
		calcPlacement(targetRect, popoverSize) {
			let left = 0;
			let top = 0;
			const allowTargetOverlap = this.allowTargetOverlap;
			const clientWidth = document.documentElement.clientWidth;
			const clientHeight = document.documentElement.clientHeight;
			let maxHeight = clientHeight;
			let maxWidth = clientWidth;
			const placementType = this.getActualPlacementType(targetRect, popoverSize);
			this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placementType, targetRect);
			const isVertical = placementType === PopoverPlacementType.Top
				|| placementType === PopoverPlacementType.Bottom;
			if (this.horizontalAlign === PopoverHorizontalAlign.Stretch && isVertical) {
				popoverSize.width = targetRect.width;
				this._width = `${targetRect.width}px`;
			} else if (this.verticalAlign === PopoverVerticalAlign.Stretch && !isVertical) {
				popoverSize.height = targetRect.height;
			}
			const arrowOffset = this.hideArrow ? 0 : arrowSize;
			switch (placementType) {
			case PopoverPlacementType.Top:
				left = this.getVerticalLeft(targetRect, popoverSize);
				top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);
				if (!allowTargetOverlap) {
					maxHeight = targetRect.top - arrowOffset;
				}
				break;
			case PopoverPlacementType.Bottom:
				left = this.getVerticalLeft(targetRect, popoverSize);
				top = targetRect.bottom + arrowOffset;
				if (allowTargetOverlap) {
					top = Math.max(Math.min(top, clientHeight - popoverSize.height), 0);
				} else {
					maxHeight = clientHeight - targetRect.bottom - arrowOffset;
				}
				break;
			case PopoverPlacementType.Left:
				left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
				top = this.getHorizontalTop(targetRect, popoverSize);
				if (!allowTargetOverlap) {
					maxWidth = targetRect.left - arrowOffset;
				}
				break;
			case PopoverPlacementType.Right:
				left = targetRect.left + targetRect.width + arrowOffset;
				top = this.getHorizontalTop(targetRect, popoverSize);
				if (allowTargetOverlap) {
					left = Math.max(Math.min(left, clientWidth - popoverSize.width), 0);
				} else {
					maxWidth = clientWidth - targetRect.right - arrowOffset;
				}
				break;
			}
			if (isVertical) {
				if (popoverSize.width > clientWidth || left < 0) {
					left = 0;
				} else if (left + popoverSize.width > clientWidth) {
					left -= left + popoverSize.width - clientWidth;
				}
			} else {
				if (popoverSize.height > clientHeight || top < 0) {
					top = 0;
				} else if (top + popoverSize.height > clientHeight) {
					top -= top + popoverSize.height - clientHeight;
				}
			}
			this._maxHeight = Math.round(maxHeight - Popover.VIEWPORT_MARGIN);
			this._maxWidth = Math.round(maxWidth - Popover.VIEWPORT_MARGIN);
			if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
				this._left = Math.round(left);
			}
			if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
				this._top = Math.round(top);
			}
			const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical);
			return {
				arrow: arrowPos,
				top: this._top,
				left: this._left,
				placementType,
			};
		}
		getArrowPosition(targetRect, popoverSize, left, top, isVertical) {
			let arrowXCentered = this.horizontalAlign === PopoverHorizontalAlign.Center || this.horizontalAlign === PopoverHorizontalAlign.Stretch;
			if (this.horizontalAlign === PopoverHorizontalAlign.Right && left <= targetRect.left) {
				arrowXCentered = true;
			}
			if (this.horizontalAlign === PopoverHorizontalAlign.Left && left + popoverSize.width >= targetRect.left + targetRect.width) {
				arrowXCentered = true;
			}
			let arrowTranslateX = 0;
			if (isVertical && arrowXCentered) {
				arrowTranslateX = targetRect.left + targetRect.width / 2 - left - popoverSize.width / 2;
			}
			let arrowTranslateY = 0;
			if (!isVertical) {
				arrowTranslateY = targetRect.top + targetRect.height / 2 - top - popoverSize.height / 2;
			}
			return {
				x: Math.round(arrowTranslateX),
				y: Math.round(arrowTranslateY),
			};
		}
		fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
			if (targetRect.left > popoverSize.width) {
				return PopoverPlacementType.Left;
			}
			if (clientWidth - targetRect.right > targetRect.left) {
				return PopoverPlacementType.Right;
			}
			if (clientHeight - targetRect.bottom > popoverSize.height) {
				return PopoverPlacementType.Bottom;
			}
			if (clientHeight - targetRect.bottom < targetRect.top) {
				return PopoverPlacementType.Top;
			}
		}
		getActualPlacementType(targetRect, popoverSize) {
			const placementType = this.placementType;
			let actualPlacementType = placementType;
			const clientWidth = document.documentElement.clientWidth;
			const clientHeight = document.documentElement.clientHeight;
			switch (placementType) {
			case PopoverPlacementType.Top:
				if (targetRect.top < popoverSize.height
					&& targetRect.top < clientHeight - targetRect.bottom) {
					actualPlacementType = PopoverPlacementType.Bottom;
				}
				break;
			case PopoverPlacementType.Bottom:
				if (clientHeight - targetRect.bottom < popoverSize.height
					&& clientHeight - targetRect.bottom < targetRect.top) {
					actualPlacementType = PopoverPlacementType.Top;
				}
				break;
			case PopoverPlacementType.Left:
				if (targetRect.left < popoverSize.width) {
					actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
				}
				break;
			case PopoverPlacementType.Right:
				if (clientWidth - targetRect.right < popoverSize.width) {
					actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
				}
				break;
			}
			return actualPlacementType;
		}
		getVerticalLeft(targetRect, popoverSize) {
			let left;
			switch (this.horizontalAlign) {
			case PopoverHorizontalAlign.Center:
			case PopoverHorizontalAlign.Stretch:
				left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
				break;
			case PopoverHorizontalAlign.Left:
				left = targetRect.left;
				break;
			case PopoverHorizontalAlign.Right:
				left = targetRect.right - popoverSize.width;
				break;
			}
			return left;
		}
		getHorizontalTop(targetRect, popoverSize) {
			let top;
			switch (this.verticalAlign) {
			case PopoverVerticalAlign.Center:
			case PopoverVerticalAlign.Stretch:
				top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
				break;
			case PopoverVerticalAlign.Top:
				top = targetRect.top;
				break;
			case PopoverVerticalAlign.Bottom:
				top = targetRect.bottom - popoverSize.height;
				break;
			}
			return top;
		}
		get isModal() {
			return this.modal;
		}
		get shouldHideBackdrop() {
			return this.hideBackdrop;
		}
		get _ariaLabelledBy() {
			return this._ariaLabel ? undefined : "ui5-popup-header";
		}
		get _ariaModal() {
			return true;
		}
		get styles() {
			return {
				...super.styles,
				root: {
					"max-height": `${this._maxHeight}px`,
					"max-width": `${this._maxWidth}px`,
				},
				arrow: {
					transform: `translate(${this.arrowTranslateX}px, ${this.arrowTranslateY}px)`,
				},
			};
		}
		get classes() {
			const allClasses = super.classes;
			allClasses.root["ui5-popover-root"] = true;
			return allClasses;
		}
		get _displayHeader() {
			return this.header.length || this.headerText;
		}
		get _displayFooter() {
			return true;
		}
	}
	Popover.define();

	return Popover;

});
