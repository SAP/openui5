sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/config/Theme', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/sys-cancel', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './generated/i18n/i18n-defaults', './Icon', './generated/templates/TokenTemplate.lit', './generated/themes/Token.css'], function (UI5Element, litRender, Theme, Keys, decline, sysCancel, i18nBundle, i18nDefaults, Icon, TokenTemplate_lit, Token_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-token",
		languageAware: true,
		managedSlots: true,
		properties:  {
			text: { type: String },
			readonly: { type: Boolean },
			overflows: { type: Boolean },
			selected: { type: Boolean },
			_tabIndex: { type: String, defaultValue: "-1", noAttribute: true },
		},
		slots:  {
			closeIcon: {
				type: HTMLElement,
			},
		},
		events:  {
			"delete": {
				detail: {
					"backSpace": { type: Boolean },
					"delete": { type: Boolean },
				},
			},
			select: {},
		},
	};
	class Token extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TokenTemplate_lit;
		}
		static get styles() {
			return Token_css;
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_handleSelect() {
			this.selected = !this.selected;
			this.fireEvent("select");
		}
		 _delete() {
			this.fireEvent("delete");
		 }
		 _keydown(event) {
			const isBS = Keys.isBackSpace(event);
			const isD = Keys.isDelete(event);
			if (!this.readonly && (isBS || isD)) {
				event.preventDefault();
				this.fireEvent("delete", {
					backSpace: isBS,
					"delete": isD,
				});
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
				this._handleSelect();
			}
		}
		get tokenDeletableText() {
			return this.i18nBundle.getText(i18nDefaults.TOKEN_ARIA_DELETABLE);
		}
		get iconURI() {
			return Theme.getTheme() === "sap_fiori_3" ? "decline" : "sys-cancel";
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	Token.define();

	return Token;

});
