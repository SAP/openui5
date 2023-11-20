sap.ui.define([
    'exports',
    'sap/ui/webc/common/thirdparty/base/decorators/customElement',
    'sap/ui/webc/common/thirdparty/base/decorators/property',
    'sap/ui/webc/common/thirdparty/base/decorators/slot',
    'sap/ui/webc/common/thirdparty/base/types/Integer',
    'sap/ui/webc/common/thirdparty/base/Device',
    'sap/ui/webc/common/thirdparty/base/types/DOMReference',
    'sap/ui/webc/common/thirdparty/base/util/PopupUtils',
    'sap/ui/webc/common/thirdparty/base/util/clamp',
    './Popup',
    './types/PopoverPlacementType',
    './types/PopoverVerticalAlign',
    './types/PopoverHorizontalAlign',
    './popup-utils/PopoverRegistry',
    './generated/templates/PopoverTemplate.lit',
    './generated/themes/BrowserScrollbar.css',
    './generated/themes/PopupsCommon.css',
    './generated/themes/Popover.css'
], function (_exports, _customElement, _property, _slot, _Integer, _Device, _DOMReference, _PopupUtils, _clamp, _Popup, _PopoverPlacementType, _PopoverVerticalAlign, _PopoverHorizontalAlign, _PopoverRegistry, _PopoverTemplate, _BrowserScrollbar, _PopupsCommon, _Popover) {
    'use strict';
    Object.defineProperty(_exports, '__esModule', { value: true });
    _exports.instanceOfPopover = _exports.default = void 0;
    _customElement = _interopRequireDefault(_customElement);
    _property = _interopRequireDefault(_property);
    _slot = _interopRequireDefault(_slot);
    _Integer = _interopRequireDefault(_Integer);
    _DOMReference = _interopRequireDefault(_DOMReference);
    _clamp = _interopRequireDefault(_clamp);
    _Popup = _interopRequireDefault(_Popup);
    _PopoverPlacementType = _interopRequireDefault(_PopoverPlacementType);
    _PopoverVerticalAlign = _interopRequireDefault(_PopoverVerticalAlign);
    _PopoverHorizontalAlign = _interopRequireDefault(_PopoverHorizontalAlign);
    _PopoverTemplate = _interopRequireDefault(_PopoverTemplate);
    _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
    _PopupsCommon = _interopRequireDefault(_PopupsCommon);
    _Popover = _interopRequireDefault(_Popover);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Popover_1;
    const ARROW_SIZE = 8;
    let Popover = Popover_1 = class Popover extends _Popup.default {
        static get VIEWPORT_MARGIN() {
            return 10;
        }
        constructor() {
            super();
        }
        onAfterRendering() {
            if (!this.isOpen() && this.open) {
                let opener;
                if (this.opener instanceof HTMLElement) {
                    opener = this.opener;
                } else if (typeof this.opener === 'string') {
                    opener = this.getRootNode().getElementById(this.opener);
                }
                if (!opener) {
                    console.warn('Valid opener id is required.');
                    return;
                }
                this.showAt(opener);
            } else if (this.isOpen() && !this.open) {
                this.close();
            }
        }
        isOpenerClicked(e) {
            const target = e.target;
            if (target === this._opener) {
                return true;
            }
            const ui5ElementTarget = target;
            if (ui5ElementTarget.getFocusDomRef && ui5ElementTarget.getFocusDomRef() === this._opener) {
                return true;
            }
            return e.composedPath().indexOf(this._opener) > -1;
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
            (0, sap.ui.require('sap/ui/webc/main/thirdparty/popup-utils/PopoverRegistry').addOpenedPopover)(this);
        }
        _removeOpenedPopup() {
            (0, sap.ui.require('sap/ui/webc/main/thirdparty/popup-utils/PopoverRegistry').removeOpenedPopover)(this);
        }
        shouldCloseDueToOverflow(placement, openerRect) {
            const threshold = 32;
            const limits = {
                'Right': openerRect.right,
                'Left': openerRect.left,
                'Top': openerRect.top,
                'Bottom': openerRect.bottom
            };
            const closedPopupParent = (0, _PopupUtils.getClosedPopupParent)(this._opener);
            let overflowsBottom = false;
            let overflowsTop = false;
            if (closedPopupParent.showAt) {
                const contentRect = closedPopupParent.contentDOM.getBoundingClientRect();
                overflowsBottom = openerRect.top > contentRect.top + contentRect.height;
                overflowsTop = openerRect.top + openerRect.height < contentRect.top;
            }
            return limits[placement] < 0 || limits[placement] + threshold > closedPopupParent.innerHeight || overflowsBottom || overflowsTop;
        }
        shouldCloseDueToNoOpener(openerRect) {
            return openerRect.top === 0 && openerRect.bottom === 0 && openerRect.left === 0 && openerRect.right === 0;
        }
        isOpenerOutsideViewport(openerRect) {
            return openerRect.bottom < 0 || openerRect.top > window.innerHeight || openerRect.right < 0 || openerRect.left > window.innerWidth;
        }
        _resize() {
            super._resize();
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
            if (this._preventRepositionAndClose || this.isOpenerOutsideViewport(this._openerRect)) {
                return this.close();
            }
            this._oldPlacement = placement;
            this.actualPlacementType = placement.placementType;
            let left = (0, _clamp.default)(this._left, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientWidth - popoverSize.width - Popover_1.VIEWPORT_MARGIN);
            if (this.actualPlacementType === _PopoverPlacementType.default.Right) {
                left = Math.max(left, this._left);
            }
            let top = (0, _clamp.default)(this._top, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientHeight - popoverSize.height - Popover_1.VIEWPORT_MARGIN);
            if (this.actualPlacementType === _PopoverPlacementType.default.Bottom) {
                top = Math.max(top, this._top);
            }
            this.arrowTranslateX = placement.arrow.x;
            this.arrowTranslateY = placement.arrow.y;
            top = this._adjustForIOSKeyboard(top);
            Object.assign(this.style, {
                top: `${ top }px`,
                left: `${ left }px`
            });
            super._show();
            if (this.horizontalAlign === _PopoverHorizontalAlign.default.Stretch && this._width) {
                this.style.width = this._width;
            }
        }
        _adjustForIOSKeyboard(top) {
            if (!(0, _Device.isIOS)()) {
                return top;
            }
            const actualTop = Math.ceil(this.getBoundingClientRect().top);
            return top + (Number.parseInt(this.style.top || '0') - actualTop);
        }
        getPopoverSize() {
            if (!this.opened) {
                Object.assign(this.style, {
                    display: 'block',
                    top: '-10000px',
                    left: '-10000px'
                });
            }
            const rect = this.getBoundingClientRect(), width = rect.width, height = rect.height;
            return {
                width,
                height
            };
        }
        get arrowDOM() {
            return this.shadowRoot.querySelector('.ui5-popover-arrow');
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
            const isVertical = placementType === _PopoverPlacementType.default.Top || placementType === _PopoverPlacementType.default.Bottom;
            if (this.horizontalAlign === _PopoverHorizontalAlign.default.Stretch && isVertical) {
                popoverSize.width = targetRect.width;
                this._width = `${ targetRect.width }px`;
            } else if (this.verticalAlign === _PopoverVerticalAlign.default.Stretch && !isVertical) {
                popoverSize.height = targetRect.height;
            }
            const arrowOffset = this.hideArrow ? 0 : ARROW_SIZE;
            switch (placementType) {
            case _PopoverPlacementType.default.Top:
                left = this.getVerticalLeft(targetRect, popoverSize);
                top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);
                if (!allowTargetOverlap) {
                    maxHeight = targetRect.top - arrowOffset;
                }
                break;
            case _PopoverPlacementType.default.Bottom:
                left = this.getVerticalLeft(targetRect, popoverSize);
                top = targetRect.bottom + arrowOffset;
                if (allowTargetOverlap) {
                    top = Math.max(Math.min(top, clientHeight - popoverSize.height), 0);
                } else {
                    maxHeight = clientHeight - targetRect.bottom - arrowOffset;
                }
                break;
            case _PopoverPlacementType.default.Left:
                left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
                top = this.getHorizontalTop(targetRect, popoverSize);
                if (!allowTargetOverlap) {
                    maxWidth = targetRect.left - arrowOffset;
                }
                break;
            case _PopoverPlacementType.default.Right:
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
            this._maxHeight = Math.round(maxHeight - Popover_1.VIEWPORT_MARGIN);
            this._maxWidth = Math.round(maxWidth - Popover_1.VIEWPORT_MARGIN);
            if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
                this._left = Math.round(left);
            }
            if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
                this._top = Math.round(top);
            }
            const borderRadius = Number.parseInt(window.getComputedStyle(this).getPropertyValue('border-radius'));
            const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius);
            return {
                arrow: arrowPos,
                top: this._top,
                left: this._left,
                placementType
            };
        }
        getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius) {
            const horizontalAlign = this._actualHorizontalAlign;
            let arrowXCentered = horizontalAlign === _PopoverHorizontalAlign.default.Center || horizontalAlign === _PopoverHorizontalAlign.default.Stretch;
            if (horizontalAlign === _PopoverHorizontalAlign.default.Right && left <= targetRect.left) {
                arrowXCentered = true;
            }
            if (horizontalAlign === _PopoverHorizontalAlign.default.Left && left + popoverSize.width >= targetRect.left + targetRect.width) {
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
            const safeRangeForArrowY = popoverSize.height / 2 - borderRadius - ARROW_SIZE / 2;
            arrowTranslateY = (0, _clamp.default)(arrowTranslateY, -safeRangeForArrowY, safeRangeForArrowY);
            const safeRangeForArrowX = popoverSize.width / 2 - borderRadius - ARROW_SIZE / 2;
            arrowTranslateX = (0, _clamp.default)(arrowTranslateX, -safeRangeForArrowX, safeRangeForArrowX);
            return {
                x: Math.round(arrowTranslateX),
                y: Math.round(arrowTranslateY)
            };
        }
        fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
            if (targetRect.left > popoverSize.width) {
                return _PopoverPlacementType.default.Left;
            }
            if (clientWidth - targetRect.right > targetRect.left) {
                return _PopoverPlacementType.default.Right;
            }
            if (clientHeight - targetRect.bottom > popoverSize.height) {
                return _PopoverPlacementType.default.Bottom;
            }
            if (clientHeight - targetRect.bottom < targetRect.top) {
                return _PopoverPlacementType.default.Top;
            }
        }
        getActualPlacementType(targetRect, popoverSize) {
            const placementType = this.placementType;
            let actualPlacementType = placementType;
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;
            switch (placementType) {
            case _PopoverPlacementType.default.Top:
                if (targetRect.top < popoverSize.height && targetRect.top < clientHeight - targetRect.bottom) {
                    actualPlacementType = _PopoverPlacementType.default.Bottom;
                }
                break;
            case _PopoverPlacementType.default.Bottom:
                if (clientHeight - targetRect.bottom < popoverSize.height && clientHeight - targetRect.bottom < targetRect.top) {
                    actualPlacementType = _PopoverPlacementType.default.Top;
                }
                break;
            case _PopoverPlacementType.default.Left:
                if (targetRect.left < popoverSize.width) {
                    actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
                }
                break;
            case _PopoverPlacementType.default.Right:
                if (clientWidth - targetRect.right < popoverSize.width) {
                    actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
                }
                break;
            }
            return actualPlacementType;
        }
        getVerticalLeft(targetRect, popoverSize) {
            const horizontalAlign = this._actualHorizontalAlign;
            let left = 0;
            switch (horizontalAlign) {
            case _PopoverHorizontalAlign.default.Center:
            case _PopoverHorizontalAlign.default.Stretch:
                left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
                break;
            case _PopoverHorizontalAlign.default.Left:
                left = targetRect.left;
                break;
            case _PopoverHorizontalAlign.default.Right:
                left = targetRect.right - popoverSize.width;
                break;
            }
            return left;
        }
        getHorizontalTop(targetRect, popoverSize) {
            let top = 0;
            switch (this.verticalAlign) {
            case _PopoverVerticalAlign.default.Center:
            case _PopoverVerticalAlign.default.Stretch:
                top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
                break;
            case _PopoverVerticalAlign.default.Top:
                top = targetRect.top;
                break;
            case _PopoverVerticalAlign.default.Bottom:
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
            if (!this._ariaLabel && this._displayHeader) {
                return 'ui5-popup-header';
            }
            return undefined;
        }
        get styles() {
            return {
                ...super.styles,
                root: {
                    'max-height': this._maxHeight ? `${ this._maxHeight }px` : '',
                    'max-width': this._maxWidth ? `${ this._maxWidth }px` : ''
                },
                arrow: { transform: `translate(${ this.arrowTranslateX }px, ${ this.arrowTranslateY }px)` }
            };
        }
        get classes() {
            const allClasses = super.classes;
            allClasses.root['ui5-popover-root'] = true;
            return allClasses;
        }
        get _displayHeader() {
            return !!(this.header.length || this.headerText);
        }
        get _displayFooter() {
            return true;
        }
        get _actualHorizontalAlign() {
            if (this.effectiveDir === 'rtl') {
                if (this.horizontalAlign === _PopoverHorizontalAlign.default.Left) {
                    return _PopoverHorizontalAlign.default.Right;
                }
                if (this.horizontalAlign === _PopoverHorizontalAlign.default.Right) {
                    return _PopoverHorizontalAlign.default.Left;
                }
            }
            return this.horizontalAlign;
        }
    };
    __decorate([(0, _property.default)()], Popover.prototype, 'headerText', void 0);
    __decorate([(0, _property.default)({
            type: _PopoverPlacementType.default,
            defaultValue: _PopoverPlacementType.default.Right
        })], Popover.prototype, 'placementType', void 0);
    __decorate([(0, _property.default)({
            type: _PopoverHorizontalAlign.default,
            defaultValue: _PopoverHorizontalAlign.default.Center
        })], Popover.prototype, 'horizontalAlign', void 0);
    __decorate([(0, _property.default)({
            type: _PopoverVerticalAlign.default,
            defaultValue: _PopoverVerticalAlign.default.Center
        })], Popover.prototype, 'verticalAlign', void 0);
    __decorate([(0, _property.default)({ type: Boolean })], Popover.prototype, 'modal', void 0);
    __decorate([(0, _property.default)({ type: Boolean })], Popover.prototype, 'hideBackdrop', void 0);
    __decorate([(0, _property.default)({ type: Boolean })], Popover.prototype, 'hideArrow', void 0);
    __decorate([(0, _property.default)({ type: Boolean })], Popover.prototype, 'allowTargetOverlap', void 0);
    __decorate([(0, _property.default)({ validator: _DOMReference.default })], Popover.prototype, 'opener', void 0);
    __decorate([(0, _property.default)({ type: Boolean })], Popover.prototype, 'disableScrolling', void 0);
    __decorate([(0, _property.default)({
            validator: _Integer.default,
            defaultValue: 0,
            noAttribute: true
        })], Popover.prototype, 'arrowTranslateX', void 0);
    __decorate([(0, _property.default)({
            validator: _Integer.default,
            defaultValue: 0,
            noAttribute: true
        })], Popover.prototype, 'arrowTranslateY', void 0);
    __decorate([(0, _property.default)({
            type: _PopoverPlacementType.default,
            defaultValue: _PopoverPlacementType.default.Right
        })], Popover.prototype, 'actualPlacementType', void 0);
    __decorate([(0, _property.default)({
            validator: _Integer.default,
            noAttribute: true
        })], Popover.prototype, '_maxHeight', void 0);
    __decorate([(0, _property.default)({
            validator: _Integer.default,
            noAttribute: true
        })], Popover.prototype, '_maxWidth', void 0);
    __decorate([(0, _slot.default)({ type: HTMLElement })], Popover.prototype, 'header', void 0);
    __decorate([(0, _slot.default)({ type: HTMLElement })], Popover.prototype, 'footer', void 0);
    Popover = Popover_1 = __decorate([(0, _customElement.default)({
            tag: 'ui5-popover',
            styles: [
                _BrowserScrollbar.default,
                _PopupsCommon.default,
                _Popover.default
            ],
            template: _PopoverTemplate.default
        })], Popover);
    const instanceOfPopover = object => {
        return 'showAt' in object;
    };
    _exports.instanceOfPopover = instanceOfPopover;
    Popover.define();
    var _default = Popover;
    _exports.default = _default;
});