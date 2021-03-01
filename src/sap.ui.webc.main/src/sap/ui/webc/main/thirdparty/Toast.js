sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', './types/ToastPlacement', './generated/templates/ToastTemplate.lit', './generated/themes/Toast.css'], function (Integer, UI5Element, litRender, PopupUtils, ToastPlacement, ToastTemplate_lit, Toast_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const MIN_DURATION = 500;
	const MAX_DURATION = 1000;
	const metadata = {
		tag: "ui5-toast",
		properties:  {
			duration: {
				type: Integer__default,
				defaultValue: 3000,
			},
			placement: {
				type: ToastPlacement,
				defaultValue: ToastPlacement.BottomCenter,
			},
			open: {
				type: Boolean,
			},
			hover: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
	};
	class Toast extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Toast_css;
		}
		static get template() {
			return ToastTemplate_lit;
		}
		onAfterRendering() {
			if (this._reopen) {
				this._reopen = false;
				this._initiateOpening();
			}
		}
		show() {
			if (this.open) {
				this._reopen = true;
				this.open = false;
			} else {
				this._initiateOpening();
			}
		}
		get effectiveDuration() {
			return this.duration < MIN_DURATION ? MIN_DURATION : this.duration;
		}
		get styles() {
			const transitionDuration = Math.min(this.effectiveDuration / 3, MAX_DURATION);
			return {
				root: {
					"transition-duration": this.open ? `${transitionDuration}ms` : "",
					"transition-delay": this.open ? `${this.effectiveDuration - transitionDuration}ms` : "",
					"opacity": this.open && !this.hover ? "0" : "",
					"z-index": PopupUtils.getNextZIndex(),
				},
			};
		}
		_initiateOpening() {
			requestAnimationFrame(_ => {
				this.open = true;
			});
		}
		_ontransitionend() {
			if (this.hover) {
				return;
			}
			this.open = false;
		}
		_onmouseover() {
			this.hover = true;
		}
		_onmouseleave() {
			this.hover = false;
		}
	}
	Toast.define();

	return Toast;

});
