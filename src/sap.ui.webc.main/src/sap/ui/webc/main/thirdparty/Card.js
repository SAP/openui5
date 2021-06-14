sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/templates/CardTemplate.lit', './Icon', './generated/i18n/i18n-defaults', './generated/themes/Card.css'], function (UI5Element, litRender, i18nBundle, AriaLabelHelper, Keys, CardTemplate_lit, Icon, i18nDefaults, Card_css) { 'use strict';

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
			avatar: {
				type: HTMLElement,
			},
			action: {
				type: HTMLElement,
			},
		},
		properties:  {
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			status: {
				type: String,
			},
			headerInteractive: {
				type: Boolean,
			},
			ariaLabel: {
				type: String,
			},
			ariaLabelledby: {
				type: String,
				defaultValue: "",
			},
			_headerActive: {
				type: Boolean,
				noAttribute: true,
			},
		},
		events:  {
			"header-click": {},
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
				main: {
					"ui5-card-root": true,
					"ui5-card--nocontent": !this.content.length,
				},
				header: {
					"ui5-card-header": true,
					"ui5-card-header--interactive": this.headerInteractive,
					"ui5-card-header--active": this.headerInteractive && this._headerActive,
				},
			};
		}
		get icon() {
			return !!this.avatar && this.avatar.startsWith("sap-icon://");
		}
		get image() {
			return !!this.avatar && !this.icon;
		}
		get ariaHeaderRole() {
			return this.headerInteractive ? "button" : "heading";
		}
		get ariaLevel() {
			return this.headerInteractive ? undefined : "3";
		}
		get hasHeader() {
			return !!(this.titleText || this.subtitleText || this.status || this.hasAction || this.avatar);
		}
		get ariaLabelText() {
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		get ariaCardRoleDescription() {
			return this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_CARD);
		}
		get ariaCardHeaderRoleDescription() {
			return this.headerInteractive ? this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER) : this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_CARD_HEADER);
		}
		get ariaCardAvatarLabel() {
			return this.i18nBundle.getText(i18nDefaults.AVATAR_TOOLTIP);
		}
		get ariaCardContentLabel() {
			return this.i18nBundle.getText(i18nDefaults.ARIA_LABEL_CARD_CONTENT);
		}
		get ariaLabelledByHeader() {
			const labels = [];
			if (this.subtitleText) {
				labels.push(`${this._id}-subtitle`);
			}
			if (this.status) {
				labels.push(`${this._id}-status`);
			}
			if (this.hasAvatar) {
				labels.push(`${this._id}-avatar`);
			}
			return labels.length !== 0 ? labels.join(" ") : undefined;
		}
		get ariaLabelledByCard() {
			return this.titleText ? `${this._id}-title ${this._id}-desc` : `${this._id}-desc`;
		}
		get hasAvatar() {
			return !!this.avatar.length;
		}
		get hasAction() {
			return !!this.action.length;
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		_headerClick() {
			if (this.headerInteractive) {
				this.fireEvent("header-click");
			}
		}
		_headerKeydown(event) {
			if (!this.headerInteractive) {
				return;
			}
			const enter = Keys.isEnter(event);
			const space = Keys.isSpace(event);
			this._headerActive = enter || space;
			if (enter) {
				this.fireEvent("header-click");
				return;
			}
			if (space) {
				event.preventDefault();
			}
		}
		_headerKeyup(event) {
			if (!this.headerInteractive) {
				return;
			}
			const space = Keys.isSpace(event);
			this._headerActive = false;
			if (space) {
				this.fireEvent("header-click");
			}
		}
	}
	Card.define();

	return Card;

});
