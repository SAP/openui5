sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', 'sap/ui/webc/common/thirdparty/base/util/clamp', './Popup', './types/PopoverPlacementType', './types/PopoverVerticalAlign', './types/PopoverHorizontalAlign', './popup-utils/PopoverRegistry', './generated/templates/PopoverTemplate.lit', './generated/themes/BrowserScrollbar.css', './generated/themes/PopupsCommon.css', './generated/themes/Popover.css'], function (Integer, ResizeHandler, PopupUtils, clamp, Popup, PopoverPlacementType, PopoverVerticalAlign, PopoverHorizontalAlign, PopoverRegistry, PopoverTemplate_lit, BrowserScrollbar_css, PopupsCommon_css, Popover_css) { 'use strict';

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
			_maxContentHeight: { type: Integer__default },
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
		static get MIN_OFFSET() {
			return 10;
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
			if (this._oldPlacement && (this._oldPlacement.left === placement.left) && (this._oldPlacement.top === placement.top) && stretching) {
				super._show();
				this.style.width = this._width;
				return;
			}
			this._oldPlacement = placement;
			const left = clamp__default(
				this._left,
				Popover.MIN_OFFSET,
				document.documentElement.clientWidth - popoverSize.width - Popover.MIN_OFFSET,
			);
			const top = clamp__default(
				this._top,
				Popover.MIN_OFFSET,
				document.documentElement.clientHeight - popoverSize.height - Popover.MIN_OFFSET,
			);
			let { arrowX, arrowY } = placement;
			const popoverOnLeftBorder = this._left === 0;
			const popoverOnRightBorder = this._left + popoverSize.width >= document.documentElement.clientWidth;
			if (popoverOnLeftBorder) {
				arrowX -= Popover.MIN_OFFSET;
			} else if (popoverOnRightBorder) {
				arrowX += Popover.MIN_OFFSET;
			}
			this.arrowTranslateX = arrowX;
			const popoverOnTopBorder = this._top === 0;
			const popoverOnBottomBorder = this._top + popoverSize.height >= document.documentElement.clientHeight;
			if (popoverOnTopBorder) {
				arrowY -= Popover.MIN_OFFSET;
			} else if (popoverOnBottomBorder) {
				arrowY += Popover.MIN_OFFSET;
			}
			this.arrowTranslateY = arrowY;
			this.actualPlacementType = placement.placementType;
			Object.assign(this.style, {
				top: `${top}px`,
				left: `${left}px`,
			});
			super._show();
			if (stretching && this._width) {
				this.style.width = this._width;
			}
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
			let width = "";
			let height = "";
			const placementType = this.getActualPlacementType(targetRect, popoverSize);
			this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placementType, targetRect);
			const isVertical = placementType === PopoverPlacementType.Top
				|| placementType === PopoverPlacementType.Bottom;
			if (this.horizontalAlign === PopoverHorizontalAlign.Stretch && isVertical) {
				popoverSize.width = targetRect.width;
				width = `${targetRect.width}px`;
			} else if (this.verticalAlign === PopoverVerticalAlign.Stretch && !isVertical) {
				popoverSize.height = targetRect.height;
				height = `${targetRect.height}px`;
			}
			this._width = width;
			this._height = height;
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
				if (allowTargetOverlap) {
					top = Math.max(Math.min(targetRect.bottom + arrowOffset, clientHeight - popoverSize.height), 0);
				} else {
					top = targetRect.bottom + arrowOffset;
					maxHeight = clientHeight - targetRect.bottom - arrowOffset;
				}
				break;
			case PopoverPlacementType.Left:
				left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
				top = this.getHorizontalTop(targetRect, popoverSize);
				break;
			case PopoverPlacementType.Right:
				if (allowTargetOverlap) {
					left = Math.max(Math.min(targetRect.left + targetRect.width + arrowOffset, clientWidth - popoverSize.width), 0);
				} else {
					left = targetRect.left + targetRect.width + arrowOffset;
				}
				top = this.getHorizontalTop(targetRect, popoverSize);
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
			let maxContentHeight = Math.round(maxHeight);
			if (this._displayHeader) {
				const headerDomRef = this.shadowRoot.querySelector(".ui5-popup-header-root")
					|| this.shadowRoot.querySelector(".ui5-popup-header-text");
				if (headerDomRef) {
					maxContentHeight = Math.round(maxHeight - headerDomRef.offsetHeight);
				}
			}
			this._maxContentHeight = maxContentHeight - Popover.MIN_OFFSET;
			const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical);
			if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
				this._left = Math.round(left);
			}
			if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
				this._top = Math.round(top);
			}
			return {
				arrowX: arrowPos.x,
				arrowY: arrowPos.y,
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
			return this.accessibleName ? undefined : "ui5-popup-header";
		}
		get _ariaModal() {
			return true;
		}
		get styles() {
			return {
				...super.styles,
				content: {
					"max-height": `${this._maxContentHeight}px`,
				},
				arrow: {
					transform: `translate(${this.arrowTranslateX}px, ${this.arrowTranslateY}px)`,
				},
			};
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
