sap.ui.define(['sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/util/clamp', 'sap/ui/webc/common/thirdparty/base/Keys', './Popup', 'sap/ui/webc/common/thirdparty/icons/resize-corner', './Icon', './generated/templates/DialogTemplate.lit', './generated/themes/BrowserScrollbar.css', './generated/themes/PopupsCommon.css', './generated/themes/Dialog.css'], function (Device, clamp, Keys, Popup, resizeCorner, Icon, DialogTemplate_lit, BrowserScrollbar_css, PopupsCommon_css, Dialog_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var clamp__default = /*#__PURE__*/_interopDefaultLegacy(clamp);

	const STEP_SIZE = 16;
	const metadata = {
		tag: "ui5-dialog",
		slots:  {
			header: {
				type: HTMLElement,
			},
			footer: {
				type: HTMLElement,
			},
		},
		properties:  {
			headerText: {
				type: String,
			},
			stretch: {
				type: Boolean,
			},
			draggable: {
				type: Boolean,
			},
			resizable: {
				type: Boolean,
			},
			onPhone: {
				type: Boolean,
			},
			onDesktop: {
				type: Boolean,
			},
		},
	};
	class Dialog extends Popup {
		constructor() {
			super();
			this._screenResizeHandler = this._center.bind(this);
			this._dragMouseMoveHandler = this._onDragMouseMove.bind(this);
			this._dragMouseUpHandler = this._onDragMouseUp.bind(this);
			this._resizeMouseMoveHandler = this._onResizeMouseMove.bind(this);
			this._resizeMouseUpHandler = this._onResizeMouseUp.bind(this);
		}
		static get metadata() {
			return metadata;
		}
		static get dependencies() {
			return [
				Icon,
			];
		}
		static get template() {
			return DialogTemplate_lit;
		}
		static get styles() {
			return [BrowserScrollbar_css, PopupsCommon_css, Dialog_css];
		}
		static _isHeader(element) {
			return element.classList.contains("ui5-popup-header-root") || element.getAttribute("slot") === "header";
		}
		async show(preventInitialFocus = false) {
			await super._open(preventInitialFocus);
		}
		get isModal() {
			return true;
		}
		get shouldHideBackdrop() {
			return false;
		}
		get _ariaLabelledBy() {
			let ariaLabelledById;
			if (this.headerText !== "" && !this._ariaLabel) {
				ariaLabelledById = "ui5-popup-header-text";
			}
			return ariaLabelledById;
		}
		get _ariaModal() {
			return true;
		}
		get _displayProp() {
			return "flex";
		}
		get _displayHeader() {
			return this.header.length || this.headerText || this.draggable || this.resizable;
		}
		get _movable() {
			return !this.stretch && this.onDesktop && (this.draggable || this.resizable);
		}
		get _headerTabIndex() {
			return this._movable ? "0" : undefined;
		}
		get _showResizeHandle() {
			return this.resizable && this.onDesktop;
		}
		get _minHeight() {
			let minHeight = Number.parseInt(window.getComputedStyle(this.contentDOM).minHeight);
			const header = this._root.querySelector(".ui5-popup-header-root");
			if (header) {
				minHeight += header.offsetHeight;
			}
			const footer = this._root.querySelector(".ui5-popup-footer-root");
			if (footer) {
				minHeight += footer.offsetHeight;
			}
			return minHeight;
		}
		_show() {
			super._show();
			this._center();
		}
		onBeforeRendering() {
			this._isRTL = this.effectiveDir === "rtl";
			this.onPhone = Device.isPhone();
			this.onDesktop = Device.isDesktop();
		}
		onAfterRendering() {
			if (!this.isOpen() && this.open) {
				this.show();
			} else if (this.isOpen() && !this.open) {
				this.close();
			}
		}
		onEnterDOM() {
			super.onEnterDOM();
			this._attachScreenResizeHandler();
		}
		onExitDOM() {
			super.onExitDOM();
			this._detachScreenResizeHandler();
		}
		_resize() {
			super._resize();
			if (this._screenResizeHandlerAttached) {
				this._center();
			}
		}
		_attachScreenResizeHandler() {
			if (!this._screenResizeHandlerAttached) {
				window.addEventListener("resize", this._screenResizeHandler);
				this._screenResizeHandlerAttached = true;
			}
		}
		_detachScreenResizeHandler() {
			if (this._screenResizeHandlerAttached) {
				window.removeEventListener("resize", this._screenResizeHandler);
				this._screenResizeHandlerAttached = false;
			}
		}
		_center() {
			const height = window.innerHeight - this.offsetHeight,
				width = window.innerWidth - this.offsetWidth;
			Object.assign(this.style, {
				top: `${Math.round(height / 2)}px`,
				left: `${Math.round(width / 2)}px`,
			});
		}
		_revertSize() {
			Object.assign(this.style, {
				top: "",
				left: "",
				width: "",
				height: "",
			});
			this.removeEventListener("ui5-before-close", this._revertSize);
		}
		_onDragMouseDown(event) {
			if (!this._movable || !this.draggable || !Dialog._isHeader(event.target)) {
				return;
			}
			event.preventDefault();
			const {
				top,
				left,
			} = this.getBoundingClientRect();
			const {
				width,
				height,
			} = window.getComputedStyle(this);
			Object.assign(this.style, {
				top: `${top}px`,
				left: `${left}px`,
				width: `${Math.round(Number.parseFloat(width) * 100) / 100}px`,
				height: `${Math.round(Number.parseFloat(height) * 100) / 100}px`,
			});
			this._x = event.clientX;
			this._y = event.clientY;
			this._attachMouseDragHandlers();
		}
		_onDragMouseMove(event) {
			event.preventDefault();
			const calcX = this._x - event.clientX;
			const calcY = this._y - event.clientY;
			const {
				left,
				top,
			} = this.getBoundingClientRect();
			Object.assign(this.style, {
				left: `${Math.floor(left - calcX)}px`,
				top: `${Math.floor(top - calcY)}px`,
			});
			this._x = event.clientX;
			this._y = event.clientY;
		}
		_onDragMouseUp() {
			this._x = null;
			this._y = null;
			this._detachMouseDragHandlers();
		}
		_onDragOrResizeKeyDown(event) {
			if (!this._movable || !Dialog._isHeader(event.target)) {
				return;
			}
			if (this.draggable && [Keys.isUp, Keys.isDown, Keys.isLeft, Keys.isRight].some(key => key(event))) {
				this._dragWithEvent(event);
				return;
			}
			if (this.resizable && [Keys.isUpShift, Keys.isDownShift, Keys.isLeftShift, Keys.isRightShift].some(key => key(event))) {
				this._resizeWithEvent(event);
			}
		}
		_dragWithEvent(event) {
			const {
				top,
				left,
				width,
				height,
			} = this.getBoundingClientRect();
			let newPos,
				posDirection;
			switch (true) {
			case Keys.isUp(event):
				newPos = top - STEP_SIZE;
				posDirection = "top";
				break;
			case Keys.isDown(event):
				newPos = top + STEP_SIZE;
				posDirection = "top";
				break;
			case Keys.isLeft(event):
				newPos = left - STEP_SIZE;
				posDirection = "left";
				break;
			case Keys.isRight(event):
				newPos = left + STEP_SIZE;
				posDirection = "left";
				break;
			}
			newPos = clamp__default(
				newPos,
				0,
				posDirection === "left" ? window.innerWidth - width : window.innerHeight - height,
			);
			this.style[posDirection] = `${newPos}px`;
		}
		_resizeWithEvent(event) {
			this._detachScreenResizeHandler();
			this.addEventListener("ui5-before-close", this._revertSize);
			const { top, left } = this.getBoundingClientRect(),
				style = window.getComputedStyle(this),
				minWidth = Number.parseFloat(style.minWidth),
				maxWidth = window.innerWidth - left,
				maxHeight = window.innerHeight - top;
			let width = Number.parseFloat(style.width),
				height = Number.parseFloat(style.height);
			switch (true) {
			case Keys.isUpShift(event):
				height -= STEP_SIZE;
				break;
			case Keys.isDownShift(event):
				height += STEP_SIZE;
				break;
			case Keys.isLeftShift(event):
				width -= STEP_SIZE;
				break;
			case Keys.isRightShift(event):
				width += STEP_SIZE;
				break;
			}
			width = clamp__default(width, minWidth, maxWidth);
			height = clamp__default(height, this._minHeight, maxHeight);
			Object.assign(this.style, {
				width: `${width}px`,
				height: `${height}px`,
			});
		}
		_attachMouseDragHandlers() {
			this._detachScreenResizeHandler();
			window.addEventListener("mousemove", this._dragMouseMoveHandler);
			window.addEventListener("mouseup", this._dragMouseUpHandler);
		}
		_detachMouseDragHandlers() {
			window.removeEventListener("mousemove", this._dragMouseMoveHandler);
			window.removeEventListener("mouseup", this._dragMouseUpHandler);
		}
		_onResizeMouseDown(event) {
			if (!this._movable || !this.resizable) {
				return;
			}
			event.preventDefault();
			const {
				top,
				left,
			} = this.getBoundingClientRect();
			const {
				width,
				height,
				minWidth,
			} = window.getComputedStyle(this);
			this._initialX = event.clientX;
			this._initialY = event.clientY;
			this._initialWidth = Number.parseFloat(width);
			this._initialHeight = Number.parseFloat(height);
			this._initialTop = top;
			this._initialLeft = left;
			this._minWidth = Number.parseFloat(minWidth);
			this._cachedMinHeight = this._minHeight;
			Object.assign(this.style, {
				top: `${top}px`,
				left: `${left}px`,
			});
			this._attachMouseResizeHandlers();
		}
		_onResizeMouseMove(event) {
			const { clientX, clientY } = event;
			let newWidth,
				newLeft;
			if (this._isRTL) {
				newWidth = clamp__default(
					this._initialWidth - (clientX - this._initialX),
					this._minWidth,
					this._initialLeft + this._initialWidth,
				);
				newLeft = clamp__default(
					this._initialLeft + (clientX - this._initialX),
					0,
					this._initialX + this._initialWidth - this._minWidth,
				);
			} else {
				newWidth = clamp__default(
					this._initialWidth + (clientX - this._initialX),
					this._minWidth,
					window.innerWidth - this._initialLeft,
				);
			}
			const newHeight = clamp__default(
				this._initialHeight + (clientY - this._initialY),
				this._cachedMinHeight,
				window.innerHeight - this._initialTop,
			);
			Object.assign(this.style, {
				height: `${newHeight}px`,
				width: `${newWidth}px`,
				left: newLeft ? `${newLeft}px` : undefined,
			});
		}
		_onResizeMouseUp() {
			delete this._initialX;
			delete this._initialY;
			delete this._initialWidth;
			delete this._initialHeight;
			delete this._initialTop;
			delete this._initialLeft;
			delete this._minWidth;
			delete this._cachedMinHeight;
			this._detachMouseResizeHandlers();
		}
		_attachMouseResizeHandlers() {
			this._detachScreenResizeHandler();
			window.addEventListener("mousemove", this._resizeMouseMoveHandler);
			window.addEventListener("mouseup", this._resizeMouseUpHandler);
			this.addEventListener("ui5-before-close", this._revertSize);
		}
		_detachMouseResizeHandlers() {
			window.removeEventListener("mousemove", this._resizeMouseMoveHandler);
			window.removeEventListener("mouseup", this._resizeMouseUpHandler);
		}
	}
	Dialog.define();

	return Dialog;

});
