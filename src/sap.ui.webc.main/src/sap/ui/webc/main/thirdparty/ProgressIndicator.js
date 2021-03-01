sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './generated/templates/ProgressIndicatorTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/ProgressIndicator.css'], function (UI5Element, litRender, AnimationMode$1, ValueState, Integer, AnimationMode, i18nBundle, ProgressIndicatorTemplate_lit, i18nDefaults, ProgressIndicator_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-progress-indicator",
		properties:  {
			disabled: {
				type: Boolean,
			},
			hideValue: {
				type: Boolean,
			},
			value: {
				type: Integer__default,
				defaultValue: 0,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
		},
		slots:  {
		},
		events:  {
		},
	};
	class ProgressIndicator extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ProgressIndicator_css;
		}
		static get template() {
			return ProgressIndicatorTemplate_lit;
		}
		constructor() {
			super();
			this._previousValue = 0;
			this._transitionDuration = 0;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this._transitionDuration = Math.abs(this._previousValue - this.validatedValue) * 20;
			this._previousValue = this.validatedValue;
		}
		valueStateTextMappings() {
			const i18nBundle = this.i18nBundle;
			return {
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
				"Success": i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
			};
		}
		valueStateIconMappings() {
			return {
				"Error": "status-negative",
				"Warning": "status-critical",
				"Success": "status-positive",
				"Information": "hint",
			};
		}
		get styles() {
			return {
				bar: {
					"width": `${this.validatedValue}%`,
					"transition-duration": this.shouldAnimate ? `${this._transitionDuration}ms` : "none",
				},
			};
		}
		get classes() {
			return {
				root: {
					"ui5-progress-indicator-max-value": this.validatedValue === 100,
					"ui5-progress-indicator-min-value": this.validatedValue === 0,
				},
			};
		}
		get validatedValue() {
			if (this.value < 0) {
				return 0;
			}
			if (this.value > 100) {
				return 100;
			}
			return this.value;
		}
		get showValueInRemainingBar() {
			return this.value <= 50;
		}
		get shouldAnimate() {
			return AnimationMode.getAnimationMode() !== AnimationMode__default.None;
		}
		get valueStateText() {
			const percentValue = `${this.validatedValue}%`;
			const valueText = this.valueStateTextMappings()[this.valueState];
			return valueText ? `${percentValue} ${valueText}` : percentValue;
		}
		get showIcon() {
			return this.valueState !== ValueState__default.None;
		}
		get valueStateIcon() {
			return this.valueStateIconMappings()[this.valueState];
		}
		get _ariaDisabled() {
			return this.disabled || undefined;
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	ProgressIndicator.define();

	return ProgressIndicator;

});
