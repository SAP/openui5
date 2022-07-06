sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/Float', './generated/i18n/i18n-defaults', './generated/templates/RatingIndicatorTemplate.lit', './Icon', 'sap/ui/webc/common/thirdparty/icons/favorite', 'sap/ui/webc/common/thirdparty/icons/unfavorite', './generated/themes/RatingIndicator.css'], function (UI5Element, litRender, Keys, i18nBundle, Integer, Float, i18nDefaults, RatingIndicatorTemplate_lit, Icon, favorite, unfavorite, RatingIndicator_css) { 'use strict';

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
			RatingIndicator.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get dependencies() {
			return [Icon];
		}
		constructor() {
			super();
			this._liveValue = null;
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
			this.value = parseInt(event.target.getAttribute("data-ui5-value"));
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
			const isDecrease = Keys.isDown(event) || Keys.isLeft(event);
			const isIncrease = Keys.isRight(event) || Keys.isUp(event);
			const isIncreaseWithReset = Keys.isSpace(event) || Keys.isEnter(event);
			const isMin = Keys.isHome(event);
			const isMax = Keys.isEnd(event);
			const isNumber = (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105);
			if (isDecrease || isIncrease || isIncreaseWithReset || isMin || isMax || isNumber) {
				event.preventDefault();
				if (isDecrease && this.value > 0) {
					this.value = Math.round(this.value - 1);
				} else if (isIncrease && this.value < this.max) {
					this.value = Math.round(this.value + 1);
				} else if (isIncreaseWithReset) {
					const proposedValue = Math.round(this.value + 1);
					this.value = proposedValue > this.max ? 0 : proposedValue;
				} else if (isMin) {
					this.value = 0;
				} else if (isMax) {
					this.value = this.max;
				} else if (isNumber) {
					const pressedNumber = parseInt(event.key);
					this.value = pressedNumber > this.max ? this.max : pressedNumber;
				}
				this.fireEvent("change");
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
			return RatingIndicator.i18nBundle.getText(i18nDefaults.RATING_INDICATOR_TOOLTIP_TEXT);
		}
		get _ariaRoleDescription() {
			return RatingIndicator.i18nBundle.getText(i18nDefaults.RATING_INDICATOR_TEXT);
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
