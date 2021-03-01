sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/main/thirdparty/Icon', './generated/templates/WizardTabTemplate.lit', './generated/themes/WizardTab.css'], function (UI5Element, litRender, Keys, Icon, WizardTabTemplate_lit, WizardTab_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);

	const metadata = {
		tag: "ui5-wizard-tab",
		properties:  {
			icon: {
				type: String,
			},
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			number: {
				type: String,
			},
			disabled: {
				type: Boolean,
			},
			selected: {
				type: Boolean,
			},
			hideSeparator: {
				type: Boolean,
			},
			activeSeparator: {
				type: Boolean,
			},
			branchingSeparator: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
			},
			_wizardTabAccInfo: {
				type: Object,
			},
		},
		slots:  {
		},
		events:  {
			"selection-change-requested": {},
		},
	};
	class WizardTab extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return WizardTab_css;
		}
		static get template() {
			return WizardTabTemplate_lit;
		}
		static get dependencies() {
			return [Icon__default];
		}
		_onclick() {
			if (!this.disabled) {
				this.fireEvent("selection-change-requested");
			}
		}
		_onkeydown(event) {
			if (this.disabled) {
				return;
			}
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				event.preventDefault();
				this.fireEvent("selection-change-requested");
			}
		}
		_onkeyup(event) {
			if (this.disabled) {
				return;
			}
			if (Keys.isSpace(event)) {
				this.fireEvent("selection-change-requested");
			}
		}
		_onfocusin() {
			if (this.disabled) {
				return;
			}
			this.fireEvent("focused");
		}
		get tabIndex() {
			return this.disabled ? undefined : this._tabIndex;
		}
		get hasTexts() {
			return this.titleText || this.subtitleText;
		}
		get accInfo() {
			return {
				"ariaSetsize": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaSetsize,
				"ariaPosinset": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaPosinset,
				"ariaLabel": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaLabel,
				"ariaCurrent": this.selected ? "true" : undefined,
				"ariaDisabled": this.disabled ? "true" : undefined,
			};
		}
	}
	WizardTab.define();

	return WizardTab;

});
