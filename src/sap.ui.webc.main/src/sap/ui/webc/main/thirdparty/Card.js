sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './generated/templates/CardTemplate.lit', './Icon', './generated/i18n/i18n-defaults', './generated/themes/Card.css'], function (UI5Element, litRender, i18nBundle, CardTemplate_lit, Icon, i18nDefaults, Card_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-card",
		languageAware: true,
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "content",
				type: HTMLElement,
			},
			header: {
				type: HTMLElement,
			},
		},
		properties:  {
		},
		events:  {
		},
	};
	class Card extends UI5Element__default {
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
			return CardTemplate_lit;
		}
		static get styles() {
			return Card_css;
		}
		get classes() {
			return {
				"ui5-card-root": true,
				"ui5-card--nocontent": !this.content.length,
			};
		}
		get _hasHeader() {
			return !!this.header.length;
		}
		get _ariaCardRoleDescription() {
			return this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_CARD);
		}
		get _ariaCardContentLabel() {
			return this.i18nBundle.getText(i18nDefaults.ARIA_LABEL_CARD_CONTENT);
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	Card.define();

	return Card;

});
