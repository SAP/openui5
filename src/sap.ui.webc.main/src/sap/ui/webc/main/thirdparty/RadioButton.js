sap.ui.define(['sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/Keys', './Label', './types/WrappingType', './RadioButtonGroup', './generated/templates/RadioButtonTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/RadioButton.css'], function (Device, FeaturesRegistry, UI5Element, litRender, i18nBundle, ValueState, Keys, Label, WrappingType, RadioButtonGroup, RadioButtonTemplate_lit, i18nDefaults, RadioButton_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-radiobutton",
		languageAware: true,
		properties:  {
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			selected: {
				type: Boolean,
			},
			text: {
				type: String,
			},
			valueState: {
				defaultValue: ValueState__default.None,
				type: ValueState__default,
			},
			name: {
				type: String,
			},
			value: {
				type: String,
			},
			wrap: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
		},
		slots:  {
			formSupport: {
				type: HTMLElement,
			},
		},
		events:  {
			select: {},
		},
	};
	class RadioButton extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return RadioButtonTemplate_lit;
		}
		static get styles() {
			return RadioButton_css;
		}
		static get dependencies() {
			return [Label];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this.syncGroup();
			this._wrappingType = this.wrap ? WrappingType.Normal : WrappingType.None;
			this._enableFormSupport();
		}
		syncGroup() {
			const oldGroup = this._name;
			const currentGroup = this.name;
			const oldSelected = this._selected;
			const currentSelected = this.selected;
			if (currentGroup !== oldGroup) {
				if (oldGroup) {
					RadioButtonGroup.removeFromGroup(this, oldGroup);
				}
				if (currentGroup) {
					RadioButtonGroup.addToGroup(this, currentGroup);
				}
			} else if (currentGroup) {
				RadioButtonGroup.enforceSingleSelection(this, currentGroup);
			}
			if (this.name && currentSelected !== oldSelected) {
				RadioButtonGroup.updateTabOrder(this.name);
			}
			this._name = this.name;
			this._selected = this.selected;
		}
		_enableFormSupport() {
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
					nativeInput.disabled = element.disabled || !element.selected;
					nativeInput.value = element.selected ? element.value : "";
				});
			} else if (this.value) {
				console.warn(`In order for the "value" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		_onclick() {
			return this.toggle();
		}
		_handleDown(event) {
			const currentGroup = this.name;
			if (!currentGroup) {
				return;
			}
			event.preventDefault();
			RadioButtonGroup.selectNextItem(this, currentGroup);
		}
		_handleUp(event) {
			const currentGroup = this.name;
			if (!currentGroup) {
				return;
			}
			event.preventDefault();
			RadioButtonGroup.selectPreviousItem(this, currentGroup);
		}
		_onkeydown(event) {
			if (Keys.isSpace(event)) {
				return event.preventDefault();
			}
			if (Keys.isEnter(event)) {
				return this.toggle();
			}
			if (Keys.isDown(event) || Keys.isRight(event)) {
				this._handleDown(event);
			}
			if (Keys.isUp(event) || Keys.isLeft(event)) {
				this._handleUp(event);
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this.toggle();
			}
		}
		toggle() {
			if (!this.canToggle()) {
				return this;
			}
			if (!this.name) {
				this.selected = !this.selected;
				this.fireEvent("select");
				return this;
			}
			RadioButtonGroup.selectItem(this, this.name);
			return this;
		}
		canToggle() {
			return !(this.disabled || this.readonly || this.selected);
		}
		valueStateTextMappings() {
			const i18nBundle = this.i18nBundle;
			return {
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		get classes() {
			return {
				inner: {
					"ui5-radio-inner--hoverable": !this.disabled && !this.readonly && Device.isDesktop(),
				},
			};
		}
		get ariaReadonly() {
			return this.readonly ? "true" : undefined;
		}
		get ariaDisabled() {
			return this.disabled ? "true" : undefined;
		}
		get ariaLabelledBy() {
			return this.text ? `${this._id}-label` : undefined;
		}
		get ariaDescribedBy() {
			return this.hasValueState ? `${this._id}-descr` : undefined;
		}
		get hasValueState() {
			return this.valueState !== ValueState__default.None;
		}
		get valueStateText() {
			return this.valueStateTextMappings()[this.valueState];
		}
		get tabIndex() {
			const tabindex = this.getAttribute("tabindex");
			if (this.disabled) {
				return "-1";
			}
			if (this.name) {
				return this._tabIndex;
			}
			return tabindex || "0";
		}
		get strokeWidth() {
			return this.valueState === "None" ? "1" : "2";
		}
	}
	RadioButton.define();

	return RadioButton;

});
