sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './generated/templates/BadgeTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Badge.css'], function (UI5Element, litRender, i18nBundle, BadgeTemplate_lit, i18nDefaults, Badge_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-badge",
		languageAware: true,
		properties:   {
			colorScheme: {
				type: String,
				defaultValue: "1",
			},
			_hasIcon: {
				type: Boolean,
			},
			_iconOnly: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				type: Node,
			},
			icon: {
				type: HTMLElement,
			},
		},
	};
	class Badge extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return BadgeTemplate_lit;
		}
		static get styles() {
			return Badge_css;
		}
		static async onDefine() {
			Badge.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this._hasIcon = this.hasIcon;
			this._iconOnly = this.iconOnly;
		}
		get hasText() {
			return !!this.textContent.trim().length;
		}
		get hasIcon() {
			return !!this.icon.length;
		}
		get iconOnly() {
			return this.hasIcon && !this.hasText;
		}
		get badgeDescription() {
			return Badge.i18nBundle.getText(i18nDefaults.BADGE_DESCRIPTION);
		}
	}
	Badge.define();

	return Badge;

});
