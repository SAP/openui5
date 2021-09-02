sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', './types/BusyIndicatorSize', './Label', './generated/templates/BusyIndicatorTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/BusyIndicator.css'], function (UI5Element, litRender, Device, i18nBundle, Keys, Integer, BusyIndicatorSize, Label, BusyIndicatorTemplate_lit, i18nDefaults, BusyIndicator_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-busy-indicator",
		altTag: "ui5-busyindicator",
		languageAware: true,
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			text: {
				type: String,
			},
			size: {
				type: BusyIndicatorSize,
				defaultValue: BusyIndicatorSize.Medium,
			},
			active: {
				type: Boolean,
			},
			delay: {
				type: Integer__default,
				defaultValue: 1000,
			},
			_isBusy: {
				type: Boolean,
				noAttribute: true,
			},
		},
	};
	class BusyIndicator extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
			this._keydownHandler = this._handleKeydown.bind(this);
			this._preventEventHandler = this._preventEvent.bind(this);
		}
		onEnterDOM() {
			this.addEventListener("keydown", this._keydownHandler, {
				capture: true,
			});
			this.addEventListener("keyup", this._preventEventHandler, {
				capture: true,
			});
		}
		onExitDOM() {
			if (this._busyTimeoutId) {
				clearTimeout(this._busyTimeoutId);
				delete this._busyTimeoutId;
			}
			this.removeEventListener("keydown", this._keydownHandler, true);
			this.removeEventListener("keyup", this._preventEventHandler, true);
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return BusyIndicator_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return BusyIndicatorTemplate_lit;
		}
		static get dependencies() {
			return [Label];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		get ariaTitle() {
			return this.i18nBundle.getText(i18nDefaults.BUSY_INDICATOR_TITLE);
		}
		get labelId() {
			return this.text ? `${this._id}-label` : undefined;
		}
		get classes() {
			return {
				root: {
					"ui5-busy-indicator-root": true,
					"ui5-busy-indicator-root--ie": Device.isIE(),
				},
			};
		}
		onBeforeRendering() {
			if (this.active) {
				if (!this._isBusy && !this._busyTimeoutId) {
					this._busyTimeoutId = setTimeout(() => {
						delete this._busyTimeoutId;
						this._isBusy = true;
					}, Math.max(0, this.delay));
				}
			} else {
				if (this._busyTimeoutId) {
					clearTimeout(this._busyTimeoutId);
					delete this._busyTimeoutId;
				}
				this._isBusy = false;
			}
		}
		_handleKeydown(event) {
			if (!this.active) {
				return;
			}
			event.stopImmediatePropagation();
			if (Keys.isTabNext(event)) {
				this.focusForward = true;
				this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
				this.focusForward = false;
			}
		}
		_preventEvent(event) {
			if (this.active) {
				event.stopImmediatePropagation();
			}
		}
		_redirectFocus(event) {
			if (this.focusForward) {
				return;
			}
			event.preventDefault();
			this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
		}
	}
	BusyIndicator.define();

	return BusyIndicator;

});
