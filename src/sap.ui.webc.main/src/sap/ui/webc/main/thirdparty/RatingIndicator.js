sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/Float', './generated/i18n/i18n-defaults', './generated/templates/RatingIndicatorTemplate.lit', './generated/themes/RatingIndicator.css'], function (UI5Element, litRender, Keys, i18nBundle, Integer, Float, i18nDefaults, RatingIndicatorTemplate_lit, RatingIndicator_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);

	const metadata = {
		tag: "ui5-rating-indicator",
		languageAware: true,
		properties:  {
			value: {
				type: Float__default,
				defaultValue: 0,
			},
			max: {
				type: Integer__default,
				defaultValue: 5,
			},
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			_stars: {
				type: Object,
				multiple: true,
			},
			_focused: {
				type: Boolean,
			},
		},
		slots:  {
		},
		events:  {
			change: {},
		},
	};
	class RatingIndicator extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return RatingIndicator_css;
		}
		static get template() {
			return RatingIndicatorTemplate_lit;
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this._liveValue = null;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this.calcState();
		}
		calcState() {
			this._stars = [];
			for (let i = 1; i < this.max + 1; i++) {
				const remainder = Math.round((this.value - Math.floor(this.value)) * 10);
				let halfStar = false,
					tempValue = this.value;
				if (Math.floor(this.value) + 1 === i && remainder > 2 && remainder < 8) {
					halfStar = true;
				} else if (remainder <= 2) {
					tempValue = Math.floor(this.value);
				} else if (remainder >= 8) {
					tempValue = Math.ceil(this.value);
				}
				this._stars.push({
					selected: i <= tempValue,
					index: i,
					halfStar,
				});
			}
		}
		_onclick(event) {
			if (this.disabled || this.readonly) {
				return;
			}
			this.value = parseInt(event.target.getAttribute("data-value"));
			if (this.value === 1 && this._liveValue === 1) {
				this.value = 0;
			}
			if (this._liveValue !== this.value) {
				this.fireEvent("change");
				this._liveValue = this.value;
			}
		}
		_onkeydown(event) {
			if (this.disabled || this.readonly) {
				return;
			}
			const down = Keys.isDown(event) || Keys.isLeft(event);
			const up = Keys.isRight(event) || Keys.isUp(event) || Keys.isSpace(event) || Keys.isEnter(event);
			if (down || up) {
				event.preventDefault();
				if (down && this.value > 0) {
					this.value = Math.round(this.value - 1);
					this.fireEvent("change");
				} else if (up && this.value < this.max) {
					this.value = Math.round(this.value + 1);
					this.fireEvent("change");
				}
			}
		}
		_onfocusin() {
			if (this.disabled) {
				return;
			}
			this._focused = true;
			this._liveValue = this.value;
		}
		_onfocusout() {
			this._focused = false;
		}
		get tabIndex() {
			return this.disabled ? "-1" : "0";
		}
		get tooltip() {
			return this.getAttribute("title") || this.defaultTooltip;
		}
		get defaultTooltip() {
			return this.i18nBundle.getText(i18nDefaults.RATING_INDICATOR_TOOLTIP_TEXT);
		}
		get _ariaRoleDescription() {
			return this.i18nBundle.getText(i18nDefaults.RATING_INDICATOR_TEXT);
		}
		get _ariaDisabled() {
			return this.disabled || undefined;
		}
		get ariaReadonly() {
			return this.readonly ? "true" : undefined;
		}
	}
	RatingIndicator.define();

	return RatingIndicator;

});
