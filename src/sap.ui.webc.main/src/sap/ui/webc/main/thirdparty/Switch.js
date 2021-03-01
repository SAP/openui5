sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/accept', 'sap/ui/webc/common/thirdparty/icons/decline', './Icon', './types/SwitchDesign', './generated/i18n/i18n-defaults', './generated/templates/SwitchTemplate.lit', './generated/themes/Switch.css'], function (UI5Element, litRender, Keys, Device, i18nBundle, accept, decline, Icon, SwitchDesign, i18nDefaults, SwitchTemplate_lit, Switch_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-switch",
		languageAware: true,
		properties:  {
			design: {
				type: SwitchDesign,
				defaultValue: SwitchDesign.Textual,
			},
			checked: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			textOn: {
				type: String,
			},
			textOff: {
				type: String,
			},
		},
		events:  {
			change: {},
		},
	};
	class Switch extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return Switch_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return SwitchTemplate_lit;
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_onclick(event) {
			this.toggle();
		}
		_onkeydown(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
			if (Keys.isEnter(event)) {
				this.toggle();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this.toggle();
			}
		}
		toggle() {
			if (!this.disabled) {
				this.checked = !this.checked;
				this.fireEvent("change");
				this.fireEvent("value-changed");
			}
		}
		get graphical() {
			return this.design === SwitchDesign.Graphical;
		}
		get _textOn() {
			return this.graphical ? "" : this.textOn;
		}
		get _textOff() {
			return this.graphical ? "" : this.textOff;
		}
		get tabIndex() {
			return this.disabled ? undefined : "0";
		}
		get classes() {
			const hasLabel = this.graphical || this.textOn || this.textOff;
			return {
				main: {
					"ui5-switch-desktop": Device.isDesktop(),
					"ui5-switch--disabled": this.disabled,
					"ui5-switch--checked": this.checked,
					"ui5-switch--semantic": this.graphical,
					"ui5-switch--no-label": !hasLabel,
				},
			};
		}
		get ariaDisabled() {
			return this.disabled ? "true" : undefined;
		}
		get accessibilityOnText() {
			return this._textOn || this.i18nBundle.getText(i18nDefaults.SWITCH_ON);
		}
		get accessibilityOffText() {
			return this._textOff || this.i18nBundle.getText(i18nDefaults.SWITCH_OFF);
		}
		get hiddenText() {
			return this.checked ? this.accessibilityOnText : this.accessibilityOffText;
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	Switch.define();

	return Switch;

});
