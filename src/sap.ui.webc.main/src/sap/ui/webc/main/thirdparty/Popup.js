sap.ui.define(['sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/util/FocusableElements', 'sap/ui/webc/common/thirdparty/base/util/createStyleInHead', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', './generated/templates/PopupTemplate.lit', './generated/templates/PopupBlockLayerTemplate.lit', './popup-utils/OpenedPopupsRegistry', './generated/themes/Popup.css', './generated/themes/PopupStaticAreaStyles.css'], function (Render, litRender, UI5Element, Device, FocusableElements, createStyleInHead, Keys, PopupUtils, PopupTemplate_lit, PopupBlockLayerTemplate_lit, OpenedPopupsRegistry, Popup_css, PopupStaticAreaStyles_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var createStyleInHead__default = /*#__PURE__*/_interopDefaultLegacy(createStyleInHead);

	const metadata = {
		managedSlots: true,
		slots:  {
			"default": {
				type: HTMLElement,
				propertyName: "content",
			},
		},
		properties:  {
			initialFocus: {
				type: String,
			},
			preventFocusRestore: {
				type: Boolean,
			},
			opened: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			_disableInitialFocus: {
				type: Boolean,
			},
			_blockLayerHidden: {
				type: Boolean,
			},
		},
		events:  {
			"before-open": {},
			"after-open": {},
			"before-close": {
				detail: {
					escPressed: { type: Boolean },
				},
			},
			"after-close": {},
			"scroll": {},
		},
	};
	let customBlockingStyleInserted = false;
	const createBlockingStyle = () => {
		if (customBlockingStyleInserted) {
			return;
		}
		createStyleInHead__default(`
		.ui5-popup-scroll-blocker {
			width: 100%;
			height: 100%;
			position: fixed;
			overflow: hidden;
		}
	`, { "data-ui5-popup-scroll-blocker": "" });
		customBlockingStyleInserted = true;
	};
	createBlockingStyle();
	let bodyScrollingBlockers = 0;
	class Popup extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Popup_css;
		}
		static get template() {
			return PopupTemplate_lit;
		}
		static get staticAreaTemplate() {
			return PopupBlockLayerTemplate_lit;
		}
		static get staticAreaStyles() {
			return PopupStaticAreaStyles_css;
		}
		onEnterDOM() {
			if (!this.isOpen()) {
				this._blockLayerHidden = true;
			}
		}
		onExitDOM() {
			if (this.isOpen()) {
				Popup.unblockBodyScrolling();
				this._removeOpenedPopup();
			}
		}
		get _displayProp() {
			return "block";
		}
		_preventBlockLayerFocus(event) {
			event.preventDefault();
		}
		static blockBodyScrolling() {
			bodyScrollingBlockers++;
			if (bodyScrollingBlockers !== 1) {
				return;
			}
			if (window.pageYOffset > 0) {
				document.body.style.top = `-${window.pageYOffset}px`;
			}
			document.body.classList.add("ui5-popup-scroll-blocker");
		}
		static unblockBodyScrolling() {
			bodyScrollingBlockers--;
			if (bodyScrollingBlockers !== 0) {
				return;
			}
			document.body.classList.remove("ui5-popup-scroll-blocker");
			window.scrollTo(0, -parseFloat(document.body.style.top));
			document.body.style.top = "";
		}
		_scroll(e) {
			this.fireEvent("scroll", {
				scrollTop: e.target.scrollTop,
				targetRef: e.target,
			});
		}
		_onkeydown(e) {
			if (e.target === this._root && Keys.isTabPrevious(e)) {
				e.preventDefault();
			}
		}
		_onfocusout(e) {
			if (!e.relatedTarget) {
				this._shouldFocusRoot = true;
			}
		}
		_onmousedown(e) {
			this._root.removeAttribute("tabindex");
			if (this.shadowRoot.contains(e.target)) {
				this._shouldFocusRoot = true;
			} else {
				this._shouldFocusRoot = false;
			}
		}
		_onmouseup() {
			this._root.tabIndex = -1;
			if (this._shouldFocusRoot) {
				if (Device.isChrome()) {
					this._root.focus();
				}
				this._shouldFocusRoot = false;
			}
		}
		async forwardToFirst() {
			const firstFocusable = await FocusableElements.getFirstFocusableElement(this);
			if (firstFocusable) {
				firstFocusable.focus();
			} else {
				this._root.focus();
			}
		}
		async forwardToLast() {
			const lastFocusable = await FocusableElements.getLastFocusableElement(this);
			if (lastFocusable) {
				lastFocusable.focus();
			} else {
				this._root.focus();
			}
		}
		async applyInitialFocus() {
			await this.applyFocus();
		}
		async applyFocus() {
			await this._waitForDomRef();
			const element = this.getRootNode().getElementById(this.initialFocus)
				|| document.getElementById(this.initialFocus)
				|| await FocusableElements.getFirstFocusableElement(this)
				|| this._root;
			if (element) {
				if (element === this._root) {
					element.tabIndex = -1;
				}
				element.focus();
			}
		}
		isOpen() {
			return this.opened;
		}
		isFocusWithin() {
			return PopupUtils.isFocusedElementWithinNode(this.shadowRoot.querySelector(".ui5-popup-root"));
		}
		async _open(preventInitialFocus) {
			const prevented = !this.fireEvent("before-open", {}, true, false);
			if (prevented) {
				return;
			}
			if (this.isModal && !this.shouldHideBackdrop) {
				this.getStaticAreaItemDomRef();
				this._blockLayerHidden = false;
				Popup.blockBodyScrolling();
			}
			this._zIndex = PopupUtils.getNextZIndex();
			this.style.zIndex = this._zIndex;
			this._focusedElementBeforeOpen = PopupUtils.getFocusedElement();
			this._show();
			if (!this._disableInitialFocus && !preventInitialFocus) {
				this.applyInitialFocus();
			}
			this._addOpenedPopup();
			this.opened = true;
			await Render.renderFinished();
			this.fireEvent("after-open", {}, false, false);
		}
		_addOpenedPopup() {
			OpenedPopupsRegistry.addOpenedPopup(this);
		}
		close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
			if (!this.opened) {
				return;
			}
			const prevented = !this.fireEvent("before-close", { escPressed }, true, false);
			if (prevented) {
				return;
			}
			if (this.isModal) {
				this._blockLayerHidden = true;
				Popup.unblockBodyScrolling();
			}
			this.hide();
			this.opened = false;
			if (!preventRegistryUpdate) {
				this._removeOpenedPopup();
			}
			if (!this.preventFocusRestore && !preventFocusRestore) {
				this.resetFocus();
			}
			this.fireEvent("after-close", {}, false, false);
		}
		_removeOpenedPopup() {
			OpenedPopupsRegistry.removeOpenedPopup(this);
		}
		resetFocus() {
			if (!this._focusedElementBeforeOpen) {
				return;
			}
			this._focusedElementBeforeOpen.focus();
			this._focusedElementBeforeOpen = null;
		}
		_show() {
			this.style.display = this._displayProp;
		}
		hide() {
			this.style.display = "none";
		}
		get isModal() {}
		get shouldHideBackdrop() {}
		get _ariaLabelledBy() {}
		get _ariaModal() {}
		get _ariaLabel() {
			return this.accessibleName || undefined;
		}
		get _root() {
			return this.shadowRoot.querySelector(".ui5-popup-root");
		}
		get styles() {
			return {
				root: {},
				content: {},
				blockLayer: {
					"zIndex": (this._zIndex - 1),
				},
			};
		}
		get classes() {
			return {
				root: {
					"ui5-popup-root": true,
				},
				content: {
					"ui5-popup-content": true,
				},
			};
		}
	}

	return Popup;

});
